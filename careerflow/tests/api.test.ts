import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { AddressInfo } from "node:net";
import { createApp } from "../server/app.js";

const application = createApp(":memory:");
let baseUrl = "";
let cookie = "";

before(async () => {
  const server = application.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => application.close());

async function request(path: string, options: RequestInit = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...options.headers
    }
  });
}

describe("CareerFlow API", () => {
  it("rejects unauthenticated job requests", async () => {
    const response = await request("/api/jobs");
    assert.equal(response.status, 401);
  });

  it("logs in with the demo account", async () => {
    const response = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "demo@careerflow.dev",
        password: "demo123"
      })
    });
    assert.equal(response.status, 200);
    cookie = response.headers.getSetCookie()[0].split(";")[0];
    const body = await response.json();
    assert.equal(body.user.name, "林默");
  });

  it("lists seeded jobs and analytics", async () => {
    const jobsResponse = await request("/api/jobs");
    const jobsBody = await jobsResponse.json();
    assert.equal(jobsResponse.status, 200);
    assert.equal(jobsBody.jobs.length, 5);

    const analyticsResponse = await request("/api/analytics");
    const analyticsBody = await analyticsResponse.json();
    assert.deepEqual(analyticsBody.analytics, {
      total: 5,
      active: 3,
      interviews: 2,
      offers: 1,
      interviewRate: 50,
      offerRate: 50
    });
  });

  it("creates, updates and deletes a job", async () => {
    const createResponse = await request("/api/jobs", {
      method: "POST",
      body: JSON.stringify({
        company: "OpenAI",
        role: "Product Engineer",
        status: "wishlist",
        location: "Remote"
      })
    });
    assert.equal(createResponse.status, 201);
    const created = (await createResponse.json()).job;

    const updateResponse = await request(`/api/jobs/${created.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "applied" })
    });
    assert.equal(updateResponse.status, 200);
    assert.equal((await updateResponse.json()).job.status, "applied");

    const deleteResponse = await request(`/api/jobs/${created.id}`, {
      method: "DELETE"
    });
    assert.equal(deleteResponse.status, 204);
  });

  it("validates job salary ranges", async () => {
    const response = await request("/api/jobs", {
      method: "POST",
      body: JSON.stringify({
        company: "Acme",
        role: "Engineer",
        status: "wishlist",
        salaryMin: 50,
        salaryMax: 30
      })
    });
    assert.equal(response.status, 400);
  });

  it("returns explainable match analysis", async () => {
    const response = await request("/api/analyze", {
      method: "POST",
      body: JSON.stringify({
        resumeText: "Built React and TypeScript apps, improving load time by 40%.",
        jobDescription: "We need React, TypeScript, Node.js and Docker experience."
      })
    });
    assert.equal(response.status, 200);
    const result = (await response.json()).result;
    assert.equal(result.score, 60);
    assert.deepEqual(result.matchedSkills, ["react", "typescript"]);
    assert.deepEqual(result.missingSkills, ["node.js", "docker"]);
  });
});
