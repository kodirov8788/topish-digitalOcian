const Users = require("../models/user_model");
const ReportUserModel = require("../models/reportUser_model");
const { handleResponse } = require("../utils/handleResponse");

class ReportUserCTRL {
  async makeReport(req, res) {


    if (!req.user) {
      return handleResponse(res, 401, "error", "Unauthorized", null, 0);
    }

    const user = await Users.findById(req.user.id).select("-password");
    if (
      !user.role === "Employer" ||
      !user.role === "JobSeeker" ||
      !user.role === "Service"
    ) {
      return handleResponse(
        res,
        403,
        "error",
        "You are not authorized to view this page",
        null,
        0
      );
    }
    try {
      const { reportedUserId, reportReason, details, jobPostId } = req.body;
      const reportData = {
        reportedUserId,
        reportReason,
        jobPostId,
        details,
      };

      // validate the report data
      if (!reportedUserId || !reportReason) {
        return handleResponse(
          res,
          400,
          "error",
          "Please provide all the required fields",
          null,
          0
        );
      }

      // add the reporter id
      reportData.reportedBy = req.user.id;

      // ReportUserModel is the model for the report
      const report = new ReportUserModel({
        ...reportData,
      });

      // create a new report
      const user = await Users.findById(reportedUserId);
      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }
      // save report
      const newReport = await report.save();
      return handleResponse(
        res,
        201,
        "success",
        "Report sent successfully",
        newReport,
        1
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
  // write get request to get all reports and add filter open and resolved
  async getReports(req, res) {
    console.log(req.query, "query")
    try {
      const { status } = req.query;
      // if (req.user.role !== 'admin') {
      //     return handleResponse(res, 403, 'error', 'You are not authorized to view this page', null, 0);
      // }

      let reports;
      if (status) {
        reports = await ReportUserModel.find({ status });
      } else {
        reports = await ReportUserModel.find();
      }
      return handleResponse(
        res,
        200,
        "success",
        "Reports fetched successfully",
        reports,
        reports.length
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
  // change the status of the report to resolved
  async changeStatusReport(req, res) {
    try {
      // if (req.user.role !== 'admin') {
      //     return handleResponse(res, 403, 'error', 'You are not authorized to view this page', null, 0);
      // }
      const { reportId } = req.params;
      // write come date from body to change the status
      const report = await ReportUserModel.findById(reportId);
      if (!report) {
        return handleResponse(res, 404, "error", "Report not found", null, 0);
      }
      const reportStatus = req.body.status;
      report.status = reportStatus;
      await report.save();
      return handleResponse(
        res,
        200,
        "success",
        "Report resolved successfully",
        report,
        1
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

module.exports = new ReportUserCTRL();
