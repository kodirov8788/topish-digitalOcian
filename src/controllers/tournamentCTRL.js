const Tournament = require("../models/tournament_model");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");

class TournamentsCTRL {
  async createTournament(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id).select("-password");
      if (user.role !== 'Admin') return handleResponse(res, 401, "error", "Unauthorized", null, 0);

      const tournamentDetails = {
        ...req.body,
        createdBy: req.user._id,
        participants: []
      };

      const tournament = await Tournament.create(tournamentDetails);

      return handleResponse(
        res,
        201,
        "success",
        "Tournament created successfully",
        tournament,
        1
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }

  async deleteTournament(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const user = await Users.findById(req.user.id).select("-password");
      if (user.role !== 'Admin') return handleResponse(res, 401, "error", "Unauthorized", null, 0);

      const {
        params: { id: tournamentID },
      } = req;

      const deleteTournament = await Tournament.findOneAndDelete({
        _id: tournamentID,
        createdBy: req.user._id,
      });
      if (!deleteTournament) {
        return handleResponse(
          res,
          404,
          "error",
          `Tournament with id: ${tournamentID} not found`,
          null,
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "Tournament deleted successfully",
        null,
        1
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }

  async getTournament(req, res) {
    try {
      const { id: tournamentID } = req.params;

      if (!tournamentID) {
        return handleResponse(res, 400, "error", "Invalid tournament ID", null, 0);
      }

      const tournament = await Tournament.findById(tournamentID);

      if (!tournament) {
        return handleResponse(
          res,
          404,
          "error",
          `Tournament not found with ID: ${tournamentID}`,
          null,
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "Tournament retrieved successfully",
        tournament,
        1
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }

  async updateTournament(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }
      const user = await Users.findById(req.user.id).select("-password");
      if (user.role !== 'Admin') return handleResponse(res, 401, "error", "Unauthorized", null, 0);

      const {
        params: { id: tournamentID },
      } = req;

      const updatedTournament = await Tournament.findOneAndUpdate(
        { _id: tournamentID, createdBy: req.user._id },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedTournament) {
        return handleResponse(
          res,
          404,
          "error",
          `Tournament not found with ID: ${tournamentID}`,
          null,
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "Tournament updated successfully",
        updatedTournament,
        1
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }

  async searchTournaments(req, res) {
    try {
      const { name, page = 1, limit = 10 } = req.query;

      if (!name || !name.trim()) {
        return handleResponse(
          res,
          200,
          "error",
          "Tournament name is required",
          [],
          0
        );
      }

      let queryObject = {
        tournament_name: { $regex: name, $options: "i" },
      };

      const tournaments = await Tournament.find(queryObject)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const totalTournaments = await Tournament.countDocuments(queryObject);

      if (tournaments.length === 0) {
        return handleResponse(res, 200, "error", "No tournaments found", [], 0);
      }

      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTournaments / limit),
        limit: parseInt(limit),
        totalDocuments: totalTournaments,
      };

      return handleResponse(
        res,
        200,
        "success",
        "Tournaments retrieved successfully",
        tournaments,
        tournaments.length,
        pagination
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }

  async joinTournament(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { id: tournamentID } = req.params;
      const user = req.user.id;

      const tournament = await Tournament.findById(tournamentID);
      if (!tournament) {
        return handleResponse(
          res,
          404,
          "error",
          `Tournament with id: ${tournamentID} not found`,
          null,
          0
        );
      }

      if (tournament.participants.includes(user.id)) {
        return handleResponse(
          res,
          400,
          "error",
          "You have already joined this tournament",
          null,
          0
        );
      }

      tournament.participants.push(user.id);
      await tournament.save();

      return handleResponse(
        res,
        200,
        "success",
        "Joined tournament successfully",
        tournament,
        1
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }

  async leaveTournament(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { id: tournamentID } = req.params;
      const user = req.user.id;

      const tournament = await Tournament.findById(tournamentID);
      if (!tournament) {
        return handleResponse(
          res,
          404,
          "error",
          `Tournament with id: ${tournamentID} not found`,
          null,
          0
        );
      }

      const participantIndex = tournament.participants.indexOf(user.id);
      if (participantIndex === -1) {
        return handleResponse(
          res,
          400,
          "error",
          "You are not a participant in this tournament",
          null,
          0
        );
      }

      tournament.participants.splice(participantIndex, 1);
      await tournament.save();

      return handleResponse(
        res,
        200,
        "success",
        "Left tournament successfully",
        tournament,
        1
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
}

module.exports = new TournamentsCTRL();
