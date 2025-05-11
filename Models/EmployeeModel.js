// Models/EmployeeModel.js
const bcrypt = require("bcrypt");

class EmployeeModel {
  static getAllEmployees(db) {
    return new Promise((resolve, reject) => {
      const query = `SELECT "User"."user_id", CONCAT("User"."name", ' ', "User"."surname") AS "name", "Role"."name" as "role" FROM public."User" 
      INNER JOIN public."Role_User" USING (user_id)
      INNER JOIN public."Role" USING (role_id)`;
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

  static updateEmployeeData(db, data, email) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE public."User"
        SET name = $1, surname = $2, email = $3
        WHERE email = $4
        RETURNING user_id
      `;
      db.query(
        query,
        [data.name, data.surname, data.email, email],
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            const user_id = result.rows[0].user_id;
            console.log(user_id);
            const roleQuery = `
              UPDATE public."Role_User"
              SET role_id = $1
              WHERE user_id = $2
            `;
            db.query(roleQuery, [data.role, user_id], (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            });
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

  static async updateEmployeeVan(db, employeeId, vanId) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO public."Warehouse_User" (warehouse_id, user_id) VALUES ($1, $2)`;
      db.query(query, [vanId, employeeId], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  static async deleteEmployeeVan(db, employeeId) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM public."Warehouse_User" WHERE user_id = $1`;
      db.query(query, [employeeId], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}

module.exports = EmployeeModel;
