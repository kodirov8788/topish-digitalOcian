const router = require("express").Router();
const authRouter = require("./auth-routes");
const avatarRouter = require("./avatar-routes");
const userRouter = require("./user-routes");
const accessRouter = require("./profile_access");
const jobRouter = require("./jobs-routes");
const quickJobRouter = require("./quickjobs-routes");
const resumeCtrl = require("./resume-routes");
const StatisticsCTRL = require("./statistics-routes");
const GalleryRouter = require("./gallery-routes");
const BannerRoutes = require("./banner-route");
const Offices = require("./offices-routes");
const adminRouter = require("./admin-route");
const companyRouter = require("./company-route");
const deleteAuthPublic = require("./deleteAuthPublic");
const googlePlayRoute = require("./googlePlay-route");
const otherRoutes = require("./other-routers");
const reportUser = require("./reportUser-routes");
const tournament = require("./tournament_route");
const telegramRouter = require("./telegram-route");
const makeFriendRouter = require("./makeFriends-routes");
const storyRouter = require("./story_route");
const discoverRouter = require("./discover-route");
const businessServicesRouter = require("./business_services_route");
const discoverTagsRoutes = require("./discoverTags-route");
const businessServicessTagsRoutes = require("./business_servicesTags-route");
const authMiddleware = require("../middleware/auth-middleware");

router.use("/api/v1/auth", authRouter);
router.use("/api/v1/google", deleteAuthPublic);
router.use("/api/v1/admin", authMiddleware, adminRouter);
router.use("/api/v1/jobs", jobRouter);
router.use("/api/v1/quickjobs", quickJobRouter);
router.use("/api/v1/users", userRouter);
router.use("/api/v1/users/avatar", authMiddleware, avatarRouter); // removed authMiddleware for a while
router.use("/api/v1/privacy", authMiddleware, accessRouter);
router.use("/api/v1/users/resume", authMiddleware, resumeCtrl);
router.use("/api/v1/statistics", StatisticsCTRL);
router.use("/api/v1/gallery", authMiddleware, GalleryRouter);
router.use("/api/v1/banner", BannerRoutes);
router.use("/api/v1/offices", authMiddleware, Offices);
router.use("/api/v1/companies", companyRouter);
router.use("/api/v1/tournaments", tournament);
router.use("/api/v1/others", authMiddleware, otherRoutes);
router.use("/api/v1/report", authMiddleware, reportUser);
router.use("/api/v1/telegram", telegramRouter);
router.use("/api/v1/makeFriends", authMiddleware, makeFriendRouter);
router.use("/api/v1/discovers", discoverRouter);
router.use("/api/v1/stories", storyRouter);
router.use("/api/v1/business-services", businessServicesRouter);
router.use("/api/v1/discoverTags", discoverTagsRoutes);
router.use("/api/v1/business-servicesTags", businessServicessTagsRoutes);

//routes
router.get("/", (req, res) => {
  res.send("<h1>Topish online ishlamoqda...  test 1</h1>");
});
router.get("/api/v1/privatePolicy", async (req, res) => {
  await googlePlayRoute.PrivatePolicy(req, res);
});

router.get("/api/v1/deleteAccount", async (req, res) => {
  await googlePlayRoute.DeleteAccount(req, res);
});

module.exports = router;
