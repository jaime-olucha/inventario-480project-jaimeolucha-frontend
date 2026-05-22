import { ChevronDown, UserPlus } from "lucide-react";
import { ConfirmModal } from "@/ui/components/organisms/confirmModal/ConfirmModal";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";
import { ContactFormPanel } from "./ContactFormPanel";
import { ContactItem } from "./ContactItem";
import { useContactDetail } from "./useContactDetail";
import type { EntityId } from "@/domain/value-objects/EntityId";
import "@/ui/components/organisms/confirmModal/ConfirmModal.scss";
import "./ContactDetail.scss";

interface ContactDetailProps {
  clientId: EntityId;
  isAdmin: boolean;
  onToast: (message: string, type: "success" | "error") => void;
}

export const ContactDetail = ({ clientId, isAdmin, onToast }: ContactDetailProps) => {
  const {
    contacts, sortedContacts, loadingContact,
    activeNoteContactId, editingContactId,
    contactToDelete, mainContactToReplace,
    isContactsOpen, isContactFormOpen,
    form,
    handleToggleContacts, handleCreateContactClick, handleEditContactClick,
    handleSaveContact, handleConfirmReplaceMainContact, handleConfirmDeleteContact,
    handleNoteClick, setContactToDelete, setMainContactToReplace,
    resetContactForm,
  } = useContactDetail({ clientId, onToast });

  return (
    <div className={`contact-detail ${isContactsOpen ? "is-open" : ""}`}>
      {mainContactToReplace && (
        <ConfirmModal
          title="Cambiar contacto principal"
          message="Ya existe un contacto principal. Si continúas, se quitará como principal y este contacto pasará a ser el principal."
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
        onClick={handleToggleContacts}
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
            <ContactFormPanel
              form={form}
              editingContactId={editingContactId}
              loadingContact={loadingContact}
              onSave={handleSaveContact}
              onCancel={resetContactForm}
            />
          )}

          {sortedContacts.length === 0 ? (
            <p className="empty-contacts">Todavía no hay contactos para este cliente.</p>
          ) : (
            <ul className="contacts-list">
              {sortedContacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  isAdmin={isAdmin}
                  loadingContact={loadingContact}
                  activeNoteContactId={activeNoteContactId}
                  onNoteClick={handleNoteClick}
                  onEditClick={handleEditContactClick}
                  onDeleteClick={setContactToDelete}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
