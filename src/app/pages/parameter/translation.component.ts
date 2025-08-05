// File: src/app/pages/translation/translation.component.ts
//
// Componente principal para el CRUD de Translation.
// Gestiona la interfaz de usuario y la lógica para las traducciones.

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
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown'; // Necesario para los dropdowns de code_labo y code_hw

// Importar nuestros modelos y servicios
import { Translation, TranslationCreatePayload, TranslationUpdatePayload } from '../../core/models/translation.model';
import { TranslationService } from '../../core/services/translation.service';
import { LoadingService } from '../../core/services/loading.service';
import { TranslationLaboService } from '../../core/services/translation-labo.service'; // Para obtener códigos de labo
import { TranslationHwService } from '../../core/services/translation-hw.service'; // Para obtener códigos de hw
import { TranslationLabo } from '../../core/models/translation-labo.model'; // Modelo para TranslationLabo
import { TranslationHw } from '../../core/models/translation-hw.model'; // Modelo para TranslationHw


/**
 * @interface NewTranslationForm
 * @description Define la estructura de los datos del formulario para crear/editar una traducción.
 */
interface NewTranslationForm {
  name: string;
  code_labo: string;
  code_hw: string;
}

@Component({
  selector: 'app-translation',
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
    TooltipModule,
    DropdownModule // Importamos DropdownModule
  ],
  template: `
    <p-toast />
    <p-confirmdialog />

    <div class="card">
      <p-toolbar styleClass="mb-4">
        <ng-template pTemplate="left">
          <p-button
            label="New Translation"
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
        [value]="translations()"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['name', 'code_labo', 'code_hw', 'is_active']"
        [tableStyle]="{ 'min-width': '75rem' }"
        [rowHover]="true"
        dataKey="translation_id"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} traducciones"
        [showCurrentPageReport]="true"
        [rowsPerPageOptions]="[10, 20, 30]"
      >
        <ng-template pTemplate="caption">
          <div class="flex items-center justify-between">
            <h5 class="m-0">Translations</h5>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="name" style="min-width:20rem">Name/Nomenclature <p-sortIcon field="name" /></th>
            <th pSortableColumn="code_labo" style="min-width:10rem">Lab Code <p-sortIcon field="code_labo" /></th>
            <th pSortableColumn="code_hw" style="min-width:10rem">Hw Code <p-sortIcon field="code_hw" /></th>
            <th pSortableColumn="is_active" style="min-width:8rem">Status <p-sortIcon field="is_active" /></th>
            <th pSortableColumn="created_at" style="min-width:15rem">Created At <p-sortIcon field="created_at" /></th>
            <th pSortableColumn="updated_at" style="min-width:15rem">Updated At <p-sortIcon field="updated_at" /></th>
            <th style="min-width:12rem">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-translation>
          <tr>
            <td>{{ translation.name }}</td>
            <td>{{ translation.code_labo }}</td>
            <td>{{ translation.code_hw }}</td>
            <td>
              <p-tag [value]="translation.is_active ? 'Active' : 'Inactive'" [severity]="getSeverity(translation.is_active)" />
            </td>
            <td>{{ translation.created_at | date:'yyyy-MM-dd HH:mm' }}</td>
            <td>{{ translation.updated_at ? (translation.updated_at | date:'yyyy-MM-dd HH:mm') : 'N/A' }}</td>
            <td>
              <p-button
                icon="pi pi-pencil"
                class="mr-2"
                [rounded]="true"
                [outlined]="true"
                severity="success"
                (click)="editTranslation(translation)"
                pTooltip="Edit"
                tooltipPosition="bottom"
              />
              <p-button
                icon="pi pi-trash"
                severity="danger"
                [rounded]="true"
                [outlined]="true"
                (click)="deactivateTranslation(translation)"
                pTooltip="Deactivate"
                tooltipPosition="bottom"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptyMessage">
          <tr>
            <td [attr.colspan]="7" class="text-center">No translations found.</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialogo para crear/editar traducción -->
    <p-dialog
      [(visible)]="translationDialog"
      [style]="{ width: '450px' }"
      [header]="dialogHeader"
      [modal]="true"
      styleClass="p-fluid"
    >
      <ng-template pTemplate="content">
        <div class="field col-12 md:col-6">
            <div>
                <label for="name" class="block font-bold mb-2">Name/Nomenclature</label>
                <input
                type="text"
                pInputText
                id="name"
                [(ngModel)]="currentTranslation.name"
                required
                autofocus
                class="w-full"
                />
                <small class="p-error" *ngIf="submitted && !currentTranslation.name"
                >Name/Nomenclature is required.</small
                >
            </div>
            <div>
                <label for="code_labo" class="block font-bold mb-2">Lab Code</label>
                <p-dropdown
                id="code_labo"
                [options]="laboCodes"
                [(ngModel)]="currentTranslation.code_labo"
                placeholder="Select a Lab Code"
                optionLabel="code"
                optionValue="code"
                [filter]="true"
                required
                class="w-full"
                ></p-dropdown>
                <small
                class="p-error"
                *ngIf="submitted && !currentTranslation.code_labo"
                >Lab Code is required.</small
                >
            </div>
            <div>
                <label for="code_hw" class="block font-bold mb-2">Hw Code</label>
                <p-dropdown
                id="code_hw"
                [options]="hwCodes"
                [(ngModel)]="currentTranslation.code_hw"
                placeholder="Select a Hw Code"
                optionLabel="code"
                optionValue="code"
                [filter]="true"
                required
                class="w-full"
                ></p-dropdown>
                <small
                class="p-error"
                *ngIf="submitted && !currentTranslation.code_hw"
                >Hw Code is required.</small
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
          (click)="saveTranslation()"
        />
      </ng-template>
    </p-dialog>
  `,
  providers: [MessageService, ConfirmationService, DatePipe]
})
export class TranslationComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  translations = signal<Translation[]>([]);
  translationDialog: boolean = false;
  submitted: boolean = false;
  dialogHeader: string = 'Create Translation';

  // Opciones para los dropdowns de códigos de laboratorio y Hw
  laboCodes: TranslationLabo[] = [];
  hwCodes: TranslationHw[] = [];

  currentTranslation: Partial<Translation> = {
    name: '',
    code_labo: '',
    code_hw: '',
  };

  constructor(
    private translationService: TranslationService,
    private translationLaboService: TranslationLaboService, // Inyectamos el servicio de Labos
    private translationHwService: TranslationHwService,     // Inyectamos el servicio de Hw
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.loadTranslations();
    this.loadLaboCodes(); // Cargar los códigos de laboratorio
    this.loadHwCodes();   // Cargar los códigos de Hw
  }

  /**
   * Carga todas las traducciones desde la API.
   */
  loadTranslations() {
    this.loadingService.show();
    this.translationService.getTranslations().subscribe({
      next: (data) => {
        this.translations.set(data);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading translations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load translations.',
          life: 3000,
        });
        this.loadingService.hide();
        if (error.status === 404) {
          this.translations.set([]);
          this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'No translations found.',
            life: 3000,
          });
        }
      },
    });
  }

  /**
   * Carga los códigos de laboratorio desde el servicio TranslationLaboService.
   */
  loadLaboCodes() {
    this.translationLaboService.getTranslationLabos().subscribe({
      next: (data) => {
        // Filtramos para mostrar solo los activos y mapeamos a la estructura necesaria para p-dropdown
        this.laboCodes = data.filter(labo => labo.is_active);
      },
      error: (error) => {
        console.error('Error loading labo codes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load lab codes for dropdown.',
          life: 3000,
        });
      }
    });
  }

  /**
   * Carga los códigos de Hw desde el servicio TranslationHwService.
   */
  loadHwCodes() {
    this.translationHwService.getTranslationHw().subscribe({
      next: (data) => {
        // Filtramos para mostrar solo los activos y mapeamos a la estructura necesaria para p-dropdown
        this.hwCodes = data.filter(hw => hw.is_active);
      },
      error: (error) => {
        console.error('Error loading Hw codes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load Hw codes for dropdown.',
          life: 3000,
        });
      }
    });
  }


  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.currentTranslation = { name: '', code_labo: '', code_hw: '' };
    this.submitted = false;
    this.translationDialog = true;
    this.dialogHeader = 'Create Translation';
  }

  editTranslation(translation: Translation) {
    this.currentTranslation = { ...translation };
    this.translationDialog = true;
    this.dialogHeader = 'Edit Translation';
  }

  hideDialog() {
    this.translationDialog = false;
    this.submitted = false;
  }

  saveTranslation() {
    this.submitted = true;

    if (!this.currentTranslation.name?.trim() || !this.currentTranslation.code_labo?.trim() || !this.currentTranslation.code_hw?.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Name, Lab Code, and Hw Code are required.', life: 3000 });
      return;
    }

    this.loadingService.show();

    if (this.currentTranslation.translation_id) {
      const payload: TranslationUpdatePayload = {
        name: this.currentTranslation.name,
        code_labo: this.currentTranslation.code_labo,
        code_hw: this.currentTranslation.code_hw,
      };
      this.translationService.updateTranslation(this.currentTranslation.translation_id, payload).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message || 'Translation updated successfully.', life: 3000 });
          this.hideDialog();
          this.loadTranslations();
        },
        error: (error) => {
          console.error('Error updating translation:', error);
          this.loadingService.hide();
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error?.error || 'Error updating translation.', life: 3000 });
        },
        complete: () => this.loadingService.hide()
      });
    } else {
      const payload: TranslationCreatePayload = {
        name: this.currentTranslation.name,
        code_labo: this.currentTranslation.code_labo,
        code_hw: this.currentTranslation.code_hw,
      };
      this.translationService.createTranslation(payload).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message || 'Translation created successfully.', life: 3000 });
          this.hideDialog();
          this.loadTranslations();
        },
        error: (error) => {
          this.loadingService.hide();
          console.error('Error creating translation:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error?.error || 'Error creating translation.', life: 3000 });
        },
        complete: () => this.loadingService.hide()
      });
    }
  }

  deactivateTranslation(translation: Translation) {
    this.confirmationService.confirm({
      message: `Are you sure you want to deactivate translation "${translation.name}"?`,
      header: 'Confirm Deactivation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loadingService.show();
        this.translationService.deactivateTranslation(translation.translation_id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Translation deactivated successfully.',
              life: 3000,
            });
            this.loadTranslations();
          },
          error: (error) => {
            console.error('Error deactivating translation:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.error || 'Error deactivating the translation.',
              life: 3000,
            });
          },
          complete: () => this.loadingService.hide()
        });
      },
    });
  }

  getSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }
}
