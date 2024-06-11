const Resume = require("../../models/resume_model"); // Update with the correct path to your model file
const Users = require("../../models/user_model");
const { handleResponse } = require("../../utils/handleResponse");
function validateEmail(email) {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^\d{9}$/; // Adjust the regex based on your phone number format
  return re.test(phone);
}

class Contact {
  async addContact(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }
    const { email, phone } = req.body;
    // Basic validation for email, phone, and location
    if (!email || !validateEmail(email)) {
      return handleResponse(
        res,
        400,
        "error",
        "Invalid or missing email address.",
        null,
        0
      );
    }
    if (!phone || !validatePhone(phone)) {
      return handleResponse(
        res,
        400,
        "error",
        "Invalid or missing phone number.",
        null,
        0
      );
    }
    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const resume = await Resume.findById(user.resumeId);
      if (!resume) {
        const newResume = new Resume({
          contact: { email, phone, location },
        });
        await newResume.save();
        user.resumeId = newResume._id;
        await user.save();
        return handleResponse(
          res,
          201,
          "success",
          "Contact added successfully",
          newResume.contact,
          1
        );
      }

      resume.contact = { email, phone };
      await resume.save();
      return handleResponse(
        res,
        200,
        "success",
        "Contact updated successfully",
        resume.contact,
        1
      );
    } catch (error) {
      console.error(error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while adding/updating the contact",
        null,
        0
      );
    }
  }
  // GET - Retrieve contact information for a user
  async getContact(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }

    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const resume = await Resume.findById(user.resumeId);
      if (!resume) {
        return handleResponse(res, 404, "error", "Resume not found", null, 0);
      }

      // Check if the contact information exists in the resume
      if (!resume.contact) {
        return handleResponse(
          res,
          404,
          "error",
          "Contact information not found",
          null,
          0
        );
      }

      // Send the contact information as the response
      return handleResponse(
        res,
        200,
        "success",
        "Contact information retrieved successfully",
        resume.contact,
        1
      );
    } catch (error) {
      console.error(error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while retrieving contact information",
        null,
        0
      );
    }
  }
  // DELETE - Remove contact information from a user's resume
  async deleteContact(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }

    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const resume = await Resume.findById(user.resumeId);
      if (!resume) {
        return handleResponse(res, 404, "error", "Resume not found", null, 0);
      }

      // Remove the contact information from the resume
      resume.contact = {
        email: "",
        phone: "",
      };

      // Save the resume with the removed contact information
      await resume.save();

      return handleResponse(
        res,
        200,
        "success",
        "Contact information successfully deleted",
        null,
        0
      );
    } catch (error) {
      console.error(error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while deleting contact information",
        null,
        0
      );
    }
  }
}

module.exports = new Contact();
