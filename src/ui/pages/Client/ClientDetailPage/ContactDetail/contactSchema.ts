import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().min(1, "El nombre es obligatorio"),
  phone: z.string().optional(),
  email: z.string().min(1, "El email es obligatorio").email("Email no válido"),
  isMain: z.boolean(),
  note: z.string().optional(),
});

export type ContactForm = z.infer<typeof contactSchema>;

export const EMPTY_CONTACT_FORM: ContactForm = {
  fullName: "",
  phone: "",
  email: "",
  isMain: false,
  note: "",
};
