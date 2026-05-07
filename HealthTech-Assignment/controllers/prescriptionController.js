const PrescriptionModel = require('../models/PrescriptionModel');
const UserModel         = require('../models/UserModel');

// POST /api/prescriptions  — Doctor only
function createPrescription(req, res) {
  try {
    const { patient_id, medicine, dosage, notes } = req.body;
    const doctor_id = req.user.id;

    const patient = UserModel.findById(patient_id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }
    if (patient.role !== 'patient') {
      return res.status(400).json({ success: false, message: 'The specified user is not a patient.' });
    }

    const newId      = PrescriptionModel.create({ doctor_id, patient_id, medicine, dosage, notes });
    const prescription = PrescriptionModel.findById(newId);

    return res.status(201).json({
      success: true,
      message: 'Prescription created successfully.',
      data: { prescription },
    });
  } catch (err) {
    console.error('CreatePrescription error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// PUT /api/prescriptions/:id  — Doctor only (own prescriptions)
function updatePrescription(req, res) {
  try {
    const prescriptionId = parseInt(req.params.id);
    if (isNaN(prescriptionId)) {
      return res.status(400).json({ success: false, message: 'Invalid prescription ID.' });
    }

    const existing = PrescriptionModel.findById(prescriptionId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }
    if (!PrescriptionModel.belongsToDoctor(prescriptionId, req.user.id)) {
      return res.status(403).json({ success: false, message: 'You can only update your own prescriptions.' });
    }

    const { medicine, dosage, notes } = req.body;
    PrescriptionModel.update(prescriptionId, { medicine, dosage, notes });

    return res.status(200).json({
      success: true,
      message: 'Prescription updated successfully.',
      data: { prescription: PrescriptionModel.findById(prescriptionId) },
    });
  } catch (err) {
    console.error('UpdatePrescription error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// GET /api/prescriptions  — role-filtered
function getPrescriptions(req, res) {
  try {
    const { id, role } = req.user;
    const prescriptions = role === 'doctor'
      ? PrescriptionModel.findByDoctorId(id)
      : PrescriptionModel.findByPatientId(id);

    return res.status(200).json({
      success: true,
      data: { prescriptions, count: prescriptions.length },
    });
  } catch (err) {
    console.error('GetPrescriptions error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// GET /api/prescriptions/:id  — role-filtered
function getPrescriptionById(req, res) {
  try {
    const prescriptionId = parseInt(req.params.id);
    if (isNaN(prescriptionId)) {
      return res.status(400).json({ success: false, message: 'Invalid prescription ID.' });
    }

    const prescription = PrescriptionModel.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    const { id: userId, role } = req.user;
    if (role === 'doctor'  && prescription.doctor_id  !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied. This prescription was not created by you.' });
    }
    if (role === 'patient' && prescription.patient_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied. This prescription is not assigned to you.' });
    }

    return res.status(200).json({ success: true, data: { prescription } });
  } catch (err) {
    console.error('GetPrescriptionById error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// GET /api/prescriptions/patients  — Doctor only
function getPatients(req, res) {
  try {
    const patients = UserModel.findAllPatients();
    return res.status(200).json({ success: true, data: { patients, count: patients.length } });
  } catch (err) {
    console.error('GetPatients error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = {
  createPrescription,
  updatePrescription,
  getPrescriptions,
  getPrescriptionById,
  getPatients,
};
