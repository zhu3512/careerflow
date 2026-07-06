import express from "express";
import { join } from "node:path";
import { CareerDatabase } from "./database.js";
import { analyzeMatch } from "./matcher.js";
import { JOB_STATUSES } from "./types.js";
function getCookie(request, name) {
    const cookies = request.headers.cookie?.split(";") ?? [];
    for (const cookie of cookies) {
        const [key, ...value] = cookie.trim().split("=");
        if (key === name)
            return decodeURIComponent(value.join("="));
    }
    return null;
}
function validateJob(body) {
    if (!body.company?.trim() || !body.role?.trim()) {
        return "公司和职位名称不能为空";
    }
    if (!body.status || !JOB_STATUSES.includes(body.status)) {
        return "职位状态无效";
    }
    if (body.salaryMin != null &&
        body.salaryMax != null &&
        body.salaryMin > body.salaryMax) {
        return "最低薪资不能高于最高薪资";
    }
    return null;
}
export function createApp(databasePath) {
    const db = new CareerDatabase(databasePath);
    const app = express();
    app.use(express.json({ limit: "1mb" }));
    const requireAuth = (request, response, next) => {
        const token = getCookie(request, "careerflow_session");
        const user = token ? db.getUserBySession(token) : null;
        if (!token || !user) {
            response.status(401).json({ error: "请先登录" });
            return;
        }
        request.user = user;
        request.sessionToken = token;
        next();
    };
    app.get("/api/health", (_request, response) => {
        response.json({ status: "ok" });
    });
    app.post("/api/auth/login", (request, response) => {
        const { email, password } = request.body;
        if (!email || !password) {
            response.status(400).json({ error: "请输入邮箱和密码" });
            return;
        }
        const result = db.login(email.toLowerCase().trim(), password);
        if (!result) {
            response.status(401).json({ error: "邮箱或密码错误" });
            return;
        }
        response.setHeader("Set-Cookie", `careerflow_session=${result.token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800`);
        response.json({ user: result.user });
    });
    app.get("/api/auth/me", requireAuth, (request, response) => {
        response.json({ user: request.user });
    });
    app.post("/api/auth/logout", requireAuth, (request, response) => {
        db.logout(request.sessionToken);
        response.setHeader("Set-Cookie", "careerflow_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0");
        response.status(204).end();
    });
    app.get("/api/jobs", requireAuth, (request, response) => {
        response.json({ jobs: db.listJobs(request.user.id) });
    });
    app.post("/api/jobs", requireAuth, (request, response) => {
        const error = validateJob(request.body);
        if (error) {
            response.status(400).json({ error });
            return;
        }
        response.status(201).json({ job: db.createJob(request.user.id, request.body) });
    });
    app.patch("/api/jobs/:id", requireAuth, (request, response) => {
        const jobId = String(request.params.id);
        const existing = db.getJob(request.user.id, jobId);
        if (!existing) {
            response.status(404).json({ error: "职位不存在" });
            return;
        }
        const next = { ...existing, ...request.body };
        const error = validateJob(next);
        if (error) {
            response.status(400).json({ error });
            return;
        }
        response.json({ job: db.updateJob(request.user.id, jobId, next) });
    });
    app.delete("/api/jobs/:id", requireAuth, (request, response) => {
        if (!db.deleteJob(request.user.id, String(request.params.id))) {
            response.status(404).json({ error: "职位不存在" });
            return;
        }
        response.status(204).end();
    });
    app.get("/api/analytics", requireAuth, (request, response) => {
        const jobs = db.listJobs(request.user.id);
        const active = jobs.filter((job) => ["applied", "interview", "offer"].includes(job.status));
        const applied = jobs.filter((job) => job.status !== "wishlist");
        const interviews = jobs.filter((job) => ["interview", "offer"].includes(job.status));
        const offers = jobs.filter((job) => job.status === "offer");
        response.json({
            analytics: {
                total: jobs.length,
                active: active.length,
                interviews: interviews.length,
                offers: offers.length,
                interviewRate: applied.length
                    ? Math.round((interviews.length / applied.length) * 100)
                    : 0,
                offerRate: interviews.length
                    ? Math.round((offers.length / interviews.length) * 100)
                    : 0
            }
        });
    });
    app.post("/api/analyze", requireAuth, (request, response) => {
        const { resumeText, jobDescription } = request.body;
        if (!resumeText?.trim() || !jobDescription?.trim()) {
            response.status(400).json({ error: "简历内容和职位描述不能为空" });
            return;
        }
        response.json({ result: analyzeMatch(resumeText, jobDescription) });
    });
    if (process.env.NODE_ENV === "production") {
        const distPath = join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get(/.*/, (_request, response) => {
            response.sendFile(join(distPath, "index.html"));
        });
    }
    let server = null;
    return {
        app,
        db,
        listen(port) {
            server = app.listen(port);
            return server;
        },
        close() {
            server?.close();
            db.close();
        }
    };
}
