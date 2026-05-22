import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Contact, CreateContactRequest } from "@/domain/models/Client/Contact";
import type { ContactDTO } from "@/infrastructure/dtos/Client/ContactDTO";
import { httpClient } from "../http/httpClient";
import { API_ENDPOINTS } from "../http/types/endpoints";
import { HttpMethod } from "../http/types/HttpMethods";
import type { ContactRepository } from "@/domain/repositories/ContactRepository";
import { mapContact, mapContactRequest } from "../mappers/mapClient";
import { v7 as uuidv7 } from "uuid";

export class ApiContactRepository implements ContactRepository {

  async getContacts(id: EntityId): Promise<Contact[]> {
    const response = await httpClient<ContactDTO[]>({
      method: HttpMethod.GET,
      path: API_ENDPOINTS.CLIENTS.CONTACTS(id),
    });
    return response.map(mapContact);
  }

  async createContact(id: EntityId, data: CreateContactRequest): Promise<EntityId> {
    const newId = uuidv7();
    const body: ContactDTO = { ...mapContactRequest(data), id: newId };
    await httpClient<void, ContactDTO>({
      method: HttpMethod.POST,
      path: API_ENDPOINTS.CLIENTS.CONTACTS(id),
      body,
    });
    return newId;
  }

  async updateContact(id: EntityId, data: Contact): Promise<void> {
    const body: ContactDTO = { ...mapContactRequest(data), id: data.id };
    await httpClient<void, ContactDTO>({
      method: HttpMethod.PUT,
      path: API_ENDPOINTS.CLIENTS.CONTACT_ID(id, data.id),
      body,
    });
  }

  async patchMainContact(id: EntityId, data: Contact): Promise<void> {
    await httpClient<void, { is_main: boolean }>({
      method: HttpMethod.PATCH,
      path: API_ENDPOINTS.CLIENTS.CONTACT_ID(id, data.id),
      body: { is_main: data.isMain },
    });
  }


  async deleteContact(id: EntityId, client_id: EntityId): Promise<void> {
    await httpClient<void>({
      method: HttpMethod.DELETE,
      path: API_ENDPOINTS.CLIENTS.CONTACT_ID(id, client_id)
    });
  }
}
