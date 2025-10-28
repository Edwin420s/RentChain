const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.details[0].message 
      });
    }
    next();
  };
};

const paymentSchema = Joi.object({
  phoneNumber: Joi.string().required(),
  amount: Joi.number().positive().required(),
  propertyId: Joi.number().integer().positive().required(),
  tenantAddress: Joi.string().required()
});

const searchSchema = Joi.object({
  q: Joi.string().min(1).required(),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

module.exports = {
  validateRequest,
  paymentSchema,
  searchSchema
};const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.details[0].message 
      });
    }
    next();
  };
};

const paymentSchema = Joi.object({
  phoneNumber: Joi.string().required(),
  amount: Joi.number().positive().required(),
  propertyId: Joi.number().integer().positive().required(),
  tenantAddress: Joi.string().required()
});

const searchSchema = Joi.object({
  q: Joi.string().min(1).required(),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

module.exports = {
  validateRequest,
  paymentSchema,
  searchSchema
};