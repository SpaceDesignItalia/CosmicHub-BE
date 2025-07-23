class CustomerModel {
  static GetAllCustomers(db, company_id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM public."Customer" WHERE "company_id" = $1`;
      db.query(query, [company_id], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows);
        }
      });
    });
  }

  static CreateCustomer(db, company_id, customer) {
    if (customer.referred_by == "") {
      customer.referred_by = null;
    }
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO public."Customer"(name, surname, phone, address, city, zip_code, country, company_name, vat_number, tax_code, notes, customer_type, referred_by, preferred_contact_method, company_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`;
      db.query(
        query,
        [
          customer.name,
          customer.surname,
          customer.phone,
          customer.address,
          customer.city,
          customer.zip_code,
          customer.country,
          customer.company_name,
          customer.vat_number,
          customer.tax_code,
          customer.notes,
          customer.customer_type,
          customer.referred_by,
          customer.preferred_contact_method,
          company_id,
        ],
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.rows[0]);
          }
        }
      );
    });
  }
}

module.exports = CustomerModel;
