const Resume = require('../../models/resume_model'); // Update with the correct path to your model file
const Users = require('../../models/user_model');  // Ensure this is the correct path to your models
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi'); // Import Joi for validation
const { handleResponse } = require('../../utils/handleResponse');


const addEducationExperienceSchema = Joi.object({
    school: Joi.string().required(),
    degree: Joi.string().required(),
    fieldOfStudy: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.when('graduated', {
        is: false,  // Only require endDate when current is false
        then: Joi.date().iso().required(),
        otherwise: Joi.optional()  // Make endDate optional when current is true
    }),
    graduated: Joi.boolean().required(),
    description: Joi.string().allow('', null), // Make "description" optional
});

class Education {
    // POST - Create a new education experience entry
    async addEducationExperience(req, res) {
        if (!req.user) {
            return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
        }
        try {
            const { error } = addEducationExperienceSchema.validate(req.body); // Validate the incoming data
            if (error) {
                return handleResponse(res, 400, 'error', error.details[0].message, null, 0);
            }

            const user = await Users.findById(req.user.id);
            if (!user) {
                return handleResponse(res, 404, 'error', 'User not found', null, 0);
            }

            const resume = await Resume.findById(user.resumeId);
            if (!resume) {
                const newResume = new Resume({
                    education: [{ ...req.body, id: uuidv4() }] // Add a UUID to the new education experience entry
                });
                await newResume.save();
                user.resumeId = newResume._id;
                await user.save();
                return handleResponse(res, 201, 'success', 'New education experience added', newResume.education, newResume.education.length);
            }

            resume.education.push({ ...req.body, id: uuidv4() }); // Add the new education experience
            await resume.save();
            return handleResponse(res, 201, 'success', 'Education experience added successfully', resume.education, resume.education.length);
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, 'error', 'An error occurred while adding education experience', null, 0);
        }
    };

    // GET - Retrieve education experience entries for a user
    async getEducationExperience(req, res) {
        if (!req.user) {
            return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
        }

        try {
            const user = await Users.findById(req.user.id);
            if (!user) {
                return handleResponse(res, 404, 'error', 'User not found', null, 0);
            }

            const resume = await Resume.findById(user.resumeId);
            if (!resume) {
                return handleResponse(res, 404, 'error', 'Resume not found', null, 0);
            }

            // Send the education array as the response
            return handleResponse(res, 200, 'success', 'Education experience retrieved successfully', resume.education, resume.education.length);
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, 'error', 'An error occurred while retrieving education experience', null, 0);
        }
    };

    async updateEducationExperience(req, res) {
        if (!req.user) {
            return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
        }

        const { id } = req.params; // Assuming you pass the UUID of the education experience as a URL parameter
        const updateData = req.body; // The updated data for the education experience

        try {
            const { error } = addEducationExperienceSchema.validate(updateData); // Validate the incoming data
            if (error) {
                return handleResponse(res, 400, 'error', error.details[0].message, null, 0);
            }

            const user = await Users.findById(req.user.id);
            if (!user) {
                return handleResponse(res, 404, 'error', 'User not found', null, 0);
            }

            const resume = await Resume.findById(user.resumeId);
            if (!resume) {
                return handleResponse(res, 404, 'error', 'Resume not found', null, 0);
            }

            const educationExperienceEntryIndex = resume.education.findIndex(entry => entry.id === id);
            if (educationExperienceEntryIndex === -1) {
                return handleResponse(res, 404, 'error', 'Education experience entry not found', null, 0);
            }

            resume.education[educationExperienceEntryIndex] = { ...resume.education[educationExperienceEntryIndex], ...updateData };
            await resume.save();

            return handleResponse(res, 200, 'success', 'Education experience updated successfully', resume.education[educationExperienceEntryIndex], 1);
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, 'error', 'An error occurred while updating education experience', null, 0);
        }
    };
    // DELETE - Remove a specific education experience entry by UUID
    async deleteEducationExperience(req, res) {
        if (!req.user) {
            return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
        }

        const { id } = req.params; // Assuming you pass the UUID of the education experience as a URL parameter

        try {
            const user = await Users.findById(req.user.id);
            if (!user) {
                return handleResponse(res, 404, 'error', 'User not found', null, 0);
            }

            const resume = await Resume.findById(user.resumeId);
            if (!resume) {
                return handleResponse(res, 404, 'error', 'Resume not found', null, 0);
            }

            const educationExperienceEntryIndex = resume.education.findIndex(entry => entry.id === id);
            if (educationExperienceEntryIndex === -1) {
                return handleResponse(res, 404, 'error', 'Education experience entry not found', null, 0);
            }

            resume.education.splice(educationExperienceEntryIndex, 1);
            await resume.save();

            return handleResponse(res, 200, 'success', 'Education experience entry successfully deleted', null, 0);
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, 'error', 'An error occurred while deleting education experience entry', null, 0);
        }
    };
}

module.exports = new Education()


