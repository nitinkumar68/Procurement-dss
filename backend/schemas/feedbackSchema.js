const { z } = require('zod');

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comments: z.string().max(2000).optional().default(''),
  recommendedModel: z.string().optional().default(''),
});

module.exports = { feedbackSchema };
