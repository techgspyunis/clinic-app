// src/app/pages/process/ordercomponent.ts

import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // ⭐ Añadir DatePipe para el formato
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
// import { InputTextareaModule } from 'primeng/inputtextarea'; // ⭐ Re-añadido para la descripción si es multilinea
import { TooltipModule } from 'primeng/tooltip'; // ⭐ Añadido para los tooltips

// Importar nuestros modelos y servicio
import { Order, OrderDetail, CreateOrderPayload, OrderDetailPayload } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';

// Importar para la carga de archivos Excel
import * as XLSX from 'xlsx';

interface Column {
  field: string;
  header: string;
}

interface NewOrderForm {
  date: Date | string;
  description: string;
  upload_file: string;
  details: OrderDetailPayload[];
}


@Component({
  selector: 'app-ordercomponent',
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
    // InputTextareaModule, // ⭐ Re-añadido
    TooltipModule // ⭐ Añadido
  ],
  template: `
    <p-toast />
    <p-confirmdialog />

    <p-toolbar styleClass="mb-4">
      <ng-template #start>
        <p-button label="New Order" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
      </ng-template>

      </p-toolbar>

    <p-table
      #dt
      [value]="orders()"
      [rows]="10"
      [paginator]="true"
      [globalFilterFields]="['date', 'description', 'upload_file']"
      [tableStyle]="{ 'min-width': '75rem' }"
      [(selection)]="selectedOrders"
      [rowHover]="true"
      dataKey="order_id"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} orders"
      [showCurrentPageReport]="true"
      [rowsPerPageOptions]="[10, 20, 30]"
    >
      <ng-template #caption>
        <div class="flex items-center justify-between">
          <h5 class="m-0">Orders</h5>
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
          <th pSortableColumn="created_at" style="min-width:15rem">Created Date <p-sortIcon field="created_at" /></th>
          <th pSortableColumn="is_active" style="min-width:8rem">Status <p-sortIcon field="is_active" /></th>
          <th style="min-width:12rem">Actions</th>
        </tr>
      </ng-template>
      <ng-template #body let-order>
        <tr>
          <td>{{ order.date | date:'yyyy-MM-dd' }}</td>
          <td>{{ order.description }}</td>
          <td>{{ order.upload_file }}</td>
          <td>{{ order.created_at | date:'yyyy-MM-dd HH:mm' }}</td>
          <td>
            <p-tag [value]="order.is_active ? 'Active' : 'Inactive'" [severity]="order.is_active ? 'success' : 'danger'" />
          </td>
          <td>
            <p-button icon="pi pi-eye" class="mr-2" [rounded]="true" [outlined]="true" severity="info" (click)="viewOrderDetails(order)" pTooltip="View Details" tooltipPosition="bottom" />
            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteOrder(order)" pTooltip="Delete Order" tooltipPosition="bottom" />
          </td>
        </tr>
      </ng-template>
      <ng-template #emptyMessage>
        <tr>
          <td [attr.colspan]="6" class="text-center">No orders found.</td>
        </tr>
      </ng-template>
    </p-table>

    <p-dialog [(visible)]="orderDialog" [style]="{ width: '75vw' }" header="Create a New Order" [modal]="true" styleClass="p-fluid">
      <ng-template #content>

          <div class="field col-12 md:col-6">
            <div>
              <label for="date" class="block font-bold mb-2">Date</label>
              <p-calendar id="date" [(ngModel)]="newOrder.date" dateFormat="yy-mm-dd" [showIcon]="true" appendTo="body" />
              <small class="p-error" *ngIf="submitted && !newOrder.date">Date is required.</small>
            </div>
            <div>
              <label for="description" class="block font-bold mb-2">Description</label>
              <input type="text" id="description" pInputText [(ngModel)]="newOrder.description" autofocus class="w-full"/>
              <small class="p-error" *ngIf="submitted && !newOrder.description">Description is required.</small>
            </div>
            <div>
              <label for="uploadFile" class="block font-bold mb-2">Upload Excel File (Order Details)</label>
              <input type="file" (change)="onFileChange($event)" accept=".xlsx, .xls" />
              <small class="p-error" *ngIf="submitted && newOrder.details.length === 0">An Excel file with details is required.</small>
              <div *ngIf="newOrder.upload_file">
                  <p>File uploaded: <strong>{{ newOrder.upload_file }}</strong></p>
              </div>
            </div>

          </div>


        <h5 *ngIf="newOrder.details && newOrder.details.length > 0">Order Details (From Excel)</h5>
        <p-table *ngIf="newOrder.details && newOrder.details.length > 0"
          [value]="newOrder.details"
          [tableStyle]="{ 'min-width': '50rem' }"
          [scrollable]="true"
          scrollHeight="300px"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>N°</th>
              <th>CENTRE MEDICAL</th>
              <th>REF PATIENT</th>
              <th>NOMS DU PATIENT</th>
              <th>REF ANALYSE</th>
              <th>NOMENCLATURE DE L'EXAMEN</th>
              <th>CODE</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-detail>
            <tr>
              <td>{{ detail.number }}</td>
              <td>{{ detail.centre_medical }}</td>
              <td>{{ detail.ref_patient }}</td>
              <td>{{ detail.name_patient }}</td>
              <td>{{ detail.ref_analyze }}</td>
              <td>{{ detail.nomenclature_examen }}</td>
              <td>{{ detail.code }}</td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptyMessage">
            <tr>
              <td colspan="7" class="text-center">No details loaded from Excel file.</td>
            </tr>
          </ng-template>
        </p-table>
      </ng-template>

      <ng-template #footer>
        <p-button label="Cancel" icon="pi pi-times" text (click)="hideNewOrderDialog()" />
        <p-button label="Save Order" icon="pi pi-check" (click)="saveNewOrder()" />
      </ng-template>
    </p-dialog>

    <p-dialog [(visible)]="orderDetailsDialog" [style]="{ width: '80vw' }" header="Order Details" [modal]="true" styleClass="p-fluid">
      <ng-template #content>
        <div *ngIf="selectedOrder">
          <p><strong>Order ID:</strong> {{ selectedOrder.order_id }}</p>
          <p><strong>Description:</strong> {{ selectedOrder.description }}</p>
          <p><strong>Date:</strong> {{ selectedOrder.date | date:'yyyy-MM-dd' }}</p> <div *ngIf="currentOrderDetails && currentOrderDetails.length > 0">
            <h5>Details:</h5>
            <p-table [value]="currentOrderDetails" [tableStyle]="{ 'min-width': '50rem' }" [scrollable]="true" scrollHeight="400px">
              <ng-template pTemplate="header">
                <tr>
                  <th>N°</th>
                  <th>Medical Center</th>
                  <th>Patient Ref</th>
                  <th>Patient Name</th>
                  <th>Analyze Ref</th>
                  <th>Nomenclature</th>
                  <th>Code</th>
                  <th>Active</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-detail>
                <tr>
                  <td>{{ detail.number }}</td>
                  <td>{{ detail.centre_medical }}</td>
                  <td>{{ detail.ref_patient }}</td>
                  <td>{{ detail.name_patient }}</td>
                  <td>{{ detail.ref_analyze }}</td>
                  <td>{{ detail.nomenclature_examen }}</td>
                  <td>{{ detail.code }}</td>
                  <td><p-tag [value]="detail.is_active ? 'Yes' : 'No'" [severity]="detail.is_active ? 'success' : 'danger'" /></td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptyMessage">
                  <tr>
                      <td colspan="8" class="text-center">No order details found.</td>
                  </tr>
              </ng-template>
            </p-table>
          </div>
          <div *ngIf="!currentOrderDetails || currentOrderDetails.length === 0">
            <p>No order details found for this order.</p> </div>
        </div>
      </ng-template>
      <ng-template #footer>
        <p-button label="Close" icon="pi pi-times" text (click)="hideOrderDetailsDialog()" />
      </ng-template>
    </p-dialog>
  `,
  providers: [MessageService, ConfirmationService, DatePipe] // ⭐ Añadir DatePipe a providers
})
export class OrderComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  orders = signal<Order[]>([]);
  selectedOrders: Order[] | null = null;
  selectedOrder: Order | null = null;

  orderDialog: boolean = false;
  orderDetailsDialog: boolean = false;
  submitted: boolean = false;

  newOrder: NewOrderForm = {
    date: '',
    description: '',
    upload_file: '',
    details: [],
  };

  currentOrderDetails: OrderDetail[] | null = null;

  constructor(
    private orderService: OrderService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  // --- Loading and Filtering Methods ---
  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load orders.', // ⭐ Mensaje ajustado
          life: 3000,
        });
        if (error.status === 404) {
            this.orders.set([]);
            this.messageService.add({
                severity: 'info',
                summary: 'Info', // ⭐ Cambiado a Info
                detail: 'No orders found.', // ⭐ Mensaje ajustado
                life: 3000,
            });
        }
      },
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // exportCSV() { // Descomentar si se usa
  //   this.dt.exportCSV();
  // }

  // --- Dialog and Modal Methods ---
  openNew() {
    this.newOrder = {
      date: '',
      description: '',
      upload_file: '',
      details: [],
    };
    this.submitted = false;
    this.orderDialog = true;
  }

  hideNewOrderDialog() {
    this.orderDialog = false;
    this.submitted = false;
  }

  viewOrderDetails(order: Order) {
    this.selectedOrder = order;
    this.orderService.getOrderDetails(order.order_id).subscribe({
      next: (details) => {
        this.currentOrderDetails = details;
        this.orderDetailsDialog = true;
      },
      error: (error) => {
        console.error('Error loading order details:', error); // ⭐ Mensaje ajustado
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load order details.', // ⭐ Mensaje ajustado
          life: 3000,
        });
        this.currentOrderDetails = null;
        this.orderDetailsDialog = true;
      },
    });
  }

  hideOrderDetailsDialog() {
    this.orderDetailsDialog = false;
    this.currentOrderDetails = null;
    this.selectedOrder = null;
  }

  // --- Excel File Upload Logic ---
  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning', // ⭐ Traducido
        detail: 'Only one file can be uploaded at a time.', // ⭐ Traducido
        life: 3000,
      });
      return;
    }

    const file = target.files[0];
    this.newOrder.upload_file = file.name;

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
        summary: 'Excel Error', // ⭐ Traducido
        detail: 'The Excel file is empty or does not have the expected format.', // ⭐ Traducido
        life: 3000,
      });
      this.newOrder.details = [];
      return;
    }

    const header = excelData[0];
    const rows = excelData.slice(1);

    // ⭐ Considera si estos encabezados deberían estar en inglés si el usuario es inglés
    // Por ahora, se mantienen como en el Excel que esperas.
    const expectedHeaders = [
      'N°',
      'CENTRE MEDICAL',
      'REF PATIENT',
      'NOMS DU PATIENT',
      'REF ANALYSE',
      'NOMENCLATURE DE L\'EXAMEN',
      'CODE',
    ];

    const isValidHeader = expectedHeaders.every((expected, index) =>
      header[index] && header[index].toString().trim().toUpperCase() === expected.toUpperCase()
    );

    if (!isValidHeader) {
      this.messageService.add({
        severity: 'error',
        summary: 'Format Error', // ⭐ Traducido
        detail: `Excel file headers do not match the expected format. Please check: ${expectedHeaders.join(' | ')}.`, // ⭐ Mensaje más claro
        life: 6000,
      });
      this.newOrder.details = [];
      return;
    }

    const details: OrderDetailPayload[] = [];
    for (const row of rows) {
      if (row.length < expectedHeaders.length || row.every((cell: any) => cell === null || cell === undefined || cell === '')) {
        continue;
      }
      try {
        const detail: OrderDetailPayload = {
          number: typeof row[0] === 'number' ? row[0] : parseInt(row[0], 10),
          centre_medical: row[1] ? row[1].toString() : '',
          ref_patient: row[2] ? row[2].toString() : '',
          name_patient: row[3] ? row[3].toString() : '',
          ref_analyze: row[4] ? row[4].toString() : '',
          nomenclature_examen: row[5] ? row[5].toString() : '',
          code: row[6] ? row[6].toString() : '',
        };
        details.push(detail);
      } catch (e) {
        console.error('Error parsing Excel row:', row, e);
        this.messageService.add({
          severity: 'error',
          summary: 'Parsing Error', // ⭐ Traducido
          detail: 'There was a problem reading a row from the Excel file. Ensure all data is valid.', // ⭐ Traducido
          life: 3000,
        });
        this.newOrder.details = [];
        return;
      }
    }

    if (details.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No valid data found in the Excel file after the header.', // ⭐ Traducido
        life: 3000,
      });
    }

    this.newOrder.details = details;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `${details.length} details loaded from Excel.`, // ⭐ Traducido
      life: 3000,
    });
  }

  // --- Save and Delete Methods ---
  saveNewOrder() {
    this.submitted = true;

    // Basic validations before sending
    if (!this.newOrder.date) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Date is required.', life: 3000 }); // ⭐ Traducido
        return;
    }
    if (!this.newOrder.description.trim()) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Description is required.', life: 3000 }); // ⭐ Traducido
        return;
    }
    if (!this.newOrder.upload_file.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An Excel file must be uploaded.', life: 3000 }); // ⭐ Traducido
      return;
    }
    if (this.newOrder.details.length === 0) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'The Excel file contains no valid details or has not been uploaded.', life: 3000 }); // ⭐ Traducido
        return;
    }

    // ⭐ La corrección del 'instanceof' ya está aplicada en la lógica
    const dateFormatted = this.newOrder.date instanceof Date
        ? this.newOrder.date.toISOString().slice(0, 10)
        : this.newOrder.date;

    const payload: CreateOrderPayload = {
        date: dateFormatted,
        description: this.newOrder.description,
        upload_file: this.newOrder.upload_file,
        details: this.newOrder.details
    };

    this.orderService.createOrder(payload).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success', // ⭐ Traducido
          detail: response.message || 'Order created successfully.', // ⭐ Traducido
          life: 3000,
        });
        this.hideNewOrderDialog();
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error creating order:', error); // ⭐ Traducido
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error creating the order.', // ⭐ Traducido
          life: 3000,
        });
      },
    });
  }

  deleteOrder(order: Order) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete order ID: ${order.order_id} with description "${order.description}"?`, // ⭐ Mensaje ajustado
      header: 'Confirm Deletion', // ⭐ Traducido
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.orderService.deleteOrder(order.order_id).subscribe({
          next: (response) => {
            this.orders.set(this.orders().filter((val) => val.order_id !== order.order_id));
            this.messageService.add({
              severity: 'success',
              summary: 'Success', // ⭐ Traducido
              detail: response.message || 'Order deleted successfully.', // ⭐ Traducido
              life: 3000,
            });
          },
          error: (error) => {
            console.error('Error deleting order:', error); // ⭐ Traducido
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error deleting the order.', // ⭐ Traducido
              life: 3000,
            });
          },
        });
      },
    });
  }

  getSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }
}