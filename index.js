const express = require("express");
const process = require("process");
const app = express();
require("dotenv").config(); // It exports .env files
require("express-async-errors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const cors = require("cors");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const authRouter = require("./src/routes/auth-routes");
const avatarRouter = require("./src/routes/avatar-routes");
const userRouter = require("./src/routes/user-routes");
const accessRouter = require("./src/routes/profile_access");
const authMiddleware = require("./src/middleware/auth-middleware");
const connnectDB = require("./src/db/connect");
const jobRouter = require("./src/routes/jobs-routes");
const quickjobRouter = require("./src/routes/quickjobs-routes");
const setupSwagger = require("./src/utils/swaggerConfig");
const resumeCtrl = require("./src/routes/resume-routes");
const StatisticsCTRL = require("./src/routes/statistics-routes");
const GalleryRouter = require("./src/routes/gallery-routes");
const BannerRoutes = require("./src/routes/banner-route");
const Offices = require("./src/routes/offices-routes");
const adminRouter = require("./src/routes/admin-route");
const companyRouter = require("./src/routes/company-route");
const deleteAuthPublic = require("./src/routes/deleteAuthPublic");
const googlePlayRoute = require("./src/routes/googlePlay-route");
const otherRoutes = require("./src/routes/other-routers");
const reportUser = require("./src/routes/reportUser-routes");
const tournament = require("./src/routes/tournament_route");

const { initSocketServer } = require("./src/socket/Socket");
const http = require("http");
const server = http.createServer(app);
initSocketServer(server);
//Middleware
app.set("trust proxy", 1);
app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));
// app.use((req, res, next) => {
//   console.log(`Incoming request from ${req.origin}: headers ->`, req.headers);
//   next();
// });
app.use(helmet());
const corsOptions = {
  origin: (origin, callback) => {
    // As "*" cannot be used with credentials: true, you need to explicitly set the allowed origin
    if (!origin) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.static("public"));
// app.use(express.urlencoded());

// ----------------- Rate Limiter and IP Blocking -----------------
//routes
app.get("/", (req, res) => {
  res.send("<h1>Jobs API 11</h1>");
});
// ----------------- Rate Limiter and IP Blocking -----------------
let blockedIPs = {};
// Function to unblock an IP after a specified timeout
function unblockIP(ip) {
  setTimeout(() => {
    // Remove the IP from the blocked list after 2 minutes
    delete blockedIPs[ip];
    // console.log(`IP unblocked: ${ip}`);
  }, 2 * 60 * 1000); // 2 minutes in milliseconds
}
// Middleware to check for blocked IPs
const checkBlockedIPMiddleware = (req, res, next) => {
  const ip = req.ip; // Get client's IP address
  // console.log("Access attempt from IP: ", ip, 'Blocked IPs:', Object.keys(blockedIPs));
  if (blockedIPs[ip]) {
    return res
      .status(429)
      .json({ message: "To'xtat bo'ldi, ishlamaydi baribir" }); // IP is blocked
  }
  next();
};

// Apply the middleware to check for blocked IPs
app.use(checkBlockedIPMiddleware);

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 200, // Limit each IP to 200 requests per windowMs for demonstration
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply the rate limiter middleware
app.use(limiter);

app.use((req, res, next) => {
  // Check the X-RateLimit-Remaining header to see if it's 0
  if (res.getHeaders()["ratelimit-remaining"] === "0") {
    const ip = req.ip;
    // console.log(`IP exceeded rate limits and will be blocked: ${ip}`);
    blockedIPs[ip] = true; // Mark the IP as blocked
    unblockIP(ip); // Schedule to unblock this IP after 2 minutes
  }
  next();
});
// ----------------- Rate Limiter and IP Blocking -----------------

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/google", deleteAuthPublic);
app.use("/api/v1/admin", authMiddleware, adminRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/quickjobs", quickjobRouter);
app.use("/api/v1/users", userRouter); // removed authMiddleware for a while
app.use("/api/v1/users/avatar", authMiddleware, avatarRouter); // removed authMiddleware for a while
app.use("/api/v1/privacy", authMiddleware, accessRouter);
app.use("/api/v1/users/resume", authMiddleware, resumeCtrl);
app.use("/api/v1/statistics", StatisticsCTRL);
app.use("/api/v1/gallery", authMiddleware, GalleryRouter);
app.use("/api/v1/banner", BannerRoutes);
app.use("/api/v1/offices", authMiddleware, Offices);
app.use("/api/v1/companies", companyRouter);
app.use("/api/v1/tournaments", tournament);
app.use("/api/v1/others", authMiddleware, otherRoutes);
app.use("/api/v1/report", authMiddleware, reportUser);

app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.nonce = nonce; // Make nonce available in locals
  res.setHeader(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'`
  );
  next();
});

app.get("/api/v1/privatePolicy", async (req, res) => {
  await googlePlayRoute.PrivatePolicy(req, res);
});

app.get("/api/v1/deleteAccount", async (req, res) => {
  await googlePlayRoute.DeleteAccount(req, res);
});
setupSwagger(app);
const port = process.env.PORT || 8080;
const start = async () => {
  try {
    await connnectDB(process.env.MONGO_URI),
      server.listen(port, console.log(`it's listening ${port}  `));
  } catch (err) {
    console.log(err);
  }
};

start();
