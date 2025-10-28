const Joi = require('joi');

const ethereumAddress = Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/);
const phoneNumber = Joi.string().pattern(/^\+?[1-9]\d{1,14}$/); // E.164 format

const propertySchema = Joi.object({
  property_id: Joi.number().integer().positive().required(),
  landlord: ethereumAddress.required(),
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
  location: Joi.string().min(1).max(255).required(),
  price: Joi.number().positive().required(),
  image_urls: Joi.array().items(Joi.string().uri()).optional(),
  status: Joi.string().valid('active', 'inactive', 'rented').default('active')
});

const paymentSchema = Joi.object({
  phoneNumber: phoneNumber.required(),
  amount: Joi.number().positive().required(),
  propertyId: Joi.number().integer().positive().required(),
  tenantAddress: ethereumAddress.required()
});

const agreementSchema = Joi.object({
  agreement_id: Joi.number().integer().positive().required(),
  tenant: ethereumAddress.required(),
  landlord: ethereumAddress.required(),
  property_id: Joi.number().integer().positive().required(),
  start_date: Joi.number().integer().positive().required(),
  end_date: Joi.number().integer().positive().required(),
  rent_amount: Joi.number().positive().required(),
  status: Joi.string().valid('active', 'completed', 'cancelled').default('active')
});

const notificationSchema = Joi.object({
  user_address: ethereumAddress.required(),
  title: Joi.string().min(1).max(255).required(),
  message: Joi.string().min(1).required(),
  type: Joi.string().valid('info', 'success', 'warning', 'error').default('info')
});

const validate = (schema) => {
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

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  };
};

module.exports = {
  propertySchema,
  paymentSchema,
  agreementSchema,
  notificationSchema,
  validate,
  validateParams,
  validateQuery,
  ethereumAddress,
  phoneNumber
};