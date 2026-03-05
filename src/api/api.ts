import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { getToken, setToken, removeToken, getRefreshToken, setRefreshToken, removeRefreshToken } from "../utils/tokenStorage";


// ─── Singleton API instance ─────────────────────────────────────────────────
// Using a singleton avoids re-creating interceptors on every call.

let _api: AxiosInstance | null = null;
let _currentBaseURL: string | null = null;

// Refresh-token state — shared across all requests so we only refresh once
let _isRefreshing = false;
let _refreshSubscribers: Array<(token: string) => void> = [];

/** Notify queued requests that a fresh access token is available. */
function onRefreshed(newToken: string) {
  _refreshSubscribers.forEach((cb) => cb(newToken));
  _refreshSubscribers = [];
}

/** Queue a request that arrived while a refresh was in-flight. */
function subscribeTokenRefresh(cb: (token: string) => void) {
  _refreshSubscribers.push(cb);
}

/**
 * Returns an axios instance bound to the selected backend instance.
 * The instance base URL is chosen on the landing page and stored in localStorage.
 */
export const getApi = (): AxiosInstance => {
  const baseURL = localStorage.getItem("INSTANCE_BASE_URL");

  if (!baseURL) {
    throw new Error("No instance selected. Please choose an instance first.");
  }

  // Re-use existing instance if base URL hasn't changed
  if (_api && _currentBaseURL === baseURL) {
    return _api;
  }

  const api = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  // ── Request interceptor: attach access token ──
  api.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ── Response interceptor: auto-refresh on 401 ──
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Only attempt refresh for 401 errors that haven't already been retried
      // and are not themselves refresh/login requests
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/refresh") &&
        !originalRequest.url?.includes("/auth/login")
      ) {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          // No refresh token → force login
          handleSessionExpired();
          return Promise.reject(error);
        }

        if (_isRefreshing) {
          // Another request is already refreshing — wait for it
          return new Promise((resolve) => {
            subscribeTokenRefresh((newToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            });
          });
        }

        // Start the refresh
        originalRequest._retry = true;
        _isRefreshing = true;

        try {
          const refreshRes = await axios.post(
            `${baseURL}/refresh`,
            {},
            {
              headers: { Authorization: `Bearer ${refreshToken}` },
              timeout: 10000,
            }
          );

          const data = refreshRes.data || {};
          const newAccessToken = data.access_token;

          if (!newAccessToken) {
            throw new Error("No access_token in refresh response");
          }

          // Persist the new tokens
          setToken(newAccessToken);
          if (data.refresh_token) {
            setRefreshToken(data.refresh_token);
          }

          // Retry the original request + all queued requests
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          onRefreshed(newAccessToken);
          _isRefreshing = false;

          return api(originalRequest);
        } catch (refreshError) {
          _isRefreshing = false;
          _refreshSubscribers = [];
          // Refresh failed → session is truly expired
          handleSessionExpired();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  _api = api;
  _currentBaseURL = baseURL;
  return api;
};

/**
 * Clears all auth state and redirects to login.
 * Called when both access and refresh tokens are invalid.
 */
function handleSessionExpired() {
  removeToken();
  removeRefreshToken();
  localStorage.removeItem("username");
  localStorage.removeItem("user_avatar_url");
  // Only redirect if not already on an auth page
  if (!window.location.pathname.startsWith("/auth")) {
    window.location.href = "/auth/login";
  }
}


// Convenience wrappers that use getApi() so callers don't need to create
// their own axios instances.
/**
 * Registers a new user.
 * @param {string} username - The username for the new account.
 * @param {string} password - The password for the new account.
 * @param {string} [email] - (Optional) The email address for the new account.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const registerUser = (username: string, password: string, email?: string, avatar?: File) => {
  const form = new FormData();
  if (avatar) {
    form.append("avatar", avatar);
  }
  return getApi().post("/auth/register", form, {
    params: { username, password, email },
  });
};

/**
 * Logs in a user.
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response containing the auth token.
 */
export const loginUser = (username: string, password: string) =>
  getApi().post("/auth/login", null, { params: { username, password } });

