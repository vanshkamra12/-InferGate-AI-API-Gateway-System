import request from "supertest";
import express from "express";

// spin up just the health/metrics routes — no redis or mongo
function buildApp() {
  const app = express();
  app.use(express.json());

  let totalRequests = 0;
  app.use((_req, _res, next) => { totalRequests++; next(); });

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "OK",
      service: "gateway-test",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/metrics", (_req, res) => {
    res.status(200).json({
      totalRequests,
      uptime: process.uptime(),
      memoryUsage: {
        rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
      },
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}

describe("GET /health", () => {
  const app = buildApp();

  it("returns 200 with status OK", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
  });

  it("includes uptime and a timestamp", async () => {
    const res = await request(app).get("/health");
    expect(typeof res.body.uptime).toBe("number");
    expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("GET /metrics", () => {
  const app = buildApp();

  it("returns memory usage fields", async () => {
    const res = await request(app).get("/metrics");
    expect(res.status).toBe(200);
    expect(res.body.memoryUsage).toHaveProperty("rss");
    expect(res.body.memoryUsage).toHaveProperty("heapUsed");
  });

  it("increments request count across calls", async () => {
    const first = await request(app).get("/metrics");
    const second = await request(app).get("/metrics");
    expect(second.body.totalRequests).toBeGreaterThan(first.body.totalRequests);
  });
});
