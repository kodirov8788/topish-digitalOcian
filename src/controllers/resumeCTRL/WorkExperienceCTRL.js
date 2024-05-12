const Resume = require('../../models/resume_model'); // Update with the correct path to your model file
const Users = require('../../models/user_model'); // Update with the correct path to your model file
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { handleResponse } = require('../../utils/handleResponse');

// Define a Joi schema for work experience validation
const workExperienceSchema = Joi.object({
    jobTitle: Joi.string().required(),
    company: Joi.string().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.when('current', {
        is: false,  // Only require endDate when current is false
        then: Joi.date().iso().required(),
        otherwise: Joi.optional()  // Make endDate optional when current is true
    }),
    current: Joi.boolean().required(),
    description: Joi.string().allow('', null),
    employmentType: Joi.string().required(),
    location: Joi.string().required(),
});
function validateWorkExperience(data) {
    return workExperienceSchema.validate(data);
}

class WorkExperience {


    async addWorkExperience(req, res) {
        if (!req.user) {
            return handleResponse(res, 401, "error", "Unauthorized");
        }

        // Validate the incoming work experience data using Joi
        const { error } = validateWorkExperience(req.body);

        if (error) {
            return handleResponse(res, 400, "error", error.details[0].message);
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
                    workExperience: [{ ...req.body, id: uuidv4() }] // Add a UUID to the new work experience entry
                });
                await newResume.save();
                user.resumeId = newResume._id;
                await user.save();
                handleResponse(res, 201, "success", "Work experience added", newResume.workExperience);
            } else {
                // Add the new work experience with a UUID to the user's resume
                resume.workExperience.push({ ...req.body, id: uuidv4() });

                // Save the resume with the updated work experience
                await resume.save();

                handleResponse(res, 201, "success", "Work experience added", resume.workExperience);
            }
        } catch (error) {
            handleResponse(res, 500, "error", error.message);
        }
    };
    async getWorkExperience(req, res) {
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
                return handleResponse(res, 404, "error", "Resume not found");
            }

            // Send the workExperience array as the response
            handleResponse(res, 200, "success", "Work experience retrieved", resume.workExperience);
        } catch (error) {
            handleResponse(res, 500, "error", error.message);
        }
    };
    async updateWorkExperience(req, res) {
        if (!req.user) {
            return handleResponse(res, 401, "error", "Unauthorized");
        }
        const { id } = req.params;
        const updateData = req.body; // The updated data for the work experience

        try {
            // Validate the updateData using the schema
            const { error } = workExperienceSchema.validate(updateData);
            if (error) {
                return handleResponse(res, 400, "error", error.details[0].message);
            }

            // Find the user by ID
            const user = await Users.findById(req.user.id);

            if (!user) {
                return handleResponse(res, 404, "error", "User not found");
            }

            // Find the resume by resumeId
            const resume = await Resume.findById(user.resumeId);

            if (!resume) {
                return handleResponse(res, 404, "error", "Resume not found");
            }

            // Find the specific work experience entry by UUID and update it
            const workExperienceEntryIndex = resume.workExperience.findIndex(entry => entry.id === id);
            if (workExperienceEntryIndex === -1) {
                return handleResponse(res, 404, "error", "Work experience entry not found");
            }

            // Update the fields of the work experience entry
            resume.workExperience[workExperienceEntryIndex] = { ...resume.workExperience[workExperienceEntryIndex], ...updateData };

            // Save the updated resume
            await resume.save();

            // Send the updated workExperience entry as the response
            handleResponse(res, 200, "success", "Work experience updated", resume.workExperience[workExperienceEntryIndex]);
        } catch (error) {
            handleResponse(res, 500, "error", error.message);
        }
    };

    async deleteWorkExperience(req, res) {
        if (!req.user) {
            return handleResponse(res, 401, "error", "Unauthorized");
        }
        const { id } = req.params; // Assuming you pass the UUID of the work experience as a URL parameter
        try {
            // Find the user by ID
            const user = await Users.findById(req.user.id);

            if (!user) {
                return handleResponse(res, 404, "error", "User not found");
            }

            // Find the resume by resumeId
            const resume = await Resume.findById(user.resumeId);

            if (!resume) {
                return handleResponse(res, 404, "error", "Resume not found");
            }

            // Find the index of the specific work experience entry by UUID
            const workExperienceEntryIndex = resume.workExperience.findIndex(entry => entry.id === id);
            if (workExperienceEntryIndex === -1) {
                return handleResponse(res, 404, "error", "Work experience entry not found");
            }

            // Remove the work experience entry from the array
            resume.workExperience.splice(workExperienceEntryIndex, 1);

            // Save the updated resume
            await resume.save();

            // Send a success response
            handleResponse(res, 200, "success", "Work experience entry successfully deleted", { message: "Work experience entry successfully deleted" });
        } catch (error) {
            handleResponse(res, 500, "error", error.message);
        }
    };
}


module.exports = new WorkExperience();
