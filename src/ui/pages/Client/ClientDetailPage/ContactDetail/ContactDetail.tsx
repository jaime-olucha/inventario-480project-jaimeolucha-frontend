import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, Edit2, Mail, Phone, StickyNote, Trash2, UserPlus, Users } from "lucide-react";
import { MenuOptions } from "@/ui/components/menuOptions/MenuOptions";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import type { Contact } from "@/domain/models/Client/Contact";
import type { EntityId } from "@/domain/value-objects/EntityId";
import { ConfirmModal } from "@/ui/components/molecules/confirmModal/ConfirmModal";
import { ActionButton } from "@/ui/components/molecules/actionButton/ActionButton";
import "@/ui/components/molecules/confirmModal/ConfirmModal.scss";
import "./ContactDetail.scss";

const contactSchema = z.object({
  fullName: z.string().min(1, "El nombre es obligatorio"),
  phone: z.string().optional(),
  email: z.string().min(1, "El email es obligatorio").email("Email no válido"),
  isActive: z.boolean(),
  isMain: z.boolean(),
  note: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

interface ContactDetailProps {
  clientId: EntityId;
  isAdmin: boolean;
  onToast: (message: string, type: "success" | "error") => void;
}

const EMPTY_CONTACT_FORM: ContactForm = {
  fullName: "",
  phone: "",
  email: "",
  isActive: true,
  isMain: false,
  note: "",
};

export const ContactDetail = ({ clientId, isAdmin, onToast }: ContactDetailProps) => {
  const { contact: contactRepo } = useRepositories();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [activeNoteContactId, setActiveNoteContactId] = useState<EntityId | null>(null);
  const [editingContactId, setEditingContactId] = useState<EntityId | null>(null);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [loadingContact, setLoadingContact] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [mainContactToReplace, setMainContactToReplace] = useState<{ data: ContactForm; id: EntityId | null } | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>({
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
    const aMain = a.isMain;
    const bMain = b.isMain;
    if (aMain && !bMain) return -1;
    if (!aMain && bMain) return 1;
    return 0;
  });

  const resetContactForm = () => {
    setEditingContactId(null);
    setIsContactFormOpen(false);
    reset(EMPTY_CONTACT_FORM);
  };

  const handleCreateContactClick = () => {
    setEditingContactId(null);
    reset(EMPTY_CONTACT_FORM);
    setActiveNoteContactId(null);
    setIsContactFormOpen(true);
  };

  const handleEditContactClick = (contact: Contact) => {
    setEditingContactId(contact.id);
    reset({
      fullName: contact.fullName,
      phone: contact.phone ?? "",
      email: contact.email,
      isActive: contact.isActive,
      isMain: contact.isMain,
      note: contact.note ?? "",
    });
    setActiveNoteContactId(null);
    setIsContactFormOpen(true);
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
      const currentMainContact = contacts.find((contact) => contact.isMain && contact.id !== editingContactId);

      if (contactData.isMain && currentMainContact && !replaceMainContact) {
        setMainContactToReplace({ data, id: editingContactId });
        return;
      }

      if (contactData.isMain && currentMainContact) {
        await contactRepo.updateContact(clientId, { ...currentMainContact, isMain: false });
      }

      if (editingContactId) {
        await contactRepo.updateContact(clientId, { id: editingContactId, ...contactData });
        onToast("Contacto actualizado correctamente", "success");
      } else {
        await contactRepo.createContact(clientId, contactData);
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

  const handleSaveContact = handleSubmit((data) => saveContact(data));

  const handleConfirmReplaceMainContact = async () => {
    if (!mainContactToReplace) return;
    await saveContact(mainContactToReplace.data, true);
  };

  const handleConfirmDeleteContact = async () => {
    if (!contactToDelete) return;
    setLoadingContact(true);

    try {
      await contactRepo.deleteContact(clientId, contactToDelete.id);
      setContacts((prev) => prev.filter((contact) => contact.id !== contactToDelete.id));
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
    setActiveNoteContactId((current) => current === contactId ? null : contactId);
  };

  return (
    <div className={`contact-detail ${isContactsOpen ? "is-open" : ""}`}>
      {mainContactToReplace && (
        <ConfirmModal
          title="Cambiar contacto principal"
          message={`Ya existe un contacto principal. Si continúas, se quitará como principal y este contacto pasará a ser el principal.`}
          confirmLabel="Continuar"
          loading={loadingContact}
          onConfirm={handleConfirmReplaceMainContact}
          onCancel={() => setMainContactToReplace(null)}
        />
      )}

      {contactToDelete && (
        <ConfirmModal
          title="Eliminar contacto"
          message={`¿Estás seguro de que deseas eliminar el contacto "${contactToDelete.fullName}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          loading={loadingContact}
          onConfirm={handleConfirmDeleteContact}
          onCancel={() => setContactToDelete(null)}
        />
      )}

      <button
        type="button"
        className="contacts-toggle"
        onClick={() => {
          setIsContactsOpen((value) => !value);
          setActiveNoteContactId(null);
        }}
        aria-expanded={isContactsOpen}
      >
        <div>
          <span className="contacts-toggle_title">Contactos</span>
          <span className="contacts-toggle_subtitle">
            {contacts.length > 0 ? `${contacts.length} contactos asociados` : "No hay contactos asociados"}
          </span>
        </div>
        <ChevronDown size={18} className="contacts-toggle_icon" />
      </button>

      <div className="contacts-panel_content">
        <div className="contacts-panel_inner">
          {isAdmin && (
            <ActionButton compact icon={<UserPlus size={16} />} onClick={handleCreateContactClick}>
              Nuevo contacto
            </ActionButton>
          )}

          {isAdmin && isContactFormOpen && (
            <form className="contact-form" onSubmit={handleSaveContact}>
              <div className="contact-form_grid">
                <div className="form-group">
                  <label htmlFor="contactFullName">Nombre</label>
                  <input id="contactFullName" className={`edit-input ${errors.fullName ? "edit-input--error" : ""}`} {...register("fullName")} />
                  {errors.fullName && <span className="field-error">{errors.fullName.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="contactPhone">Teléfono</label>
                  <input id="contactPhone" className="edit-input" {...register("phone")} />
                </div>
                <div className="form-group">
                  <label htmlFor="contactEmail">Email</label>
                  <input id="contactEmail" type="email" className={`edit-input ${errors.email ? "edit-input--error" : ""}`} {...register("email")} />
                  {errors.email && <span className="field-error">{errors.email.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contactNote">Nota</label>
                <textarea id="contactNote" className="edit-input contact-textarea" {...register("note")} />
              </div>

              <div className="contact-form_footer">
                <label className="contact-checkbox">
                  <input type="checkbox" {...register("isMain")} />
                  Contacto principal
                </label>

                <div className="contact-form_actions">
                  <button type="button" className="btn-cancel-contact" onClick={resetContactForm} disabled={loadingContact}>Cancelar</button>
                  <ActionButton type="submit" compact disabled={loadingContact}>{loadingContact ? "Guardando..." : editingContactId ? "Guardar cambios" : "Crear contacto"}</ActionButton>
                </div>
              </div>
            </form>
          )}

          {sortedContacts.length === 0 ? (
            <p className="empty-contacts">Todavía no hay contactos para este cliente.</p>
          ) : (
            <ul className="contacts-list">
              {sortedContacts.map((contact) => (
                <li key={contact.id} className="contact-item">
                  <div className="contact-item_main">
                    <div className="contact-field contact-name">
                      <Users size={16} className="field-icon" />
                      <span className="field-value">
                        {contact.fullName}
                        {contact.isMain && (
                          <span className="main-badge">Principal</span>
                        )}
                      </span>
                    </div>

                    <div className="contact-field">
                      <Phone size={16} className="field-icon" />
                      <span className="field-value">{contact.phone || "No disponible"}</span>
                    </div>

                    <div className="contact-field">
                      <Mail size={16} className="field-icon" />
                      <span className="field-value">{contact.email}</span>
                    </div>
                  </div>

                  <div className="contact-item_actions">
                    <div className="contact-note">
                      <button
                        className={`btn-note ${activeNoteContactId === contact.id ? "active" : ""}`}
                        onClick={(event) => handleNoteClick(event, contact.id)}
                        disabled={!contact.note}
                      >
                        <StickyNote size={14} /> Ver nota
                      </button>

                      {activeNoteContactId === contact.id && contact.note && (
                        <div className="note-bubble" onClick={(event) => event.stopPropagation()}>
                          <div className="bubble-content">
                            {contact.note}
                          </div>
                          <div className="bubble-arrow"></div>
                        </div>
                      )}
                    </div>

                    {isAdmin && (
                      <MenuOptions
                        disabled={loadingContact}
                        items={[
                          {
                            label: "Editar",
                            icon: <Edit2 size={14} />,
                            onClick: () => handleEditContactClick(contact),
                          },
                          {
                            label: "Eliminar",
                            icon: <Trash2 size={14} />,
                            variant: "danger",
                            onClick: () => setContactToDelete(contact),
                          },
                        ]}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};



