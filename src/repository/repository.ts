import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise"
import { Poll } from "./db";
import { BaseContact, Contact, ContactRelative, ContactReport } from "../canonical/entities";

interface IContactRepository {
    CreateContact(contact: Contact): Promise<Contact>;
    CreateRelationships(contacts: ContactRelative[], relativeId: number): Promise<ContactRelative[]>;
    GetContacts(limit: number, offset: number, name: string): Promise<ContactReport[]>;
    GetContact(id: number): Promise<Contact>;
    DeleteRelative(contactId: number, relativeId: number): Promise<void>
    DeleteContact(id: number) : Promise<void>
    UpdateContact(id: number, contact: BaseContact) : Promise<BaseContact>
}

class ContactRepository implements IContactRepository {
    DeleteRelative(contactId: number, relativeId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            Poll.getConnection().then(async conn => {
                conn.execute(`UPDATE ContactRelative SET Active = 0 WHERE ContactId = ? AND RelativeId = ?`, [contactId, relativeId]).then(() => {
                    resolve()
                }).catch((err) => reject(err))
            })
        })
    }

    DeleteContact(id: number) : Promise<void>  {
        return new Promise((resolve, reject) => {
            Poll.getConnection().then(async conn => {
                conn.execute(`UPDATE Contact SET Active = 0 WHERE Id = ?`, [id]).then(() => {
                    resolve()
                }).catch((err) => reject(err))
            })
        })
    }

    UpdateContact(id: number, contact: BaseContact) : Promise<BaseContact>  {
        return new Promise((resolve, reject) => {
            Poll.getConnection().then(async conn => {
                conn.execute(`UPDATE Contact SET Name = ?, Phone = ?, Email = ? WHERE Id = ?`, [contact.name, contact.phone, contact.email, id]).then(() => {
                    resolve(contact)
                }).catch((err) => reject(err))
            })
        })
    }

    GetContact(id: number): Promise<Contact> {
        return new Promise((resolve, reject) => {
            Poll.getConnection().then(async conn => {
                
                conn.query<RowDataPacket[]>(`SELECT * FROM Contact WHERE Id = ? AND Active = 1`, [id]).then((result) => {
                    const contact: Contact = {
                        id: result[0][0].Id,
                        name: result[0][0].Name,
                        email: result[0][0].Email,
                        phone: result[0][0].Phone
                    };

                    conn.query<RowDataPacket[]>(`SELECT C.Id, C.Name, C.Email, C.Phone, CR.Relationship 
                    FROM Contact C 
                    INNER JOIN ContactRelative CR ON C.Id = CR.RelativeId
                    WHERE CR.ContactId = ? AND C.Active = 1`, [id]).then((result) => {
                        const contactRelatives: ContactRelative[] = result[0].map((row: any) => ({
                            id: row.Id,
                            relationship: row.Relationship,
                            name: row.Name,
                            email: row.Email,
                            phone: row.Phone
                        }));

                        contact.contacts = contactRelatives
                        resolve(contact)
                    }).catch((err) => reject(err))

                }).catch((err) => reject(err))

            })
        });
    }

    GetContacts(limit: number, offset: number, name?: string): Promise<ContactReport[]> {
        return new Promise((resolve, reject) => {
            Poll.getConnection().then(async conn => {
               conn.query<RowDataPacket[]>(`SELECT C.Id, C.Name, C.Phone, C.Email, COUNT(CR.ContactId)-1 as Contacts 
                FROM Contact C
                INNER JOIN ContactRelative CR ON (CR.ContactId = C.Id OR CR.RelativeId = C.Id) AND CR.Active = 1
                WHERE ${name ? ` C.Name LIKE '${name}%' AND`: ""}
                C.Active = 1
                GROUP BY CR.ContactId, C.Id, C.Name, C.Email, C.Phone 
                LIMIT ${limit.toString()} OFFSET ${offset.toString()}`, []).then((result) => {
                    const contacts: ContactReport[] = result[0].map((row: any) => ({
                        id: row.Id,
                        contacts: row.Contacts,
                        name: row.Name,
                        email: row.Email,
                        phone: row.Phone
                    }));
                    resolve(contacts)

                }).catch((err) => reject(err))

            })
        });
    }

    CreateContact(contact: Contact): Promise<Contact> {
        return new Promise((resolve, reject) => {
            Poll.getConnection().then(async conn => {
                await conn.beginTransaction()
                conn.query<ResultSetHeader>(
                    "INSERT INTO Contact (name, phone, email) VALUES(?,?,?)",
                    [contact.name, contact.phone, contact.phone]
                ).then((result) => {
                    contact.id = result[0].insertId

                    if (contact.contacts && contact.contacts.length > 0) {
                        this.createRelationships(conn, contact.contacts, contact.id).then(() => {
                            conn.commit().then(() => {
                                resolve(contact)
                                conn.release()
                            })
                        }).catch((err) => {
                            conn.rollback().then(() => {
                                reject(err)
                                conn.release()
                            })
                        })
                        return
                    }
                    conn.commit().then(() => {
                        resolve(contact)
                        conn.release()
                    })
                }).catch(err => {
                    conn.rollback().then(() => {
                        reject(err)
                        conn.release()
                    })
                })
            })
        });
    }

    CreateRelationships(contacts: ContactRelative[], relativeId: number): Promise<ContactRelative[]> {
        return new Promise((resolve, reject) => {
            Poll.getConnection().then(async conn => {
                await conn.beginTransaction()
                this.createRelationships(conn, contacts, relativeId).then(() => {
                    conn.commit().then(() => {
                        resolve(contacts)
                        conn.release()
                    })
                }).catch((err) => {
                    conn.rollback().then(() => {
                        reject(contacts)
                        conn.release()
                    })
                })
            })
        })
    }

    createRelationships(conn: PoolConnection, contacts: ContactRelative[], relativeId: number): Promise<ContactRelative[]> {
        return new Promise(async (resolve, reject) => {
            try {
                var values: (string | number)[][] = [];
                let promises: Promise<any>[] = [];
                contacts.forEach((contactRelative, index) => {
                    promises.push(conn.query<ResultSetHeader>("INSERT INTO Contact (Name, Phone, Email) VALUES (?, ?, ?)", [contactRelative.name, contactRelative.phone, contactRelative.email]).then(result => {
                        values.push([relativeId, result[0].insertId, contactRelative.relationship])
                        contacts[index].id = result[0].insertId
                    }))
                })
                await Promise.all(promises);
                const sql = `INSERT INTO ContactRelative (ContactId, RelativeId, Relationship) VALUES ?;`

                conn.query(sql, [values]).then(() => {
                    resolve(contacts)
                })
            } catch (err) {
                reject(err)
            }
        })
    }
}
export default new ContactRepository();