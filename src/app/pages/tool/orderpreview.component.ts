// src/app/pages/order-preview/order-preview.component.ts

import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api'; // Servicios para confirmación y mensajes toast
import * as XLSX from 'xlsx';

import { OrderPreviewService } from '../../core/services/orderpreview.service';
import { LoadingService } from '../../core/services/loading.service';
import { OrderPreview, OrderDetailPreview, NewOrderPreviewPayload, NewOrderPreviewForm, OrderDetailPayload } from '../../core/models/orderpreview.model';

@Component({
  selector: 'app-order-preview',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, RippleModule,
    ToastModule, ToolbarModule, InputTextModule, IconFieldModule,
    InputIconModule, ConfirmDialogModule, DialogModule, TagModule,
    CalendarModule, CheckboxModule, InputNumberModule, DropdownModule, TooltipModule
  ],
  template: `
    <p-toast />

    <p-confirmdialog /> <!-- Componente para diálogos de confirmación -->

    <p-toolbar styleClass="mb-4">
      <ng-template pTemplate="start">
        <p-button label="New Order" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNewOrderDialog()" />
        <p-button label="Download Format" icon="pi pi-download" severity="secondary" class="mr-2" (onClick)="downloadOrderFormat()" />
      </ng-template>

      <ng-template pTemplate="center">
        <p-dropdown [options]="years" [(ngModel)]="selectedYear" (ngModelChange)="loadOrderPreviews()" placeholder="Select Year" styleClass="w-full md:w-10rem mr-2" />
        <p-dropdown [options]="months" [(ngModel)]="selectedMonth" (ngModelChange)="loadOrderPreviews()" optionLabel="name" optionValue="value" placeholder="Select Month" styleClass="w-full md:w-12rem mr-2" />
        <p-dropdown [options]="weeks" [(ngModel)]="selectedWeek" (ngModelChange)="loadOrderPreviews()" optionLabel="name" optionValue="value" placeholder="Select Week" styleClass="w-full md:w-10rem" />
      </ng-template>

      <ng-template pTemplate="end">
        <p-iconfield iconPosition="left">
          <p-inputicon styleClass="pi pi-search" />
          <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
        </p-iconfield>
      </ng-template>
    </p-toolbar>

    <p-table
      #dt
      [value]="orders()"
      [rows]="10"
      [paginator]="true"
      [globalFilterFields]="['date', 'description']"
      [tableStyle]="{ 'min-width': '75rem' }"
      [rowHover]="true"
      dataKey="order_id"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} orders"
      [showCurrentPageReport]="true"
      [rowsPerPageOptions]="[10, 20, 30]"
    >
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="date" style="min-width:10rem">Date <p-sortIcon field="date" /></th>
          <th pSortableColumn="description" style="min-width:20rem">Description <p-sortIcon field="description" /></th>
          <th pSortableColumn="yearNumber" style="min-width:8rem">Year <p-sortIcon field="yearNumber" /></th>
          <th pSortableColumn="monthNumber" style="min-width:8rem">Month <p-sortIcon field="monthNumber" /></th>
          <th pSortableColumn="weekNumber" style="min-width:8rem">Week <p-sortIcon field="weekNumber" /></th>
          <th style="min-width:12rem">Actions</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-order>
        <tr>
          <td>{{ order.date | date:'yyyy-MM-dd' }}</td>
          <td>{{ order.description }}</td>
          <td>{{ order.yearNumber }}</td>
          <td>{{ order.monthNumber }}</td>
          <td>{{ order.weekNumber }}</td>
          <td>
            <p-button icon="pi pi-eye" class="mr-2" [rounded]="true" [outlined]="true" severity="info" (click)="viewOrderDetails(order)" pTooltip="View Details" tooltipPosition="bottom" />
            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteOrder(order)" pTooltip="Delete Order" tooltipPosition="bottom" />
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptyMessage">
        <tr>
          <td [attr.colspan]="6" class="text-center">No order previews found.</td>
        </tr>
      </ng-template>
    </p-table>

    <p-dialog [(visible)]="newOrderDialog" [style]="{ width: '50vw' }" header="Create a New Order Preview" [modal]="true" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div class="grid p-fluid">
          <div class="field col-12 md:col-4">
            <label for="date" class="block font-bold mb-2">Date</label>
            <p-calendar id="date" [(ngModel)]="newOrder.date" dateFormat="yy-mm-dd" [showIcon]="true" appendTo="body" (ngModelChange)="onDateChange()" />
            <small class="p-error" *ngIf="submitted && !newOrder.date">Date is required.</small>
          </div>
          <div class="field col-12 md:col-4">
            <label for="year" class="block font-bold mb-2">Year</label>
            <p-dropdown [options]="years" [(ngModel)]="newOrder.year" placeholder="Select Year" />
            <small class="p-error" *ngIf="submitted && !newOrder.year">Year is required.</small>
          </div>
          <div class="field col-12 md:col-4">
            <label for="month" class="block font-bold mb-2">Month</label>
            <p-dropdown [options]="months" [(ngModel)]="newOrder.month" optionLabel="name" optionValue="value" placeholder="Select Month" />
            <small class="p-error" *ngIf="submitted && !newOrder.month">Month is required.</small>
          </div>
          <div class="field col-12 md:col-6">
            <label for="week" class="block font-bold mb-2">Week</label>
            <p-dropdown [options]="weeks" [(ngModel)]="newOrder.week" optionLabel="name" optionValue="value" placeholder="Select Week" />
            <small class="p-error" *ngIf="submitted && !newOrder.week">Week is required.</small>
          </div>
          <div class="field col-12 md:col-6">
            <label for="description" class="block font-bold mb-2">Description</label>
            <input type="text" id="description" pInputText [(ngModel)]="newOrder.description" autofocus class="w-full"/>
            <small class="p-error" *ngIf="submitted && !newOrder.description">Description is required.</small>
          </div>
          <div class="field col-12">
            <label for="uploadFile" class="block font-bold mb-2">Upload Excel File (Order Details)</label>
            <input type="file" (change)="onExcelFileChange($event)" accept=".xlsx, .xls" />
            <small class="p-error" *ngIf="submitted && newOrder.orderDetails.length === 0">An Excel file with details is required.</small>
            <div *ngIf="uploadedFileName">
                <p>File uploaded: <strong>{{ uploadedFileName }}</strong></p>
            </div>
          </div>
        </div>

        <h5 *ngIf="newOrder.orderDetails && newOrder.orderDetails.length > 0">Order Details (From Excel)</h5>
        <p-table *ngIf="newOrder.orderDetails && newOrder.orderDetails.length > 0"
          [value]="newOrder.orderDetails"
          [tableStyle]="{ 'min-width': '50rem' }"
          [scrollable]="true"
          scrollHeight="300px"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Medical Center</th>
              <th>Patient Name</th>
              <th>Nomenclature</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-detail>
            <tr>
              <td>{{ detail.medical_center }}</td>
              <td>{{ detail.patient_name }}</td>
              <td>{{ detail.nomenclature }}</td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptyMessage">
            <tr>
              <td colspan="3" class="text-center">No details loaded from Excel file.</td>
            </tr>
          </ng-template>
        </p-table>
      </ng-template>

      <ng-template pTemplate="footer">
        <p-button label="Cancel" icon="pi pi-times" text (click)="hideNewOrderDialog()" />
        <p-button label="Save Order" icon="pi pi-check" (click)="saveNewOrderPreview()" />
      </ng-template>
    </p-dialog>

    <p-dialog [(visible)]="orderDetailsDialog" [style]="{ width: '80vw' }" header="Order Preview Details" [modal]="true" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div *ngIf="selectedOrder">
          <p><strong>Order ID:</strong> {{ selectedOrder.order_id }}</p>
          <p><strong>Description:</strong> {{ selectedOrder.description }}</p>
          <p><strong>Date:</strong> {{ selectedOrder.date | date:'yyyy-MM-dd' }}</p>
          <div *ngIf="currentOrderDetails && currentOrderDetails.length > 0">
            <h5>Details:</h5>
            <p-table [value]="currentOrderDetails" [tableStyle]="{ 'min-width': '50rem' }" [scrollable]="true" scrollHeight="400px">
              <ng-template pTemplate="header">
                <tr>
                  <th>Number</th>
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
            <p>No order details found for this order.</p>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <p-button label="Download Details" icon="pi pi-file-excel" class="mr-2" severity="success" (click)="downloadOrderDetails()" [disabled]="!currentOrderDetails || currentOrderDetails.length === 0" />
        <p-button label="Close" icon="pi pi-times" text (click)="hideOrderDetailsDialog()" />
      </ng-template>
    </p-dialog>
  `,
  providers: [MessageService, DatePipe, ConfirmationService]
})
export class OrderPreviewComponent implements OnInit {

