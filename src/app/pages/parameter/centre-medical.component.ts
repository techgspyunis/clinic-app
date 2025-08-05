// File: src/app/pages/centre-medical/centre-medical.component.ts
//
// Componente principal para el CRUD de CentreMedical.
// Adaptado del ejemplo 'ordercomponent' para gestionar centros médicos.

import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // DatePipe es útil para formatear fechas si se muestran
import { FormsModule } from '@angular/forms'; // Necesario para ngModel en los formularios
import { ConfirmationService, MessageService } from 'primeng/api'; // Servicios para confirmación y mensajes toast
import { Table, TableModule } from 'primeng/table'; // Componente de tabla de PrimeNG
import { ButtonModule } from 'primeng/button'; // Componente de botón de PrimeNG
import { RippleModule } from 'primeng/ripple'; // Efecto ripple para botones
import { ToastModule } from 'primeng/toast'; // Componente para mostrar mensajes toast
import { ToolbarModule } from 'primeng/toolbar'; // Componente de barra de herramientas
import { InputTextModule } from 'primeng/inputtext'; // Componente para campos de texto
import { InputIconModule } from 'primeng/inputicon'; // Icono dentro de input
import { IconFieldModule } from 'primeng/iconfield'; // Contenedor para input con icono
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // Diálogo de confirmación
import { DialogModule } from 'primeng/dialog'; // Componente de diálogo modal
import { TagModule } from 'primeng/tag'; // Componente para etiquetas de estado
import { TooltipModule } from 'primeng/tooltip'; // Componente para tooltips

// Importar nuestros modelos y servicio
import { CentreMedical, CentreMedicalCreatePayload, CentreMedicalUpdatePayload } from '../../core/models/centre-medical.model';
import { CentreMedicalService } from '../../core/services/centre-medical.service';
import { LoadingService } from '../../core/services/loading.service'; // Servicio para mostrar/ocultar el spinner de carga

/**
 * @interface NewMedicalCenterForm
 * @description Define la estructura de los datos del formulario para crear/editar un centro médico.
 */
interface NewMedicalCenterForm {
  name: string;
  abbreviation: string;
}

