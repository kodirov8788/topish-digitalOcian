const Resume = require("../../models/resume_model"); // Update with the correct path to your model file
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
  async addCertificate(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }
    // Validate the request body against the certificate schema
    const { error, value } = addCertificateSchema.validate(req.body); // Changed to validateAddCertificate

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

      const resume = await Resume.findById(user.resumeId);
      if (!resume) {
        const newResume = new Resume({
          certificates: [{ ...value, id: uuidv4() }],
        });
        await newResume.save();
        user.resumeId = newResume._id;
        await user.save();
        return handleResponse(
          res,
          201,
          "success",
          "New resume created with certificate",
          newResume.certificates,
          newResume.certificates.length
        );
      }

      resume.certificates.push({ ...value, id: uuidv4() });
      await resume.save();
      return handleResponse(
        res,
        201,
        "success",
        "Certificate added successfully",
        resume.certificates,
        resume.certificates.length
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
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Find the user by ID
      const user = await Users.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Find the resume by resumeId
      const resume = await Resume.findById(user.resumeId);

      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }

      // Send the certificates array as the response
      res.status(200).json(resume.certificates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateCertificate(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }
    const { id } = req.params;
    const updateData = req.body; // The updated data for the certificate

    // Validate the request body against the certificate schema
    const { error, value } = addCertificateSchema.validate(updateData); // Changed to validateUpdateCertificate

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

      const resume = await Resume.findById(user.resumeId);
      if (!resume) {
        return handleResponse(res, 404, "error", "Resume not found", null, 0);
      }

      const certificateIndex = resume.certificates.findIndex(
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

      resume.certificates[certificateIndex] = {
        ...resume.certificates[certificateIndex],
        ...value,
      };
      await resume.save();

      return handleResponse(
        res,
        200,
        "success",
        "Certificate updated successfully",
        resume.certificates[certificateIndex],
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

      const resume = await Resume.findById(user.resumeId);
      if (!resume) {
        return handleResponse(res, 404, "error", "Resume not found", null, 0);
      }

      const certificateIndex = resume.certificates.findIndex(
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

      resume.certificates.splice(certificateIndex, 1);
      await resume.save();

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
