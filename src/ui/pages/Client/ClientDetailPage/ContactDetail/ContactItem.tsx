import { Edit2, Mail, Phone, StickyNote, Trash2, Users } from "lucide-react";
import { MenuOptions } from "@/ui/components/organisms/menuOptions/MenuOptions";
import type { Contact } from "@/domain/models/Client/Contact";
import type { EntityId } from "@/domain/value-objects/EntityId";

interface ContactItemProps {
  contact: Contact;
  isAdmin: boolean;
  loadingContact: boolean;
  activeNoteContactId: EntityId | null;
  onNoteClick: (event: React.MouseEvent<HTMLButtonElement>, contactId: EntityId) => void;
  onEditClick: (contact: Contact) => void;
  onDeleteClick: (contact: Contact) => void;
}

export const ContactItem = ({
  contact,
  isAdmin,
  loadingContact,
  activeNoteContactId,
  onNoteClick,
  onEditClick,
  onDeleteClick,
}: ContactItemProps) => (
  <li className="contact-item">
    <div className="contact-item_main">
      <div className="contact-field contact-name">
        <Users size={16} className="field-icon" />
        <span className="field-value">
          {contact.fullName}
          {contact.isMain && <span className="main-badge">Principal</span>}
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
          onClick={(event) => onNoteClick(event, contact.id)}
          disabled={!contact.note}
        >
          <StickyNote size={14} /> Ver nota
        </button>

        {activeNoteContactId === contact.id && contact.note && (
          <div className="note-bubble" onClick={(event) => event.stopPropagation()}>
            <div className="bubble-content">{contact.note}</div>
            <div className="bubble-arrow"></div>
          </div>
        )}
      </div>

      {isAdmin && (
        <MenuOptions
          disabled={loadingContact}
          items={[
            { label: "Editar", icon: <Edit2 size={14} />, onClick: () => onEditClick(contact) },
            { label: "Eliminar", icon: <Trash2 size={14} />, variant: "danger", onClick: () => onDeleteClick(contact) },
          ]}
        />
      )}
    </div>
  </li>
);
