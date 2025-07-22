// src/app/pages/process/ordercomponent.ts

import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { TagModule } from 'primeng/tag'; // Para el estado is_active si lo quieres estilizar
import { CalendarModule } from 'primeng/calendar'; // Para la fecha

// Importar nuestros modelos y servicio
import { Order, OrderDetail, CreateOrderPayload, OrderDetailPayload } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';

// Importar para la carga de archivos Excel (instalaremos después)
import * as XLSX from 'xlsx'; // Importamos la librería para leer Excel

interface Column {
  field: string;
  header: string;
}

interface NewOrderForm {
  date: Date | string; // Permitimos que sea Date (del p-calendar) o string
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
    CalendarModule
  ],
  template: `
    <p-toast />
    <p-confirmdialog />

    <p-toolbar styleClass="mb-4">
      <ng-template #start>
        <p-button label="Nueva Orden" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
        </ng-template>

      <ng-template #end>
        <p-button label="Exportar CSV" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
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
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} órdenes"
      [showCurrentPageReport]="true"
      [rowsPerPageOptions]="[10, 20, 30]"
    >
      <ng-template #caption>
        <div class="flex items-center justify-between">
          <h5 class="m-0">Gestión de Órdenes</h5>
          <p-iconfield iconPosition="left">
            <p-inputicon styleClass="pi pi-search" />
            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
          </p-iconfield>
        </div>
      </ng-template>
      <ng-template #header>
        <tr>
          <th pSortableColumn="date" style="min-width:10rem">Fecha <p-sortIcon field="date" /></th>
          <th pSortableColumn="description" style="min-width:20rem">Descripción <p-sortIcon field="description" /></th>
          <th pSortableColumn="upload_file" style="min-width:15rem">Archivo Subido <p-sortIcon field="upload_file" /></th>
          <th pSortableColumn="created_at" style="min-width:15rem">Fecha Creación <p-sortIcon field="created_at" /></th>
          <th pSortableColumn="is_active" style="min-width:8rem">Activa <p-sortIcon field="is_active" /></th>
          <th style="min-width:12rem">Acciones</th>
        </tr>
      </ng-template>
      <ng-template #body let-order>
        <tr>
          <td>{{ order.date | date:'yyyy-MM-dd' }}</td>
          <td>{{ order.description }}</td>
          <td>{{ order.upload_file }}</td>
          <td>{{ order.created_at | date:'yyyy-MM-dd HH:mm' }}</td>
          <td>
            <p-tag [value]="order.is_active ? 'Activa' : 'Inactiva'" [severity]="order.is_active ? 'success' : 'danger'" />
          </td>
          <td>
            <p-button icon="pi pi-eye" class="mr-2" [rounded]="true" [outlined]="true" severity="info" (click)="viewOrderDetails(order)" pTooltip="Ver Detalles" tooltipPosition="bottom" />
            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteOrder(order)" pTooltip="Eliminar Orden" tooltipPosition="bottom" />
          </td>
        </tr>
      </ng-template>
      <ng-template #emptyMessage>
        <tr>
          <td [attr.colspan]="6" class="text-center">No se encontraron órdenes.</td>
        </tr>
      </ng-template>
    </p-table>

    <p-dialog [(visible)]="orderDialog" [style]="{ width: '75vw' }" header="Detalles de la Nueva Orden" [modal]="true" styleClass="p-fluid">
      <ng-template #content>
        <div class="grid p-fluid">
          <div class="field col-12 md:col-6">
            <label for="date">Fecha</label>
            <p-calendar id="date" [(ngModel)]="newOrder.date" dateFormat="yy-mm-dd" [showIcon]="true" appendTo="body" />
            <small class="p-error" *ngIf="submitted && !newOrder.date">La fecha es requerida.</small>
          </div>
          <div class="field col-12 md:col-6">
            <label for="description">Descripción</label>
            <textarea id="description" pInputTextarea [(ngModel)]="newOrder.description" rows="3" cols="20"></textarea>
            <small class="p-error" *ngIf="submitted && !newOrder.description">La descripción es requerida.</small>
          </div>
          <div class="field col-12">
            <label for="uploadFile">Cargar Archivo Excel (Detalles de la Orden)</label>
            <input type="file" (change)="onFileChange($event)" accept=".xlsx, .xls" />
            <small class="p-error" *ngIf="submitted && newOrder.details.length === 0">Debe cargar un archivo Excel con los detalles.</small>
            <div *ngIf="newOrder.upload_file">
                <p>Archivo cargado: <strong>{{ newOrder.upload_file }}</strong></p>
            </div>
          </div>
        </div>

        <h5 *ngIf="newOrder.details && newOrder.details.length > 0">Detalles de la Orden (del Excel)</h5>
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
              <td colspan="7" class="text-center">No hay detalles cargados del archivo Excel.</td>
            </tr>
          </ng-template>
        </p-table>
      </ng-template>

      <ng-template #footer>
        <p-button label="Cancelar" icon="pi pi-times" text (click)="hideNewOrderDialog()" />
        <p-button label="Guardar Orden" icon="pi pi-check" (click)="saveNewOrder()" />
      </ng-template>
    </p-dialog>

    <p-dialog [(visible)]="orderDetailsDialog" [style]="{ width: '80vw' }" header="Detalles de la Orden" [modal]="true" styleClass="p-fluid">
      <ng-template #content>
        <div *ngIf="currentOrderDetails && currentOrderDetails.length > 0">
          <h5>Orden ID: {{ selectedOrder?.order_id }}</h5>
          <p>Descripción: {{ selectedOrder?.description }}</p>
          <p-table [value]="currentOrderDetails" [tableStyle]="{ 'min-width': '50rem' }" [scrollable]="true" scrollHeight="400px">
            <ng-template pTemplate="header">
              <tr>
                <th>N°</th>
                <th>Centro Médico</th>
                <th>Ref Paciente</th>
                <th>Nombre Paciente</th>
                <th>Ref Análisis</th>
                <th>Examen</th>
                <th>Código</th>
                <th>Activo</th>
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
                <td><p-tag [value]="detail.is_active ? 'Sí' : 'No'" [severity]="detail.is_active ? 'success' : 'danger'" /></td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptyMessage">
                <tr>
                    <td colspan="8" class="text-center">No se encontraron detalles para esta orden.</td>
                </tr>
            </ng-template>
          </p-table>
        </div>
        <div *ngIf="!currentOrderDetails || currentOrderDetails.length === 0">
          <p>No se encontraron detalles para esta orden.</p>
        </div>
      </ng-template>
      <ng-template #footer>
        <p-button label="Cerrar" icon="pi pi-times" text (click)="hideOrderDetailsDialog()" />
      </ng-template>
    </p-dialog>
  `,
  providers: [MessageService, ConfirmationService] // OrderService ya está providedIn: 'root'
})
export class OrderComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  

  orders = signal<Order[]>([]);
  selectedOrders: Order[] | null = null; // Para la selección de múltiples, si decides usarla
  selectedOrder: Order | null = null; // Para la orden seleccionada para ver detalles

  orderDialog: boolean = false; // Controla la visibilidad del modal de creación/edición
  orderDetailsDialog: boolean = false; // Controla la visibilidad del modal de detalles
  submitted: boolean = false; // Para validación de formularios

  // Objeto para la nueva orden a crear
  newOrder: NewOrderForm = { // Usamos la interfaz auxiliar aquí
    date: '', // O new Date() si quieres que el calendario empiece con la fecha actual
    description: '',
    upload_file: '',
    details: [],
  };

  currentOrderDetails: OrderDetail[] | null = null; // Para mostrar en el modal de detalles

  constructor(
    private orderService: OrderService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  // --- Métodos de Carga y Filtrado ---
  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
      },
      error: (error) => {
        console.error('Error al cargar órdenes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las órdenes.',
          life: 3000,
        });
        // Si el 404 significa que no hay datos, puedes manejarlo así:
        if (error.status === 404) {
            this.orders.set([]); // Limpiar la tabla si no hay datos
            this.messageService.add({
                severity: 'info',
                summary: 'Información',
                detail: 'No se encontraron órdenes.',
                life: 3000,
            });
        }
      },
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  // --- Métodos de Diálogos y Modales ---
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
    this.selectedOrder = order; // Guardar la orden seleccionada
    this.orderService.getOrderDetails(order.order_id).subscribe({
      next: (details) => {
        this.currentOrderDetails = details;
        this.orderDetailsDialog = true;
      },
      error: (error) => {
        console.error('Error al cargar detalles de la orden:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los detalles de la orden.',
          life: 3000,
        });
        this.currentOrderDetails = null; // Limpiar detalles anteriores
        this.orderDetailsDialog = true; // Abrir modal incluso con error, para mostrar mensaje
      },
    });
  }

  hideOrderDetailsDialog() {
    this.orderDetailsDialog = false;
    this.currentOrderDetails = null; // Limpiar los detalles al cerrar
    this.selectedOrder = null; // Limpiar la orden seleccionada
  }

  // --- Lógica de Carga de Archivo Excel ---
  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Solo se permite cargar un archivo a la vez.',
        life: 3000,
      });
      return;
    }

    const file = target.files[0];
    this.newOrder.upload_file = file.name; // Guarda el nombre del archivo

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* Coge la primera hoja de trabajo */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* Convierte los datos a un array de JSON */
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      this.parseExcelData(data);
    };
    reader.readAsBinaryString(file);
  }

  parseExcelData(excelData: any[]) {
    if (!excelData || excelData.length < 2) { // Necesitamos al menos 2 filas (encabezado + 1 fila de datos)
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Excel',
        detail: 'El archivo Excel está vacío o no tiene el formato esperado.',
        life: 3000,
      });
      this.newOrder.details = [];
      return;
    }

    const header = excelData[0]; // La primera fila es el encabezado
    const rows = excelData.slice(1); // Las demás filas son los datos

    const expectedHeaders = [
      'N°',
      'CENTRE MEDICAL',
      'REF PATIENT',
      'NOMS DU PATIENT',
      'REF ANALYSE',
      'NOMENCLATURE DE L\'EXAMEN',
      'CODE',
    ];

    // Validar encabezados (opcional, pero buena práctica)
    const isValidHeader = expectedHeaders.every((expected, index) =>
      header[index] && header[index].toString().trim().toUpperCase() === expected.toUpperCase()
    );

    if (!isValidHeader) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Formato',
        detail: 'Los encabezados del archivo Excel no coinciden con el formato esperado. Verifique: N° | CENTRE MEDICAL | REF PATIENT | NOMS DU PATIENT | REF ANALYSE | NOMENCLATURE DE L\'EXAMEN | CODE',
        life: 6000,
      });
      this.newOrder.details = [];
      return;
    }

    const details: OrderDetailPayload[] = [];
    for (const row of rows) {
      // Ignorar filas vacías o con datos insuficientes
      if (row.length < expectedHeaders.length || row.every((cell: any) => cell === null || cell === undefined || cell === '')) {
        continue;
      }
      try {
        const detail: OrderDetailPayload = {
          number: typeof row[0] === 'number' ? row[0] : parseInt(row[0], 10), // N°
          centre_medical: row[1] ? row[1].toString() : '', // CENTRE MEDICAL
          ref_patient: row[2] ? row[2].toString() : '', // REF PATIENT
          name_patient: row[3] ? row[3].toString() : '', // NOMS DU PATIENT
          ref_analyze: row[4] ? row[4].toString() : '', // REF ANALYSE
          nomenclature_examen: row[5] ? row[5].toString() : '', // NOMENCLATURE DE L'EXAMEN
          code: row[6] ? row[6].toString() : '', // CODE
        };
        // Puedes agregar más validaciones aquí si un campo específico es obligatorio
        details.push(detail);
      } catch (e) {
        console.error('Error parseando fila de Excel:', row, e);
        this.messageService.add({
          severity: 'error',
          summary: 'Error de Parseo',
          detail: 'Hubo un problema al leer una fila del archivo Excel. Asegúrese que todos los datos sean válidos.',
          life: 3000,
        });
        this.newOrder.details = [];
        return;
      }
    }

    if (details.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se encontraron datos válidos en el archivo Excel después del encabezado.',
        life: 3000,
      });
    }

    this.newOrder.details = details;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `${details.length} detalles cargados del Excel.`,
      life: 3000,
    });
  }

  // --- Métodos de Guardar y Eliminar ---
  saveNewOrder() {
    this.submitted = true;

    // Validaciones básicas antes de enviar
    if (!this.newOrder.date) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La fecha es requerida.', life: 3000 });
        return;
    }
    if (!this.newOrder.description.trim()) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La descripción es requerida.', life: 3000 });
        return;
    }
    if (!this.newOrder.upload_file.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe cargar un archivo Excel.', life: 3000 });
      return;
    }
    if (this.newOrder.details.length === 0) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El archivo Excel no contiene detalles válidos o no ha sido cargado.', life: 3000 });
        return;
    }

    // Formatear la fecha a "YYYY-MM-DD" si viene del p-calendar como Date object
    const dateFormatted = this.newOrder.date instanceof Date
        ? this.newOrder.date.toISOString().slice(0, 10)
        : this.newOrder.date;

    const payload: CreateOrderPayload = {
        ...this.newOrder,
        date: dateFormatted
    };


    this.orderService.createOrder(payload).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: response.message || 'Orden creada exitosamente.',
          life: 3000,
        });
        this.hideNewOrderDialog();
        this.loadOrders(); // Recargar la lista de órdenes para ver la nueva
      },
      error: (error) => {
        console.error('Error al crear orden:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al crear la orden.',
          life: 3000,
        });
      },
    });
  }

  deleteOrder(order: Order) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la orden con ID: ${order.order_id} y descripción "${order.description}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.orderService.deleteOrder(order.order_id).subscribe({
          next: (response) => {
            this.orders.set(this.orders().filter((val) => val.order_id !== order.order_id));
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: response.message || 'Orden eliminada exitosamente.',
              life: 3000,
            });
          },
          error: (error) => {
            console.error('Error al eliminar orden:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error al eliminar la orden.',
              life: 3000,
            });
          },
        });
      },
    });
  }

  // deleteSelectedOrders() { // Esto es si decides implementar la eliminación múltiple
  //   this.confirmationService.confirm({
  //     message: 'Are you sure you want to delete the selected orders?',
  //     header: 'Confirm',
  //     icon: 'pi pi-exclamation-triangle',
  //     accept: () => {
  //       // Lógica para eliminar múltiples órdenes
  //       // Podrías mapear los IDs y enviar un array al backend si tu API lo soporta
  //       // O hacer llamadas individuales (con cuidado con muchas peticiones)
  //       this.selectedOrders = null;
  //       this.messageService.add({
  //         severity: 'success',
  //         summary: 'Successful',
  //         detail: 'Orders Deleted',
  //         life: 3000,
  //       });
  //     },
  //   });
  // }

  getSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }
}