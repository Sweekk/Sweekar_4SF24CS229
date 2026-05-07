const { run, get, all } = require('../config/database');

class UserModel {
  static create({ name, email, password, role }) {
    const id = run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return id;
  }

  static findByEmail(email) {
    return get('SELECT * FROM users WHERE email = ?', [email]);
  }

  static findById(id) {
    return get(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
  }

  static findAllPatients() {
    return all(
      "SELECT id, name, email, role, created_at FROM users WHERE role = 'patient'"
    );
  }
}

module.exports = UserModel;