/**
 * Creates a new post.
 * @param {string} content - The content of the post.
 * @param {string} [username] - (Optional) The username of the author (for server-side attribution).
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const createPost = (
  content: string,
  username?: string,
  image?: File,
  visibility: string = "public"
) => {
  const form = new FormData();
  form.append("content", content);
  if (username) form.append("username", username);
  if (image) form.append("image", image);

  return getApi().post("/posts", form, {
    params: { visibility },
    headers: { "Content-Type": "multipart/form-data" }, // let axios auto-set multipart/form-data
    timeout: image ? 60000 : 30000, // 60s for image uploads, 30s otherwise
  });
};

/**
 * Gets an AI suggestion to enhance the post content.
 * @param {string} content - The content to enhance.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const completePost = (content: string) => {
  const form = new FormData();
  form.append("content", content);
  return getApi().post("/post/completePost", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

/**
 * Validates an image for explicit content using the moderation service.
 * @param {File} file - The image file to validate.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response containing safety categories.
 */
export const moderateImage = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return getApi().post("/moderate-image", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30000,
  });
};

/**
 * Gets an AI suggestion to elaborate the post content.
 * @param {string} content - The content to elaborate.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const elaboratePost = (content: string) => {
  const form = new FormData();
  form.append("content", content);
  return getApi().post("/post/eloboratePost", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

// Fetch posts from the instance. Returns an array of posts.
/**
 * Fetches posts from the instance.
 * @param {number} [limit=50] - The maximum number of posts to fetch.
 * @param {string} [username] - (Optional) Filter posts by username.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response containing the list of posts.
 */
export const getPosts = (limit = 50, username?: string) => {
  return getApi().get("/timeline", { params: { limit, username } });
};

// Fetch user details. Try several common endpoint shapes to be robust
// across different instance implementations.
/**
 * Fetches user details.
 * @param {string} username - The username of the user to fetch.
 * @param {string} [token] - (Optional) The auth token to use for the request.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response containing user details.
 * @throws {Error} If no username is provided.
 */
export const getUser = async (username: string, token?: string) => {
  const api = getApi();
  if (!username || String(username).trim() === "") {
    throw new Error("No username provided to getUser");
  }

  // If a token is provided explicitly, send it on this request; otherwise
  // the instance-level interceptor will add a token from the cookie.
  const headers: Record<string, string> = {};
  const authToken = token || getToken();
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  // Call the username-based endpoint the backend expects.
  return api.get(`/get_user/${encodeURIComponent(String(username))}`, { headers });
};

// Update user profile. Most instances expose a JSON endpoint to update
// profile fields; the exact path may differ between backends. This helper
// posts a JSON body to `/update_user` by default — adjust if your
// instance expects a different path (e.g. `/users/{username}` or PATCH).
/**
 * Updates the user's profile.
 * @param {string} username - The username of the user.
 * @param {Record<string, any>} data - The data to update (e.g., bio, website).
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const updateUser = (username: string, data: Record<string, any>) =>
  getApi().post(`/update_user`, { username, ...data });

// Upload an avatar image. Uses multipart/form-data and posts to
// `/upload_avatar`. If your backend expects a different path, update it.
/**
 * Uploads a user avatar.
 * @param {string} username - The username of the user.
 * @param {File} file - The image file to upload.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const uploadAvatar = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return getApi().post(`/users/avatar`, form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
};

/**
 * Deletes a post.
 * @param {string | number} postId - The ID of the post to delete.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const deletePost = (postId: string | number) => {
  return getApi().delete(`/delete/${postId}`);
};

/**
 * Creates a comment on a post.
 * @param {string} postId - The ID of the post to comment on.
 * @param {string} content - The content of the comment.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const createComment = (postId: string, content: string) => {
  return getApi().post(`/${postId}/comments`, { content });
};

/**
 * Fetches all comments for a post.
 * @param {string} postId - The ID of the post.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response containing the comments.
 */
export const getComments = (postId: string) => {
  return getApi().get(`/${postId}/comments`);
};

/**
 * Deletes a comment.
 * @param {string} commentId - The ID of the comment to delete.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const deleteComment = (commentId: string) => {
  return getApi().delete(`/comments/${commentId}`);
};

/**
 * Fetches a list of users.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response containing the list of users.
 */
export const getUsers = () => getApi().get("/users");

/**
 * Fetches a list of random users (e.g., for suggestions).
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response containing random users.
 */
export const getRandomUsers = () => getApi().get("/random_users");

