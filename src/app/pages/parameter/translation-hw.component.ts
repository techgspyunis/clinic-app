// File: src/app/pages/translation-hw/translation-hw.component.ts
//
// Componente principal para el CRUD de TranslationHw.
// Adaptado de ejemplos anteriores para gestionar hardware de traducción.

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
import { InputNumberModule } from 'primeng/inputnumber'; // Componente para campos numéricos (precio)
import { InputIconModule } from 'primeng/inputicon'; // Icono dentro de input
import { IconFieldModule } from 'primeng/iconfield'; // Contenedor para input con icono
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // Diálogo de confirmación
import { DialogModule } from 'primeng/dialog'; // Componente de diálogo modal
import { TagModule } from 'primeng/tag'; // Componente para etiquetas de estado
import { TooltipModule } from 'primeng/tooltip'; // Componente para tooltips

// Importar nuestros modelos y servicio
import { TranslationHw, TranslationHwCreatePayload, TranslationHwUpdatePayload } from '../../core/models/translation-hw.model';
import { TranslationHwService } from '../../core/services/translation-hw.service';
import { LoadingService } from '../../core/services/loading.service'; // Servicio para mostrar/ocultar el spinner de carga

/**
 * @interface NewTranslationHwForm
 * @description Define la estructura de los datos del formulario para crear/editar un hardware de traducción.
 */
interface NewTranslationHwForm {
  code: string;
  price: number | null; // Usamos null para permitir que el campo esté vacío inicialmente
}

