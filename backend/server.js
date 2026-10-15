"use strict";

require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const db = require("./db");

const providersRouter = require("./routes/providers");
const estimatesRouter = require("./routes/estimates");
const projectsRouter = require("./routes/projects");
const recommendationsRouter = require("./routes/recommendations");
const architectureRouter = require("./routes/architecture");
const costsRouter = require("./routes/costs");
const advisorsRouter = require("./routes/advisors");
const reportsRouter = require("./routes/reports");
const adminRouter = require("./routes/admin");

const app = express();

// Security and parsing middleware
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(cors());
app.use(express.json({ limit: "500kb" }));

// Structured request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "test") {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
});

// Health check endpoint (compatible with Docker & legacy checks)
app.get("/api/health", (req, res) => {
  try {
    db.prepare("SELECT 1").get();
    res.json({
      success: true,
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      status: "error",
      database: "disconnected",
      error: err.message
    });
  }
});

// Mount modular API routers
app.use("/api/providers", providersRouter);
app.use("/api/estimates", estimatesRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/recommendations", recommendationsRouter);
app.use("/api/architecture", architectureRouter);
app.use("/api/costs", costsRouter);
app.use("/api/database-advisor", advisorsRouter);
app.use("/api/finops-advisor", advisorsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/admin", adminRouter);

// Centralized 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error"
  });
});

const port = Number(process.env.PORT || 3000);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, "0.0.0.0", () => {
    console.log(`CloudBlueprint API listening on port ${port} (0.0.0.0)`);
  });
}

module.exports = app;
