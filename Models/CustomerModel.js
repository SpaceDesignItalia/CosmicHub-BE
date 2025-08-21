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

  static GetAllEvents(db, company_id) {
    return new Promise((resolve, reject) => {
      // Prima query per ottenere tutti gli eventi con customer e technician info
      const query = `
        SELECT 
          e.event_id,
          e.title,
          e.start_date,
          e.end_date,
          e.start_time,
          e.end_time,
          e.description,
          e.location,
          e.event_type,
          e.priority,
          e.notes,
          c.customer_id,
          c.name as customer_name,
          c.phone as customer_phone,
          c.company_name as customer_company,
          c.customer_type,
          c.address as customer_address,
          u.user_id as technician_id,
          u.name as technician_name,
          r.name as technician_role
        FROM public."Event" e
        LEFT JOIN public."Customer" c ON e.customer_id = c.customer_id
        LEFT JOIN public."User" u ON e.assigned_technician = u.user_id
        LEFT JOIN public."Role_User" ru ON u.user_id = ru.user_id
        LEFT JOIN public."Role" r ON ru.role_id = r.role_id
        WHERE e.company_id = $1
        ORDER BY e.start_date, e.start_time
      `;

      db.query(query, [company_id], async (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          // Per ogni evento, ottieni i partecipanti
          const eventsWithParticipants = await Promise.all(
            result.rows.map(async (eventRow) => {
              // Query per ottenere i partecipanti dell'evento
              const participantsQuery = `
                SELECT 
                  partecipant_id,
                  email,
                  role
                FROM public."Event_Partecipant"
                WHERE event_id = $1
              `;

              return new Promise((resolveParticipant, rejectParticipant) => {
                db.query(
                  participantsQuery,
                  [eventRow.event_id],
                  (participantError, participantResult) => {
                    if (participantError) {
                      rejectParticipant(participantError);
                      return;
                    }

                    // Struttura i dati secondo l'interfaccia richiesta
                    const calendarEvent = {
                      EventId: eventRow.event_id,
                      EventTitle: eventRow.title,
                      EventStartDate: eventRow.start_date,
                      EventEndDate: eventRow.end_date,
                      EventStartTime: eventRow.start_time,
                      EventEndTime: eventRow.end_time,
                      EventColor: "#3788d8", // Colore di default
                      EventDescription: eventRow.description || "",
                      EventLocation: eventRow.location || "",
                      EventTagName: eventRow.event_type || "appointment",
                      EventType: eventRow.event_type || "appointment",
                      EventPriority: eventRow.priority || "medium",
                      EventPartecipants: participantResult.rows.map((p) => ({
                        EventPartecipantId: p.partecipant_id,
                        EventPartecipantEmail: p.email,
                        EventPartecipantRole: p.role,
                        EventPartecipantStatus: p.status || "confirmed",
                      })),
                      CustomerInfo: {
                        customer_id: eventRow.customer_id,
                        customer_name:
                          eventRow.customer_name ||
                          eventRow.customer_company ||
                          "N/A",
                        customer_phone: eventRow.customer_phone || "",
                        customer_email: "", // Non presente nella tabella Customer
                        customer_address: eventRow.customer_address || "",
                        customer_type: eventRow.customer_type || "private",
                      },
                      TechnicianAssignment: eventRow.technician_id
                        ? {
                            technician_id: eventRow.technician_id,
                            technician_name: eventRow.technician_name || "",
                            role: eventRow.technician_role || "",
                            availability_status:
                              eventRow.availability_status || "available",
                          }
                        : undefined,
                      InterventionNotes: eventRow.notes || "",
                    };

                    resolveParticipant(calendarEvent);
                  }
                );
              });
            })
          );

          resolve(eventsWithParticipants);
        } catch (asyncError) {
          reject(asyncError);
        }
      });
    });
  }
}

module.exports = CustomerModel;
