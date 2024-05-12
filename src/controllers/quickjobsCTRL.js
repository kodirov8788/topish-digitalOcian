const QuickJobs = require("../models/quickjob_model");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");

class QuickJobsCTRL {
    async createQuickjobs(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }

            const coins = req.user.coins;
            if (req.user.role !== "Employer") {
                return handleResponse(res, 403, 'error', 'You are not allowed!', null, 0);
            }

            if (coins == null) {
                return handleResponse(res, 400, 'error', 'There are some problems with your coins. Please contact support.', null, 0);
            }

            if (coins < 5) {
                return handleResponse(res, 400, 'error', 'Not enough coins.', null, 0);
            }

            const userId = req.user.id;
            const user = await Users.findOne({ _id: userId });
            if (!user || !user.employer) {
                return handleResponse(res, 400, 'error', 'Employer details not found.', null, 0);
            }


            const jobDetails = {
                ...req.body,
                createdBy: user.id,
                hr_avatar: user.avatar,
                hr_name: user.employer.fullName
            };
            // console.log("user", user)
            const job = await QuickJobs.create(jobDetails);

            await Users.findByIdAndUpdate(userId, { $inc: { coins: -1 } });

            return handleResponse(res, 201, 'success', 'Quick Job created successfully', job, 1);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async deleteQuickjobs(req, res, next) {
        try {
            // Check if the user is authenticated
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }
            // Check if the user role is Employer
            else if (req.user.role !== "Employer") {
                return handleResponse(res, 401, 'error', 'You are not allowed!', null, 0);
            }
            const { id: jobID } = req.params;
            // Perform the deletion operation
            const deleteJob = await QuickJobs.findOneAndDelete({
                _id: jobID,
                createdBy: req.user.id, // Ensure that the job can only be deleted by its creator
            });

            // If the job doesn't exist or wasn't deleted
            if (!deleteJob) {
                return handleResponse(res, 404, 'error', `Job with id: ${jobID} not found`, null, 0);
            }

            // If deletion was successful
            return handleResponse(res, 200, 'success', 'Job deleted successfully', null, 1);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async getAllQuickjobs(req, res) {
        try {
            // if (!req.user) {
            //     return handleResponse(res, 401, 'error', 'Unauthorized');
            // }

            const { recommended, jobTitle, location, page = 1, limit = 10, sort } = req.query;
            let queryObject = {};

            if (recommended) {
                queryObject.recommended = recommended === "true";
            }

            if (jobTitle) {
                if (jobTitle.trim() === "") {
                    return handleResponse(res, 400, 'error', 'Title cannot be empty', [], 0);
                } else {
                    queryObject.title = { $regex: jobTitle, $options: "i" };
                }
            }

            if (location) {
                queryObject.location = { $regex: location, $options: "i" };
            }

            let query = QuickJobs.find(queryObject);

            // Pagination
            const skip = (page - 1) * parseInt(limit); // Ensure limit is an integer
            query = query.skip(skip).limit(parseInt(limit));

            // Sort
            if (sort) {
                const sortList = sort.split(",").join(" ");
                query = query.sort(sortList);
            } else {
                query = query.sort("-createdAt"); // Default sort by createdAt in descending order
            }

            // Fields selection
            // Ensure 'description' is always included along with other fields
            // let fieldsToSelect = "title location createdBy description phoneNumber"; // Default fields now include 'description'
            // query = query.select(fieldsToSelect);

            const searchedJob = await query;

            if (searchedJob.length === 0) {
                return handleResponse(res, 200, 'success', 'No jobs found', [], 0);
            }

            const userIds = searchedJob.map(job => job.createdBy);
            const users = await Users.find({ _id: { $in: userIds } });
            const userMap = users.reduce((acc, user) => {
                acc[user._id.toString()] = user;
                return acc;
            }, {});

            let NewSearchedJob = searchedJob.map(job => {
                const user = userMap[job.createdBy.toString()];  // Get the user based on job's createdBy field
                if (!user) {
                    return {
                        ...job._doc, // Assuming you're using Mongoose and want to spread the job document
                        hr_name: "deleted user", // Fallback if user is not found
                        hr_avatar: "default_avatar.png", // Fallback avatar image path
                    };
                } else {
                    return {
                        ...job._doc,
                        hr_name: user.employer ? user.employer.fullName : "No employer name", // Check if employer exists
                        hr_avatar: user.avatar || "default_avatar.png", // Use default avatar if none is provided
                    };
                }
            });


            // Prepare pagination data
            const totalJobs = await QuickJobs.countDocuments(queryObject); // Efficiently fetch total count
            const pagination = {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalJobs / parseInt(limit)),
                limit: parseInt(limit),
                totalDocuments: totalJobs
            };

            return handleResponse(res, 200, 'success', 'Jobs retrieved successfully', NewSearchedJob, searchedJob.length, pagination);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async getEmployerPosts(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            } else if (req.user.role !== "Employer") {
                return handleResponse(res, 401, 'error', 'You are not allowed!', null, 0);
            }

            const page = parseInt(req.query.page) || 1; // Default to first page if not specified
            const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items if not specified
            const skip = (page - 1) * limit;

            const allJobs = await QuickJobs.find({ createdBy: req.user.id })
                .sort("-createdAt")
                .skip(skip)
                .limit(limit);

            const totalJobs = await QuickJobs.countDocuments({ createdBy: req.user.id });

            if (allJobs.length === 0) {
                return handleResponse(res, 200, 'success', 'No employer posts found', [], 0);
            }
            // console.log("req.user.avatar", req.user)
            let NewSearchedJob = allJobs.map(job => {
                return {
                    ...job._doc, // Assuming you're using Mongoose and want to spread the job document
                    hr_name: req.user.employer.fullName, // Directly use req.user information
                    hr_avatar: req.user.avatar, // Directly use req.user information
                };
            });

            // Prepare pagination data
            const pagination = {
                currentPage: page,
                totalPages: Math.ceil(totalJobs / limit),
                limit: limit,
                totalDocuments: totalJobs
            };

            return handleResponse(res, 200, 'success', 'Employer posts retrieved successfully', NewSearchedJob, allJobs.length, pagination);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async getSingleQuickjob(req, res) {
        try {
            // if (!req.user) {
            //     return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            // }
            const { id: jobID } = req.params; // Simplified destructuring for readability

            // Check if jobID is a valid ObjectId
            if (!ObjectId.isValid(jobID)) {
                return handleResponse(res, 400, 'error', 'Invalid job ID format', null, 0);
            }

            const singleJob = await QuickJobs.findOne({ _id: jobID });

            if (!singleJob) {
                return handleResponse(res, 404, 'error', `Job not found with ID: ${jobID}`, null, 0);
            }

            const NewUser = await Users.findOne({ _id: singleJob.createdBy });
            let NewSearchedJob;
            if (!NewUser) {
                NewSearchedJob = {
                    ...singleJob.toObject(), // Convert Mongoose document to plain object
                    hr_name: "User Deleted", // Consistent capitalization and message
                    hr_avatar: "default_avatar.png", // Uniform default avatar
                };
            } else {
                NewSearchedJob = {
                    ...singleJob.toObject(), // Convert Mongoose document to plain object
                    hr_name: NewUser.employer ? NewUser.employer.fullName : 'No employer information', // Informative fallback
                    hr_avatar: NewUser.avatar || 'default_avatar.png', // Uniform default avatar
                };
            }

            return handleResponse(res, 200, 'success', 'Job retrieved successfully', NewSearchedJob, 1);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async updateQuickjobs(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            } else if (req.user.role !== "Employer") {
                return handleResponse(res, 401, 'error', 'You are not allowed!', null, 0);
            }

            const { params: { id: jobID } } = req;

            const updatedJob = await QuickJobs.findOneAndUpdate(
                { _id: jobID, createdBy: req.user.id },
                req.body,
                {
                    new: true,
                    runValidators: true,
                }
            );

            if (!updatedJob) {
                return handleResponse(res, 404, 'error', `Job not found with ID: ${jobID}`, null, 0);
            }

            // Assuming req.user has the employer information you want to attach
            // Otherwise, you might need to fetch this data from your database
            let NewSearchedJob = {
                ...updatedJob.toObject(), // Convert Mongoose document to plain object
                hr_name: req.user.employer ? req.user.employer.fullName : '', // Use req.user data
                hr_avatar: req.user.avatar, // Assuming req.user.avatar exists
            };

            return handleResponse(res, 200, 'success', 'Job updated successfully', NewSearchedJob, 1);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
}

module.exports = new QuickJobsCTRL();