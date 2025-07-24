// src/app/pages/process/invoicecomponent.ts

import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';

import { Invoice, InvoiceDetail, CreateInvoicePayload, InvoiceDetailPayload } from '../../core/models/invoice.model';
import { InvoiceService, LabFileUploadResponse  } from '../../core/services/invoice.service';

import * as XLSX from 'xlsx';

interface NewInvoiceForm {
  date: Date | string;
  description: string;
  is_payed: boolean;
  upload_file: string;
  details: InvoiceDetailPayload[];
}

@Component({
  selector: 'app-invoicecomponent',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    DialogModule,
    TagModule,
    CalendarModule,
    CheckboxModule,
    InputNumberModule,
    TooltipModule
  ],
  template: `
    <p-toast />
    <p-confirmdialog />

    <p-toolbar styleClass="mb-4">
      <ng-template #start>
        <p-button label="New Invoice" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
        <p-button label="Download Invoice Format" icon="pi pi-download" severity="secondary" class="mr-2" (onClick)="downloadInvoiceFormat()" />
        <!-- ⭐ Nuevo botón para subir archivo ZIP ⭐ -->
        <p-button label="Upload Zip File" icon="pi pi-upload" severity="info" (onClick)="openUploadZipFileDialog()" />
      </ng-template>
    </p-toolbar>

    <p-table
      #dt
      [value]="invoices()"
      [rows]="10"
      [paginator]="true"
      [globalFilterFields]="['date', 'description', 'upload_file', 'is_payed']"
      [tableStyle]="{ 'min-width': '75rem' }"
      [(selection)]="selectedInvoices"
      [rowHover]="true"
      dataKey="invoice_id"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} invoices"
      [showCurrentPageReport]="true"
      [rowsPerPageOptions]="[10, 20, 30]"
    >
      <ng-template #caption>
        <div class="flex items-center justify-between">
          <h5 class="m-0">Invoice Management</h5>
          <p-iconfield>
            <p-inputicon styleClass="pi pi-search" />
            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
          </p-iconfield>
        </div>
      </ng-template>
      <ng-template #header>
        <tr>
          <th pSortableColumn="date" style="min-width:10rem">Date <p-sortIcon field="date" /></th>
          <th pSortableColumn="description" style="min-width:20rem">Description <p-sortIcon field="description" /></th>
          <th pSortableColumn="upload_file" style="min-width:15rem">Uploaded File <p-sortIcon field="upload_file" /></th>
          <th pSortableColumn="is_payed" style="min-width:8rem">Paid <p-sortIcon field="is_payed" /></th>
          <th pSortableColumn="created_at" style="min-width:15rem">Created Date <p-sortIcon field="created_at" /></th>
          <th pSortableColumn="is_active" style="min-width:8rem">Status <p-sortIcon field="is_active" /></th>
          <th style="min-width:12rem">Actions</th>
        </tr>
      </ng-template>
      <ng-template #body let-invoice>
        <tr>
          <td>{{ invoice.date | date:'yyyy-MM-dd' }}</td>
          <td>{{ invoice.description }}</td>
          <td>{{ invoice.upload_file }}</td>
          <td>
            <p-checkbox
              [binary]="true"
              [(ngModel)]="invoice.is_payed"
              (ngModelChange)="onPaidStatusChange(invoice)"
              [pTooltip]="invoice.is_payed ? 'Mark as Unpaid' : 'Mark as Paid'"
              tooltipPosition="bottom"
            ></p-checkbox>
          </td>
          <td>{{ invoice.created_at | date:'yyyy-MM-dd HH:mm' }}</td>
          <td>
            <p-tag [value]="invoice.is_active ? 'Active' : 'Inactive'" [severity]="invoice.is_active ? 'success' : 'danger'" />
          </td>
          <td>
            <p-button icon="pi pi-eye" class="mr-2" [rounded]="true" [outlined]="true" severity="info" (click)="viewInvoiceDetails(invoice)" pTooltip="View Details" tooltipPosition="bottom" />
            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteInvoice(invoice)" pTooltip="Delete Invoice" tooltipPosition="bottom" />
          </td>
        </tr>
      </ng-template>
      <ng-template #emptyMessage>
        <tr>
          <td [attr.colspan]="7" class="text-center">No invoices found.</td>
        </tr>
      </ng-template>
    </p-table>

    <p-dialog [(visible)]="invoiceDialog" [style]="{ width: '75vw' }" header="Create a New Invoice" [modal]="true" styleClass="p-fluid">
      <ng-template #content>
        <div class="grid p-fluid">
          <div class="field col-12 md:col-6">
            <label for="date" class="block font-bold mb-2">Date</label>
            <p-calendar id="date" [(ngModel)]="newInvoice.date" dateFormat="yy-mm-dd" [showIcon]="true" appendTo="body" />
            <small class="p-error" *ngIf="submitted && !newInvoice.date">Date is required.</small>
          </div>
          <div class="field col-12 md:col-6">
            <label for="description" class="block font-bold mb-2">Description</label>
            <input type="text" id="description" pInputText [(ngModel)]="newInvoice.description" autofocus class="w-full"/>
            <small class="p-error" *ngIf="submitted && !newInvoice.description">Description is required.</small>
          </div>
          <div class="field col-12 md:col-6">
            <label for="isPayed" class="block font-bold mb-2">Is Paid?</label>
            <p-checkbox id="isPayed" [(ngModel)]="newInvoice.is_payed" [binary]="true"></p-checkbox>
          </div>
          <div class="field col-12">
            <label for="uploadFile" class="block font-bold mb-2">Upload Excel File (Invoice Details)</label>
            <input type="file" (change)="onExcelFileChange($event)" accept=".xlsx, .xls" />
            <small class="p-error" *ngIf="submitted && newInvoice.details.length === 0">An Excel file with details is required.</small>
            <div *ngIf="newInvoice.upload_file">
                <p>File uploaded: <strong>{{ newInvoice.upload_file }}</strong></p>
            </div>
          </div>
        </div>

        <h5 *ngIf="newInvoice.details && newInvoice.details.length > 0">Invoice Details (From Excel)</h5>
        <p-table *ngIf="newInvoice.details && newInvoice.details.length > 0"
          [value]="newInvoice.details"
          [tableStyle]="{ 'min-width': '50rem' }"
          [scrollable]="true"
          scrollHeight="300px"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Demand</th>
              <th>Patient Name</th>
              <th>Prel. Date</th>
              <th>Patient Ref</th>
              <th>Amount</th>
              <th>Unknow</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-detail>
            <tr>
              <td>{{ detail.demande }}</td>
              <td>{{ detail.name_patient }}</td>
              <td>{{ detail.date_prel | date:'yyyy-MM-dd' }}</td>
              <td>{{ detail.ref_patient }}</td>
              <td>{{ detail.montant | currency:'USD':'symbol':'1.2-2' }}</td>
              <td>{{ detail.unknow }}</td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptyMessage">
            <tr>
              <td colspan="6" class="text-center">No details loaded from Excel file.</td>
            </tr>
          </ng-template>
        </p-table>
      </ng-template>

      <ng-template #footer>
        <p-button label="Cancel" icon="pi pi-times" text (click)="hideNewInvoiceDialog()" />
        <p-button label="Save Invoice" icon="pi pi-check" (click)="saveNewInvoice()" />
      </ng-template>
    </p-dialog>

    <p-dialog [(visible)]="invoiceDetailsDialog" [style]="{ width: '80vw' }" header="Invoice Details" [modal]="true" styleClass="p-fluid">
      <ng-template #content>
        <div *ngIf="selectedInvoice">
          <p><strong>Invoice ID:</strong> {{ selectedInvoice.invoice_id }}</p>
          <p><strong>Description:</strong> {{ selectedInvoice.description }}</p>
          <p><strong>Date:</strong> {{ selectedInvoice.date | date:'yyyy-MM-dd' }}</p>
          <p><strong>Paid:</strong> <p-tag [value]="selectedInvoice.is_payed ? 'Yes' : 'No'" [severity]="selectedInvoice.is_payed ? 'success' : 'warning'" /></p>
          <div *ngIf="currentInvoiceDetails && currentInvoiceDetails.length > 0">
            <h5>Details:</h5>
            <p-table [value]="currentInvoiceDetails" [tableStyle]="{ 'min-width': '50rem' }" [scrollable]="true" scrollHeight="400px">
              <ng-template pTemplate="header">
                <tr>
                  <th>Demand</th>
                  <th>Patient Name</th>
                  <th>Prel. Date</th>
                  <th>Patient Ref</th>
                  <th>Amount</th>
                  <th>Unknow</th>
                  <th>Active</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-detail>
                <tr>
                  <td>{{ detail.demande }}</td>
                  <td>{{ detail.name_patient }}</td>
                  <td>{{ detail.date_prel | date:'yyyy-MM-dd' }}</td>
                  <td>{{ detail.ref_patient }}</td>
                  <td>{{ detail.montant | currency:'USD':'symbol':'1.2-2' }}</td>
                  <td>{{ detail.unknow }}</td>
                  <td><p-tag [value]="detail.is_active ? 'Yes' : 'No'" [severity]="detail.is_active ? 'success' : 'danger'" /></td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptyMessage">
                  <tr>
                      <td colspan="7" class="text-center">No invoice details found.</td>
                  </tr>
              </ng-template>
            </p-table>
          </div>
          <div *ngIf="!currentInvoiceDetails || currentInvoiceDetails.length === 0">
            <p>No invoice details found for this invoice.</p>
          </div>
        </div>
      </ng-template>
      <ng-template #footer>
        <p-button label="Close" icon="pi pi-times" text (click)="hideInvoiceDetailsDialog()" />
      </ng-template>
    </p-dialog>

    <!-- ⭐ Nuevo Modal para Subir Archivo ZIP ⭐ -->
    <p-dialog [(visible)]="uploadZipFileDialog" [style]="{ width: '50vw' }" header="Upload Lab Results (ZIP)" [modal]="true" styleClass="p-fluid">
      <ng-template #content>
        <div class="field">
          <label for="zipFile" class="block font-bold mb-2">Select ZIP File</label>
          <input type="file" id="zipFile" (change)="onZipFileChange($event)" accept=".zip" />
          <small class="p-error" *ngIf="submittedZipFile && !selectedZipFile">A ZIP file is required.</small>
          <div *ngIf="selectedZipFile">
            <p>Selected file: <strong>{{ selectedZipFile.name }}</strong></p>
          </div>
        </div>
      </ng-template>
      <ng-template #footer>
        <p-button label="Cancel" icon="pi pi-times" text (click)="hideUploadZipFileDialog()" />
        <p-button label="Upload" icon="pi pi-upload" (click)="uploadZipFile()" />
      </ng-template>
    </p-dialog>
  `,
  providers: [MessageService, ConfirmationService, DatePipe]
})
export class InvoiceComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  invoices = signal<Invoice[]>([]);
  selectedInvoices: Invoice[] | null = null;
  selectedInvoice: Invoice | null = null;

  invoiceDialog: boolean = false;
  orderDetailsDialog: boolean = false;
   uploadZipFileDialog: boolean = false; // ⭐ Nueva propiedad para el modal de subida ZIP
  invoiceDetailsDialog: boolean = false;
  submitted: boolean = false;
