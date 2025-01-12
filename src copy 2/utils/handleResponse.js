exports.handleResponse = (res, status, result, msg, data = null, totalCount = 0, pagination = null) => {
  res.status(status).json({
    result,
    msg,
    data,
    totalCount,
    pagination
  });
};
