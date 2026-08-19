require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const taskRoutes = require("./routes/task.routes");
const documentRoutes = require("./routes/document.routes");
const projectRoutes = require("./routes/project.routes");
const notificationRoutes = require("./routes/notification.routes");
const calendarRoutes = require("./routes/calendar.routes");
const commentRoutes = require("./routes/comment.routes");
const { notFound, errorHandler } = require("./middleware/error.middleware");
const { validateEnv } = require("./config/env");

validateEnv();
const app = express();
const uploadDir = process.env.UPLOAD_DIR || "uploads";
const clientUrl = process.env.CLIENT_URL;
const stableVercelDomain = "https://internshipelectrolytefinaldeployment.vercel.app";
const vercelProjectPattern =
  /^https:\/\/internshipelectrolytefinaldeployment-[a-z0-9-]+\.vercel\.app$/i;

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  try {
    const requestOrigin = new URL(origin).origin;

    if (clientUrl && requestOrigin === new URL(clientUrl).origin) return true;
    if (requestOrigin === stableVercelDomain) return true;
    if (vercelProjectPattern.test(requestOrigin)) return true;

    return false;
  } catch {
    return false;
  }
};

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 250 }));
app.use("/uploads", express.static(path.join(process.cwd(), uploadDir)));

app.get("/health", (_req, res) => res.json({ success: true, message: "API healthy" }));
app.use("/", authRoutes);
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/documents", documentRoutes);
app.use("/comments", commentRoutes);
app.use("/notifications", notificationRoutes);
app.use("/calendar", calendarRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
