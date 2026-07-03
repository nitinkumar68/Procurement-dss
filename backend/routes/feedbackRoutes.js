const express = require('express');
const router = express.Router();
const { createFeedback, getAllFeedback } = require('../controllers/feedbackController');
const { feedbackSchema } = require('../schemas/feedbackSchema');

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({ success: false, errors: err.errors });
  }
};

router.post('/', validate(feedbackSchema), createFeedback);
router.get('/', getAllFeedback);

module.exports = router;
