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
    removeChannel
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
router.post('/remove-telegram-id', authMiddleware, removeTelegramId);



module.exports = router;
