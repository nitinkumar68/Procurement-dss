const express = require('express');
const router = express.Router();
const { createAssessment } = require('../controllers/assessmentController');
const { validateBody } = require('../middleware/validate');
const { assessmentSchema } = require('../schemas/assessmentSchema');

router.post('/', validateBody(assessmentSchema), createAssessment);

module.exports = router;