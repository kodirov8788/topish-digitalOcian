const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");
// const Resume = require('../models/resume_model'); // Ensure this path points to your Resume model
const Jobs = require('../models/job_model');
const Quickjobs = require('../models/quickjob_model');

//property for selecting employee info to get back
const property =
    " role jobSeeker.fullName jobSeeker.skills jobSeeker.gender jobSeeker.age jobSeeker.education jobSeeker.experience jobSeeker.desiredSalary";
// Function to map experience text to a numerical range
function getExperienceRange(experienceText) {
    const mappings = {
        'No experience': { min: null, max: 0 },
        '0-1 year': { min: 0, max: 1 },
        '1-2 year': { min: 1, max: 2 },
        '2-5 year': { min: 2, max: 5 },
        '6-10 year': { min: 6, max: 10 },
        'more Than 10 years': { min: 10, max: null }
    };
    return mappings[experienceText] || null;
}

class JobSeekerCTRL {
    // it shows all employees
    async getAllJobSeekers(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }
            // Pagination parameters
            const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
            const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items if not specified
            const skip = (page - 1) * limit; // Calculate the number of documents to skip

            // Modify the query to include pagination
            const resultUsers = await Users.find({ jobSeeker: { $exists: true } }).populate("resumeId")
                .skip(skip) // Skip the documents for the current page
                .limit(limit) // Limit the number of documents returned
                .exec(); // Execute the query

            // Count the total documents that match the query (without limit and skip) for pagination metadata
            const total = await Users.countDocuments({ jobSeeker: { $exists: true } });

            if (resultUsers.length === 0) {
                return handleResponse(res, 200, 'error', 'No job seekers found', [], 0);
            }

            // Prepare pagination metadata
            const pagination = {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                limit: limit,
                totalDocuments: total
            };

            return handleResponse(res, 200, 'success', 'Job seekers retrieved successfully', resultUsers, resultUsers.length, pagination);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async getRecommendedJobSeekers(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }

            if (!req.user.role === 'Employer') {
                return handleResponse(res, 401, 'error', 'You are not allowed!', null, 0);
            }

            // Pagination parameters
            const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
            const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items if not specified
            const skip = (page - 1) * limit; // Calculate the number of documents to skip

            // Modify the query to include pagination
            const resultUsers = await Users.find({ jobSeeker: { $exists: true } }).populate("resumeId")
                .skip(skip) // Skip the documents for the current page
                .limit(limit) // Limit the number of documents returned
                .exec(); // Execute the query

            // Count the total documents that match the query (without limit and skip) for pagination metadata
            const total = await Users.countDocuments({ jobSeeker: { $exists: true } });

            if (resultUsers.length === 0) {
                return handleResponse(res, 200, 'success', 'No jobseekers found', [], 0);
            }

            // Prepare pagination metadata
            const pagination = {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                limit: limit,
                totalDocuments: total
            };

            return handleResponse(res, 200, 'success', 'Job seekers retrieved successfully', resultUsers, resultUsers.length, pagination);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    // async getJobSeekersByParams(req, res) {
    //     let { skills, location, salary, worktype, jobTitle, employmentType, experience, education, page = 1, limit = 10 } = req.query;

    //     if (!req.user) {
    //         return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
    //     }

    //     if (!req.user.employer) {
    //         return handleResponse(res, 401, 'error', 'Employer only', null, 0);
    //     }

    //     try {
    //         let resumeQueryObject = {}; // Query object for the resume
    //         let userQueryObject = {}; // Query object for the user

    //         // Build query for Resume
    //         if (location) userQueryObject['jobSeeker.location'] = location;
    //         if (education) resumeQueryObject.education = { $in: [education] };
    //         if (skills) userQueryObject["jobSeeker.skills"] = { $in: [skills] };
    //         // ... handle other resume-specific query parameters ...
    //         if (jobTitle) userQueryObject["jobSeeker.jobtitle"] = { $in: [jobTitle] };
    //         // Build query for Users
    //         if (worktype) userQueryObject.worktype = worktype;
    //         if (employmentType) userQueryObject['jobSeeker.employmentType'] = employmentType;
    //         // ... handle other user-specific query parameters ...

