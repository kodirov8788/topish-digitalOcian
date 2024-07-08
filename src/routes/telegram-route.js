const {
    addTelegramChannel,
    deleteTelegramChannel,
    updateTelegramChannel,
    getTelegramChannels,
} = require("../controllers/telegramCTRL");
const router = require("express").Router();

router.route("/").post(addTelegramChannel);
router.route("/").get(getTelegramChannels);
router.route("/:channelId").delete(deleteTelegramChannel);
router.route("/:channelId").patch(updateTelegramChannel);


module.exports = router;
