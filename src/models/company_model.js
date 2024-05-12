const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  company_logo: {
    type: Array,
    required: [false, "Company logo is required"],
    default: []
  },
  company_description: {
    type: String,
    required: [true, "Company description is required"]
  },
  company_name: {
    type: String,
    required: [true, "Company name is required"]
  },
  company_size: {
    type: String,
    required: [true, "Company size is required"]
  },
  company_location: {
    type: String,
    required: [true, "Company location is required"]
  },
  company_type: {
    type: String,
    required: [true, "Company type is required"]
  },
  company_workers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users' // Assuming 'Worker' is another model that you've defined elsewhere,
  }],
  company_owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // Assuming 'User' is another model that you've defined elsewhere
    required: [false, "Company owner ID is required"]
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users' // Assuming 'User' is another model that you've defined elsewhere,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // Assuming 'User' is another model that you've defined elsewhere
    required: [true, "Creator user ID is required"]
  }
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
