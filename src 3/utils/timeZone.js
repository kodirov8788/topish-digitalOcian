// src/utils/timeZone.js
exports.timeZone = () => {
    const date = new Date();
    const gmtPlus5Time = new Date(date.getTime() + (5 * 60 * 60 * 1000));
    return gmtPlus5Time.toISOString();
}

