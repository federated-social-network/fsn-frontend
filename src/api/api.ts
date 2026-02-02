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
    timeout: 8000,
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
export const registerUser = (username: string, password: string, email?: string) =>
  getApi().post("/auth/register", null, { params: { username, password, email } });

export const loginUser = (username: string, password: string) =>
  getApi().post("/auth/login", null, { params: { username, password } });

export const createPost = (
  content: string,
  username?: string
) => {
  // Build query params.
  const params: Record<string, string> = { content } as any;

  if (username) {
    // include username as a param for server-side attribution if useful
    params.username = username;
  }

  // Do not set Basic auth here. getApi() will attach a Bearer token
  // if one is present in localStorage (preferred server flow).
  return getApi().post("/posts", null, { params });
};

// Fetch posts from the instance. Returns an array of posts.
export const getPosts = (limit = 50, username?: string) => {
  return getApi().get("/get_posts", { params: { limit, username } });
};

// Fetch user details. Try several common endpoint shapes to be robust
// across different instance implementations.
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
export const updateUser = (username: string, data: Record<string, any>) =>
  getApi().post(`/update_user`, { username, ...data });

// Upload an avatar image. Uses multipart/form-data and posts to
// `/upload_avatar`. If your backend expects a different path, update it.
export const uploadAvatar = (username: string, file: File) => {
  const form = new FormData();
  form.append("username", username);
  form.append("avatar", file);
  return getApi().post(`/upload_avatar`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deletePost = (postId: string | number) => {
  return getApi().delete(`/delete/${postId}`);
};

export const getUsers = () => getApi().get("/users");

export const getRandomUsers = () => getApi().get("/random_users");

export const initiateConnection = (username: string) =>
  getApi().post(`/connect/${username}`);

export const acceptConnection = (connectionId: string | number) =>
  getApi().post(`/connect/accept/${connectionId}`);

export const getPendingConnections = () => getApi().get("/connections/pending");

export const getFollowedPosts = () => getApi().get("/timeline_connected_users");

export const forgotPassword = (email: string) =>
  getApi().post("/auth/forgot-password", { email });

export const verifyOtp = (email: string, otp: string) =>
  getApi().post("/auth/verify-otp", { email, otp });

export const resetPassword = (reset_token: string, new_password: string) =>
  getApi().post("/auth/reset-password", { reset_token, new_password });

export const getConnectionCount = () => getApi().get("/count_connections");
