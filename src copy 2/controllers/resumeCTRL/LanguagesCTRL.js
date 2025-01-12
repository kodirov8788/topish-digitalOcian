const Users = require("../../models/user_model"); // Update with the correct path to your model file
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const { handleResponse } = require("../../utils/handleResponse");

// Define a Joi schema for validating the language data
const addLanguagesSchema = Joi.object({
  language: Joi.string().required(),
  proficiency: Joi.string().required(),
});

class Language {
  // POST - Add a new language entry with UUID
  async addLanguages(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized");
    }
    const { language, proficiency } = req.body; // Language data
    const id = uuidv4(); // Generate a UUID for the new entry

    try {
      // Validate the request body against the schema
      const { error } = addLanguagesSchema.validate({ language, proficiency });
      if (error) {
        return handleResponse(res, 400, "error", error.details[0].message);
      }

      // Find the user by ID
      const user = await Users.findById(req.user.id);

      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      const newLanguageEntry = { id, language, proficiency };

      // Add the new language entry with a UUID to the user's resume
      if (!user.resume) {
        user.resume = { languages: [newLanguageEntry] };
      } else {
        user.resume.languages.push(newLanguageEntry);
      }

      // Save the user with the updated languages
      await user.save();

      handleResponse(res, 201, "success", "Language added", newLanguageEntry);
    } catch (error) {
      handleResponse(res, 500, "error", error.message);
    }
  }

  // GET - Retrieve the languages from a user's resume
  async getLanguages(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized");
    }

    try {
      // Find the user by ID
      const user = await Users.findById(req.user.id);

      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      if (!user.resume || !user.resume.languages) {
        return handleResponse(res, 404, "error", "Languages not found");
      }

      handleResponse(
        res,
        200,
        "success",
        "Languages retrieved",
        user.resume.languages,
        user.resume.languages.length
      );
    } catch (error) {
      handleResponse(res, 500, "error", error.message);
    }
  }

  // PUT - Update a specific language entry by UUID
  async updateLanguages(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized");
    }
    const { id } = req.params;
    const { language, proficiency } = req.body; // The updated language data

    try {
      // Validate the request body against the schema
      const { error } = addLanguagesSchema.validate({ language, proficiency });
      if (error) {
        return handleResponse(res, 400, "error", error.details[0].message);
      }

      // Find the user by ID
      const user = await Users.findById(req.user.id);

      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      if (!user.resume || !user.resume.languages) {
        return handleResponse(res, 404, "error", "Languages not found");
      }

      // Find the specific language entry by UUID and update it
      const languageEntryIndex = user.resume.languages.findIndex(
        (entry) => entry.id === id
      );

      if (languageEntryIndex === -1) {
        return handleResponse(res, 404, "error", "Language entry not found");
      }

      // Update the fields of the language entry
      user.resume.languages[languageEntryIndex] = {
        ...user.resume.languages[languageEntryIndex],
        language,
        proficiency,
      };

      // Save the updated user
      await user.save();
      // Send the updated language entry as the response
      handleResponse(
        res,
        200,
        "success",
        "Language updated",
        user.resume.languages[languageEntryIndex]
      );
    } catch (error) {
      handleResponse(res, 500, "error", error.message);
    }
  }

  // DELETE - Delete a specific language entry by UUID
  async deleteLanguages(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized");
    }
    const { id } = req.params; // Assuming you pass the UUID of the language entry as a URL parameter

    try {
      // Find the user by ID
      const user = await Users.findById(req.user.id);

      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      if (!user.resume || !user.resume.languages) {
        return handleResponse(res, 404, "error", "Languages not found");
      }

      // Find the specific language entry by UUID and remove it
      const languageEntryIndex = user.resume.languages.findIndex(
        (entry) => entry.id === id
      );
      if (languageEntryIndex === -1) {
        return handleResponse(res, 404, "error", "Language entry not found");
      }

      // Remove the language entry from the array
      user.resume.languages.splice(languageEntryIndex, 1);

      // Save the user with the language entry removed
      await user.save();
      handleResponse(res, 200, "success", "Language entry deleted");
    } catch (error) {
      handleResponse(res, 500, "error", error.message);
    }
  }
}

module.exports = new Language();
