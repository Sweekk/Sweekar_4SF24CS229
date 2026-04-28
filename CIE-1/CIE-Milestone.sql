CREATE TABLE IF NOT EXISTS Patient (
    patient_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL
);

CREATE TABLE Patient_phone (
    phone_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    phone_no   TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
);

CREATE TABLE IF NOT EXISTS Doctor (
    doctor_id             INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_name           TEXT NOT NULL,
    doctor_specialization TEXT
);

CREATE TABLE IF NOT EXISTS Appointment (
    appointment_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_date DATE NOT NULL,
    patient_id       INTEGER NOT NULL,
    doctor_id        INTEGER NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES Patient(patient_id),
    FOREIGN KEY (doctor_id)  REFERENCES Doctor(doctor_id)
);

CREATE TABLE Medicine (
    medicine_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine_name  TEXT NOT NULL,
    medicine_price DECIMAL(8,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS Diagnosis (
    diagnosis_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id)
);

CREATE TABLE Treatment (
    treatment_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    diagnosis_id  INTEGER NOT NULL,
    medicine_id   INTEGER NOT NULL,
    FOREIGN KEY (diagnosis_id) REFERENCES Diagnosis(diagnosis_id),
    FOREIGN KEY (medicine_id)  REFERENCES Medicine(medicine_id)
);

CREATE TABLE Prescription (
    prescription_id INTEGER NOT NULL,
    appointment_id  INTEGER NOT NULL,
    treatment_id    INTEGER NOT NULL,
    PRIMARY KEY (appointment_id, treatment_id, prescription_id),
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id),
    FOREIGN KEY (treatment_id)   REFERENCES Treatment(treatment_id)
);

CREATE TABLE Prescription_Med (
    prescription_id INTEGER NOT NULL,
    medicine_id     INTEGER NOT NULL,
    dosage          TEXT NOT NULL,
    duration        TEXT NOT NULL,
    FOREIGN KEY (medicine_id)     REFERENCES Medicine(medicine_id),
    FOREIGN KEY (prescription_id) REFERENCES Prescription(prescription_id)
);

CREATE TABLE Billing (
    bill_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_amount    DECIMAL(10,2) NOT NULL,
    appointment_id INTEGER NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id)
);

CREATE TABLE Payment (
    payment_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id        INTEGER NOT NULL,
    payment_status TEXT NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES Billing(bill_id)
);

CREATE TABLE Multi_Doctor (
    appointment_id INTEGER,
    doctor_id      INTEGER,
    contribution   TEXT,
    PRIMARY KEY (appointment_id, doctor_id),
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id),
    FOREIGN KEY (doctor_id)      REFERENCES Doctor(doctor_id)
);

INSERT INTO Patient (patient_name) VALUES ('Ravi'), ('Anita'), ('Kiran'), ('Sneha');

INSERT INTO Doctor (doctor_name, doctor_specialization)
VALUES ('Dr. Sharma', 'Cardiology'),
       ('Dr. Mehta', 'General');

INSERT INTO Medicine (medicine_name, medicine_price)
VALUES ('Paracetamol', 10),
       ('Antibiotic', 25);

INSERT INTO Appointment (appointment_date, patient_id, doctor_id)
VALUES 
('2026-04-28', 1, 1),
('2026-04-29', 2, 2),
('2026-04-29', 3, 1),
('2026-04-29', 4, 2);

INSERT INTO Multi_Doctor VALUES 
(1, 1, 'Primary'),
(1, 2, 'Consulted'),
(2, 2, 'Primary'),
(3, 1, 'Primary'),
(4, 2, 'Primary');

INSERT INTO Diagnosis (appointment_id) VALUES (1), (2), (3), (4);

INSERT INTO Treatment (diagnosis_id, medicine_id) VALUES
(1, 1),
(2, 2),
(3, 1),
(4, 2);

INSERT INTO Prescription VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 3),
(4, 4, 4);

INSERT INTO Prescription_Med VALUES
(1, 1, '2 times/day', '5 days'),
(2, 2, '1 time/day', '7 days'),
(3, 1, '2 times/day', '3 days'),
(4, 2, '1 time/day', '5 days');

INSERT INTO Billing (bill_amount, appointment_id) VALUES
(200, 1),
(300, 2),
(400, 3),
(250, 4);

INSERT INTO Payment (bill_id, payment_status) VALUES
(1, 'pending'),
(2, 'paid'),
(3, 'pending'),
(4, 'pending');

SELECT 
    p.patient_name,
    a.appointment_id,
    a.appointment_date,
    d.doctor_name,
    diag.diagnosis_id,
    m.medicine_name,
    pm.dosage,
    pm.duration
FROM Patient p
JOIN Appointment a         ON p.patient_id = a.patient_id
JOIN Multi_Doctor ad       ON a.appointment_id = ad.appointment_id
JOIN Doctor d              ON ad.doctor_id = d.doctor_id
LEFT JOIN Diagnosis diag   ON a.appointment_id = diag.appointment_id
LEFT JOIN Treatment t      ON diag.diagnosis_id = t.diagnosis_id
LEFT JOIN Prescription pr  ON t.treatment_id = pr.treatment_id 
                           AND a.appointment_id = pr.appointment_id
LEFT JOIN Prescription_Med pm ON pr.prescription_id = pm.prescription_id
LEFT JOIN Medicine m       ON pm.medicine_id = m.medicine_id
WHERE p.patient_id = 1;

SELECT 
    d.doctor_name,
    COUNT(ad.appointment_id) AS total_consultations
FROM Doctor d
JOIN Multi_Doctor ad ON d.doctor_id = ad.doctor_id
GROUP BY d.doctor_id
ORDER BY total_consultations DESC
LIMIT 1;

SELECT 
    p.patient_name,
    SUM(b.bill_amount) AS total_outstanding
FROM Patient p
JOIN Appointment a ON p.patient_id = a.patient_id
JOIN Billing b     ON a.appointment_id = b.appointment_id
JOIN Payment pay   ON b.bill_id = pay.bill_id
WHERE LOWER(pay.payment_status) = 'pending'
GROUP BY p.patient_id;

