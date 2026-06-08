const { z } = require('zod');

const assessmentSchema = z.object({
  supplierDensity: z.enum(['Single Vendor', 'Limited Tier', 'Broad Market Tier']),
  allocationTimeline: z.enum(['Urgent / Emergency Needs', 'Standard Processing Window', 'Long-Term Strategic Sourcing']),
  materialClassification: z.enum(['Commodity Goods', 'Highly Specialized / Proprietary Equipment']),
  projectCapitalAllocation: z.number().positive("Capital allocation must be a positive number"),
  pricingMatrixStatus: z.enum(['Fixed Initial List Price', 'Open / Fluctuating Market Spot Rate']),
});

module.exports = { assessmentSchema };