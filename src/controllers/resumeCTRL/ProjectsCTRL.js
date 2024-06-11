const Resume = require("../../models/resume_model"); // Update with the correct path to your model file
const Users = require("../../models/user_model"); // Ensure this is the correct path to your models
const { v4: uuidv4 } = require("uuid"); // Ensure you have uuid installed and imported
const { handleResponse } = require("../../utils/handleResponse");

// module.exports = {
//     addProject,
//     getProjects,
//     updateProject,
//     deleteProject
// };

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

      // Find the resume by resumeId
      const resume = await Resume.findById(user.resumeId);

      if (!resume) {
        // If the resume doesn't exist, create a new one and link it to the user
        const newResume = new Resume({
          projects: [{ ...req.body, id: uuidv4() }], // Add a UUID to the new project entry
        });
        await newResume.save();
        user.resumeId = newResume._id;
        await user.save();
        return handleResponse(
          res,
          201,
          "success",
          "Project added",
          newResume.projects,
          newResume.projects?.length
        );
      }

      // Add the new project with a UUID to the user's resume
      resume.projects.push({ ...req.body, id: uuidv4() });

      // Save the resume with the updated projects
      await resume.save();

      handleResponse(
        res,
        201,
        "success",
        "Project added",
        resume.projects,
        resume.projects?.length
      );
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

      const resume = await Resume.findById(user.resumeId);
      if (!resume) {
        return handleResponse(res, 404, "error", "Resume not found");
      }

      handleResponse(
        res,
        200,
        "success",
        "Projects retrieved",
        resume.projects,
        resume.projects?.length
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

      const resume = await Resume.findById(user.resumeId);
      if (!resume) {
        return handleResponse(res, 404, "error", "Resume not found");
      }

      const projectIndex = resume.projects.findIndex(
        (project) => project.id === id
      );
      if (projectIndex === -1) {
        return handleResponse(res, 404, "error", "Project not found");
      }

      resume.projects[projectIndex] = {
        ...resume.projects[projectIndex],
        ...updateData,
      };
      await resume.save();

      handleResponse(
        res,
        200,
        "success",
        "Project updated",
        resume.projects[projectIndex]
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

      const resume = await Resume.findById(user.resumeId);
      if (!resume) {
        return handleResponse(res, 404, "error", "Resume not found");
      }

      const projectIndex = resume.projects.findIndex(
        (project) => project.id === id
      );
      if (projectIndex === -1) {
        return handleResponse(res, 404, "error", "Project not found");
      }

      resume.projects.splice(projectIndex, 1);
      await resume.save();

      handleResponse(res, 200, "success", "Project successfully deleted", {
        message: "Project successfully deleted",
      });
    } catch (error) {
      handleResponse(res, 500, "error", error.message);
    }
  }
}

module.exports = new Projects();
