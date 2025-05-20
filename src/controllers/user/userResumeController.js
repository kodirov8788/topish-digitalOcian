const BaseController = require("./BaseController");
const { handleResponse } = require("../../utils/handleResponse");

class UserResumeController extends BaseController {
  constructor() {
    super();
    // Bind methods to preserve 'this' context
    this.getResume = this.getResume.bind(this);
    this.updateResumeSummary = this.updateResumeSummary.bind(this);
    this.updateResumeContact = this.updateResumeContact.bind(this);
    this.addWorkExperience = this.addWorkExperience.bind(this);
    this.updateWorkExperience = this.updateWorkExperience.bind(this);
    this.deleteWorkExperience = this.deleteWorkExperience.bind(this);
    this.addEducation = this.addEducation.bind(this);
    this.updateEducation = this.updateEducation.bind(this);
    this.deleteEducation = this.deleteEducation.bind(this);
    this.updateSkills = this.updateSkills.bind(this);
    this.uploadCV = this.uploadCV.bind(this);
    this.deleteCV = this.deleteCV.bind(this);
  }

  async getResume(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const userId = req.params.userId || req.user.id;

      // If requesting another user's resume, check visibility and permissions
      if (userId !== req.user.id) {
        const targetUser = await this._getUser(userId);
        if (!targetUser) {
          return handleResponse(res, 404, "error", "User not found", null, 0);
        }

        // Check if the current user is an admin
        const currentUser = await this._getUser(req.user.id);
        const isAdmin =
          currentUser.roles && currentUser.roles.includes("Admin");

        // If not admin, check if the profile is visible
        if (
          !isAdmin &&
          !targetUser.resume?.profileVisibility &&
          targetUser.accountVisibility !== "public"
        ) {
          return handleResponse(
            res,
            403,
            "error",
            "This user's resume is not publicly visible",
            null,
            0
          );
        }
      }

      const user = await this._getUser(userId);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Return only the resume portion of the user object
      return handleResponse(
        res,
        200,
        "success",
        "Resume retrieved successfully",
        user.resume || {},
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to retrieve resume: " + error.message,
        null,
        0
      );
    }
  }

  async updateResumeSummary(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const { summary } = req.body;

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Initialize resume if it doesn't exist
      if (!user.resume) {
        user.resume = {};
      }

      // Update summary
      user.resume.summary = summary || null;

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Resume summary updated successfully",
        user.resume,
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to update resume summary: " + error.message,
        null,
        0
      );
    }
  }

  async updateResumeContact(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const { email, phone, location } = req.body;

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Initialize resume and contact if they don't exist
      if (!user.resume) {
        user.resume = {};
      }

      if (!user.resume.contact) {
        user.resume.contact = {};
      }

      // Update contact fields
      if (email !== undefined) user.resume.contact.email = email;
      if (phone !== undefined) user.resume.contact.phone = phone;
      if (location !== undefined) user.resume.contact.location = location;

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Resume contact information updated successfully",
        user.resume.contact,
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to update resume contact: " + error.message,
        null,
        0
      );
    }
  }

  async addWorkExperience(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const { title, company, startDate, endDate, description, current } =
        req.body;

      // Validate required fields
      if (!title || !company) {
        return handleResponse(
          res,
          400,
          "error",
          "Job title and company are required",
          null,
          0
        );
      }

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Initialize resume and workExperience if they don't exist
      if (!user.resume) {
        user.resume = {};
      }

      if (!Array.isArray(user.resume.workExperience)) {
        user.resume.workExperience = [];
      }

      // Create new work experience entry
      const newExperience = {
        title,
        company,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        description,
        current: Boolean(current),
      };

      // Add to beginning of array (most recent first)
      user.resume.workExperience.unshift(newExperience);

      await user.save();

      return handleResponse(
        res,
        201,
        "success",
        "Work experience added successfully",
        user.resume.workExperience,
        user.resume.workExperience.length
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to add work experience: " + error.message,
        null,
        0
      );
    }
  }

  async updateWorkExperience(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const {
        index,
        title,
        company,
        startDate,
        endDate,
        description,
        current,
      } = req.body;

      // Validate index
      if (index === undefined || isNaN(index)) {
        return handleResponse(
          res,
          400,
          "error",
          "Valid experience index is required",
          null,
          0
        );
      }

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Check if work experience exists
      if (
        !user.resume ||
        !Array.isArray(user.resume.workExperience) ||
        !user.resume.workExperience[index]
      ) {
        return handleResponse(
          res,
          404,
          "error",
          "Work experience entry not found",
          null,
          0
        );
      }

      // Update fields
      if (title !== undefined) user.resume.workExperience[index].title = title;
      if (company !== undefined)
        user.resume.workExperience[index].company = company;
      if (startDate !== undefined)
        user.resume.workExperience[index].startDate = new Date(startDate);
      if (endDate !== undefined)
        user.resume.workExperience[index].endDate = new Date(endDate);
      if (description !== undefined)
        user.resume.workExperience[index].description = description;
      if (current !== undefined)
        user.resume.workExperience[index].current = Boolean(current);

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Work experience updated successfully",
        user.resume.workExperience,
        user.resume.workExperience.length
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to update work experience: " + error.message,
        null,
        0
      );
    }
  }

  async deleteWorkExperience(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const { index } = req.params;

      // Validate index
      if (index === undefined || isNaN(index)) {
        return handleResponse(
          res,
          400,
          "error",
          "Valid experience index is required",
          null,
          0
        );
      }

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Check if work experience exists
      if (
        !user.resume ||
        !Array.isArray(user.resume.workExperience) ||
        !user.resume.workExperience[index]
      ) {
        return handleResponse(
          res,
          404,
          "error",
          "Work experience entry not found",
          null,
          0
        );
      }

      // Remove the entry
      user.resume.workExperience.splice(index, 1);

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Work experience deleted successfully",
        user.resume.workExperience,
        user.resume.workExperience.length
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to delete work experience: " + error.message,
        null,
        0
      );
    }
  }

  async addEducation(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const { institution, degree, field, startDate, endDate, description } =
        req.body;

      // Validate required fields
      if (!institution || !degree) {
        return handleResponse(
          res,
          400,
          "error",
          "Institution and degree are required",
          null,
          0
        );
      }

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Initialize resume and education if they don't exist
      if (!user.resume) {
        user.resume = {};
      }

      if (!Array.isArray(user.resume.education)) {
        user.resume.education = [];
      }

      // Create new education entry
      const newEducation = {
        institution,
        degree,
        field,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        description,
      };

      // Add to beginning of array (most recent first)
      user.resume.education.unshift(newEducation);

      await user.save();

      return handleResponse(
        res,
        201,
        "success",
        "Education added successfully",
        user.resume.education,
        user.resume.education.length
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to add education: " + error.message,
        null,
        0
      );
    }
  }

  async updateEducation(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const {
        index,
        institution,
        degree,
        field,
        startDate,
        endDate,
        description,
      } = req.body;

      // Validate index
      if (index === undefined || isNaN(index)) {
        return handleResponse(
          res,
          400,
          "error",
          "Valid education index is required",
          null,
          0
        );
      }

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Check if education exists
      if (
        !user.resume ||
        !Array.isArray(user.resume.education) ||
        !user.resume.education[index]
      ) {
        return handleResponse(
          res,
          404,
          "error",
          "Education entry not found",
          null,
          0
        );
      }

      // Update fields
      if (institution !== undefined)
        user.resume.education[index].institution = institution;
      if (degree !== undefined) user.resume.education[index].degree = degree;
      if (field !== undefined) user.resume.education[index].field = field;
      if (startDate !== undefined)
        user.resume.education[index].startDate = new Date(startDate);
      if (endDate !== undefined)
        user.resume.education[index].endDate = new Date(endDate);
      if (description !== undefined)
        user.resume.education[index].description = description;

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Education updated successfully",
        user.resume.education,
        user.resume.education.length
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to update education: " + error.message,
        null,
        0
      );
    }
  }

  async deleteEducation(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const { index } = req.params;

      // Validate index
      if (index === undefined || isNaN(index)) {
        return handleResponse(
          res,
          400,
          "error",
          "Valid education index is required",
          null,
          0
        );
      }

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Check if education exists
      if (
        !user.resume ||
        !Array.isArray(user.resume.education) ||
        !user.resume.education[index]
      ) {
        return handleResponse(
          res,
          404,
          "error",
          "Education entry not found",
          null,
          0
        );
      }

      // Remove the entry
      user.resume.education.splice(index, 1);

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Education deleted successfully",
        user.resume.education,
        user.resume.education.length
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to delete education: " + error.message,
        null,
        0
      );
    }
  }

  async updateSkills(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const { skills } = req.body;

      if (!Array.isArray(skills)) {
        return handleResponse(
          res,
          400,
          "error",
          "Skills must be an array",
          null,
          0
        );
      }

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Initialize resume if it doesn't exist
      if (!user.resume) {
        user.resume = {};
      }

      // Update skills
      user.resume.skills = skills;

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "Skills updated successfully",
        user.resume.skills,
        user.resume.skills.length
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to update skills: " + error.message,
        null,
        0
      );
    }
  }

  async uploadCV(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const { path, filename, size, key } = req.body;

      // Validate required fields
      if (!path || !filename) {
        return handleResponse(
          res,
          400,
          "error",
          "CV path and filename are required",
          null,
          0
        );
      }

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Initialize resume if it doesn't exist
      if (!user.resume) {
        user.resume = {};
      }

      // Update CV
      user.resume.cv = {
        path,
        filename,
        size: size || null,
        key: key || null,
      };

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "CV uploaded successfully",
        user.resume.cv,
        1
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to upload CV: " + error.message,
        null,
        0
      );
    }
  }

  async deleteCV(req, res) {
    try {
      if (this._checkAuth(req, res) !== true) return;

      const user = await this._getUser(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Check if CV exists
      if (!user.resume || !user.resume.cv || !user.resume.cv.path) {
        return handleResponse(res, 404, "error", "CV not found", null, 0);
      }

      // Remove CV
      user.resume.cv = {
        path: null,
        filename: null,
        size: null,
        key: null,
      };

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "CV deleted successfully",
        null,
        0
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Failed to delete CV: " + error.message,
        null,
        0
      );
    }
  }
}

module.exports = new UserResumeController();
