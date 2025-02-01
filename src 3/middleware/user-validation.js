// src/middleware/user-validation.js
const { check, validationResult } = require("express-validator");
const { handleResponse } = require("../utils/handleResponse");

exports.validateUserSignUp = [
  // Export a middleware function for validating user sign-up data
  /*   check("fullName") // Define validation rules for the 'firstName' field
    .trim() // Remove whitespace from the beginning and end of the input
    .not() // Ensure that the input is not empty
    .isEmpty()
    .withMessage("Name is required!") // Return an error message if the input is empty
    .isString() // Ensure that the input is a string
    .withMessage("Must be a valid name!") // Return an error message if the input is not a string
    .isLength({ min: 3, max: 20 }) // Ensure that the input is between 3 and 20 characters long
    .withMessage("First Name must be within 3 to 20 character!"), // Return an error message if the input is not between 3 and 20 characters long
 */
  check("phoneNumber") // Define validation rules for the 'phoneNumber' field
    .trim() // Remove whitespace from the beginning and end of the input
    .not() // Ensure that the input is not empty
    .isEmpty()
    .withMessage("Phone number is required!") // Return an error message if the input is empty
    .isString() // Ensure that the input is a string
    .withMessage("Phone number must be a valid string!") // Return an error message if the input is not a string
    .isLength({ min: 10, max: 20 }) // Ensure that the input is between 10 and 20 characters long
    .withMessage("Phone number must be within 10 to 20 characters!") // Return an error message if the input is not between 10 and 20 characters long
    .matches(/^[+0-9]+$/) // Ensure that the input only contains numbers
    .withMessage("Phone number must only contain numbers!"), // Return an error message if the input contains non-numeric characters

  check("email") // Define validation rules for the 'email' field
    .normalizeEmail() // Normalize the input email address
    .isEmail() // Ensure that the input is a valid email address
    .withMessage("Invalid email! Please"), // Return an error message if the input is not a valid email address

  check("password") // Define validation rules for the 'password' field
    .trim() // Remove whitespace from the beginning and end of the input
    .not() // Ensure that the input is not empty
    .isEmpty()
    .withMessage("Password is empty!") // Return an error message if the input is empty
    .isLength({ min: 8, max: 20 }) // Ensure that the input is between 8 and 20 characters long
    .withMessage("Password must be 3 to 20 characters long!"), // Return an error message if the input is not between 8 and 20 characters long

  check("confirmPassword") // Define validation rules for the 'confirmPassword' field
    .trim() // Remove whitespace from the beginning and end of the input
    .not() // Ensure that the input is not empty
    .isEmpty()
    .custom((value, { req }) => {
      // Check that the value matches the value of the 'password' field
      if (value !== req.body.password) {
        // If the values do not match, throw an error
        throw new Error("Both password must be same!");
      }
      return true; // If the values match, return true
    }),
];

exports.userValidation = (req, res, next) => {
  // Export a middleware function for handling validation errors
  const result = validationResult(req).array(); // Get an array of validation errors (if any) from the request object
  if (!result.length) return next(); // If there are no errors, continue to the next middleware function

  const error = result[0].msg; // Get the first error message from the array
  return handleResponse(res, 400, 'error', `Please, ${error}`, {}, 0); // Return an error response to the client
};


exports.validateUserSignIn = [
  check("email").trim().isEmail().withMessage("fill the correct email!"),
  check("password").trim().not().isEmpty().withMessage("enter your password!"),
];
