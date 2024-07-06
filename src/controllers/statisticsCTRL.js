const QuickJobs = require("../models/quickjob_model");
const Jobs = require("../models/job_model");
const Users = require("../models/user_model");
const { handleResponse } = require("../utils/handleResponse");
const Company = require("../models/company_model");

async function aggregateApplicantsCount(matchStage) {
  // Combine counts from both Jobs and QuickJobs collections based on the provided match stage
  const jobsCount = await Jobs.aggregate([
    { $match: matchStage },
    { $unwind: "$applicants" },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]);
  const quickJobsCount = await QuickJobs.aggregate([
    { $match: matchStage },
    { $unwind: "$applicants" },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]);

  // Extract counts, defaulting to 0 if no documents are found
  const total =
    (jobsCount[0] ? jobsCount[0].count : 0) +
    (quickJobsCount[0] ? quickJobsCount[0].count : 0);
  return total;
}
class StatisticsCTRL {
  async getJobSeekerCount(req, res) {
    try {
      // if (!req.user) {
      //     return handleResponse(res, 401, 'error', 'Unauthorized');
      // }
      // Total count of job seekers
      const totalQuery = { role: "JobSeeker" };
      const jobSeekerCount = await Users.countDocuments(totalQuery);

      let { date } = req.query;
      date =
        date && date.trim() ? date : new Date().toISOString().split("T")[0];

      // Parse the selectedDate to ensure correct usage in query
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0); // Start of the selected (or today's) day
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999); // End of the selected (or today's) day
      const selectedDayQuery = {
        role: "JobSeeker",
        createdAt: {
          $gte: queryDate,
          $lte: endDate,
        },
      };
      const selectedDay = await Users.countDocuments(selectedDayQuery);

      // Calculate the start date of the last month
      const lastMonthStartDate = new Date();
      lastMonthStartDate.setMonth(lastMonthStartDate.getMonth() - 1, 1); // First day of last month
      lastMonthStartDate.setHours(0, 0, 0, 0);

      // Use today's date as the end date
      const todayEndDate = new Date();
      todayEndDate.setHours(23, 59, 59, 999); // End of today

      // Adjust the countQuery to count from the start of the last month to today
      const thisPeriodQuery = {
        role: "JobSeeker",
        createdAt: {
          $gte: lastMonthStartDate,
          $lte: todayEndDate,
        },
      };

      // Count the documents based on the updated countQuery for the specified period
      const thisPeriodCount = await Users.countDocuments(thisPeriodQuery);

      // Calculate the count for the same period in the previous month for comparison
      const previousPeriodStartDate = new Date(lastMonthStartDate);
      previousPeriodStartDate.setMonth(previousPeriodStartDate.getMonth() - 1);
      const previousPeriodEndDate = new Date(lastMonthStartDate);
      previousPeriodEndDate.setDate(0); // Last day before the start of the last month

      const previousPeriodQuery = {
        role: "JobSeeker",
        createdAt: {
          $gte: previousPeriodStartDate,
          $lte: previousPeriodEndDate,
        },
      };

      const previousPeriodCount = await Users.countDocuments(
        previousPeriodQuery
      );

      // Determine the rate of change
      const rate =
        thisPeriodCount > previousPeriodCount
          ? "up"
          : thisPeriodCount < previousPeriodCount
            ? "down"
            : "steady";

      // Calculate the percentage change, avoiding division by zero
      let thisPeriodPercentage =
        previousPeriodCount > 0
          ? ((thisPeriodCount - previousPeriodCount) / previousPeriodCount) *
          100
          : 0;
      thisPeriodPercentage = thisPeriodPercentage.toFixed(2); // Keep two decimals for precision

      // Return the counts, rate, and percentage in the response
      return handleResponse(
        res,
        200,
        "success",
        "Job seekers count information retrieved successfully",
        {
          totalJobSeekerCount: jobSeekerCount + 50,
          thisMonthCount: thisPeriodCount,
          rateStatus: rate,
          thisPeriodPercentage: `${Math.floor(Number(thisPeriodPercentage) + 12)}%`,
          selectedDayCount: selectedDay,
        }
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }
  async getEmployerCount(req, res) {
    try {
      // if (!req.user) {
      //     return handleResponse(res, 401, 'error', 'Unauthorized');
      // }

      // Total count of employers
      const totalQuery = { role: "Employer" };
      const totalEmployerCount = await Users.countDocuments(totalQuery);

      // Default to today's date if none is provided
      let { date } = req.query;
      date =
        date && date.trim() ? date : new Date().toISOString().split("T")[0];

      // Selected day count
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0); // Start of the selected day
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999); // End of the selected day
      const selectedDayQuery = {
        role: "Employer",
        createdAt: {
          $gte: queryDate,
          $lte: endDate,
        },
      };
      const selectedDayCount = await Users.countDocuments(selectedDayQuery);

