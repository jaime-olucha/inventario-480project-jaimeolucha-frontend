import { useEffect, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { useModal } from "@/ui/hooks/useModal";
import { contactSchema, EMPTY_CONTACT_FORM, type ContactForm } from "./contactSchema";
import type { Contact } from "@/domain/models/Client/Contact";
import type { EntityId } from "@/domain/value-objects/EntityId";

export interface UseContactDetailReturn {
  contacts: Contact[];
  sortedContacts: Contact[];
  loadingContact: boolean;
  activeNoteContactId: EntityId | null;
  editingContactId: EntityId | null;
  contactToDelete: Contact | null;
  mainContactToReplace: { data: ContactForm; id: EntityId | null } | null;
  isContactsOpen: boolean;
  isContactFormOpen: boolean;
  form: UseFormReturn<ContactForm>;
  handleToggleContacts: () => void;
  handleCreateContactClick: () => void;
  handleEditContactClick: (contact: Contact) => void;
  handleSaveContact: (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleConfirmReplaceMainContact: () => Promise<void>;
  handleConfirmDeleteContact: () => Promise<void>;
  handleNoteClick: (event: React.MouseEvent<HTMLButtonElement>, contactId: EntityId) => void;
  setContactToDelete: (contact: Contact | null) => void;
  setMainContactToReplace: (val: { data: ContactForm; id: EntityId | null } | null) => void;
  resetContactForm: () => void;
}

interface UseContactDetailProps {
  clientId: EntityId;
  onToast: (message: string, type: "success" | "error") => void;
}

export const useContactDetail = ({ clientId, onToast }: UseContactDetailProps): UseContactDetailReturn => {
  const { contact: contactRepo } = useRepositories();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeNoteContactId, setActiveNoteContactId] = useState<EntityId | null>(null);
  const [editingContactId, setEditingContactId] = useState<EntityId | null>(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [mainContactToReplace, setMainContactToReplace] = useState<{ data: ContactForm; id: EntityId | null } | null>(null);

  const { isOpen: isContactsOpen, toggle: toggleContacts } = useModal();
  const { isOpen: isContactFormOpen, open: openContactForm, close: closeContactForm } = useModal();

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: EMPTY_CONTACT_FORM,
  });

  useEffect(() => {
    contactRepo.getContacts(clientId).then(setContacts);
  }, [clientId, contactRepo]);

  useEffect(() => {
    if (!activeNoteContactId) return;
    const handleClickOutside = () => setActiveNoteContactId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeNoteContactId]);

  const sortedContacts = [...contacts].sort((a, b) => {
    if (a.isMain && !b.isMain) return -1;
    if (!a.isMain && b.isMain) return 1;
    return 0;
  });

  const resetContactForm = () => {
    setEditingContactId(null);
    closeContactForm();
    form.reset(EMPTY_CONTACT_FORM);
  };

  const handleToggleContacts = () => {
    toggleContacts();
    setActiveNoteContactId(null);
  };

  const handleCreateContactClick = () => {
    setEditingContactId(null);
    form.reset(EMPTY_CONTACT_FORM);
    setActiveNoteContactId(null);
    openContactForm();
  };

  const handleEditContactClick = (contact: Contact) => {
    setEditingContactId(contact.id);
    form.reset({
      fullName: contact.fullName,
      phone: contact.phone ?? "",
      email: contact.email,
      isMain: contact.isMain,
      note: contact.note ?? "",
    });
    setActiveNoteContactId(null);
    openContactForm();
  };

  const refreshContacts = async () => {
    const nextContacts = await contactRepo.getContacts(clientId);
    setContacts(nextContacts);
  };

  const saveContact = async (data: ContactForm, replaceMainContact = false) => {
    setLoadingContact(true);

    const contactData = {
      ...data,
      phone: data.phone || undefined,
      note: data.note ?? "",
    };

    try {
      const currentMainContact = contacts.find((c) => c.isMain && c.id !== editingContactId);

      if (contactData.isMain && currentMainContact && !replaceMainContact) {
        setMainContactToReplace({ data, id: editingContactId });
        return;
      }

      if (editingContactId) {
        if (contactData.isMain && currentMainContact) {
          await contactRepo.patchMainContact(clientId, { id: editingContactId, ...contactData });
        }
        await contactRepo.updateContact(clientId, { id: editingContactId, ...contactData });
        onToast("Contacto actualizado correctamente", "success");
      } else {
        const newId = await contactRepo.createContact(clientId, contactData);
        if (contactData.isMain) {
          await contactRepo.patchMainContact(clientId, { id: newId, ...contactData });
        }
        onToast("Contacto creado correctamente", "success");
      }

      await refreshContacts();
      resetContactForm();
      setMainContactToReplace(null);
    } catch (err) {
      onToast(getErrorMessage(err, "No se pudo guardar el contacto."), "error");
    } finally {
      setLoadingContact(false);
    }
  };

  const handleSaveContact = form.handleSubmit((data) => saveContact(data));

  const handleConfirmReplaceMainContact = async () => {
    if (!mainContactToReplace) return;
    await saveContact(mainContactToReplace.data, true);
  };

  const handleConfirmDeleteContact = async () => {
    if (!contactToDelete) return;
    setLoadingContact(true);
    try {
      await contactRepo.deleteContact(clientId, contactToDelete.id);
      setContacts((prev) => prev.filter((c) => c.id !== contactToDelete.id));
      onToast("Contacto eliminado correctamente", "success");
      if (editingContactId === contactToDelete.id) resetContactForm();
    } catch (err) {
      onToast(getErrorMessage(err, "No se pudo eliminar el contacto."), "error");
    } finally {
      setLoadingContact(false);
      setContactToDelete(null);
    }
  };

  const handleNoteClick = (event: React.MouseEvent<HTMLButtonElement>, contactId: EntityId) => {
    event.stopPropagation();
    setActiveNoteContactId((current) => (current === contactId ? null : contactId));
  };

  return {
    contacts,
    sortedContacts,
    loadingContact,
    activeNoteContactId,
    editingContactId,
    contactToDelete,
    mainContactToReplace,
    isContactsOpen,
    isContactFormOpen,
    form,
    handleToggleContacts,
    handleCreateContactClick,
    handleEditContactClick,
    handleSaveContact,
    handleConfirmReplaceMainContact,
    handleConfirmDeleteContact,
    handleNoteClick,
    setContactToDelete,
    setMainContactToReplace,
    resetContactForm,
  };
};
