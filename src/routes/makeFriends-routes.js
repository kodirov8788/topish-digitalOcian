const {
  sendInvitationToFriend,
  acceptFriendRequest,
  blockFriend,
  getAcceptedFriends,
  getPendingFriends,
  getBlockedFriends,
  deleteFriendShip,
  cancelFriendRequest,
  getFollowers,
  getFollowing,
  getAllCounts,
} = require("../controllers/makeFriendsCTRL");
const router = require("express").Router();
router.get("/", getAcceptedFriends);
router.get("/pending", getPendingFriends);
router.get("/blocked", getBlockedFriends);
router.post("/sendInvitation", sendInvitationToFriend);
router.post("/acceptFriendRequest", acceptFriendRequest);
router.post("/blockFriend", blockFriend);
router.get("/followers", getFollowers);
router.get("/following", getFollowing);
router.get("/getAllCounts", getAllCounts);
router.delete("/deleteFriend/:friendId", deleteFriendShip);
router.delete("/cancelFriendRequest/:receiverId", cancelFriendRequest);

module.exports = router;