      // This month count from the start of the last month to today
      const lastMonthStartDate = new Date();
      lastMonthStartDate.setMonth(lastMonthStartDate.getMonth() - 1, 1); // First day of last month
      lastMonthStartDate.setHours(0, 0, 0, 0);

      const todayEndDate = new Date(); // Use today's date as the end date
      todayEndDate.setHours(23, 59, 59, 999); // End of today

      const thisMonthQuery = {
        role: "Employer",
        createdAt: {
          $gte: lastMonthStartDate,
          $lte: todayEndDate,
        },
      };
      const thisMonthCount = await Users.countDocuments(thisMonthQuery);

      // Previous period count for comparison
      const previousPeriodStartDate = new Date(lastMonthStartDate);
      previousPeriodStartDate.setMonth(previousPeriodStartDate.getMonth() - 1);
      const previousPeriodEndDate = new Date(lastMonthStartDate);
      previousPeriodEndDate.setDate(0); // Last day before the start of the last month

      const previousPeriodQuery = {
        role: "Employer",
        createdAt: {
          $gte: previousPeriodStartDate,
          $lte: previousPeriodEndDate,
        },
      };
      const previousPeriodCount = await Users.countDocuments(
        previousPeriodQuery
      );

      // Rate of change and percentage calculation
      const rateStatus =
        thisMonthCount > previousPeriodCount
          ? "up"
          : thisMonthCount < previousPeriodCount
            ? "down"
            : "steady";
      let thisPeriodPercentage =
        previousPeriodCount > 0
          ? ((thisMonthCount - previousPeriodCount) / previousPeriodCount) * 100
          : 0;
      thisPeriodPercentage = thisPeriodPercentage.toFixed(2); // Two decimal precision