/**
 * Initiates a connection request to another user.
 * @param {string} username - The username of the user to connect with.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const initiateConnection = (username: string) =>
  getApi().post(`/connect/${username}`);

/**
 * Accepts a pending connection request.
 * @param {string | number} connectionId - The ID of the connection request to accept.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const acceptConnection = (connectionId: string | number) =>
  getApi().post(`/connect/accept/${connectionId}`);

/**
 * Fetches pending connection requests.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response containing pending connections.
 */
export const getPendingConnections = () => getApi().get("/connections/pending");

/**
 * Fetches posts from followed/connected users (timeline).
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response containing the timeline posts.
 */
export const getFollowedPosts = () => getApi().get("/timeline_connected_users");

/**
 * Initiates the forgot password flow.
 * @param {string} email - The email address of the user.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const forgotPassword = (email: string) =>
  getApi().post("/auth/forgot-password", { email });

/**
 * Verifies the OTP for password reset.
 * @param {string} email - The email address of the user.
 * @param {string} otp - The one-time password.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const verifyOtp = (email: string, otp: string) =>
  getApi().post("/auth/verify-otp", { email, otp });

/**
 * Resets the user's password.
 * @param {string} reset_token - The token received after verifying OTP.
 * @param {string} new_password - The new password.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const resetPassword = (reset_token: string, new_password: string) =>
  getApi().post("/auth/reset-password", { reset_token, new_password });

/**
 * Fetches the count of connections for the current user.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response containing the connection count.
 */
export const getConnectionCount = () => getApi().get("/count_connections");

/**
 * Fetches the list of connections for the current user.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response containing the list of connections.
 */
export const getConnectionsList = () => getApi().get("/list_connections");

/**
 * Removes a connection with another user.
 * @param {string} username - The username of the user to disconnect from.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const removeConnection = (username: string) =>
  getApi().post(`/remove_connection/${username}`);

/**
 * Searches for users by query.
 * @param {string} q - The search query.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response containing search results.
 */
export const searchUsers = (q: string) =>
  getApi().get("/search_users", { params: { q } });

/**
 * Likes a post.
 * @param {string} postId - The ID of the post to like.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const likePost = (postId: string) =>
  getApi().post(`/posts/${postId}/like`);

/**
 * Unlikes a post.
 * @param {string} postId - The ID of the post to unlike.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const unlikePost = (postId: string) =>
  getApi().delete(`/posts/${postId}/like`);

/**
 * Updates the current user's profile (bio, display_name).
 * @param {Object} data - Fields to update.
 * @param {string} [data.bio] - The new bio text.
 * @param {string} [data.display_name] - The new display name.
 * @returns {Promise<import("axios").AxiosResponse<any>>} The server response.
 */
export const updateProfile = (data: { bio?: string; display_name?: string }) =>
  getApi().post("/update-profile", null, { params: data });

/**
 * Fetches all conversations for the current user.
 * @returns {Promise<import("axios").AxiosResponse<any>>} List of conversations with last message info.
 */
export const getConversations = () => getApi().get("/conversations");

/**
 * Fetches message history between two users.
 * @param {string} user1 - First user's ID/username.
 * @param {string} user2 - Second user's ID/username.
 * @returns {Promise<import("axios").AxiosResponse<any>>} Ordered list of messages.
 */
export const getMessages = (user1: string, user2: string) =>
  getApi().get(`/messages/${encodeURIComponent(user1)}/${encodeURIComponent(user2)}`);

/**
 * Builds the WebSocket URL for the chat endpoint.
 * Derives ws:// or wss:// from the stored INSTANCE_BASE_URL.
 * @param {string} userId - The current user's ID (username).
 * @returns {string} The full WebSocket URL.
 */
export const getChatWebSocketUrl = (userId: string): string => {
  const baseURL = localStorage.getItem("INSTANCE_BASE_URL");
  if (!baseURL) throw new Error("No instance selected.");

  // Replace http(s):// with ws(s):// AND strip any trailing /api/v1
  // because the backend chat router is mounted at the root of the server
  const wsBase = baseURL.replace(/^http/, "ws").replace(/\/api\/v[0-9]+$/, "");
  return `${wsBase}/ws/chat/${encodeURIComponent(userId)}`;
};
