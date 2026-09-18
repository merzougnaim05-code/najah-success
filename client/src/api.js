async function request(path, options = {}) {
  const opts = {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  };
  const res = await fetch(path, opts);
  const text = await res.text().catch(() => "");
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const err = new Error(json.error || "حدث خطأ غير متوقع");
    err.status = res.status;
    throw err;
  }
  return json.data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body = {}) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body = {}) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body = {}) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};