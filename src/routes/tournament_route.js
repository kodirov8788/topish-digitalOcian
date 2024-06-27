const TournamentsCTRL = require("../controllers/tournamentCTRL");
const router = require("express").Router();
const authMiddleware = require("../middleware/auth-middleware");
const { uploadFiles } = require("../utils/TurnerUpload");

router.post("/", authMiddleware, uploadFiles, TournamentsCTRL.createTournament);
router.delete("/:id", authMiddleware, TournamentsCTRL.deleteTournament);
router.get("/:id", TournamentsCTRL.getTournament);
router.patch("/:id", authMiddleware, uploadFiles, TournamentsCTRL.updateTournament); // Add uploadFiles middleware for updates
router.get("/", TournamentsCTRL.searchTournaments);
router.post("/:id/join", authMiddleware, TournamentsCTRL.joinTournament);
router.post("/:id/leave", authMiddleware, TournamentsCTRL.leaveTournament);
router.patch("/:id/updateStatus", authMiddleware, TournamentsCTRL.updateTournamentStatus);

module.exports = router;