@Component({
  selector: 'app-centre-medical',
  standalone: true, // Indica que el componente es independiente y no necesita un NgModule
  imports: [
    CommonModule, // Módulo común de Angular para directivas como ngIf, ngFor
    FormsModule, // Módulo para formularios basados en plantillas (ngModel)
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
    TooltipModule // Importamos el módulo de tooltips
  ],
  template: `
    <p-toast /> <!-- Componente para mostrar mensajes toast -->
    <p-confirmdialog /> <!-- Componente para diálogos de confirmación -->

    <div class="card">
      <p-toolbar styleClass="mb-4">
        <ng-template pTemplate="left">
          <p-button
            label="New Medical Center"
            icon="pi pi-plus"
            severity="secondary"
            class="mr-2"
            (onClick)="openNew()"
          />
        </ng-template>
        <ng-template pTemplate="right">
          <p-iconfield iconPosition="left">
            <p-inputicon styleClass="pi pi-search" />
            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
          </p-iconfield>
        </ng-template>
      </p-toolbar>

      <p-table
        #dt
        [value]="medicalCenters()"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['name', 'abbreviation', 'is_active']"
        [tableStyle]="{ 'min-width': '75rem' }"
        [rowHover]="true"
        dataKey="centre_id"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} centros"
        [showCurrentPageReport]="true"
        [rowsPerPageOptions]="[10, 20, 30]"
      >
        <ng-template pTemplate="caption">
          <div class="flex items-center justify-between">
            <h5 class="m-0">Medical Centers</h5>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="name" style="min-width:15rem">Name <p-sortIcon field="name" /></th>
            <th pSortableColumn="abbreviation" style="min-width:10rem">Abbreviation <p-sortIcon field="abbreviation" /></th>
            <th pSortableColumn="is_active" style="min-width:8rem">Status <p-sortIcon field="is_active" /></th>
            <th pSortableColumn="created_at" style="min-width:15rem">Created At <p-sortIcon field="created_at" /></th>
            <th pSortableColumn="updated_at" style="min-width:15rem">Updated At <p-sortIcon field="updated_at" /></th>
            <th style="min-width:12rem">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-center>
          <tr>
            <td>{{ center.name }}</td>
            <td>{{ center.abbreviation }}</td>
            <td>
              <p-tag [value]="center.is_active ? 'Active' : 'Inactive'" [severity]="getSeverity(center.is_active)" />
            </td>
            <td>{{ center.created_at | date:'yyyy-MM-dd HH:mm' }}</td>
            <td>{{ center.updated_at ? (center.updated_at | date:'yyyy-MM-dd HH:mm') : 'N/A' }}</td>
            <td>
              <p-button
                icon="pi pi-pencil"
                class="mr-2"
                [rounded]="true"
                [outlined]="true"
                severity="success"
                (click)="editMedicalCenter(center)"
                pTooltip="Edit"
                tooltipPosition="bottom"
              />
              <p-button
                icon="pi pi-trash"
                severity="danger"
                [rounded]="true"
                [outlined]="true"
                (click)="deactivateMedicalCenter(center)"
                pTooltip="Deactivate"
                tooltipPosition="bottom"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptyMessage">
          <tr>
            <td [attr.colspan]="6" class="text-center">No medical centers found.</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialogo para crear/editar centro médico -->
    <p-dialog
      [(visible)]="medicalCenterDialog"
      [style]="{ width: '450px' }"
      [header]="dialogHeader"
      [modal]="true"
      styleClass="p-fluid"
    >
      <ng-template pTemplate="content">
        <div class="field col-12 md:col-6">
            <div>
                <label for="name" class="block font-bold mb-2">Name</label>
                <input
                    type="text"
                    pInputText
                    id="name"
                    [(ngModel)]="currentMedicalCenter.name"
                    required
                    autofocus
                    class="w-full"
                />
                <small class="p-error" *ngIf="submitted && !currentMedicalCenter.name"
                    >Name is required.</small
                >
            </div>
            <div>
                          <label for="abbreviation" class="block font-bold mb-2">Abbreviation</label>
          <input
            type="text"
            pInputText
            id="abbreviation"
            [(ngModel)]="currentMedicalCenter.abbreviation"
            required
            class="w-full"
          />
          <small
            class="p-error"
            *ngIf="submitted && !currentMedicalCenter.abbreviation"
            >Abbreviation is required.</small
          >
            </div>

        </div>



      </ng-template>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancel"
          icon="pi pi-times"
          text
          (click)="hideDialog()"
        />
        <p-button
          label="Save"
          icon="pi pi-check"
          (click)="saveMedicalCenter()"
        />
      </ng-template>
    </p-dialog>
  `,
  providers: [MessageService, ConfirmationService, DatePipe] // DatePipe es necesario si se usa en la plantilla
})
export class CentreMedicalComponent implements OnInit {
  @ViewChild('dt') dt!: Table; // Referencia a la tabla de PrimeNG para el filtrado global

  medicalCenters = signal<CentreMedical[]>([]); // Signal para almacenar la lista de centros médicos
  medicalCenterDialog: boolean = false; // Controla la visibilidad del diálogo de creación/edición
  submitted: boolean = false; // Indica si el formulario ha sido enviado (para mostrar validaciones)
  dialogHeader: string = 'Create Medical Center'; // Título del diálogo (cambia entre "Crear" y "Editar")

  // Objeto para almacenar los datos del centro médico actual en el formulario
  currentMedicalCenter: Partial<CentreMedical> = {
    name: '',
    abbreviation: '',
  };

  constructor(
    private centreMedicalService: CentreMedicalService, // Servicio para interactuar con la API
    private messageService: MessageService, // Servicio para mostrar mensajes toast
    private confirmationService: ConfirmationService, // Servicio para diálogos de confirmación
    private loadingService: LoadingService // Servicio para controlar el estado de carga global
  ) {}

  ngOnInit() {
    this.loadMedicalCenters(); // Carga los centros médicos al inicializar el componente
  }

