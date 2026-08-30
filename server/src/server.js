const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const apiRoutes = require("./routes");
const { env, validateEnv } = require("./config/env");
const { notFoundHandler, errorHandler } = require("./middleware/error-handler");

const app = express();
const envCheck = validateEnv();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.json({
    service: "UniPam Backend",
    status: "running",
    env: env.nodeEnv,
    envReady: envCheck.ok,
    missingEnv: envCheck.missing
  });
});

app.use("/api/v1", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`UniPam backend listening on http://localhost:${env.port}`);
});
