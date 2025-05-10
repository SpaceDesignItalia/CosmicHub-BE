// Models/EmployeeModel.js
const bcrypt = require("bcrypt");

class EmployeeModel {
  static getAllEmployees(db) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM public."User"`;
      db.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows);
        }
      });
    });
  }

  static getEmployeeById(db, employeeId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM employee WHERE id = $1`;
      db.query(query, [employeeId], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows[0]);
        }
      });
    });
  }

  static searchEmployee(db, searchTerm) {
    return new Promise((resolve, reject) => {
      const likeTerm = `%${searchTerm}%`;
      const query = `
        SELECT * FROM employee
        WHERE name LIKE $1 OR surname LIKE $2 OR email LIKE $3 OR phone LIKE $4
      `;
      db.query(
        query,
        [likeTerm, likeTerm, likeTerm, likeTerm],
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.rows);
          }
        }
      );
    });
  }

  static createNewEmployee(db, data) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO employee (name, surname, email, phone, role)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `;
      db.query(
        query,
        [data.name, data.surname, data.email, data.phone, data.role],
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.rows[0].id);
          }
        }
      );
    });
  }

  static updateEmployeeData(db, data) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE employee
        SET name = $1, surname = $2, email = $3, phone = $4, role = $5
        WHERE id = $6
      `;
      db.query(
        query,
        [data.name, data.surname, data.email, data.phone, data.role, data.id],
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  static deleteEmployee(db, employeeId) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM employee WHERE id = $1`;
      db.query(query, [employeeId], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  static async updateUserPassword(db, email, currentPassword, newPassword) {
    return new Promise((resolve, reject) => {
      const hashOldPassword = bcrypt.hashSync(currentPassword, 10);
      const searchUserQuery = `SELECT * FROM public."User" WHERE "email" = $1 AND "password" = $2`;

      db.query(searchUserQuery, [email, hashOldPassword], (error, result) => {
        if (error) {
          reject(error);
        } else if (result.rows.length === 0) {
          const hashNewPassword = bcrypt.hashSync(newPassword, 10);
          const updateUserPasswordQuery = `UPDATE public."User" SET "password" = $1 WHERE "email" = $2 AND "password" = $3`;
          db.query(
            updateUserPasswordQuery,
            [hashNewPassword, email, hashOldPassword],
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(true);
              }
            }
          );
        } else {
          resolve(false);
        }
      });
    });
  }
}

module.exports = EmployeeModel;