  @ViewChild('dt') dt!: Table;

  orders = signal<OrderPreview[]>([]);
  selectedOrder: OrderPreview | null = null;
  currentOrderDetails: OrderDetailPreview[] | null = null;

  newOrderDialog: boolean = false;
  orderDetailsDialog: boolean = false;
  submitted: boolean = false;
  uploadedFileName: string = '';

  // ⭐ Propiedades para los dropdowns de filtrado ⭐
  years: number[] = [];
  months = [
    { name: 'January', value: 1 }, { name: 'February', value: 2 },
    { name: 'March', value: 3 }, { name: 'April', value: 4 },
    { name: 'May', value: 5 }, { name: 'June', value: 6 },
    { name: 'July', value: 7 }, { name: 'August', value: 8 },
    { name: 'September', value: 9 }, { name: 'October', value: 10 },
    { name: 'November', value: 11 }, { name: 'December', value: 12 }
  ];
  weeks = [
    { name: 'Week 1', value: 1 }, { name: 'Week 2', value: 2 },
    { name: 'Week 3', value: 3 }, { name: 'Week 4', value: 4 },
    { name: 'Week 5', value: 5 }
  ];

  selectedYear: number | null = null;
  selectedMonth: number | null = null;
  selectedWeek: number | null = null;

  newOrder: NewOrderPreviewForm = {
    date: '',
    description: '',
    year: null,
    month: null,
    week: null,
    orderDetails: [],
  };

