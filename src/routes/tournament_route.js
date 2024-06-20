const TournamentsCTRL = require("../controllers/tournamentCTRL");
const router = require("express").Router();
const authMiddleware = require("../middleware/auth-middleware");

router.post("/", authMiddleware, TournamentsCTRL.createTournament);
router.delete("/:id", authMiddleware, TournamentsCTRL.deleteTournament);
router.get("/:id", TournamentsCTRL.getTournament);
router.patch("/:id", authMiddleware, TournamentsCTRL.updateTournament);
router.get("/", TournamentsCTRL.searchTournaments);
router.post("/:id/join", authMiddleware, TournamentsCTRL.joinTournament);
router.post("/:id/leave", authMiddleware, TournamentsCTRL.leaveTournament);

module.exports = router;