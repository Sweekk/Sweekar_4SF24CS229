const express = require('express');
const router  = express.Router();

const {
  createPrescription, updatePrescription,
  getPrescriptions,   getPrescriptionById, getPatients,
} = require('../controllers/prescriptionController');

const { authenticate, authorize } = require('../middleware/auth');
const {
  prescriptionCreateRules, prescriptionUpdateRules, handleValidation,
} = require('../middleware/validation');

// All routes require a valid JWT
router.use(authenticate);

router.get('/patients',  authorize('doctor'), getPatients);
router.get('/',          getPrescriptions);
router.get('/:id',       getPrescriptionById);
router.post('/',         authorize('doctor'), prescriptionCreateRules, handleValidation, createPrescription);
router.put('/:id',       authorize('doctor'), prescriptionUpdateRules, handleValidation, updatePrescription);

module.exports = router;
