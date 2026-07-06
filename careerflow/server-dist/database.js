import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
function hashPassword(password) {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
    const [salt, expectedHex] = stored.split(":");
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
}
function mapJob(row) {
    return {
        id: row.id,
        company: row.company,
        role: row.role,
        status: row.status,
        location: row.location,
        workMode: row.work_mode,
        salaryMin: row.salary_min,
        salaryMax: row.salary_max,
        source: row.source,
        appliedAt: row.applied_at,
        nextStep: row.next_step,
        nextStepAt: row.next_step_at,
        description: row.description,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}
export class CareerDatabase {
    db;
    constructor(path) {
        if (path !== ":memory:")
            mkdirSync(dirname(path), { recursive: true });
        this.db = new DatabaseSync(path);
        this.db.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
        this.migrate();
        this.seed();
    }
    migrate() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL,
        location TEXT NOT NULL DEFAULT '',
        work_mode TEXT NOT NULL DEFAULT '远程',
        salary_min INTEGER,
        salary_max INTEGER,
        source TEXT NOT NULL DEFAULT '',
        applied_at TEXT,
        next_step TEXT NOT NULL DEFAULT '',
        next_step_at TEXT,
        description TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    }
    seed() {
        const existing = this.db.prepare("SELECT id FROM users LIMIT 1").get();
        if (existing)
            return;
        const userId = randomUUID();
        this.db
            .prepare("INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)")
            .run(userId, "demo@careerflow.dev", "林默", hashPassword("demo123"));
        const now = new Date().toISOString();
        const jobs = [
            {
                company: "Linear",
                role: "Frontend Engineer",
                status: "interview",
                location: "上海",
                workMode: "混合办公",
                salaryMin: 35,
                salaryMax: 50,
                source: "LinkedIn",
                appliedAt: "2026-06-18",
                nextStep: "技术二面",
                nextStepAt: "2026-07-08T14:00",
                description: "使用 React、TypeScript 和 GraphQL 构建高质量产品体验，重视 testing 与性能。"
            },
            {
                company: "Vercel",
                role: "Full-stack Engineer",
                status: "applied",
                location: "远程",
                workMode: "远程",
                salaryMin: 40,
                salaryMax: 60,
                source: "官网",
                appliedAt: "2026-07-02",
                nextStep: "等待反馈",
                nextStepAt: null,
                description: "React、Node.js、SQL、AWS、Docker，负责端到端产品交付。"
            },
            {
                company: "字节跳动",
                role: "前端开发工程师",
                status: "wishlist",
                location: "杭州",
                workMode: "现场",
                salaryMin: 30,
                salaryMax: 45,
                source: "内推",
                appliedAt: null,
                nextStep: "完善项目描述",
                nextStepAt: "2026-07-09T10:00",
                description: "熟悉 JavaScript、React、TypeScript，有复杂 Web 应用性能优化经验。"
            },
            {
                company: "Shopify",
                role: "Product Engineer",
                status: "offer",
                location: "远程",
                workMode: "远程",
                salaryMin: 42,
                salaryMax: 58,
                source: "朋友推荐",
                appliedAt: "2026-05-28",
                nextStep: "评估 Offer",
                nextStepAt: "2026-07-10T18:00",
                description: "使用 React、Ruby、SQL 和 GraphQL 构建商家工具，强调业务影响力。"
            },
            {
                company: "Notion",
                role: "Software Engineer",
                status: "rejected",
                location: "北京",
                workMode: "混合办公",
                salaryMin: 38,
                salaryMax: 55,
                source: "LinkedIn",
                appliedAt: "2026-06-02",
                nextStep: "复盘面试",
                nextStepAt: null,
                description: "TypeScript、React、Node.js、PostgreSQL，关注协作产品与系统设计。"
            }
        ];
        const statement = this.db.prepare(`
      INSERT INTO jobs (
        id, user_id, company, role, status, location, work_mode,
        salary_min, salary_max, source, applied_at, next_step,
        next_step_at, description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        for (const job of jobs) {
            statement.run(randomUUID(), userId, job.company, job.role, job.status, job.location ?? "", job.workMode ?? "远程", job.salaryMin ?? null, job.salaryMax ?? null, job.source ?? "", job.appliedAt ?? null, job.nextStep ?? "", job.nextStepAt ?? null, job.description, now, now);
        }
    }
    login(email, password) {
        const user = this.db
            .prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?")
            .get(email);
        if (!user || !verifyPassword(password, user.password_hash))
            return null;
        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 7 * 86_400_000).toISOString();
        this.db
            .prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
            .run(token, user.id, expiresAt);
        return { token, user: { id: user.id, email: user.email, name: user.name } };
    }
    getUserBySession(token) {
        return this.db
            .prepare(`
        SELECT users.id, users.email, users.name
        FROM sessions JOIN users ON users.id = sessions.user_id
        WHERE sessions.token = ? AND sessions.expires_at > ?
      `)
            .get(token, new Date().toISOString());
    }
    logout(token) {
        this.db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    }
    listJobs(userId) {
        const rows = this.db
            .prepare("SELECT * FROM jobs WHERE user_id = ? ORDER BY updated_at DESC")
            .all(userId);
        return rows.map(mapJob);
    }
    createJob(userId, input) {
        const id = randomUUID();
        const now = new Date().toISOString();
        this.db
            .prepare(`
        INSERT INTO jobs (
          id, user_id, company, role, status, location, work_mode,
          salary_min, salary_max, source, applied_at, next_step,
          next_step_at, description, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
            .run(id, userId, input.company, input.role, input.status, input.location ?? "", input.workMode ?? "远程", input.salaryMin ?? null, input.salaryMax ?? null, input.source ?? "", input.appliedAt ?? null, input.nextStep ?? "", input.nextStepAt ?? null, input.description ?? "", now, now);
        return this.getJob(userId, id);
    }
    getJob(userId, id) {
        const row = this.db
            .prepare("SELECT * FROM jobs WHERE user_id = ? AND id = ?")
            .get(userId, id);
        return row ? mapJob(row) : null;
    }
    updateJob(userId, id, input) {
        const existing = this.getJob(userId, id);
        if (!existing)
            return null;
        const next = { ...existing, ...input, updatedAt: new Date().toISOString() };
        this.db
            .prepare(`
        UPDATE jobs SET company = ?, role = ?, status = ?, location = ?,
          work_mode = ?, salary_min = ?, salary_max = ?, source = ?,
          applied_at = ?, next_step = ?, next_step_at = ?, description = ?,
          updated_at = ? WHERE user_id = ? AND id = ?
      `)
            .run(next.company, next.role, next.status, next.location, next.workMode, next.salaryMin, next.salaryMax, next.source, next.appliedAt, next.nextStep, next.nextStepAt, next.description, next.updatedAt, userId, id);
        return this.getJob(userId, id);
    }
    deleteJob(userId, id) {
        const result = this.db
            .prepare("DELETE FROM jobs WHERE user_id = ? AND id = ?")
            .run(userId, id);
        return result.changes > 0;
    }
    close() {
        this.db.close();
    }
}
