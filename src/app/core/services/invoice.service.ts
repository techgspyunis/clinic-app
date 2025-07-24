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
import {
  AdministrativeRecord, // ⭐ Importar la nueva interfaz
  AdministrativeResult, // ⭐ Importar la nueva interfaz
} from '../models/administrative.model';

export interface LabFileUploadResponse {
  message: string;
  processedFilesCount: number;
  totalErrors: number;
  skippedFiles: string[];
  processedRecords: Array<{
    administrativeId: string;
    labFileName: string;
    storageUrl: string;
  }>;
  errors: any[];
}

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private apiUrl = 'https://clinic-express.onrender.com/invoices'; // ⭐ Base URL para Invoices

  private uploadLabFileUrl = 'https://clinic-express.onrender.com/upload-lab-file';

  private administrativeApiUrl = 'https://clinic-express.onrender.com/administratives';

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

  uploadLabFile(file: File): Observable<LabFileUploadResponse> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name); // 'file' debe coincidir con la 'key' esperada por el backend

    // ⭐ HttpClient maneja automáticamente el Content-Type: multipart/form-data
    return this.http.post<LabFileUploadResponse>(this.uploadLabFileUrl, formData);
  }

  getAdministrativeRecords(): Observable<AdministrativeRecord[]> {
    return this.http.get<AdministrativeRecord[]>(this.administrativeApiUrl);
  }

  getAdministrativeResults(administrativeId: string): Observable<AdministrativeResult[]> {
    return this.http.get<AdministrativeResult[]>(`${this.administrativeApiUrl}/${administrativeId}/results`);
  }
  // ⭐ Si hubiera un endpoint para actualizar o un GET por ID, se añadirían aquí.
  // Por ejemplo:
  // getInvoiceById(invoiceId: string): Observable<Invoice> {
  //   return this.http.get<Invoice>(`${this.apiUrl}/${invoiceId}`);
  // }
}