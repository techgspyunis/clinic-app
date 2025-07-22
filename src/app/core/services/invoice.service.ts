// src/app/core/services/invoice.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Invoice,
  InvoiceDetail,
  CreateInvoicePayload,
  CreateInvoiceResponse,
  GenericApiResponse,
} from '../models/invoice.model'; // ⭐ Importar los modelos de Invoice

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private apiUrl = 'https://clinic-express.onrender.com/invoices'; // ⭐ Base URL para Invoices

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las facturas.
   * GET /invoices
   */
  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  /**
   * Obtiene los detalles de una factura específica.
   * GET /invoices/{invoice_id}/details
   */
  getInvoiceDetails(invoiceId: string): Observable<InvoiceDetail[]> {
    return this.http.get<InvoiceDetail[]>(`${this.apiUrl}/${invoiceId}/details`);
  }

  /**
   * Crea una nueva factura con sus detalles.
   * POST /invoices
   */
  createInvoice(payload: CreateInvoicePayload): Observable<CreateInvoiceResponse> {
    return this.http.post<CreateInvoiceResponse>(this.apiUrl, payload);
  }

  /**
   * Marca una factura y sus detalles como inactivos (eliminación lógica).
   * DELETE /invoices/{invoice_id}
   */
  deleteInvoice(invoiceId: string): Observable<GenericApiResponse> {
    return this.http.delete<GenericApiResponse>(`${this.apiUrl}/${invoiceId}`);
  }

  updateInvoicePaidStatus(invoiceId: string, isPayed: boolean): Observable<Invoice> { // ⭐ Cambiado a Observable<Invoice>
    return this.http.patch<Invoice>(`${this.apiUrl}/${invoiceId}/payment`, { is_payed: isPayed });
  }
  // ⭐ Si hubiera un endpoint para actualizar o un GET por ID, se añadirían aquí.
  // Por ejemplo:
  // getInvoiceById(invoiceId: string): Observable<Invoice> {
  //   return this.http.get<Invoice>(`${this.apiUrl}/${invoiceId}`);
  // }
}