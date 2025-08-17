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

  static AddEvent(db, company_id, event) {
    console.log(event);
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO public."Event"(
        title, description, customer_id, event_type, priority, 
        assigned_technician, location, notes, start_date, end_date, 
        start_time, end_time, company_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`;

      db.query(
        query,
        [
          event.EventTitle,
          event.EventDescription,
          event.CustomerInfo.customer_id,
          event.EventType,
          event.EventPriority,
          event.TechnicianAssignment.technician_id,
          event.EventLocation,
          event.EventNotes,
          event.EventStartDate,
          event.EventEndDate,
          event.EventStartTime,
          event.EventEndTime,
          1,
        ],
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            const query2 = `INSERT INTO public."Event_Partecipant"(
              email, role, event_id
            ) VALUES ($1, $2, $3) RETURNING *`;
            console.log(
              event.EventPartecipants,
              event.EventPartecipants.length
            );

            // Se non ci sono partecipanti, risolvi immediatamente
            if (
              !event.EventPartecipants ||
              event.EventPartecipants.length === 0
            ) {
              resolve(result.rows[0]);
              return;
            }

            // Conta le query completate
            let completedQueries = 0;
            const totalQueries = event.EventPartecipants.length;

            for (const participant of event.EventPartecipants) {
              console.log(participant);
              db.query(
                query2,
                [
                  participant.EventPartecipantEmail,
                  participant.EventPartecipantRole,
                  result.rows[0].event_id,
                ],
                (error) => {
                  if (error) {
                    reject(error);
                    return;
                  }

                  completedQueries++;
                  // Risolvi solo quando tutte le query sono completate
                  if (completedQueries === totalQueries) {
                    resolve(result.rows[0]);
                  }
                }
              );
            }
          }
        }
      );
    });
  }
}

module.exports = CustomerModel;
