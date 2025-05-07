class CompanyModel {
  static GetCompanyByCompanyId(db, companyId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM public."Company" WHERE "company_id" = $1`;
      db.query(query, [companyId], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows[0]);
        }
      });
    });
  }
}

module.exports = CompanyModel;
