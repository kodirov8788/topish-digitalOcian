// src/routes/resume-routes.js
const express = require('express');
const router = express.Router();

const {
    addWorkExperience,
    getWorkExperience,
    updateWorkExperience,
    deleteWorkExperience
} = require('../controllers/resumeCTRL/WorkExperienceCTRL'); // Update with the correct path

const {
    addEducationExperience,
    getEducationExperience,
    updateEducationExperience,
    deleteEducationExperience
} = require('../controllers/resumeCTRL/EducationCTRL');

const {
    addProject,
    getProjects,
    updateProject,
    deleteProject
} = require('../controllers/resumeCTRL/ProjectsCTRL');

const {
    addCertificate,
    getCertificates,
    updateCertificate,
    deleteCertificate
} = require('../controllers/resumeCTRL/CertificatesCTRL');

const {
    addAward,
    getAwards,
    updateAward,
    deleteAward
} = require('../controllers/resumeCTRL/AwardCTRL');
const {
    addContact,
    getContact,
    deleteContact
} = require('../controllers/resumeCTRL/ContactCTRL');


const {
    addOrUpdateSummary
} = require('../controllers/resumeCTRL/SummaryCTRL');
const {
    addAndUpdateCvFile,
    getCvFile,
    // updateCvFile,
    deleteCvFile
} = require('../controllers/resumeCTRL/CvCTRL');


const {
    addOrUpdateSkills
} = require('../controllers/resumeCTRL/SkillsCTRL');

const {
    addOrUpdateProfessions
} = require('../controllers/resumeCTRL/ProfessionsCTRL');
const {
    addLanguages,
    getLanguages,
    updateLanguages,
    deleteLanguages
} = require('../controllers/resumeCTRL/LanguagesCTRL');


const {
    addIndustry,
    getIndustries,
    updateIndustry,
    deleteIndustry,
} = require('../controllers/resumeCTRL/IndustriesCTRL');


const {
    addExpectedSalary,
    getExpectedSalary,
    updateExpectedSalary,
    deleteExpectedSalary,
} = require("../controllers/resumeCTRL/ExpectedSalaryCTRL");


const {
    setSearchJobTrue,
    setSearchJobFalse,
} = require("../controllers/resumeCTRL/SearchJobCTRL");


router.post('/project', addProject);
router.get('/project', getProjects);
router.put('/project/:id', updateProject);
router.delete('/project/:id', deleteProject);

router.post('/experience', addWorkExperience);
router.get('/experience', getWorkExperience);
router.put('/experience/:id', updateWorkExperience);
router.delete('/experience/:id', deleteWorkExperience);


router.post('/education', addEducationExperience);
router.get('/education', getEducationExperience);
router.put('/education/:id', updateEducationExperience);
router.delete('/education/:id', deleteEducationExperience);

router.post('/certificates', addCertificate);
router.get('/certificates', getCertificates);
router.put('/certificates/:id', updateCertificate);
router.delete('/certificates/:id', deleteCertificate);

router.post('/awards', addAward);
router.get('/awards', getAwards);
router.put('/awards/:id', updateAward);
router.delete('/awards/:id', deleteAward);


router.post('/cv', addAndUpdateCvFile);
router.get('/cv', getCvFile);
router.delete('/cv', deleteCvFile);

router.post('/contact', addContact);
router.get('/contact', getContact);
router.delete('/contact', deleteContact);

router.post('/summary', addOrUpdateSummary);
router.post('/skills', addOrUpdateSkills);
router.post('/professions', addOrUpdateProfessions);


router.post('/languages', addLanguages);
router.get('/languages', getLanguages);
router.put('/languages/:id', updateLanguages);
router.delete('/languages/:id', deleteLanguages);


router.post('/industry', addIndustry);
router.get('/industry', getIndustries);
router.put('/industry/:id', updateIndustry);
router.delete('/industry/:id', deleteIndustry);

router.post("/expected-salary", addExpectedSalary);
router.get("/expected-salary", getExpectedSalary);
router.put("/expected-salary", updateExpectedSalary);
router.delete("/expected-salary", deleteExpectedSalary);


router.post("/search-job/true", setSearchJobTrue);
router.post("/search-job/false", setSearchJobFalse);

module.exports = router;
