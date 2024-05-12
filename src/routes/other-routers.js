const router = require("express").Router();
const { Professions } = require("../models/other_models");
const { handleResponse } = require("../utils/handleResponse");

router.route("/professions").get(async (req, res) => {
    try {
        const professions = await Professions.find();
        if (!professions.length) {
            return handleResponse(res, 200, 'success', 'No professions found', [], 0);
        }
        let inside = professions[0].profession;

        return handleResponse(res, 200, 'success', 'Professions fetched successfully', [...inside], 1);
    } catch (error) {
        console.error("Error fetching professions:", error);
        return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
    }
});

router.route("/professions").post(async (req, res) => {
    try {
        const { professions } = req.body;
        if (!professions || !professions.length) {
            return handleResponse(res, 200, "success", "no new professions to update", [], 0);
        }
        let newProfession = professions.filter((profession) => {
            if (typeof profession !== 'string') {
                return handleResponse(res, 400, 'error', 'Professions should be an array of strings', null, 0);
            }
        });
        newProfession = professions.filter((profession) => profession.trim() !== '');
        const professionsData = await Professions.find();
        if (!professionsData.length) {
            const newProfessions = new Professions({
                profession: newProfession
            });
            await newProfessions.save();
            let inside = newProfessions.profession;
            return handleResponse(res, 200, 'success', 'Professions updated successfully', [...inside], 1);
        }
        else {
            const updatedProfessions = await Professions.findOneAndUpdate({}, { profession: newProfession }, { new: true });
            console.log("updatedProfessions", updatedProfessions);
            let inside = updatedProfessions.profession;
            return handleResponse(res, 200, 'success', 'Professions updated successfully', [...inside], 1);
        }
    } catch (error) {
        console.error("Error in updateProfessions function:", error);
        return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
    }
}
);


module.exports = router;
