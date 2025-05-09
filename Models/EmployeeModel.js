// Models/EmployeeModel.js
class EmployeeModel {
  static async getAllEmployees(db) {
    const query = `SELECT * FROM public."User"`;
    const result = await db.query(query);
    console.log(result.rows);
    return result.rows;
  }

  static async getEmployeeById(db, employeeId) {
    const query = `SELECT * FROM employee WHERE id = $1`;
    const result = await db.query(query, [employeeId]);
    return result.rows[0];
  }

  static async searchEmployee(db, searchTerm) {
    const likeTerm = `%${searchTerm}%`;
    const query = `
      SELECT * FROM employee
      WHERE name LIKE $1 OR surname LIKE $2 OR email LIKE $3 OR phone LIKE $4
    `;
    const result = await db.query(query, [likeTerm, likeTerm, likeTerm, likeTerm]);
    return result.rows;
  }

  static async createNewEmployee(db, data) {
    const query = `
      INSERT INTO employee (name, surname, email, phone, role)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `;
    const result = await db.query(query, [
      data.name,
      data.surname,
      data.email,
      data.phone,
      data.role,
    ]);
    return result.rows[0].id;
  }

  static async updateEmployeeData(db, data) {
    const query = `
      UPDATE employee
      SET name = $1, surname = $2, email = $3, phone = $4, role = $5
      WHERE id = $6
    `;
    await db.query(query, [
      data.name,
      data.surname,
      data.email,
      data.phone,
      data.role,
      data.id,
    ]);
  }

  static async deleteEmployee(db, employeeId) {
    const query = `DELETE FROM employee WHERE id = $1`;
    await db.query(query, [employeeId]);
  }
}

module.exports = EmployeeModel;
