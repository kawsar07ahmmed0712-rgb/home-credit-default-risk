const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Request failed.";
    try {
      const errorPayload = await response.json();
      message = errorPayload.detail ?? message;
    } catch {
      // Ignore parse failure and keep the default message.
    }
    throw new Error(message);
  }

  return response.json();
}