@Component({
  selector: 'app-translation-hw',
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
    InputNumberModule, // Importamos InputNumberModule
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
            label="New Translation Hw"
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
        [value]="translationHw()"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['code', 'price', 'is_active']"
        [tableStyle]="{ 'min-width': '75rem' }"
        [rowHover]="true"
        dataKey="hw_id"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} hw"
        [showCurrentPageReport]="true"
        [rowsPerPageOptions]="[10, 20, 30]"
      >
        <ng-template pTemplate="caption">
          <div class="flex items-center justify-between">
            <h5 class="m-0">Translation Hw</h5>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="code" style="min-width:15rem">Code <p-sortIcon field="code" /></th>
            <th pSortableColumn="price" style="min-width:10rem">Price <p-sortIcon field="price" /></th>
            <th pSortableColumn="is_active" style="min-width:8rem">Status <p-sortIcon field="is_active" /></th>
            <th pSortableColumn="created_at" style="min-width:15rem">Created At <p-sortIcon field="created_at" /></th>
            <th pSortableColumn="updated_at" style="min-width:15rem">Updated At <p-sortIcon field="updated_at" /></th>
            <th style="min-width:12rem">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-hw>
          <tr>
            <td>{{ hw.code }}</td>
            <td>{{ hw.price | currency:'EUR':'symbol' }}</td>
            <td>
              <p-tag [value]="hw.is_active ? 'Active' : 'Inactive'" [severity]="getSeverity(hw.is_active)" />
            </td>
            <td>{{ hw.created_at | date:'yyyy-MM-dd HH:mm' }}</td>
            <td>{{ hw.updated_at ? (hw.updated_at | date:'yyyy-MM-dd HH:mm') : 'N/A' }}</td>
            <td>
              <p-button
                icon="pi pi-pencil"
                class="mr-2"
                [rounded]="true"
                [outlined]="true"
                severity="success"
                (click)="editTranslationHw(hw)"
                pTooltip="Edit"
                tooltipPosition="bottom"
              />
              <p-button
                icon="pi pi-trash"
                severity="danger"
                [rounded]="true"
                [outlined]="true"
                (click)="deactivateTranslationHw(hw)"
                pTooltip="Deactivate"
                tooltipPosition="bottom"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptyMessage">
          <tr>
            <td [attr.colspan]="6" class="text-center">No translation hw found.</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialogo para crear/editar hardware de traducción -->
    <p-dialog
      [(visible)]="translationHwDialog"
      [style]="{ width: '450px' }"
      [header]="dialogHeader"
      [modal]="true"
      styleClass="p-fluid"
    >
      <ng-template pTemplate="content">
        <div class="field col-12 md:col-6">
            <div>
                <label for="code" class="block font-bold mb-2">Code</label>
                <input
                type="text"
                pInputText
                id="code"
                [(ngModel)]="currentTranslationHw.code"
                required
                autofocus
                class="w-full"
                />
                <small class="p-error" *ngIf="submitted && !currentTranslationHw.code"
                >Code is required.</small
                >
            </div>
            <div>
                <label for="price" class="block font-bold mb-2">Price</label>
                <p-inputNumber
                id="price"
                [(ngModel)]="currentTranslationHw.price"
                mode="decimal"
                [minFractionDigits]="2"
                [maxFractionDigits]="2"
                [min]="0"
                required
                class="w-full"
                ></p-inputNumber>
                <small
                class="p-error"
                *ngIf="submitted && (currentTranslationHw.price === null || currentTranslationHw.price === undefined || currentTranslationHw.price < 0)"
                >Price is required and must be non-negative.</small
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
          (click)="saveTranslationHw()"
        />
      </ng-template>
    </p-dialog>
  `,
  providers: [MessageService, ConfirmationService, DatePipe] // DatePipe es necesario si se usa en la plantilla
})
export class TranslationHwComponent implements OnInit {
  @ViewChild('dt') dt!: Table; // Referencia a la tabla de PrimeNG para el filtrado global

  translationHw = signal<TranslationHw[]>([]); // Signal para almacenar la lista de hardware de traducción
  translationHwDialog: boolean = false; // Controla la visibilidad del diálogo de creación/edición
  submitted: boolean = false; // Indica si el formulario ha sido enviado (para mostrar validaciones)
  dialogHeader: string = 'Create Translation Hw'; // Título del diálogo (cambia entre "Crear" y "Editar")

  // Objeto para almacenar los datos del hardware de traducción actual en el formulario
  currentTranslationHw: Partial<TranslationHw> = {
    code: '',
    price: null,
  };

  constructor(
    private translationHwService: TranslationHwService, // Servicio para interactuar con la API
    private messageService: MessageService, // Servicio para mostrar mensajes toast
    private confirmationService: ConfirmationService, // Servicio para diálogos de confirmación
    private loadingService: LoadingService // Servicio para controlar el estado de carga global
  ) {}

  ngOnInit() {
    this.loadTranslationHw(); // Carga el hardware de traducción al inicializar el componente
  }

  /**
   * Carga todo el hardware de traducción desde la API.
   * Muestra y oculta el spinner de carga.
   */
  loadTranslationHw() {
    this.loadingService.show(); // Muestra el spinner de carga
    this.translationHwService.getTranslationHw().subscribe({
      next: (data) => {
        this.translationHw.set(data); // Actualiza la signal con los datos recibidos
        this.loadingService.hide(); // Oculta el spinner de carga
      },
      error: (error) => {
        console.error('Error loading translation hw:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load translation hw.',
          life: 3000,
        });
        this.loadingService.hide(); // Oculta el spinner de carga en caso de error
        // Si no hay datos (ej. 404 Not Found), mostramos un mensaje informativo.
        if (error.status === 404) {
          this.translationHw.set([]); // Limpia la tabla si no se encuentran datos
          this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'No translation hw found.',
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
   * Abre el diálogo para crear un nuevo hardware de traducción.
   * Reinicia el formulario y establece el título del diálogo.
   */
  openNew() {
    this.currentTranslationHw = { code: '', price: null }; // Reinicia el objeto del formulario
    this.submitted = false; // Reinicia el estado de envío del formulario
    this.translationHwDialog = true; // Muestra el diálogo
    this.dialogHeader = 'Create Translation Hw'; // Establece el título del diálogo
  }

  /**
   * Abre el diálogo para editar un hardware de traducción existente.
   * Carga los datos del hardware en el formulario y establece el título del diálogo.
   * @param hw El objeto TranslationHw a editar.
   */
  editTranslationHw(hw: TranslationHw) {
    this.currentTranslationHw = { ...hw }; // Clona el objeto para evitar mutación directa de los datos de la tabla
    this.translationHwDialog = true; // Muestra el diálogo
    this.dialogHeader = 'Edit Translation Hw'; // Establece el título del diálogo
  }

  /**
   * Oculta el diálogo de creación/edición y reinicia el estado de envío del formulario.
   */
  hideDialog() {
    this.translationHwDialog = false; // Oculta el diálogo
    this.submitted = false; // Reinicia el estado de envío
  }

  /**
   * Guarda o actualiza un hardware de traducción.
   * Realiza validaciones básicas y llama al servicio correspondiente.
   */
  saveTranslationHw() {
    this.submitted = true; // Marca el formulario como enviado para activar las validaciones

    // Validación básica del formulario
    if (!this.currentTranslationHw.code?.trim() || this.currentTranslationHw.price === null || this.currentTranslationHw.price === undefined || this.currentTranslationHw.price < 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Code and a valid non-negative price are required.', life: 3000 });
      return; // Detiene la ejecución si la validación falla
    }

    this.loadingService.show(); // Muestra el spinner de carga

    // Determina si es una operación de actualización o creación
    if (this.currentTranslationHw.hw_id) {
      // Es una actualización si el hardware ya tiene un ID
      const payload: TranslationHwUpdatePayload = {
        code: this.currentTranslationHw.code,
        price: this.currentTranslationHw.price,
      };
      this.translationHwService.updateTranslationHw(this.currentTranslationHw.hw_id, payload).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message || 'Translation hw updated successfully.', life: 3000 });
          this.hideDialog(); // Cierra el diálogo
          this.loadTranslationHw(); // Recarga la lista para ver el cambio
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error updating translation hw:', error);
          this.loadingService.hide();
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error?.error || 'Error updating translation hw.', life: 3000 });
        },
        complete: () => this.loadingService.hide() // Oculta el spinner al completar (éxito o error)
      });
    } else {
      // Es una creación si el hardware no tiene un ID
      const payload: TranslationHwCreatePayload = {
        code: this.currentTranslationHw.code,
        price: this.currentTranslationHw.price,
      };
      this.translationHwService.createTranslationHw(payload).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message || 'Translation hw created successfully.', life: 3000 });
          this.hideDialog(); // Cierra el diálogo
          this.loadTranslationHw(); // Recarga la lista para ver el nuevo registro
        },
        error: (error) => {
          console.error('Error creating translation hw:', error);
          this.loadingService.hide();
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error?.error || 'Error creating translation hw.', life: 3000 });
        },
        complete: () => this.loadingService.hide() // Oculta el spinner al completar (éxito o error)
      });
    }
  }

  /**
   * Desactiva un hardware de traducción después de la confirmación del usuario.
   * Llama al servicio de eliminación (que realiza una desactivación lógica).
   * @param hw El objeto TranslationHw a desactivar.
   */
  deactivateTranslationHw(hw: TranslationHw) {
    this.confirmationService.confirm({
      message: `Are you sure you want to deactivate translation hw "${hw.code}"?`,
      header: 'Confirm Deactivation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loadingService.show(); // Muestra el spinner de carga
        this.translationHwService.deactivateTranslationHw(hw.hw_id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Translation hw deactivated successfully.',
              life: 3000,
            });
            this.loadTranslationHw(); // Recarga la lista para ver el cambio de estado
          },
          error: (error) => {
            console.error('Error deactivating translation hw:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.error || 'Error deactivating the translation hw.',
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
   * @param isActive Booleano que indica si el hardware de traducción está activo.
   * @returns La cadena de severidad ('success' para activo, 'danger' para inactivo).
   */
  getSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }
}
