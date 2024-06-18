const Users = require("../../models/user_model"); // Update with the correct path to your model file
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const { handleResponse } = require("../../utils/handleResponse");

// Define a Joi schema for validating the certificate data
const addCertificateSchema = Joi.object({
  title: Joi.string().required(),
  organization: Joi.string().required(),
  dateOfIssue: Joi.date().iso().required(),
  expirationDate: Joi.when("notExpire", {
    is: false, // Only require expirationDate when notExpire is false
    then: Joi.date().iso().required(),
    otherwise: Joi.optional(), // Make expirationDate optional when notExpire is true
  }),
  notExpire: Joi.boolean().required(),
  credentialId: Joi.string().allow("", null),
  credentialUrl: Joi.string().allow("", null), // Make "credentialUrl" optional
});

class Certificates {
  // POST - Create a new certificate entry
  async addCertificate(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }

    // Validate the request body against the certificate schema
    const { error, value } = addCertificateSchema.validate(req.body);
    if (error) {
      return handleResponse(
        res,
        400,
        "error",
        error.details[0].message,
        null,
        0
      );
    }

    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      const newCertificate = { ...value, id: uuidv4() };

      if (!user.resume) {
        user.resume = { certificates: [newCertificate] };
      } else {
        user.resume.certificates.push(newCertificate);
      }

      await user.save();
      return handleResponse(
        res,
        201,
        "success",
        "Certificate added successfully",
        newCertificate,
        1
      );
    } catch (error) {
      console.error(error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while adding the certificate",
        null,
        0
      );
    }
  }

  // GET - Retrieve certificate entries for a user
  async getCertificates(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }

    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      if (!user.resume || !user.resume.certificates) {
        return handleResponse(
          res,
          404,
          "error",
          "Certificates not found",
          null,
          0
        );
      }

      return handleResponse(
        res,
        200,
        "success",
        "Certificates retrieved successfully",
        user.resume.certificates,
        user.resume.certificates.length
      );
    } catch (error) {
      console.error(error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while retrieving certificates",
        null,
        0
      );
    }
  }

  // PUT - Update a specific certificate entry
  async updateCertificate(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }
    const { id } = req.params;
    const updateData = req.body;

    // Validate the request body against the certificate schema
    const { error, value } = addCertificateSchema.validate(updateData);
    if (error) {
      return handleResponse(
        res,
        400,
        "error",
        error.details[0].message,
        null,
        0
      );
    }

    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      if (!user.resume || !user.resume.certificates) {
        return handleResponse(
          res,
          404,
          "error",
          "Certificates not found",
          null,
          0
        );
      }

      const certificateIndex = user.resume.certificates.findIndex(
        (certificate) => certificate.id === id
      );
      if (certificateIndex === -1) {
        return handleResponse(
          res,
          404,
          "error",
          "Certificate not found",
          null,
          0
        );
      }

      user.resume.certificates[certificateIndex] = {
        ...user.resume.certificates[certificateIndex],
        ...value,
      };
      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Certificate updated successfully",
        user.resume.certificates[certificateIndex],
        1
      );
    } catch (error) {
      console.error(error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while updating the certificate",
        null,
        0
      );
    }
  }

  // DELETE - Remove a specific certificate entry
  async deleteCertificate(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }
    const { id } = req.params;

    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      if (!user.resume || !user.resume.certificates) {
        return handleResponse(
          res,
          404,
          "error",
          "Certificates not found",
          null,
          0
        );
      }

      const certificateIndex = user.resume.certificates.findIndex(
        (certificate) => certificate.id === id
      );
      if (certificateIndex === -1) {
        return handleResponse(
          res,
          404,
          "error",
          "Certificate not found",
          null,
          0
        );
      }

      user.resume.certificates.splice(certificateIndex, 1);
      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Certificate successfully deleted",
        null,
        0
      );
    } catch (error) {
      console.error(error);
      return handleResponse(
        res,
        500,
        "error",
        "An error occurred while deleting the certificate",
        null,
        0
      );
    }
  }
}

module.exports = new Certificates();
