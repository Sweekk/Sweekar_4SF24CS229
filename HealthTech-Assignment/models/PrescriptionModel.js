const { run, get, all } = require('../config/database');

class PrescriptionModel {
  static create({ doctor_id, patient_id, medicine, dosage, notes }) {
    const id = run(
      `INSERT INTO prescriptions (doctor_id, patient_id, medicine, dosage, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [doctor_id, patient_id, medicine, dosage, notes || null]
    );
    return id;
  }

  static findById(id) {
    return get(
      `SELECT p.*,
         d.name  AS doctor_name,  d.email AS doctor_email,
         pa.name AS patient_name, pa.email AS patient_email
       FROM prescriptions p
       JOIN users d  ON p.doctor_id  = d.id
       JOIN users pa ON p.patient_id = pa.id
       WHERE p.id = ?`,
      [id]
    );
  }

  static findByDoctorId(doctor_id) {
    return all(
      `SELECT p.*,
         pa.name AS patient_name, pa.email AS patient_email
       FROM prescriptions p
       JOIN users pa ON p.patient_id = pa.id
       WHERE p.doctor_id = ?
       ORDER BY p.created_at DESC`,
      [doctor_id]
    );
  }

  static findByPatientId(patient_id) {
    return all(
      `SELECT p.*,
         d.name AS doctor_name, d.email AS doctor_email
       FROM prescriptions p
       JOIN users d ON p.doctor_id = d.id
       WHERE p.patient_id = ?
       ORDER BY p.created_at DESC`,
      [patient_id]
    );
  }

  static update(id, { medicine, dosage, notes }) {
    const fields = [];
    const values = [];

    if (medicine !== undefined) { fields.push('medicine = ?'); values.push(medicine); }
    if (dosage   !== undefined) { fields.push('dosage = ?');   values.push(dosage); }
    if (notes    !== undefined) { fields.push('notes = ?');    values.push(notes); }
    if (fields.length === 0) return null;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    return run(`UPDATE prescriptions SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  static belongsToDoctor(prescriptionId, doctorId) {
    return !!get(
      'SELECT id FROM prescriptions WHERE id = ? AND doctor_id = ?',
      [prescriptionId, doctorId]
    );
  }
}

module.exports = PrescriptionModel;
