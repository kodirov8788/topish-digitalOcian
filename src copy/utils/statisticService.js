const Statistics = require("../models/statistic_count");

// Increment the count of users entering the site
async function incrementUserCount() {
    let stat = await Statistics.findOne();

    if (!stat) {
        stat = new Statistics();
    }

    stat.count += 1;
    await stat.save();
    // console.log("User count incremented to: ", stat)
    return stat;
}

// Retrieve the current statistics
async function getStatistics() {
    const stat = await Statistics.findOne();
    return stat;
}

module.exports = {
    incrementUserCount,
    getStatistics
};
