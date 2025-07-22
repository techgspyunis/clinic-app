// src/app/core/models/invoice.model.ts

export interface Invoice {
  invoice_id: string;
  date: string;
  description: string;
  is_active: boolean;
  is_payed: boolean; // ⭐ Nuevo campo
  upload_file: string;
  created_at: string;
  updated_at: string | null;
}

export interface InvoiceDetail {
  invoicedetail_id: string;
  invoice_id: string;
  demande: string;
  name_patient: string;
  date_prel: string;
  ref_patient: string;
  montant: number;
  unknow: string | null; // ⭐ Puede ser null
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

// Payload para crear un detalle de factura (desde Excel)
export interface InvoiceDetailPayload {
  demande: string;
  name_patient: string;
  date_prel: string;
  ref_patient: string;
  montant: number;
  unknow: string | null;
}

// Payload para crear una factura completa (incluyendo detalles)
export interface CreateInvoicePayload {
  date: string;
  description: string;
  is_payed: boolean;
  upload_file: string;
  details: InvoiceDetailPayload[];
}

// ⭐ Interfaces para la respuesta del backend
export interface CreateInvoiceResponse {
  message: string;
  invoice: { invoice_id: string };
  details: InvoiceDetail[];
}

export interface GenericApiResponse {
  message: string;
}