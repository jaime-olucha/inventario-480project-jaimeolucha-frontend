import type { EntityId } from "@/domain/value-objects/EntityId";


export interface Contact {
  id: EntityId;
  fullName: string;
  phone?: string;
  email: string;
  isMain: boolean;
  note?: string;
}

export interface CreateContactRequest extends Omit<Contact, 'id'> { }