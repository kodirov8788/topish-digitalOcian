// src/controllers/resumeCTRL/ProjectsCTRL.js
const Users = require("../../models/user_model"); // Ensure this is the correct path to your models
const { v4: uuidv4 } = require("uuid"); // Ensure you have uuid installed and imported
const { handleResponse } = require("../../utils/handleResponse");

class Projects {
  // POST - Create a new project entry
  async addProject(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized");
    }

    try {
      // Find the user by ID
      const user = await Users.findById(req.user.id);

      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      const newProject = { ...req.body, id: uuidv4() };

      // Add the new project with a UUID to the user's resume
      if (!user.resume) {
        user.resume = { projects: [newProject] };
      } else {
        user.resume.projects.push(newProject);
      }

      // Save the user with the updated projects
      await user.save();

      handleResponse(res, 201, "success", "Project added", newProject);
    } catch (error) {
      handleResponse(res, 500, "error", error.message);
    }
  }

  // GET - Retrieve project entries for a user
  async getProjects(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized");
    }

    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      if (!user.resume || !user.resume.projects) {
        return handleResponse(res, 404, "error", "Projects not found");
      }

      handleResponse(
        res,
        200,
        "success",
        "Projects retrieved",
        user.resume.projects,
        user.resume.projects.length
      );
    } catch (error) {
      handleResponse(res, 500, "error", error.message);
    }
  }

  // PUT - Update a specific project entry by UUID
  async updateProject(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized");
    }

    const { id } = req.params;
    const updateData = req.body;
    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      if (!user.resume || !user.resume.projects) {
        return handleResponse(res, 404, "error", "Projects not found");
      }

      const projectIndex = user.resume.projects.findIndex(
        (project) => project.id === id
      );
      if (projectIndex === -1) {
        return handleResponse(res, 404, "error", "Project not found");
      }

      user.resume.projects[projectIndex] = {
        ...user.resume.projects[projectIndex],
        ...updateData,
      };
      await user.save();

      handleResponse(
        res,
        200,
        "success",
        "Project updated",
        user.resume.projects[projectIndex]
      );
    } catch (error) {
      handleResponse(res, 500, "error", error.message);
    }
  }

  // DELETE - Remove a specific project entry by UUID
  async deleteProject(req, res) {
    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized");
    }

    const { id } = req.params;

    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found");
      }

      if (!user.resume || !user.resume.projects) {
        return handleResponse(res, 404, "error", "Projects not found");
      }

      const projectIndex = user.resume.projects.findIndex(
        (project) => project.id === id
      );
      if (projectIndex === -1) {
        return handleResponse(res, 404, "error", "Project not found");
      }

      user.resume.projects.splice(projectIndex, 1);
      await user.save();

      handleResponse(res, 200, "success", "Project successfully deleted", {
        message: "Project successfully deleted",
      });
    } catch (error) {
      handleResponse(res, 500, "error", error.message);
    }
  }
}

module.exports = new Projects();