submittedZipFile: boolean = false; 

  newInvoice: NewInvoiceForm = {
    date: '',
    description: '',
    is_payed: false,
    upload_file: '',
    details: [],
  };

  selectedZipFile: File | null = null; // ⭐ Propiedad para almacenar el archivo ZIP seleccionado

  currentInvoiceDetails: InvoiceDetail[] | null = null;

  constructor(
    private invoiceService: InvoiceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadInvoices();
  }

  // --- Loading and Filtering Methods ---
  loadInvoices() {
    this.invoiceService.getInvoices().subscribe({
      next: (data) => {
        this.invoices.set(data);
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load invoices.',
          life: 3000,
        });
        if (error.status === 404) {
            this.invoices.set([]);
            this.messageService.add({
                severity: 'info',
                summary: 'Info',
                detail: 'No invoices found.',
                life: 3000,
            });
        }
      },
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // --- Dialog and Modal Methods ---
  openNew() {
    this.newInvoice = {
      date: '',
      description: '',
      is_payed: false,
      upload_file: '',
      details: [],
    };
    this.submitted = false;
    this.invoiceDialog = true;
  }

  hideNewInvoiceDialog() {
    this.invoiceDialog = false;
    this.submitted = false;
  }

  viewInvoiceDetails(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.invoiceService.getInvoiceDetails(invoice.invoice_id).subscribe({
      next: (details) => {
        this.currentInvoiceDetails = details;
        this.invoiceDetailsDialog = true;
      },
      error: (error) => {
        console.error('Error loading invoice details:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load invoice details.',
          life: 3000,
        });
        this.currentInvoiceDetails = null;
        this.invoiceDetailsDialog = true;
      },
    });
  }

  hideInvoiceDetailsDialog() {
    this.invoiceDetailsDialog = false;
    this.currentInvoiceDetails = null;
    this.selectedInvoice = null;
  }

  openUploadZipFileDialog() {
    this.selectedZipFile = null; // Limpiar archivo previo
    this.submittedZipFile = false;
    this.uploadZipFileDialog = true;
  }

   hideUploadZipFileDialog() {
    this.uploadZipFileDialog = false;
    this.selectedZipFile = null;
    this.submittedZipFile = false;
  }

  onZipFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length > 0) {
      this.selectedZipFile = target.files[0];
    } else {
      this.selectedZipFile = null;
    }
  }

  uploadZipFile() {
    this.submittedZipFile = true; // Activar validación

    if (!this.selectedZipFile) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select a ZIP file to upload.',
        life: 3000,
      });
      return;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Uploading',
      detail: 'Processing file... Please wait.',
      life: 5000, // Mostrar por más tiempo ya que el procesamiento puede tardar
    });

    this.invoiceService.uploadLabFile(this.selectedZipFile).subscribe({
      next: (response: LabFileUploadResponse) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.message || 'Lab file processed successfully.',
          life: 5000,
        });
        // Puedes mostrar más detalles si quieres, por ejemplo:
        if (response.processedFilesCount > 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'Details',
            detail: `${response.processedFilesCount} LAB files processed. ${response.totalErrors} errors.`,
            life: 7000,
          });
        }
        this.hideUploadZipFileDialog(); // Cerrar el modal al finalizar
      },
      error: (error) => {
        console.error('Error uploading lab file:', error);
        let errorMessage = 'Failed to upload and process lab file.';

        // ⭐ Lógica para manejar el error de archivo duplicado ⭐
        if (error.error && typeof error.error === 'object' && error.error.error) {
          errorMessage = error.error.error; // Captura el mensaje de error específico del backend
        } else if (error.message) {
          errorMessage = error.message; // Mensaje de error general de la petición HTTP
        }
        // Puedes añadir más lógica si sabes que hay otros tipos de errores específicos.

        this.messageService.add({
          severity: 'error',
          summary: 'Upload Error',
          detail: errorMessage, // Usamos el mensaje de error capturado
          life: 5000,
        });
      },
    });
  }



  // --- Excel File Upload Logic ---
  onExcelFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Only one file can be uploaded at a time.',
        life: 3000,
      });
      return;
    }

    const file = target.files[0];
    this.newInvoice.upload_file = file.name;

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      this.parseExcelData(data);
    };
    reader.readAsBinaryString(file);
  }

  parseExcelData(excelData: any[]) {
    if (!excelData || excelData.length < 2) {
      this.messageService.add({
        severity: 'error',
        summary: 'Excel Error',
        detail: 'The Excel file is empty or does not have the expected format.',
        life: 3000,
      });
      this.newInvoice.details = [];
      return;
    }

    const header = excelData[0];
    const rows = excelData.slice(1);

    const expectedHeaders = [
      'demande',
      'name_patient',
      'date_prel',
      'ref_patient',
      'montant',
      'unknow',
    ];

    const isValidHeader = expectedHeaders.every((expected, index) =>
      header[index] && header[index].toString().trim().toLowerCase() === expected.toLowerCase()
    );

    if (!isValidHeader) {
      this.messageService.add({
        severity: 'error',
        summary: 'Format Error',
        detail: `Excel file headers do not match the expected format. Please check: ${expectedHeaders.join(' | ')}.`,
        life: 6000,
      });
      this.newInvoice.details = [];
      return;
    }

    const details: InvoiceDetailPayload[] = [];
    for (const row of rows) {
      if (row.length < expectedHeaders.length || row.every((cell: any) => cell === null || cell === undefined || cell === '')) {
        continue;
      }
      try {
        const detail: InvoiceDetailPayload = {
          demande: row[0] ? row[0].toString() : '',
          name_patient: row[1] ? row[1].toString() : '',
          date_prel: row[2] ? new Date(row[2]).toISOString().slice(0, 10) : '',
          ref_patient: row[3] ? row[3].toString() : '',
          montant: typeof row[4] === 'number' ? row[4] : parseFloat(row[4]),
          unknow: row[5] ? row[5].toString() : null,
        };
        details.push(detail);
      } catch (e) {
        console.error('Error parsing Excel row:', row, e);
        this.messageService.add({
          severity: 'error',
          summary: 'Parsing Error',
          detail: 'There was a problem reading a row from the Excel file. Ensure all data is valid.',
          life: 3000,
        });
        this.newInvoice.details = [];
        return;
      }
    }

    if (details.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No valid data found in the Excel file after the header.',
        life: 3000,
      });
    }

    this.newInvoice.details = details;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `${details.length} details loaded from Excel.`,
      life: 3000,
    });
  }

  // --- Save and Delete Methods ---
  saveNewInvoice() {
    this.submitted = true;

    if (!this.newInvoice.date) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Date is required.', life: 3000 });
        return;
    }
    if (!this.newInvoice.description.trim()) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Description is required.', life: 3000 });
        return;
    }
    if (!this.newInvoice.upload_file.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An Excel file must be uploaded.', life: 3000 });
      return;
    }
    if (this.newInvoice.details.length === 0) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'The Excel file contains no valid details or has not been uploaded.', life: 3000 });
        return;
    }

    const dateFormatted = this.newInvoice.date instanceof Date
        ? this.newInvoice.date.toISOString().slice(0, 10)
        : this.newInvoice.date;

    const payload: CreateInvoicePayload = {
        date: dateFormatted,
        description: this.newInvoice.description,
        is_payed: this.newInvoice.is_payed,
        upload_file: this.newInvoice.upload_file,
        details: this.newInvoice.details
    };

    this.invoiceService.createInvoice(payload).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.message || 'Invoice created successfully.',
          life: 3000,
        });
        this.hideNewInvoiceDialog();
        this.loadInvoices();
      },
      error: (error) => {
        console.error('Error creating invoice:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error creating the invoice.',
          life: 3000,
        });
      },
    });
  }

  deleteInvoice(invoice: Invoice) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete invoice ID: ${invoice.invoice_id} with description "${invoice.description}"? This will mark it as inactive.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.invoiceService.deleteInvoice(invoice.invoice_id).subscribe({
          next: (response) => {
            this.invoices.set(this.invoices().map(inv => inv.invoice_id === invoice.invoice_id ? { ...inv, is_active: false } : inv));

            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Invoice marked as inactive successfully.',
              life: 3000,
            });
          },
          error: (error) => {
            console.error('Error deleting invoice:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error deleting the invoice.',
              life: 3000,
            });
          },
        });
      },
    });
  }

  onPaidStatusChange(invoice: Invoice) {
    const originalStatus = !invoice.is_payed; // El valor en `invoice.is_payed` ya fue cambiado por `[(ngModel)]`
    this.confirmationService.confirm({
      message: `Are you sure you want to change the paid status for invoice ID: ${invoice.invoice_id} to ${invoice.is_payed ? 'Paid' : 'Unpaid'}?`,
      header: 'Confirm Status Change',
      icon: 'pi pi-info-circle',
      accept: () => {
        // ⭐ Aquí, 'response' ahora será directamente el objeto Invoice actualizado
        this.invoiceService.updateInvoicePaidStatus(invoice.invoice_id, invoice.is_payed).subscribe({
          next: (updatedInvoice: Invoice) => { // ⭐ Tipado como Invoice
            // Actualizar el signal con el objeto Invoice actualizado recibido del backend
            this.invoices.update(invoices => invoices.map(inv =>
              inv.invoice_id === updatedInvoice.invoice_id ? updatedInvoice : inv
            ));

            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Invoice paid status updated successfully.', // Mensaje genérico o si el backend lo devuelve, usarlo
              life: 3000,
            });
          },
          error: (error) => {
            console.error('Error updating paid status:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to update paid status.',
              life: 3000,
            });
            // Revertir el cambio en el UI si la llamada falla
            invoice.is_payed = originalStatus;
          },
        });
      },
      reject: () => {
        // Si el usuario cancela la confirmación, revertir el cambio en el UI
        invoice.is_payed = originalStatus;
      }
    });
  }

  downloadInvoiceFormat() {
    const headers = [
      'demande',
      'name_patient',
      'date_prel',
      'ref_patient',
      'montant',
      'unknow',
    ];

    // Crea un array de arrays, donde la primera fila son los encabezados
    const data = [headers];

    // Crea un nuevo libro de trabajo
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'InvoiceDetails');

    // Genera el archivo Excel en formato binario
    const wbout: string = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    // Función para convertir string binario a ArrayBuffer
    function s2ab(s: string): ArrayBuffer {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }

    // Crea un Blob y descarga el archivo
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const fileName = 'invoice_details_format.xlsx';

    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      // Para IE
      (window.navigator as any).msSaveOrOpenBlob(blob, fileName);
    } else {
      // Para otros navegadores
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Download',
      detail: 'Invoice details format downloaded.',
      life: 3000,
    });
  }

  getSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }

  getPaidSeverity(isPaid: boolean): string {
    return isPaid ? 'success' : 'warning';
  }
}