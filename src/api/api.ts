import axios, { type AxiosInstance } from "axios";


/**
 * Returns an axios instance bound to the selected backend instance.
 * The instance base URL is chosen on the landing page and stored in localStorage.
 */
export const getApi = (): AxiosInstance => {
  const baseURL = localStorage.getItem("INSTANCE_BASE_URL");

  if (!baseURL) {
    throw new Error("No instance selected. Please choose an instance first.");
  }



  const api = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  // Optional: request interceptor (for future JWT support)
  api.interceptors.request.use(
    (config) => {
      // Support either key name so login can store `access_token` or `AUTH_TOKEN`.
      const token = localStorage.getItem("AUTH_TOKEN") || localStorage.getItem("access_token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Optional: response interceptor (global error handling)
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn("Unauthorized  possible invalid login");
      }
      return Promise.reject(error);
    }
  );

  return api;
};


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
  image?: File
) => {
  const form = new FormData();
  form.append("content", content);
  if (username) form.append("username", username);
  if (image) form.append("image", image);

  return getApi().post("/posts", form, {
    headers: { "Content-Type": undefined }, // let axios auto-set multipart/form-data
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
    headers: { "Content-Type": undefined }
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
    headers: { "Content-Type": undefined },
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
    headers: { "Content-Type": undefined }
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
  // the instance-level interceptor will add a token from localStorage.
  const headers: Record<string, string> = {};
  const authToken = token || localStorage.getItem("AUTH_TOKEN") || localStorage.getItem("access_token");
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
  return getApi().post(`/users/avatar`, form);
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

