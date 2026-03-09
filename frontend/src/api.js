// ── Central API Service for Momentum ─────────────────────────────────────────
// All calls go to the Spring Boot backend hosted on Railway
// JWT is stored in localStorage and attached to every request automatically.

const BASE = "https://momentum-productivity-partner-production.up.railway.app";

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("momentum_jwt");
export const setToken = (t) => localStorage.setItem("momentum_jwt", t);
export const clearToken = () => localStorage.removeItem("momentum_jwt");

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function req(method, path, body) {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
    }

    const ct = res.headers.get("Content-Type") || "";
    if (res.status === 204 || !ct.includes("application/json")) return null;
    return res.json();
}

const get    = (path)         => req("GET",    path);
const post   = (path, body)   => req("POST",   path, body);
const patch  = (path, body)   => req("PATCH",  path, body);
const del    = (path)         => req("DELETE", path);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
    register: (username, email, password) =>
        post("/api/auth/register", { username, email, password }),
    login: (email, password) =>
        post("/api/auth/login", { email, password }),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const tasks = {
    getAll:  ()            => get("/api/tasks"),
    create:  (task)        => post("/api/tasks", task),
    update:  (id, changes) => patch(`/api/tasks/${id}`, changes),
    remove:  (id)          => del(`/api/tasks/${id}`),
};

// ── Habits ────────────────────────────────────────────────────────────────────
export const habits = {
    getAll:  ()            => get("/api/habits"),
    create:  (habit)       => post("/api/habits", habit),
    toggle:  (id, index)   => post(`/api/habits/${id}/toggle`, { index }),
    remove:  (id)          => del(`/api/habits/${id}`),
};

// ── Focus Sessions ────────────────────────────────────────────────────────────
export const focus = {
    getAll:   ()      => get("/api/focus"),
    create:   (s)     => post("/api/focus", s),
    today:    ()      => get("/api/focus/today"),
    yearly:   ()      => get("/api/focus/yearly"),
};

// ── Journal ───────────────────────────────────────────────────────────────────
export const journal = {
    getAll:     ()     => get("/api/journal"),
    getByDate:  (date) => get(`/api/journal/${date}`),
    save:       (entry)=> post("/api/journal", entry),
};
