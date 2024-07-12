const router = require("express").Router();
const { Professions } = require("../models/other_models");
const { handleResponse } = require("../utils/handleResponse");

router.route("/professions").get(async (req, res) => {
  try {
    const { language } = req.query; // Use req.query for GET requests
    if (!language) {
      return handleResponse(
        res,
        400,
        "error",
        "Language is required",
        null,
        0
      );
    }
    const professions = await Professions.find({ language });
    if (!professions.length) {
      return handleResponse(
        res,
        200,
        "success",
        "No professions found",
        [],
        0
      );
    }

    return handleResponse(
      res,
      200,
      "success",
      "Professions fetched successfully",
      professions[0].profession,
      1
    );
  } catch (error) {
    console.error("Error fetching professions:", error);
    return handleResponse(
      res,
      500,
      "error",
      "Something went wrong: " + error.message,
      null,
      0
    );
  }
});

router.route("/professions").post(async (req, res) => {
  try {
    const { professions, language } = req.body;
    if (!professions || !Array.isArray(professions) || !professions.length) {
      return handleResponse(
        res,
        400,
        "error",
        "Professions should be a non-empty array",
        null,
        0
      );
    }
    if (!language) {
      return handleResponse(
        res,
        400,
        "error",
        "Language is required",
        null,
        0
      );
    }

    const validProfessions = professions.filter(
      (profession) => typeof profession === "string" && profession.trim() !== ""
    );

    if (!validProfessions.length) {
      return handleResponse(
        res,
        400,
        "error",
        "Professions should contain valid non-empty strings",
        null,
        0
      );
    }

    let professionData = await Professions.findOne({ language });
    if (!professionData) {
      const newProfessions = new Professions({
        profession: validProfessions,
        language,
      });
      await newProfessions.save();
      return handleResponse(
        res,
        200,
        "success",
        "Professions created successfully",
        newProfessions.profession,
        1
      );
    } else {
      professionData.profession = validProfessions;
      await professionData.save();
      return handleResponse(
        res,
        200,
        "success",
        "Professions updated successfully",
        professionData.profession,
        1
      );
    }
  } catch (error) {
    console.error("Error in updateProfessions function:", error);
    return handleResponse(
      res,
      500,
      "error",
      "Something went wrong: " + error.message,
      null,
      0
    );
  }
});

module.exports = router;
