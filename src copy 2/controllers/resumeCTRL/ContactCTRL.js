const Users = require("../../models/user_model");
const { handleResponse } = require("../../utils/handleResponse");

function validateEmail(email) {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}



class Contact {
  async addContact(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }
    const { email, phone, location } = req.body;

    // Basic validation for email and phone
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
    if (!phone) {
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

      if (!user.resume) {
        user.resume = { contact: { email, phone, location } };
      } else {
        user.resume.contact = { email, phone, location };
      }

      await user.save();
      return handleResponse(
        res,
        201,
        "success",
        "Contact added/updated successfully",
        user.resume.contact,
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

      if (!user.resume || !user.resume.contact) {
        return handleResponse(
          res,
          404,
          "error",
          "Contact information not found",
          null,
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "Contact information retrieved successfully",
        user.resume.contact,
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

      if (!user.resume || !user.resume.contact) {
        return handleResponse(
          res,
          404,
          "error",
          "Contact information not found",
          null,
          0
        );
      }

      user.resume.contact = { email: "", phone: "", location: "" };
      await user.save();

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