    //         // Calculate the number of results to skip (for pagination)
    //         const skip = (page - 1) * limit;

    //         // First, find users that match the userQueryObject with pagination
    //         const matchedUsers = await Users.find(userQueryObject)
    //             .skip(parseInt(skip))
    //             .limit(parseInt(limit))
    //             .populate({
    //                 path: 'resumeId',
    //                 match: resumeQueryObject
    //             });

    //         // Optionally, you might need to adjust how you handle the count for total documents if resume filtering significantly alters the result set
    //         const total = await Users.countDocuments(userQueryObject);

    //         // Filter out users whose resumes don't match the resumeQueryObject
    //         const resultUsers = matchedUsers.filter(user => user.resumeId && Object.keys(user.resumeId).length > 0);

    //         if (resultUsers.length === 0) {
    //             return handleResponse(res, 200, 'success', 'No job seekers found', [], 0);
    //         }

    //         // Prepare pagination data
    //         const pagination = {
    //             currentPage: parseInt(page),
    //             totalPages: Math.ceil(total / limit),
    //             limit: parseInt(limit),
    //             totalDocuments: total
    //         };

    //         return handleResponse(res, 200, 'success', 'Job seekers retrieved successfully', resultUsers, resultUsers.length, pagination);
    //     } catch (error) {
    //         console.error("Error in getJobSeekersByParams function:", error);
    //      return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
    //     }
    // }
    async getJobSeekersSavedJobs(req, res) {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page, 10);
        limit = parseInt(limit, 10);
        const skip = (page - 1) * limit;

        if (!req.user) {
            return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
        }

        if (!req.user.jobSeeker) {
            return handleResponse(res, 401, 'error', 'Job Seeker only', null, 0);
        }

        const jobSeekerId = req.user.id; // Assuming this is the correct path to the job seeker's _id

