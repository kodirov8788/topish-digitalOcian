const Company = require("../models/company_model");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");
const { deleteFiles } = require("../utils/companyImageUpload");
class CompanyCTRL {
    async createCompany(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }
            // console.log("req.body", req.body)
            // console.log("req.files ctrl: ", req.files)
            const coins = req.user.coins;
            const allowedRoles = ["Admin", "Employer"];
            if (!allowedRoles.includes(req.user.role)) {
                return handleResponse(res, 401, 'error', 'You are not allowed!', null, 0);
            }

            if (coins == null) {
                return handleResponse(res, 400, 'error', 'There are some problems with your coins. Please contact support.', null, 0);
            }

            if (coins < 5) {
                return handleResponse(res, 400, 'error', 'Not enough coins.', null, 0);
            }

            const userId = req.user.id;
            const user = await Users.findOne({ _id: userId });
            if (!user) {
                return handleResponse(res, 400, 'error', 'User not found.', null, 0);
            }
            const companyDetails = {
                ...req.body,
                createdBy: user.id,
            };
            // console.log(req.body)
            console.log("req.files => ", req.files)
            if (req.files && req.files.length > 0) {
                // Map through the files array and extract the S3 file locations
                companyDetails.company_logo = req.files;
            }
            const company = await Company.create(companyDetails);
            // console.log("company: ", company)
            await Users.findByIdAndUpdate(userId, { $inc: { coins: -1 } });

