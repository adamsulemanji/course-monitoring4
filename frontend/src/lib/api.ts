// Default to localhost if not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const { token, ...fetchOptions } = options;
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  let finalBody = fetchOptions.body;
  if (finalBody && typeof finalBody === 'object' && !(finalBody instanceof Blob) && 
      !(finalBody instanceof ArrayBuffer) && !(finalBody instanceof FormData) && 
      !(finalBody instanceof URLSearchParams) && !(finalBody instanceof ReadableStream)) {
    headers.set("Content-Type", "application/json");
    finalBody = JSON.stringify(finalBody);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    body: finalBody as BodyInit
  });

  // For non-OK responses, parse the error message
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "An error occurred");
  }

  // Return null for 204 responses (no content)
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Auth
export const auth = {
  signup: (data: any) => 
    fetchAPI("/auth/signup", { method: "POST", body: data }),
  
  signin: (data: any) => 
    fetchAPI("/auth/signin", { method: "POST", body: data }),
  
  verify: (data: any) => 
    fetchAPI("/auth/verify_account", { method: "POST", body: data }),
  
  resendCode: (email: string) => 
    fetchAPI(`/auth/resend_confirmation_code?email=${encodeURIComponent(email)}`, { method: "POST" }),
  
  logout: (token: string) => 
    fetchAPI("/auth/logout", { 
      method: "POST", 
      body: { access_token: token } as unknown as BodyInit
    }),
  
  forgotPassword: (email: string) => 
    fetchAPI(`/auth/forgot_password?email=${encodeURIComponent(email)}`, { method: "POST" }),
  
  resetPassword: (data: any) => 
    fetchAPI("/auth/confirm_forgot_password", { method: "POST", body: data }),
};

// Courses
export const courses = {
  getAll: (token: string) => 
    fetchAPI("/courses", { token }),
  
  getById: (id: string, token: string) => 
    fetchAPI(`/courses/${id}`, { token }),
};

// Notifications
export const notifications = {
  getAll: (token: string) => 
    fetchAPI("/notifications", { token }),
  
  markAsRead: (id: string, token: string) => 
    fetchAPI(`/notifications/${id}/read`, { method: "POST", token }),
};

export default {
  auth,
  courses,
  notifications,
}; 