  /**
   * Carga todos los centros médicos desde la API.
   * Muestra y oculta el spinner de carga.
   */
  loadMedicalCenters() {
    this.loadingService.show(); // Muestra el spinner de carga
    this.centreMedicalService.getCentres().subscribe({
      next: (data) => {
        this.medicalCenters.set(data); // Actualiza la signal con los datos recibidos
        this.loadingService.hide(); // Oculta el spinner de carga
      },
      error: (error) => {
        console.error('Error loading medical centers:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load medical centers.',
          life: 3000,
        });
        this.loadingService.hide(); // Oculta el spinner de carga en caso de error
        // Si no hay datos (ej. 404 Not Found), mostramos un mensaje informativo.
        if (error.status === 404) {
          this.medicalCenters.set([]); // Limpia la tabla si no se encuentran datos
          this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'No medical centers found.',
            life: 3000,
          });
        }
      },
    });
  }

  /**
   * Filtra la tabla globalmente en base al valor de entrada.
   * @param table La instancia de la tabla de PrimeNG.
   * @param event El evento de entrada del campo de búsqueda.
   */
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  /**
   * Abre el diálogo para crear un nuevo centro médico.
   * Reinicia el formulario y establece el título del diálogo.
   */
  openNew() {
    this.currentMedicalCenter = { name: '', abbreviation: '' }; // Reinicia el objeto del formulario
    this.submitted = false; // Reinicia el estado de envío del formulario
    this.medicalCenterDialog = true; // Muestra el diálogo
    this.dialogHeader = 'Create Medical Center'; // Establece el título del diálogo
  }

  /**
   * Abre el diálogo para editar un centro médico existente.
   * Carga los datos del centro en el formulario y establece el título del diálogo.
   * @param center El objeto CentreMedical a editar.
   */
  editMedicalCenter(center: CentreMedical) {
    this.currentMedicalCenter = { ...center }; // Clona el objeto para evitar mutación directa de los datos de la tabla
    this.medicalCenterDialog = true; // Muestra el diálogo
    this.dialogHeader = 'Edit Medical Center'; // Establece el título del diálogo
  }

  /**
   * Oculta el diálogo de creación/edición y reinicia el estado de envío del formulario.
   */
  hideDialog() {
    this.medicalCenterDialog = false; // Oculta el diálogo
    this.submitted = false; // Reinicia el estado de envío
  }

  /**
   * Guarda o actualiza un centro médico.
   * Realiza validaciones básicas y llama al servicio correspondiente.
   */
  saveMedicalCenter() {
    this.submitted = true; // Marca el formulario como enviado para activar las validaciones

    // Validación básica del formulario
    if (!this.currentMedicalCenter.name?.trim() || !this.currentMedicalCenter.abbreviation?.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Name and abbreviation are required.', life: 3000 });
      return; // Detiene la ejecución si la validación falla
    }

    this.loadingService.show(); // Muestra el spinner de carga

    // Determina si es una operación de actualización o creación
    if (this.currentMedicalCenter.centre_id) {
      // Es una actualización si el centro médico ya tiene un ID
      const payload: CentreMedicalUpdatePayload = {
        name: this.currentMedicalCenter.name,
        abbreviation: this.currentMedicalCenter.abbreviation,
      };
      this.centreMedicalService.updateCentre(this.currentMedicalCenter.centre_id, payload).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message || 'Medical center updated successfully.', life: 3000 });
          this.hideDialog(); // Cierra el diálogo
          this.loadMedicalCenters(); // Recarga la lista para ver el cambio
        },
        error: (error) => {
          console.error('Error updating medical center:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error?.message || 'Error updating medical center.', life: 3000 });
        },
        complete: () => this.loadingService.hide() // Oculta el spinner al completar (éxito o error)
      });
    } else {
      // Es una creación si el centro médico no tiene un ID
      const payload: CentreMedicalCreatePayload = {
        name: this.currentMedicalCenter.name,
        abbreviation: this.currentMedicalCenter.abbreviation,
      };
      this.centreMedicalService.createCentre(payload).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message || 'Medical center created successfully.', life: 3000 });
          this.hideDialog(); // Cierra el diálogo
          this.loadMedicalCenters(); // Recarga la lista para ver el nuevo registro
        },
        error: (error) => {
          console.error('Error creating medical center:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error?.message || 'Error creating medical center.', life: 3000 });
        },
        complete: () => this.loadingService.hide() // Oculta el spinner al completar (éxito o error)
      });
    }
  }

  /**
   * Desactiva un centro médico después de la confirmación del usuario.
   * Llama al servicio de eliminación (que realiza una desactivación lógica).
   * @param center El objeto CentreMedical a desactivar.
   */
  deactivateMedicalCenter(center: CentreMedical) {
    this.confirmationService.confirm({
      message: `Are you sure you want to deactivate medical center "${center.name}"?`,
      header: 'Confirm Deactivation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loadingService.show(); // Muestra el spinner de carga
        this.centreMedicalService.deleteCentre(center.centre_id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Medical center deactivated successfully.',
              life: 3000,
            });
            this.loadMedicalCenters(); // Recarga la lista para ver el cambio de estado
          },
          error: (error) => {
            console.error('Error deactivating medical center:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error deactivating the medical center.',
              life: 3000,
            });
          },
          complete: () => this.loadingService.hide() // Oculta el spinner al completar (éxito o error)
        });
      },
    });
  }

  /**
   * Obtiene la severidad (color) para la etiqueta de estado de PrimeNG.
   * @param isActive Booleano que indica si el centro médico está activo.
   * @returns La cadena de severidad ('success' para activo, 'danger' para inactivo).
   */
  getSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }
}
