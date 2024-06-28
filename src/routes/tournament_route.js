const TournamentsCTRL = require("../controllers/tournamentCTRL");
const router = require("express").Router();
const authMiddleware = require("../middleware/auth-middleware");
const { uploadFiles } = require("../utils/TurnerUpload");

router.post("/", authMiddleware, uploadFiles, TournamentsCTRL.createTournament);
router.delete("/:id", authMiddleware, TournamentsCTRL.deleteTournament);
router.get("/:id", TournamentsCTRL.getTournament);
router.patch("/:id", authMiddleware, TournamentsCTRL.updateTournament);
router.get("/", TournamentsCTRL.searchTournaments);
router.post("/:id/join", authMiddleware, TournamentsCTRL.joinTournament);
router.post("/:id/leave", authMiddleware, TournamentsCTRL.leaveTournament);
router.patch("/:id/updateStatus", authMiddleware, TournamentsCTRL.updateTournamentStatus);
router.post("/:id/checkUser", TournamentsCTRL.checkUserInTournament);

module.exports = router;