        try {
            // Run both queries in parallel
            const [matchedJobs, matchedQuickJobs] = await Promise.all([
                Jobs.find({ "applicants": jobSeekerId }).skip(skip).limit(limit),
                Quickjobs.find({ "applicants": jobSeekerId }).skip(skip).limit(limit)
            ]);

            // Combine the results from both queries
            const combinedJobs = {
                jobs: matchedJobs,
                quickJobs: matchedQuickJobs
            };

            // Calculate the total number of documents for pagination
            const total = matchedJobs.length + matchedQuickJobs.length;


            if (total === 0) {
                return handleResponse(res, 200, 'success', 'No jobs found for this job seeker', [], 0);
            }

            // Prepare simplified pagination data, might need adjustment
            const pagination = {
                currentPage: page,
                // This totalPages calculation might not be accurate for combined results from two collections
                totalPages: Math.ceil(total / limit),
                limit: limit,
                totalDocuments: total
            };

            return handleResponse(res, 200, 'success', 'Jobs retrieved successfully', combinedJobs, total, pagination);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async deleteSavedJob(req, res) {
        if (!req.user || !req.user.jobSeeker) {
            return handleResponse(res, 401, 'error', 'Unauthorized or not a Job Seeker', null, 0);
        }

        const jobSeekerId = req.user.id;
        const jobId = req.params.id; // Assuming the job ID comes through the URL parameters

        if (!jobId) {
            return handleResponse(res, 400, 'error', 'Job ID must be provided', null, 0);
        }

        try {
            // Attempt to update in both collections concurrently
            const updates = await Promise.all([
                Jobs.updateOne({ _id: jobId, applicants: jobSeekerId }, { $pull: { applicants: jobSeekerId } }),
                Quickjobs.updateOne({ _id: jobId, applicants: jobSeekerId }, { $pull: { applicants: jobSeekerId } })
            ]);

            // Check if any of the operations were successful
            const wasUpdated = updates.some(result => result.modifiedCount > 0);

            if (!wasUpdated) {
                // If none of the documents were updated, it means the job seeker wasn't an applicant for the job
                return handleResponse(res, 404, 'error', 'Job not found or job seeker not an applicant', null, 0);
            }

            return handleResponse(res, 200, 'success', 'Job application removed successfully', null, 0);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    // ----------------- Job Seeker's Resume -----------------
    async postFavoriteJob(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }
            const { id: jobID } = req.params; // Assuming the job ID is passed in req.params directly
            const userID = req.user.id;

            const user = await Users.findById(userID);

            // Check if the user or user's jobSeeker data exists
            if (!user || !user.jobSeeker) {
                return handleResponse(res, 400, 'error', 'Only job seekers can favorite jobs', null, 0);
            }
            const job = await Jobs.findById(jobID);

            // Check if the job exists
            if (!job) {
                return handleResponse(res, 404, 'error', 'Job not found', null, 0);
            }

            // Initialize likedBy array if it doesn't exist
            if (!job.likedBy) {
                job.likedBy = [];
            }

            // Check if the job seeker has already liked the job
            if (job.likedBy.includes(user.id)) {
                return handleResponse(res, 400, 'error', 'You have already liked this job', null, 0);
            }

            // Add job seeker's ID to the likedBy array
            job.likedBy.push(user.id);
            await job.save();

            return handleResponse(res, 201, 'success', 'Job liked successfully', null, 0);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async postFavoriteQuickJob(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }
            const { id: jobID } = req.params; // Assuming the job ID is passed in req.params
            const userID = req.user.id;

            const user = await Users.findById(userID);
            // console.log("user: ", user.id)
            // Check if the user or user's jobSeeker data exists
            if (!user || !user.jobSeeker) {
                return handleResponse(res, 400, 'error', 'Only job seekers can favorite jobs', null, 0);
            }
            // Assuming jobSeeker ID is stored in user.jobSeeker._id
            const job = await Quickjobs.findById(jobID);

            // Check if the job exists
            if (!job) {
                return handleResponse(res, 404, 'error', 'Job not found', null, 0);
            }

            // Initialize likedBy array if it doesn't exist
            if (!job.likedBy) {
                job.likedBy = [];
            }
            // Check if the job seeker has already liked the job
            if (job.likedBy.includes(user.id.toString())) {
                return handleResponse(res, 400, 'error', 'You have already liked this job', null, 0);
            }

            // Add job seeker's ID to the likedBy array
            job.likedBy.push(user.id);
            await job.save();
            // console.log("job.likedBy", job.likedBy)


            return handleResponse(res, 201, 'success', 'Job liked successfully', null, 0);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async getFavoriteJobs(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }

            const userID = req.user.id;

            const user = await Users.findById(userID).populate('jobSeeker');

            // Check if the user or user's jobSeeker data exists
            if (!user || !user.jobSeeker) {
                return handleResponse(res, 400, 'error', 'Only job seekers can favorite jobs', null, 0);
            }
            const jobSeekerID = user.id; // Assuming jobSeeker ID is stored in user.jobSeeker._id

            // Use Promise.all to execute both queries in parallel for efficiency
            const [jobs, quickJobs] = await Promise.all([
                Jobs.find({ likedBy: jobSeekerID }),
                Quickjobs.find({ likedBy: jobSeekerID })
            ]);

            // Concatenate both job lists into a single list
            const allJobs = { jobs, quickJobs };

            // Return the combined list of jobs
            // The total count now correctly includes both jobs and quickJobs
            return handleResponse(res, 200, 'success', 'Favorite jobs retrieved successfully', allJobs, allJobs.length);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async deleteFavoriteJob(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }

            const { id: jobID } = req.params; // Extract jobID from params
            const userID = req.user.id;

            const user = await Users.findById(userID);

            if (!user || !user.jobSeeker) {
                return handleResponse(res, 400, 'error', 'Only job seekers can manage favorite jobs', null, 0);
            }
            const jobSeekerID = user.id;

            // Attempt to find the job in both collections
            let job = await Jobs.findById(jobID);
            let collection = 'Jobs';

            if (!job) {
                job = await Quickjobs.findById(jobID);
                collection = 'Quickjobs';
            }

            if (!job) {
                return handleResponse(res, 404, 'error', 'Job not found', null, 0);
            }

            // Check if the job seeker has liked the job
            if (job.likedBy && job.likedBy.includes(jobSeekerID)) {
                // Remove job seeker's ID from the likedBy array
                job.likedBy = job.likedBy.filter(id => id.toString() !== jobSeekerID);
                await job.save();
                return handleResponse(res, 200, 'success', `Job removed from favorites successfully from ${collection}`, null, 0);
            } else {
                return handleResponse(res, 404, 'error', 'Job not found in favorites', null, 0);
            }
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async getJobSeekersQuery(req, res) {
        try {
            const { searchQuery, page = 1, limit = 10 } = req.query;
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }
            if (!searchQuery) {
                return handleResponse(res, 400, 'error', 'Please enter a search query!', null, 0);
            }
            const skip = (page - 1) * limit;
            // Normalize the search query by removing spaces and converting to lowercase for fullname
            const normalizedSearchQuery = searchQuery.replace(/\s+/g, '').toLowerCase();
            // Create regex patterns for case-insensitive search
            const regex = new RegExp(searchQuery, 'i');
            const fullnameRegex = new RegExp(normalizedSearchQuery.split('').join('\\s*'), 'i');
            const query = {
                $and: [
                    { jobSeeker: { $exists: true } }, // Only search for users who are job seekers
                    {
                        $or: [
                            { "jobSeeker.skills": { $regex: regex } }, // Search in skills
                            { "jobSeeker.fullName": { $regex: fullnameRegex } }, // Search in fullname with space tolerance
                            { "jobSeeker.jobtitle": { $regex: regex } } // Search in jobTitle
                        ],
                    },
                ],
            };
            const resultUsers = await Users.find(query)
                .populate("resumeId")
                .skip(parseInt(skip))
                .limit(parseInt(limit));
            const total = await Users.countDocuments(query);
            if (resultUsers.length === 0) {
                return handleResponse(res, 200, 'success', 'No job seekers found', [], 0);
            }
            const pagination = {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                limit: parseInt(limit),
                totalDocuments: total
            };
            return handleResponse(res, 200, 'success', 'Job seekers retrieved successfully', resultUsers, resultUsers.length, pagination);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    // ----------------- delete after some time-----------------
    async getJobSeekersBySkills(req, res) {
        try {
            // console.log(req.query)
            const { skills, page = 1, limit = 10 } = req.query; // Destructuring to include pagination parameters with defaults

            if (skills === undefined || skills === "") {
                return handleResponse(res, 400, 'error', 'Please enter skills!', null, 0);
            }

            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }

            // Calculate the number of results to skip (for pagination)
            const skip = (page - 1) * limit;

            // Query to find job seekers by skills with pagination
            const query = {
                $and: [
                    { jobSeeker: { $exists: true } }, // Only search for users who are job seekers
                    { "jobSeeker.skills": { $regex: skills, $options: "i" } }, // Search by skills, case-insensitive
                ],
            };

            // Find matching job seekers and apply pagination
            const resultUsers = await Users.find(query).populate("resumeId")
                .skip(parseInt(skip))
                .limit(parseInt(limit));

            // Count the total matching job seekers for pagination info
            const total = await Users.countDocuments(query);

            // Check if no job seekers were found
            if (resultUsers.length === 0) {
                return handleResponse(res, 200, 'success', 'No job seekers found', [], 0, null);
            }

            // Prepare pagination data
            const pagination = {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                limit: parseInt(limit),
                totalDocuments: total
            };

            // Return the paginated list of job seekers
            return handleResponse(res, 200, 'success', 'Job seekers retrieved successfully', resultUsers, resultUsers.length, pagination);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async getJobSeekersByName(req, res) {
        let { fullname, page = 1, limit = 10 } = req.query; // Include default pagination parameters

        if (!fullname) {
            return handleResponse(res, 400, 'error', 'Please enter full name!', null, 0);
        }

        if (!req.user) {
            return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
        }

        // Normalize the fullName by removing spaces and converting to lowercase
        fullname = fullname.replace(/\s+/g, '').toLowerCase();
        try {
            // Create a case-insensitive regex pattern to match the normalized fullName
            // The \s* between each character allows for any number of spaces to appear between letters
            const pattern = fullname.split('').join('\\s*');
            const regex = new RegExp(pattern, 'i');

            // Calculate the number of results to skip (for pagination)
            const skip = (page - 1) * limit;

            // Execute the query with pagination
            const resultUsers = await Users.find({
                $and: [
                    { jobSeeker: { $exists: true } }, // Only search for users who have the jobSeeker field
                    { "jobSeeker.fullName": { $regex: regex } }, // Search by fullName in jobSeeker subdocument
                ],
            })
                .skip(parseInt(skip))
                .limit(parseInt(limit));

            // Count the total documents matching the query for pagination info
            const total = await Users.countDocuments({
                $and: [
                    { jobSeeker: { $exists: true } },
                    { "jobSeeker.fullName": { $regex: regex } },
                ],
            });

            if (resultUsers.length === 0) {
                return handleResponse(res, 200, 'success', 'No job seekers found', [], 0);
            }

            // Prepare pagination data
            const pagination = {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                limit: parseInt(limit),
                totalDocuments: total
            };

            return handleResponse(res, 200, 'success', 'Job seekers retrieved successfully', resultUsers, resultUsers.length, pagination);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async getJobSeekersByParams(req, res) {
        let { skills, location, worktype, jobtitle, employmentType, experience, education, newJobSeekers, expectedSalary, sortByAlphabet, page = 1, limit = 10 } = req.query;

        if (!req.user || !req.user.employer) {
            return handleResponse(res, 401, 'error', 'Unauthorized or Employer only', null, 0);
        }
        // console.log("query: ", req.query)
        try {
            let resumeQueryObject = {}; // Query object for the resume
            let userQueryObject = {}; // Query object for the user
            if (newJobSeekers === true) {
                userQueryObject['createdAt'] = { $gte: new Date(newJobSeekers) }
            }
            if (sortByAlphabet === true) {
                userQueryObject['jobSeeker.fullName'] = { $regex: '^[A-Z]', $options: 'i' };
            }
            if (expectedSalary) {
                userQueryObject['jobSeeker.expectedSalary'] = { $lte: expectedSalary }
            }

            if (location) userQueryObject['jobSeeker.location'] = location;
            if (education) userQueryObject["jobSeeker.educationalBackground"] = education;
            if (skills) userQueryObject["jobSeeker.skills"] = { $in: skills.split(",") };
            if (jobtitle) userQueryObject["jobSeeker.jobtitle"] = { $regex: jobtitle, $options: 'i' };
            if (experience) userQueryObject["jobSeeker.workingExperience"] = experience;
            if (worktype) userQueryObject["jobSeeker.employmentType"] = worktype;
            if (employmentType) userQueryObject['jobSeeker.employmentType'] = employmentType;


            const skip = (page - 1) * limit;
            const matchedUsers = await Users.find(userQueryObject)
                .skip(parseInt(skip))
                .limit(parseInt(limit))
                .populate({
                    path: 'resumeId',
                    match: resumeQueryObject
                });
            // console.log("userQueryObject: ", userQueryObject)
            // console.log("resumeQueryObject: ", resumeQueryObject)
            // console.log("matchedUsers: ", matchedUsers)
            const total = await Users.countDocuments(userQueryObject);
            const resultUsers = matchedUsers.filter(user => user.resumeId && Object.keys(user.resumeId).length > 0);

            if (resultUsers.length === 0) {
                return handleResponse(res, 200, 'success', 'No job seekers found', [], 0);
            }

            const pagination = {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                limit: parseInt(limit),
                totalDocuments: total
            };

            return handleResponse(res, 200, 'success', 'Job seekers retrieved successfully', resultUsers, resultUsers.length, pagination);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
}


module.exports = new JobSeekerCTRL();

