// swaggerConfig.js
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { MessagesEndpoint } = require('../swaggerDocs/messagesDocs');
const { UserAvatarEndpoint } = require('../swaggerDocs/userAvatardocs');
const { ProfileEndpoint } = require('../swaggerDocs/profileDocs');
const { JobsEndpoint } = require('../swaggerDocs/jobsDocs');
const { QuickjobsEndpoint } = require('../swaggerDocs/quickjobsDocs');
const { UpdateUser } = require('../swaggerDocs/UpdateUser');
const { FavoriteUser } = require('../swaggerDocs/favoriteUser');
const { UsersEndpoint } = require('../swaggerDocs/userDocs');
const { JobSeekersEndpoint } = require('../swaggerDocs/jobsSeekersDocs');
const { EmployersEndpoint } = require('../swaggerDocs/employersDocs');
const { UserDocResponseSchema, userDocSchema } = require('../swaggerDocs/userResponse');
const { AuthEndpoints } = require('../swaggerDocs/authDocs');
const { AllRoutesSchemas } = require('../swaggerDocs/AllRoutesSchemas');
const { workExperienceEndpoint } = require('../swaggerDocs/workExperienceDocs');
const { educationEndpoint } = require('../swaggerDocs/educationDocs');
const { projectEndpoint } = require('../swaggerDocs/projectsDocs');
const { AwardsEndpoints } = require('../swaggerDocs/awardsDocs');
const { certificatesEndpoint } = require('../swaggerDocs/certificatesDocs');
const { contactEndpoint } = require('../swaggerDocs/ContactDocs');
const { summaryEndpoint } = require('../swaggerDocs/SummaryDocs');
const { languagesEndpoint } = require('../swaggerDocs/languageDocs');
const { skillsEndpoint } = require('../swaggerDocs/skillsDocs');
const { professionsEndpoint } = require('../swaggerDocs/professionsDocs');
const { cvFileEndpoints } = require('../swaggerDocs/cvFileDocs');
const { statisticsEndpoint } = require('../swaggerDocs/statisticsDocs');
const { galleryEndpoint } = require('../swaggerDocs/galleryDocs');
const { BannerEndpoint } = require('../swaggerDocs/bannerDocs');
const { OfficesEndpoint } = require('../swaggerDocs/officesDocs');
const { AdminEndpoint } = require('../swaggerDocs/AdminDocs');
const { CompanyEndpoint } = require('../swaggerDocs/companyDocs');
const { reportUserEndPoint } = require('../swaggerDocs/reportUserDocs');
const { tournamentsEndpoint } = require('../swaggerDocs/tournamentsDocs');


const SecuritySchemes = {
    cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token'  // name of the cookie
    }
};

// const URL = `http://localhost:5001/api/v1/`;

const URL = process.env.SWAGGERT_URL

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Library API",
            version: "1.0.0",
            description: "A simple Express Library API",
        },
        servers: [
            {
                url: URL,
                description: 'Development server',
            },
        ],
        tags: [AuthEndpoints.tags, UsersEndpoint.tags],
        components: {
            schemas: {
                ...userDocSchema.schemas,
                ...UserDocResponseSchema,
                ...AllRoutesSchemas.components.schemas
            },
        },
        securitySchemes: {
            ...SecuritySchemes // Include your security schemes here
        },
        paths: {
            ...AuthEndpoints,
            ...UsersEndpoint,
            ...JobSeekersEndpoint,
            ...EmployersEndpoint,
            ...UpdateUser,
            ...FavoriteUser,
            ...JobsEndpoint,
            ...ProfileEndpoint,
            ...UserAvatarEndpoint,
            ...MessagesEndpoint,
            ...workExperienceEndpoint,
            ...educationEndpoint,
            ...projectEndpoint,
            ...AwardsEndpoints,
            ...certificatesEndpoint,
            ...contactEndpoint,
            ...summaryEndpoint,
            ...languagesEndpoint,
            ...skillsEndpoint,
            ...cvFileEndpoints,
            ...QuickjobsEndpoint,
            ...statisticsEndpoint,
            ...galleryEndpoint,
            ...BannerEndpoint,
            ...professionsEndpoint,
            ...OfficesEndpoint,
            ...AdminEndpoint,
            ...CompanyEndpoint,
            ...reportUserEndPoint,
            ...tournamentsEndpoint
        },
    },
    apis: ["./routes/*.js"],
};

// Setup Swagger
const swaggerSpecs = swaggerJsDoc(swaggerOptions);

const setupSwagger = (app) => {
    const options = {
        explorer: false,
        swaggerOptions: {
            docExpansion: 'none' // This will collapse all sections by default
        }
    };
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs, options));
    // console.log('Swagger is setup and running');
};

module.exports = setupSwagger;