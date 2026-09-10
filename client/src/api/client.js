const BASE_URL = "http://localhost:5050/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

async function uploadResumeFile(file, token) {
  const formData = new FormData();
  formData.append("resumeFile", file);

  const res = await fetch(`${BASE_URL}/resumes/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export const api = {
  register: (body) => request("/auth/register", { method: "POST", body }),
  login: (body) => request("/auth/login", { method: "POST", body }),
  getMe: (token) => request("/users/me", { token }),

  listResumes: (token) => request("/resumes", { token }),
  createResume: (body, token) => request("/resumes", { method: "POST", body, token }),
  getResume: (id, token) => request(`/resumes/${id}`, { token }),
  updateResume: (id, body, token) => request(`/resumes/${id}`, { method: "PATCH", body, token }),
  deleteResume: (id, token) => request(`/resumes/${id}`, { method: "DELETE", token }),
  uploadResume: uploadResumeFile,

  analyzeResume: (id, jobDescription, token) =>
    request(`/resumes/${id}/analyze`, { method: "POST", body: { jobDescription }, token }),
  rewriteBullet: (id, bulletText, jobDescription, token) =>
    request(`/resumes/${id}/rewrite-bullet`, {
      method: "POST",
      body: { bulletText, jobDescription },
      token,
    }),
};