  constructor(
    private orderPreviewService: OrderPreviewService,
    private messageService: MessageService,
    private loadingService: LoadingService,
    private confirmationService: ConfirmationService // Servicio para diálogos de confirmación
  ) {}

  ngOnInit() {
    this.initializeDropdowns();
    this.loadOrderPreviews();
  }

  // ⭐ Inicializar dropdowns con valores por defecto ⭐
  initializeDropdowns() {
    const currentYear = new Date().getFullYear();
    for (let i = 2024; i <= 2030; i++) {
      this.years.push(i);
    }
    this.selectedYear = currentYear;
    this.selectedMonth = new Date().getMonth() + 1; // getMonth() es 0-indexado
  }

  // ⭐ Carga de órdenes basada en los filtros ⭐
  loadOrderPreviews() {
    if (!this.selectedYear || !this.selectedMonth) {
        this.orders.set([]); // Limpiar si no hay filtros seleccionados
        return;
    }

    this.loadingService.show();
    this.orderPreviewService.getOrders(this.selectedYear, this.selectedMonth, this.selectedWeek || 1).subscribe({
      next: (data) => {
        this.loadingService.hide();
        this.orders.set(data);
      },
      error: (error) => {
        console.error('Error loading order previews:', error);
        this.loadingService.hide();
        this.orders.set([]);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.message || 'Could not load order previews.',
          life: 3000,
        });
      },
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // --- Modal y Lógica de Creación ---
  openNewOrderDialog() {
    this.newOrder = {
      date: '',
      description: '',
      year: this.selectedYear,
      month: this.selectedMonth,
      week: this.selectedWeek,
      orderDetails: [],
    };
    this.uploadedFileName = '';
    this.submitted = false;
    this.newOrderDialog = true;
  }

  hideNewOrderDialog() {
    this.newOrderDialog = false;
    this.submitted = false;
  }

  viewOrderDetails(order: OrderPreview) {
    this.selectedOrder = order;
    this.loadingService.show();
    this.orderPreviewService.getOrderDetails(order.order_id).subscribe({
      next: (details) => {
        this.loadingService.hide();
        this.currentOrderDetails = details;
        this.orderDetailsDialog = true;
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        this.loadingService.hide();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load order details.',
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

  // ⭐ Handler para el cambio de fecha ⭐
  onDateChange() {
    if (this.newOrder.date) {
        const dateObj = new Date(this.newOrder.date);
        this.newOrder.year = dateObj.getFullYear();
        this.newOrder.month = dateObj.getMonth() + 1;
    } else {
        this.newOrder.year = null;
        this.newOrder.month = null;
    }
  }

  // ⭐ Lógica para subir y parsear el Excel de 3 columnas ⭐
  onExcelFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Only one file can be uploaded at a time.', life: 3000 });
      return;
    }

    const file = target.files[0];
    this.uploadedFileName = file.name;

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
      this.messageService.add({ severity: 'error', summary: 'Excel Error', detail: 'The Excel file is empty or does not have the expected format.', life: 3000 });
      this.newOrder.orderDetails = [];
      return;
    }

    const header = excelData[0];
    const rows = excelData.slice(1);
    const expectedHeaders = ['Centre medical', 'Name Patient', 'Nomenclature'];

    const isValidHeader = expectedHeaders.every((expected, index) =>
      header[index] && header[index].toString().trim().toLowerCase() === expected.toLowerCase()
    );

    if (!isValidHeader) {
      this.messageService.add({ severity: 'error', summary: 'Format Error', detail: `Excel headers must be: ${expectedHeaders.join(' | ')}.`, life: 6000 });
      this.newOrder.orderDetails = [];
      return;
    }

    const details: OrderDetailPayload[] = [];
    for (const row of rows) {
      if (row.length < expectedHeaders.length || row.every((cell: any) => cell === null || cell === undefined || cell === '')) {
        continue;
      }
      try {
        const detail: OrderDetailPayload = {
          medical_center: row[0] ? row[0].toString() : '',
          patient_name: row[1] ? row[1].toString() : '',
          nomenclature: row[2] ? row[2].toString() : '',
        };
        details.push(detail);
      } catch (e) {
        console.error('Error parsing Excel row:', row, e);
        this.messageService.add({ severity: 'error', summary: 'Parsing Error', detail: 'Problem reading a row from the Excel file. Check data validity.', life: 3000 });
        this.newOrder.orderDetails = [];
        return;
      }
    }

    if (details.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No valid data found in the Excel file after the header.', life: 3000 });
    }

    this.newOrder.orderDetails = details;
    this.messageService.add({ severity: 'success', summary: 'Success', detail: `${details.length} details loaded from Excel.`, life: 3000 });
  }

  // ⭐ Lógica para guardar la nueva orden de previsualización ⭐
  saveNewOrderPreview() {
    this.submitted = true;

    if (!this.newOrder.date || !this.newOrder.year || !this.newOrder.month || !this.newOrder.week || !this.newOrder.description.trim() || this.newOrder.orderDetails.length === 0) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields and upload a valid Excel file.', life: 3000 });
        return;
    }

    const dateFormatted = this.newOrder.date instanceof Date
        ? this.newOrder.date.toISOString().slice(0, 10)
        : this.newOrder.date;

    const payload: NewOrderPreviewPayload = {
        date: dateFormatted,
        description: this.newOrder.description,
        year: this.newOrder.year,
        month: this.newOrder.month,
        week: this.newOrder.week,
        orderDetails: this.newOrder.orderDetails
    };

    this.loadingService.show();
    this.orderPreviewService.createOrder(payload).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.message || 'Order preview created successfully.',
          life: 3000,
        });
        this.loadingService.hide();
        this.hideNewOrderDialog();
        this.loadOrderPreviews(); // Recargar la lista
      },
      error: (error) => {
        console.error('Error creating order preview:', error);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error || 'Error creating the order preview.',

          life: 3000,
        });
        this.loadingService.hide();
      },
    });
  }

  // --- Otros Métodos ---
  deleteOrder(order: OrderPreview) {

    console.log(order);

    this.confirmationService.confirm({
      message: `Are you sure you want to deactivate order preview "${order.description}"?`,
      header: 'Confirm Deactivation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loadingService.show(); // Muestra el spinner de carga
        this.orderPreviewService.deleteOrder(order.order_id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Order preview deactivated successfully.',
              life: 3000,
            });
            this.loadOrderPreviews(); // Recarga la lista para ver el cambio de estado
          },
          error: (error) => {
            console.error('Error deactivating order preview:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error deactivating the order preview.',
              life: 3000,
            });
          },
          complete: () => this.loadingService.hide() // Oculta el spinner al completar (éxito o error)
        });
      },
    });


  }

  downloadOrderFormat() {
    const headers = ['Centre medical', 'Name Patient', 'Nomenclature'];
    const data = [headers];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'OrderDetails');
    const wbout: string = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    function s2ab(s: string): ArrayBuffer {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }

    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const fileName = 'order_details_format.xlsx';

    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      (window.navigator as any).msSaveOrOpenBlob(blob, fileName);
    } else {
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
      detail: 'Order details format downloaded.',
      life: 3000,
    });
  }