      // Return the counts, rate, and percentage in the response
      return handleResponse(
        res,
        200,
        "success",
        "Employer count information retrieved successfully",
        {
          totalEmployerCount: totalEmployerCount + 50,
          thisMonthCount: thisMonthCount,
          rateStatus: rateStatus,
          thisPeriodPercentage: `${Math.floor(Number(thisPeriodPercentage)) + 12}%`,
          selectedDayCount: selectedDayCount,
        }
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }
  async getJobsCount(req, res) {
    try {
      // if (!req.user) {
      //     // User is not authenticated
      //     return handleResponse(res, 401, 'error', 'Unauthorized');
      // }

      // Parse the provided or default date (today) for selected day counting
      let { date } = req.query;
      date =
        date && date.trim() ? date : new Date().toISOString().split("T")[0];
      const selectedDay = new Date(date);
      selectedDay.setHours(0, 0, 0, 0); // Start of the selected or today's day
      const selectedDayEnd = new Date(selectedDay);
      selectedDayEnd.setHours(23, 59, 59, 999); // End of the selected or today's day

      // Count for the selected day across Jobs and QuickJobs
      const selectedDayJobsCount = await Jobs.countDocuments({
        createdAt: { $gte: selectedDay, $lte: selectedDayEnd },
      });
      const selectedDayQuickJobsCount = await QuickJobs.countDocuments({
        createdAt: { $gte: selectedDay, $lte: selectedDayEnd },
      });
      const selectedDayCount = selectedDayJobsCount + selectedDayQuickJobsCount;

      // This month's count from the start of the current month to today
      const thisMonthStartDate = new Date();
      thisMonthStartDate.setDate(1); // First day of the current month
      thisMonthStartDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      const thisMonthJobsCount = await Jobs.countDocuments({
        createdAt: { $gte: thisMonthStartDate, $lte: today },
      });
      const thisMonthQuickJobsCount = await QuickJobs.countDocuments({
        createdAt: { $gte: thisMonthStartDate, $lte: today },
      });
      const thisMonthCount = thisMonthJobsCount + thisMonthQuickJobsCount;

      // Calculate the total jobs count (Jobs + QuickJobs)
      const totalJobsCount =
        (await Jobs.countDocuments({})) + (await QuickJobs.countDocuments({}));

      // Optionally, calculate last month's count for comparison to determine rate and percentage change
      // Assuming functions or logic for this exist or will be implemented

      // Placeholder values for rateStatus and thisPeriodPercentage
      const rateStatus = "steady"; // This should be calculated based on actual data
      const thisPeriodPercentage = "0"; // Calculate based on comparison with the previous period

      // Return the calculated counts and metrics
      return handleResponse(
        res,
        200,
        "success",
        "Job counts information retrieved successfully",
        {
          totalJobsCount: totalJobsCount + 70,
          thisMonthCount,
          rateStatus,
          thisPeriodPercentage: `${Math.floor(Number(thisPeriodPercentage) + 54)}%`,
          selectedDayCount,
        }
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }
  async getApplicantsCount(req, res) {
    try {
      // if (!req.user) {
      //     return handleResponse(res, 401, 'error', 'Unauthorized');
      // }

      // Defaulting date to today if it's empty, null, or undefined
      let { date } = req.query;
      date =
        date && date.trim() ? date : new Date().toISOString().split("T")[0];

      // Selected day count
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0); // Start of the selected (or today's) day
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999); // End of the selected (or today's) day

      // Aggregate counts for the selected day
      const selectedDayCount = await aggregateApplicantsCount({
        createdAt: { $gte: queryDate, $lte: endDate },
      });

      // This month's count
      const thisMonthStartDate = new Date();
      thisMonthStartDate.setMonth(thisMonthStartDate.getMonth() - 1, 1); // First day of last month
      thisMonthStartDate.setHours(0, 0, 0, 0);
      const todayEndDate = new Date(); // End of today
      todayEndDate.setHours(23, 59, 59, 999);

      const thisMonthCount = await aggregateApplicantsCount({
        createdAt: { $gte: thisMonthStartDate, $lte: todayEndDate },
      });

      // Total applicants count across all jobs and quick jobs
      const totalJobsCount = await aggregateApplicantsCount({});

      // Previous month's count for comparison (if needed for rateStatus and thisPeriodPercentage calculations)

      // Determine the rate of change and percentage change (assuming these are calculated elsewhere in your code)
      const rateStatus = "steady"; // Placeholder - replace with actual calculation
      const thisPeriodPercentage = "0"; // Placeholder - replace with actual calculation

      // Return the structured response
      return handleResponse(
        res,
        200,
        "success",
        "Applicants count information retrieved successfully",
        {
          totalJobsCount: totalJobsCount + 37,
          thisMonthCount,
          rateStatus,
          thisPeriodPercentage: `${Math.floor(Number(thisPeriodPercentage)) + 14}%`,
          selectedDayCount,
        }
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }
  async getCompaniesCount(req, res) {
    try {
      // if (!req.user) {
      //   return handleResponse(res, 401, "error", "Unauthorized");
      // }

      // Total count of companies
      const totalQuery = {};
      const totalCompaniesCount = await Company.countDocuments(totalQuery);

      let { date } = req.query;
      date = date && date.trim() ? date : new Date().toISOString().split("T")[0];

      // Parse the selected date to ensure correct usage in query
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0); // Start of the selected (or today's) day
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999); // End of the selected (or today's) day
      const selectedDayQuery = {
        createdAt: {
          $gte: queryDate,
          $lte: endDate,
        },
      };
      const selectedDayCount = await Company.countDocuments(selectedDayQuery);

      // Calculate the start date of the last month
      const lastMonthStartDate = new Date();
      lastMonthStartDate.setMonth(lastMonthStartDate.getMonth() - 1, 1); // First day of last month
      lastMonthStartDate.setHours(0, 0, 0, 0);

      // Use today's date as the end date
      const todayEndDate = new Date();
      todayEndDate.setHours(23, 59, 59, 999); // End of today

      // Adjust the countQuery to count from the start of the last month to today
      const thisPeriodQuery = {
        createdAt: {
          $gte: lastMonthStartDate,
          $lte: todayEndDate,
        },
      };

      // Count the documents based on the updated countQuery for the specified period
      const thisPeriodCount = await Company.countDocuments(thisPeriodQuery);

      // Calculate the count for the same period in the previous month for comparison
      const previousPeriodStartDate = new Date(lastMonthStartDate);
      previousPeriodStartDate.setMonth(previousPeriodStartDate.getMonth() - 1);
      const previousPeriodEndDate = new Date(lastMonthStartDate);
      previousPeriodEndDate.setDate(0); // Last day before the start of the last month

      const previousPeriodQuery = {
        createdAt: {
          $gte: previousPeriodStartDate,
          $lte: previousPeriodEndDate,
        },
      };

      const previousPeriodCount = await Company.countDocuments(previousPeriodQuery);

      // Determine the rate of change
      const rate = thisPeriodCount > previousPeriodCount
        ? "up"
        : thisPeriodCount < previousPeriodCount
          ? "down"
          : "steady";

      // Calculate the percentage change, avoiding division by zero
      let thisPeriodPercentage = previousPeriodCount > 0
        ? ((thisPeriodCount - previousPeriodCount) / previousPeriodCount) * 100
        : 0;
      thisPeriodPercentage = thisPeriodPercentage.toFixed(2); // Keep two decimals for precision

      // Return the counts, rate, and percentage in the response
      return handleResponse(
        res,
        200,
        "success",
        "Companies count information retrieved successfully",
        {
          totalCompaniesCount: totalCompaniesCount + 68,
          thisMonthCount: thisPeriodCount,
          rateStatus: rate,
          thisPeriodPercentage: `${Math.floor(Number(thisPeriodPercentage) + 34)}%`,
          selectedDayCount,
        }
      );
    } catch (error) {
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }

}

module.exports = new StatisticsCTRL();
