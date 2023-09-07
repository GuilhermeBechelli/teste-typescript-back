import { Request, Response } from "express";
import ContactRepository from "../repository/repository"
import { BaseContact, Contact, ContactRelative } from "../canonical/entities";

export const CreateContact = async (req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  let contact: Contact = req.body;
  ContactRepository.CreateContact(contact).then(contact => {
    res.json(contact);
  }).catch(err => {
    res.status(501).json({ 'error': err })
  })

};

export const AddContact = async (req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  let contact: ContactRelative = req.body;
  ContactRepository.CreateRelationships([contact], Number(req.params.id)).then(contacts => {
    res.json(contacts[0]);
  }).catch(err => {
    res.status(501).json({ 'error': err })
  })
};

export const DeleteContact = async (req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  ContactRepository.DeleteContact(Number(req.params.id)).then(() => {
    res.json();
  }).catch(err => {
    res.status(501).json({ 'error': err })
  })
};

export const UpdateContact = async (req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  let contact: BaseContact = req.body;
  ContactRepository.UpdateContact(Number(req.params.id), contact).then(contact => {
    res.json(contact);
  }).catch(err => {
    res.status(501).json({ 'error': err })
  })
};


export const GetContacts = async (req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  ContactRepository.GetContacts(Number(req.query.limit), Number(req.query.offset), req.query.name? String(req.query.name).trim() : undefined).then(contacts => {
    res.json(contacts);
  }).catch(err => {
    res.status(501).json({ 'error': err })
  })
};

export const GetContact = async (req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  ContactRepository.GetContact(Number(req.params.id)).then(contact => {
    res.json(contact);
  }).catch(err => {
    res.status(501).json({ 'error': err })
  })
};

export const DeleteRelative = async (req: Request, res: Response) => {
   res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  ContactRepository.DeleteRelative(Number(req.params.contactId), Number(req.params.relativeId)).then(() => {
    res.status(200).json();
  }).catch(err => {
    res.status(501).json({ 'error': err })
  })
};