// ⭐ NUEVO MÉTODO: Método para descargar los detalles de la orden en un archivo Excel ⭐
    downloadOrderDetails() {
    if (!this.currentOrderDetails || !this.selectedOrder) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No order details to download.', life: 3000 });
        return;
    }

    const headers = ['Number', 'Medical Center', 'Patient Ref', 'Patient Name', 'Analyze Ref', 'Nomenclature', 'Code'];
    const data = this.currentOrderDetails.map(detail => [
      detail.number,
      detail.centre_medical,
      detail.ref_patient,
      detail.name_patient,
      detail.ref_analyze,
      detail.nomenclature_examen,
      detail.code
    ]);

     // Añadir los encabezados al principio del array de datos
     data.unshift(headers);

     const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
     const wb: XLSX.WorkBook = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, 'OrderDetails');
     const wbout: string = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

     // Reutiliza la función auxiliar para convertir string a ArrayBuffer
     const s2ab = (s: string): ArrayBuffer => {
     const buf = new ArrayBuffer(s.length);
     const view = new Uint8Array(buf);
     for (let i = 0; i < s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
     return buf;
    };

    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const fileName = `order_details_${this.selectedOrder.order_id}.xlsx`;

    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      (window.navigator as any).msSaveOrOpenBlob(blob, fileName);
    } else {
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
      severity: 'success',
      summary: 'Download',
      detail: 'Order details downloaded successfully.',
      life: 3000,
    });
   }

}