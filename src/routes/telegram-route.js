const bot = require("../../bot");
const {
    addTelegramChannel,
    deleteTelegramChannel,
    updateTelegramChannel,
    getTelegramChannels,
    leaveChannel,
    addTelegramId,
    removeTelegramId,
    saveChannel,
    removeChannel,
    uploadTelegramImages,
    deleteTelegramImages,
    deleteSingleTelegramImage,
    addOrUpdateTelegramData,
    deleteTelegramData,
    changeSelectedImage,
    changeSelectedPost
} = require("../controllers/telegramCTRL");
const authMiddleware = require("../middleware/auth-middleware");
const router = require("express").Router();


// router.post("/", authMiddleware, addTelegramChannel);
router.get("/", authMiddleware, getTelegramChannels);
router.delete("/:id", authMiddleware, deleteTelegramChannel);
router.patch("/:id", authMiddleware, updateTelegramChannel);
router.post('/leave-channel', authMiddleware, leaveChannel);

router.post('/save-channel', saveChannel);
router.post('/remove-channel', removeChannel);
router.post("/add-telegram-id", addTelegramId);
router.post("/add-update-data", authMiddleware, addOrUpdateTelegramData);
router.post("/delete-telegram-data", authMiddleware, deleteTelegramData);
router.post('/remove-telegram-id', authMiddleware, removeTelegramId);
router.post("/upload-post-images", authMiddleware, uploadTelegramImages);
router.post("/delete-post-images", authMiddleware, deleteTelegramImages);
router.post("/delete-single-telegram-image", authMiddleware, deleteSingleTelegramImage);
router.post("/change-selected-image", authMiddleware, changeSelectedImage);
router.post("/change-selected-post", authMiddleware, changeSelectedPost);


module.exports = router;



