const jobs = require("../models/job_model");
const QuickJobs = require("../models/quickjob_model");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");


class ApplicationCTRL {
    async applyForJob(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }
            const {
                params: { id: jobID },
            } = req;
            const userID = req.user.id;

            const user = await Users.findById(userID);

            // Check if the user or user's jobSeeker data exists
            if (!user || !user.jobSeeker) {
                return handleResponse(res, 400, 'error', 'Only job seekers can apply for jobs', null, 0);
            }
            const jobSeekerID = user.id;
            const job = await jobs.findOne({ _id: jobID });
            // Check if the job exists
            if (!job) {
                return handleResponse(res, 404, 'error', 'Job not found', null, 0);
            }

            // Check if the job seeker is trying to apply to a job they have already applied for
            if (job.applicants && job.applicants.includes(jobSeekerID)) {
                return handleResponse(res, 400, 'error', 'You have already applied for this job', null, 0);
            }

            // Add job seeker's ID to the applicants array
            job.applicants.push(jobSeekerID);
            await job.save();

            return handleResponse(res, 201, 'success', 'Job application submitted successfully', null, 0);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async getApplicantsForJob(req, res, next) {
        if (!req.user) {
            return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
        }

        const jobID = req.params.id;
        if (!jobID) {
            return handleResponse(res, 400, 'error', 'Job ID must be provided', null, 0);
        }

        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items
        const skip = (page - 1) * limit;
        try {
            const job = await jobs.findById(jobID);
            if (!job) {
                return handleResponse(res, 404, 'error', 'Job not found', null, 0);
            }

            // Assuming job.applicants is an array of ObjectId references to the Users collection
            const applicantsQuery = { "_id": { $in: job.applicants } };
            const applicantsData = await Users.find(applicantsQuery).populate("resumeId")
                .skip(skip)
                .limit(limit);

            const totalApplicants = job.applicants.length;

            if (applicantsData.length === 0) {
                return handleResponse(res, 200, 'success', 'No applicants found for this job', [], 0);
            }
            console.log(applicantsData)

            const pagination = {
                currentPage: page,
                totalPages: Math.ceil(totalApplicants / limit),
                limit: limit,
                totalDocuments: totalApplicants
            };


            return handleResponse(res, 200, 'success', 'Applicants retrieved successfully', applicantsData, applicantsData.length, pagination);
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, 'error', 'An error occurred while fetching the applicants.', null, 0);
        }
    }

    async applyForQuickjob(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }
            const {
                params: { id: jobID },
            } = req;
            const userID = req.user.id;

            const user = await Users.findById(userID);

            // Check if the user or user's jobSeeker data exists
            if (!user || !user.jobSeeker) {
                return handleResponse(res, 400, 'error', 'Only job seekers can apply for jobs', null, 0);
            }
            // console.log(jobID)
            const jobSeekerID = user.id;
            const job = await QuickJobs.findOne({ _id: jobID });

            // Check if the job exists
            if (!job) {
                return handleResponse(res, 404, 'error', 'Job not found', null, 0);
            }

            // Check if the job seeker is trying to apply to a job they have already applied for
            if (job.applicants && job.applicants.includes(jobSeekerID)) {
                return handleResponse(res, 400, 'error', 'You have already applied for this job', null, 0);
            }

            // Add job seeker's ID to the applicants array
            job.applicants.push(jobSeekerID);
            await job.save();

            return handleResponse(res, 201, 'success', 'Job application submitted successfully', null, 0);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async getApplicantsForQuickjob(req, res, next) {
        if (!req.user) {
            return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
        }

        const jobID = req.params.id;
        if (!jobID) {
            return handleResponse(res, 400, 'error', 'Job ID must be provided', null, 0);
        }

        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items
        const skip = (page - 1) * limit;

        try {
            const job = await QuickJobs.findById(jobID);
            if (!job) {
                return handleResponse(res, 404, 'error', 'Job not found', null, 0);
            }
            // console.log(job)
            // Assuming job.applicants is an array of ObjectId references to the Users collection
            const applicantsQuery = { "_id": { $in: job.applicants } };
            const applicantsData = await Users.find(applicantsQuery).populate("resumeId")
                .skip(skip)
                .limit(limit);
            console.log(applicantsData)

            const totalApplicants = job.applicants.length;
            if (applicantsData.length === 0) {
                return handleResponse(res, 200, 'success', 'No applicants found for this job', [], 0);
            }

            const pagination = {
                currentPage: page,
                totalPages: Math.ceil(totalApplicants / limit),
                limit: limit,
                totalDocuments: totalApplicants
            };

            // Adjust the data structure as needed for your response


            return handleResponse(res, 200, 'success', 'Applicants retrieved successfully', applicantsData, applicantsData.length, pagination);
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, 'error', 'An error occurred while fetching the applicants.', null, 0);
        }
    }

}
module.exports = new ApplicationCTRL();

