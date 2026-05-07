const { body, validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role').isIn(['doctor', 'patient']).withMessage("Role must be 'doctor' or 'patient'."),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const prescriptionCreateRules = [
  body('patient_id').isInt({ gt: 0 }).withMessage('Valid patient_id is required.'),
  body('medicine').trim().notEmpty().withMessage('Medicine is required.'),
  body('dosage').trim().notEmpty().withMessage('Dosage is required.'),
  body('notes').optional().trim(),
];

const prescriptionUpdateRules = [
  body('medicine').optional().trim().notEmpty().withMessage('Medicine cannot be empty.'),
  body('dosage').optional().trim().notEmpty().withMessage('Dosage cannot be empty.'),
  body('notes').optional().trim(),
];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  prescriptionCreateRules,
  prescriptionUpdateRules,
};
