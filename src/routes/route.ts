import express from 'express';

import { AddContact, CreateContact, DeleteContact, DeleteRelative, GetContact, GetContacts, UpdateContact } from '../controllers/contact';

const router = express.Router();

router.put('/contact/:id', UpdateContact);
router.post('/contact', CreateContact);
router.get('/contact/:id', GetContact);
router.delete('/contact/:contactId/relative/:relativeId', DeleteRelative);
router.post('/contact/:id', AddContact);
router.get('/contact', GetContacts);
router.delete('/contact/:id', DeleteContact);


export default router;