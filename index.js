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
const connnectDB = require("./src/db/connect");
const setupSwagger = require("./src/utils/swaggerConfig");
// const swaggerJsDoc = require('swagger-jsdoc');
const MainRouter = require("./src/routes/index");
const { initSocketServer } = require("./src/socket/Socket");
const http = require("http");
const path = require("path");
const server = http.createServer(app);
initSocketServer(server);
app.set("trust proxy", 1);
app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));
app.use(helmet());
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));
const corsOptions = {
  origin: '*', // Allow all origins
  credentials: false, // Do not allow credentials when using '*'
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
// ----------------- Rate Limiter and IP Blocking -----------------
let blockedIPs = {};
function unblockIP(ip) {
  setTimeout(() => {
    delete blockedIPs[ip];
  }, 2 * 60 * 1000); // 2 minutes in milliseconds
}
const checkBlockedIPMiddleware = (req, res, next) => {
  const ip = req.ip; // Get client's IP address
  if (blockedIPs[ip]) {
    return res
      .status(429)
      .json({ message: "To'xtat bo'ldi, ishlamaydi baribir" }); // IP is blocked
  }
  next();
};
app.use(checkBlockedIPMiddleware);
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 200, // Limit each IP to 200 requests per windowMs for demonstration
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
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

app.use('/', MainRouter);
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.nonce = nonce; // Make nonce available in locals
  res.setHeader(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'`
  );
  next();
});

app.get('/swagger-spec.json', (req, res) => {
  res.json(swaggerSpecs);
});
setupSwagger(app);

const port = process.env.PORT || 8080;
console.log("MONO URI", process.env.MONGO_URI);
const start = async () => {
  try {
    await connnectDB(process.env.MONGO_URI),
      server.listen(port, console.log(`it's listening ${port}  `));
  } catch (err) {
    console.log(err);
  }
};

start();
