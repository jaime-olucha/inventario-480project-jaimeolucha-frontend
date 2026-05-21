import type { EntityId } from "../value-objects/EntityId";
import type { Contact, CreateContactRequest } from "../models/Client/Contact";

export interface ContactRepository {
  getContacts(id: EntityId): Promise<Contact[]>;
  createContact(id: EntityId, data: CreateContactRequest): Promise<EntityId>;
  updateContact(id: EntityId, data: Contact): Promise<void>;
  patchMainContact(id: EntityId, data: Contact): Promise<void>;
  deleteContact(id: EntityId, client_id: EntityId): Promise<void>;
}
