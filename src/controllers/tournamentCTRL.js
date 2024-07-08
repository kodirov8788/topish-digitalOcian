const { v4: uuidv4 } = require('uuid');
const Tournament = require("../models/tournament_model");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");
const { deleteFiles } = require("../utils/TurnerUpload");

class TournamentsCTRL {

  async createTournament(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id);
      if (user.role !== 'Admin' && user.role !== "Employer") {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const tournamentDetails = {
        ...req.body,
        tournament_id: uuidv4(), // Generate unique tournament_id
        createdBy: req.user._id,
        participants: [],
        image: req.files && req.files.length ? req.files[0] : "",
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
      if (req.files && req.files.length) {
        await deleteFiles(req.files); // Cleanup uploaded file if tournament creation fails
      }
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }

  async deleteTournament(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id);
      if (user.role !== 'Admin' && user.role !== "Employer") {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { params: { id: tournamentID } } = req;

      const tournament = await Tournament.findOneAndDelete({
        _id: tournamentID,
        createdBy: req.user._id,
      });

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

      if (tournament.image) {
        await deleteFiles([tournament.image]);
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

      const user = await Users.findById(req.user.id);
      if (user.role !== 'Admin' && user.role !== "Employer") {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { params: { id: tournamentID } } = req;

      const updateData = { ...req.body };
      if (req.files && req.files.length) {
        updateData.image = req.files[0];
      }

      const updatedTournament = await Tournament.findOneAndUpdate(
        { _id: tournamentID, createdBy: req.user._id },
        updateData,
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
      if (req.files && req.files.length) {
        await deleteFiles(req.files); // Cleanup uploaded file if tournament update fails
      }
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }

  async searchTournaments(req, res) {
    try {
      const { name, page = 1, limit = 10 } = req.query;

      let queryObject = {};

      if (name && name.trim()) {
        queryObject = {
          tournament_name: { $regex: name, $options: "i" },
        };
      }

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

      if (tournament.participants.some((participant) => participant.userId === user)) {
        return handleResponse(
          res,
          400,
          "error",
          "You have already joined this tournament",
          null,
          0
        );
      }

      const playerId = `topish${Math.floor(1000 + Math.random() * 9000)}`;
      const specialCode = `topish-${tournament.tournament_id.slice(-4)}${user.slice(-4)}`;

      tournament.participants.push({
        userId: user,
        playerId,
        specialCode,
      });

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

      const participantIndex = tournament.participants.findIndex(
        (participant) => participant.userId === user
      );

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

  async updateTournamentStatus(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const user = await Users.findById(req.user.id);
      if (user.role !== 'Admin' && user.role !== 'Employer') {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { params: { id: tournamentID } } = req;
      const { status } = req.body;

      if (status) {
        const validStatuses = ["open", "closed", "expired"];
        if (!validStatuses.includes(status)) {
          return handleResponse(res, 400, "error", "Invalid status value", null, 0);
        }
      }

      const updatedTournament = await Tournament.findOneAndUpdate(
        { _id: tournamentID, createdBy: req.user._id },
        { status },
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
        "Tournament status updated successfully",
        updatedTournament,
        1
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }

  async checkUserInTournament(req, res) {
    try {
      const { id: tournamentID } = req.params;
      const { specialCode } = req.body;

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

      const participant = tournament.participants.find(
        (participant) => participant.specialCode === specialCode
      );

      if (!participant) {
        return handleResponse(
          res,
          404,
          "error",
          "Participant not found in this tournament",
          null,
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "Participant found in tournament",
        participant,
        1
      );
    } catch (error) {
      return handleResponse(res, 500, "error", error.message, null, 0);
    }
  }
}

module.exports = new TournamentsCTRL();