            return handleResponse(res, 201, 'success', 'company created successfully', company, 1);
        } catch (error) {
            console.error("Error in company function:", error);
            return handleResponse(res, 500, 'error', 'An error occurred while creating the job.', null, 0);
        }
    }
    async deleteCompany(req, res, next) {
        try {
            // Check if the user is authenticated
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }
            // Check if the user role is Employer
            const allowedRoles = ["Admin", "Employer"];
            if (!allowedRoles.includes(req.user.role)) {
                return handleResponse(res, 401, 'error', 'You are not allowed!', null, 0);
            }
            const { id: companyId } = req.params;

            let company = await Company.findById(companyId);
            await deleteFiles(company.company_logo);
            // Perform the deletion operation
            const deleteCompany = await Company.findOneAndDelete({
                _id: companyId,
                createdBy: req.user.id, // Ensure that the job can only be deleted by its creator
            });

            // If the job doesn't exist or wasn't deleted
            if (!deleteCompany) {
                return handleResponse(res, 404, 'error', `company with id: ${companyId} not found`, null, 0);
            }

            // If deletion was successful
            return handleResponse(res, 200, 'success', 'company deleted successfully', null, 1);
        } catch (error) {
            console.error("Error in deleteCompany function:", error);
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async getAllCompany(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized');
            }

            const { recommended, companyName, location, page = 1, limit = 10, sort } = req.query;
            let queryObject = {};
            let company_name = companyName;
            let recommendedCompany = recommended;
            let company_location = location;

            if (company_name) {
                if (company_name.trim() === "") {
                    return handleResponse(res, 400, 'error', 'Title cannot be empty', [], 0);
                } else {
                    queryObject.title = { $regex: company_name, $options: "i" };
                }
            }

            if (company_location) {
                queryObject.location = { $regex: company_location, $options: "i" };
            }

            let query = Company.find(queryObject);

            // Pagination
            const skip = (page - 1) * parseInt(limit); // Ensure limit is an integer
            query = query.skip(skip).limit(parseInt(limit));

            // Sort
            if (sort) {
                const sortList = sort.split(",").join(" ");
                query = query.sort(sortList);
            } else {
            }
            const searchedCompany = await query;
            if (searchedCompany.length === 0) {
                return handleResponse(res, 200, 'success', 'No jobs found', [], 0);
            }

            // Prepare pagination data
            const totalCompanies = await Company.countDocuments(queryObject); // Efficiently fetch total count
            const pagination = {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCompanies / parseInt(limit)),
                limit: parseInt(limit),
                totalDocuments: totalCompanies
            };

            return handleResponse(res, 200, 'success', 'Company retrieved successfully', searchedCompany, searchedCompany.length, pagination);
        } catch (error) {
            console.error("Error in getAllOffices function:", error);
            return handleResponse(res, 500, 'error', 'Internal Server Error');
        }
    }
    async getSingleCompany(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }
            const {
                params: { id: companyId },
            } = req; // request gives the ID of the item

            const singleCompany = await Company.findById(companyId);
            if (!singleCompany) {
                return handleResponse(res, 404, 'error', `Company not found with ID: ${companyId}`, null, 0);
            }

            return handleResponse(res, 200, 'success', 'Company retrieved successfully', singleCompany, 1);
        } catch (error) {
            console.error("Error in getSingleJob function:", error);
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async updateCompany(req, res) {
        try {
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }
            const allowedRoles = ["Admin", "Employer"];
            if (!allowedRoles.includes(req.user.role)) {
                return handleResponse(res, 401, 'error', 'You are not allowed!', null, 0);
            }
            const { params: { id: companyId } } = req;
            let company = await Company.findById(companyId);
            if (!company || company.createdBy.toString() !== req.user.id) {
                return handleResponse(res, 404, 'error', `company not found with ID: ${companyId}`, null, 0);
            }
            let newImages = []
            if (req.files && req.files.length > 0) {
                newImages = req.files.map(file => file);
            }
            console.log("newImages: ", newImages)

            if (newImages.length > 0) {
                const delete_logo = company.company_logo.map(image => image);
                company.company_logo = newImages;
                console.log("company.company_logo: ", company.company_logo)
                console.log("delete_logo: ", delete_logo)
                await deleteFiles(delete_logo);
            }

            console.log("company: ", company)


            // Update company with the new data
            // company = await Company.findOneAndUpdate(
            //     { _id: companyId, createdBy: req.user.id },
            //     {
            //         ...req.body,
            //         company_logo: [...collectedImages] // Combine kept and new images
            //     },
            //     { new: true, runValidators: true }
            // );
            return handleResponse(res, 200, 'success', 'company updated successfully', company, 1);
        } catch (error) {
            console.error("Error in updateOffice function:", error);
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    // async getServicePosts(req, res) {
    //     try {
    //         if (!req.user) {
    //             return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
    //         }

    //         const allowedRoles = ["Service", "Admin", "Employer"];
    //         if (!allowedRoles.includes(req.user.role)) {
    //             return handleResponse(res, 401, 'error', 'You are not allowed!', null, 0);
    //         }

    //         const page = parseInt(req.query.page) || 1; // Default to first page if not specified
    //         const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items if not specified
    //         const skip = (page - 1) * limit;

    //         const allOffices = await Company.find({ createdBy: req.user.id })
    //             .sort("-createdAt")
    //             .skip(skip)
    //             .limit(limit);

    //         const totalOffices = await Company.countDocuments({ createdBy: req.user.id });

    //         if (allOffices.length === 0) {
    //             return handleResponse(res, 200, 'success', 'No employer posts found', [], 0);
    //         }

    //         // Prepare pagination data
    //         const pagination = {
    //             currentPage: page,
    //             totalPages: Math.ceil(totalOffices / limit),
    //             limit: limit,
    //             totalDocuments: totalOffices
    //         };

    //         return handleResponse(res, 200, 'success', 'Employer posts retrieved successfully', allOffices, allOffices.length, pagination);
    //     } catch (error) {
    //         console.error("Error in getEmployerPosts function:", error);
    //      return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
    //     }
    // }



    // async postFavoriteOffice(req, res) {
    //     try {
    //         if (!req.user) {
    //             return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
    //         }

    //         const { companyId } = req.params; // Correctly extracting the office ID from request parameters
    //         const userID = req.user.id;

    //         // Verify the user exists
    //         const user = await Users.findById(userID);
    //         if (!user) {
    //             // This message was originally about job seekers, which may not be appropriate if your app isn't job-related
    //             return handleResponse(res, 400, 'error', 'User not found', null, 0);
    //         }

    //         // Find the office by its ID
    //         const office = await Company.findById(companyId);
    //         if (!office) {
    //             // Updated message for consistency with the "office" context
    //             return handleResponse(res, 404, 'error', 'Office not found', null, 0);
    //         }

    //         // Initialize likedBy array if it doesn't exist
    //         if (!office.likedBy) {
    //             office.likedBy = [];
    //         }

    //         // Check if the user has already liked the office
    //         if (office.likedBy.includes(userID)) {
    //             return handleResponse(res, 400, 'error', 'You have already liked this office', null, 0);
    //         }

    //         // Add the user's ID to the likedBy array
    //         office.likedBy.push(userID);
    //         await office.save();

    //         // Updated message to reflect successful liking of an office
    //         return handleResponse(res, 201, 'success', 'Office liked successfully', null, 0);
    //     } catch (error) {
    //         console.error("Error in postFavoriteOffice function:", error);
    //      return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
    //     }
    // }
    // async getFavoriteOffices(req, res) {
    //     try {
    //         if (!req.user) {
    //             return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
    //         }
    //         const userID = req.user.id;
    //         // Ensure the user exists
    //         const user = await Users.findById(userID);
    //         if (!user) {
    //             return handleResponse(res, 404, 'error', 'User not found', null, 0);
    //         }

    //         // Directly query for Company that the user has liked
    //         const favoriteOffices = await Company.find({ likedBy: userID });
    //         // Check if the user has any favorite Company
    //         if (!favoriteOffices || favoriteOffices.length === 0) {
    //             return handleResponse(res, 200, 'success', 'No favorite Company found', null, 0);
    //         }
    //         // Successful response returning the favorite Company
    //         return handleResponse(res, 200, 'success', 'Favorite Company retrieved successfully', favoriteOffices, favoriteOffices.length);
    //     } catch (error) {
    //         console.error("Error in getFavoriteOffices function:", error);
    //      return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
    //     }
    // }
    // async deleteFavoriteOffice(req, res) {
    //     try {
    //         if (!req.user) {
    //             return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
    //         }

    //         const { companyId } = req.params; // Correctly extracting the office ID from request parameters
    //         const userID = req.user.id;

    //         // Verify the user exists (the check for user.jobSeeker is removed to generalize the function)
    //         const user = await Users.findById(userID);
    //         if (!user) {
    //             return handleResponse(res, 404, 'error', 'User not found', null, 0);
    //         }

    //         // Find the office by its ID
    //         const office = await Company.findById(companyId);
    //         if (!office) {
    //             return handleResponse(res, 404, 'error', 'Office not found', null, 0);
    //         }

    //         // Check if the user has already liked the office
    //         if (office.likedBy && office.likedBy.includes(userID)) {
    //             // Remove the user's ID from the likedBy array
    //             office.likedBy = office.likedBy.filter(id => id.toString() !== userID);
    //             await office.save();
    //             return handleResponse(res, 200, 'success', 'Office removed from favorites successfully', null, 0);
    //         } else {
    //             return handleResponse(res, 404, 'error', 'Office not found in favorites', null, 0);
    //         }
    //     } catch (error) {
    //         console.error("Error in deleteFavoriteOffice function:", error);
    //      return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
    //     }
    // }
    async CompanySelectOwner(req, res) {
        try {
            // Check if the user is authenticated
            if (!req.user) {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }
            const { companyId } = req.params;  // Getting company ID from route parameters
            const { employerId } = req.body;  // Getting new owner ID from request body
            const userId = req.user.id;       // Assuming req.user.id is available from the authentication middleware

            // Finding the company by ID
            const company = await Company.findById(companyId);
            if (!company) {
                return handleResponse(res, 404, 'error', 'Company not found', null, 0);
            }

            // Check if the current user is trying to assign ownership to themselves
            if (company.company_owner.toString() === employerId) {
                return handleResponse(res, 400, 'error', 'this Employer is already the owner of this company', null, 0);
            }

            // Setting the new owner
            company.company_owner = employerId;

            // Saving the updated company object
            await company.save();

            // Returning success response
            return handleResponse(res, 200, 'success', 'Company owner changed successfully', company, 1);

        } catch (error) {
            console.error("Error in CompanySelectOwner function:", error);
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async CompanyAddWorker(req, res) {
        try {

            const { companyId } = req.params;  // Getting company ID from route parameters
            const { workerId } = req.body;  // Getting new owner ID from request body
            const userId = req.user.id;       // Assuming req.user.id is available from the authentication middleware

            const User = await Users.findById(userId);

            if (User.role !== "Employer") {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }

            // Finding the company by ID
            const company = await Company.findById(companyId);
            if (!company) {
                return handleResponse(res, 404, 'error', 'Company not found', null, 0);
            }

            // Check if the current user is trying to assign ownership to themselves
            if (company.company_workers.includes(workerId)) {
                return handleResponse(res, 400, 'error', 'this Employer is already the owner of this company', null, 0);
            }

            // Setting the new owner
            company.company_workers.push(workerId);

            // Saving the updated company object
            await company.save();

            // Returning success response
            return handleResponse(res, 200, 'success', 'Company owner changed successfully', company, 1);

        } catch (error) {
            console.error("Error in CompanySelectOwner function:", error);
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }
    async CompanyDeleteWorker(req, res) {
        try {
            const { companyId } = req.params;  // Getting company ID from route parameters
            const { workerId } = req.body;  // Getting new owner ID from request body
            const userId = req.user.id;       // Assuming req.user.id is available from the authentication middleware
            const User = await Users.findById(userId);
            if (User.role !== "Employer") {
                return handleResponse(res, 401, 'error', 'Unauthorized', null, 0);
            }
            // Finding the company by ID
            const company = await Company.findById(companyId);
            if (!company) {
                return handleResponse(res, 404, 'error', 'Company not found', null, 0);
            }
            // Check if the current user is trying to assign ownership to themselves
            if (!company.company_workers.includes(workerId)) {
                return handleResponse(res, 400, 'error', 'this Employer is already the owner of this company', null, 0);
            }
            // Setting the new owner
            company.company_workers = company.company_workers.filter(worker => worker !== workerId);
            // Saving the updated company object
            await company.save();
            // Returning success response
            return handleResponse(res, 200, 'success', 'Company owner changed successfully', company, 1);
        } catch (error) {
            return handleResponse(res, 500, 'error', 'Something went wrong: ' + error.message, null, 0);
        }
    }

}

module.exports = new CompanyCTRL();

