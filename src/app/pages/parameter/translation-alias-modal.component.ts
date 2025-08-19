// File: src/app/components/translation-alias/translation-alias-modal.component.ts
//
// Modal component for managing translation aliases (CRUD).
// Follows the structure of the reference component for similar usage.

import { Component, Input, OnInit, OnDestroy, ViewChild, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

// Import our models and services
import { TranslationAlias, TranslationAliasCreatePayload, TranslationAliasUpdatePayload } from '../../core/models/translation-alias.model';
import { TranslationAliasService } from '../../core/services/translation-alias.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-translation-alias-modal',
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
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmdialog />

    <div class="card p-4">
      <p-toolbar styleClass="mb-4">
        <div class="p-toolbar-group-start">
          <p-button
            label="New Alias"
            icon="pi pi-plus"
            severity="secondary"
            class="mr-2"
            (onClick)="openNew()"
          />
        </div>
        <div class="p-toolbar-group-end">
          <p-iconfield iconPosition="left">
            <p-inputicon styleClass="pi pi-search" />
            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
          </p-iconfield>
        </div>
      </p-toolbar>

      <p-table
        #dt
        [value]="translationAliases()"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['name', 'is_active']"
        [rowHover]="true"
        dataKey="t_alias_id"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} aliases"
        [rowsPerPageOptions]="[10, 20, 30]"
        [loading]="loadingTable"
      >
        <ng-template pTemplate="caption">
          <div class="flex items-center justify-between">
            <h5 class="m-0">Translation Alias Management for Translation ID: {{ translationId }}</h5>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="name">Name <p-sortIcon field="name" /></th>
            <th pSortableColumn="is_active">Status <p-sortIcon field="is_active" /></th>
            <th pSortableColumn="created_at">Created <p-sortIcon field="created_at" /></th>
            <th>Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-alias>
          <tr>
            <td>{{ alias.name }}</td>
            <td>
              <p-tag [value]="alias.is_active ? 'Active' : 'Inactive'" [severity]="getSeverity(alias.is_active)" />
            </td>
            <td>{{ alias.created_at | date:'yyyy-MM-dd HH:mm' }}</td>
            <td>
              <p-button
                icon="pi pi-pencil"
                class="mr-2"
                [rounded]="true"
                [outlined]="true"
                severity="success"
                (click)="editAlias(alias)"
                pTooltip="Edit"
                tooltipPosition="bottom"
              />
              <p-button
                icon="pi pi-trash"
                severity="danger"
                [rounded]="true"
                [outlined]="true"
                (click)="deactivateAlias(alias)"
                pTooltip="Deactivate"
                tooltipPosition="bottom"
                [disabled]="!alias.is_active"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="4" class="text-center">No aliases found.</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Dialog for creating/editing an alias -->
    <p-dialog
      [(visible)]="dialogVisible"
      [style]="{width: '450px'}"
      [header]="dialogHeader"
      [modal]="true"
      styleClass="p-fluid"
    >
      <ng-template pTemplate="content">
        <div class="field col-12 md:col-6">
          <div>
            <label for="name" class="block font-bold mb-2">Alias Name</label>
            <input
            type="text"
            pInputText
            id="name"
            [(ngModel)]="currentAlias.name"
            required
            autofocus
            class="w-full"
            [ngClass]="{'ng-invalid ng-dirty': submitted && !currentAlias.name}"
            />
            <small class="p-error" *ngIf="submitted && !currentAlias.name">Name is required.</small>
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
          (click)="saveAlias()"
        />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .card {
      background: var(--surface-card);
      padding: 2rem;
      border-radius: 10px;
      margin-bottom: 2rem;
    }
  `]
})
export class TranslationAliasModalComponent implements OnInit, OnDestroy {
  @ViewChild('dt') dt!: Table;

  @Input() translationId!: string;

  translationAliases = signal<TranslationAlias[]>([]);
  dialogVisible: boolean = false;
  submitted: boolean = false;
  dialogHeader: string = 'Create Alias';

  currentAlias: Partial<TranslationAlias> = {};

  loadingTable: boolean = true;

  private destroy$ = new Subject<void>();

  constructor(
    private service: TranslationAliasService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private loadingService: LoadingService,
    private datePipe: DatePipe // Although not used directly in the TS, it's needed for the date pipe in the template
  ) {}

  ngOnInit(): void {
    this.loadTranslationAliases();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads the translation aliases for the provided translation ID.
   */
  loadTranslationAliases(): void {
    if (!this.translationId) {
      console.error('translationId is not defined.');
      return;
    }

    this.loadingTable = true;
    this.service.getTranslationAliases(this.translationId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.translationAliases.set(response);
        this.loadingTable = false;
      },
      error: (err) => {
        console.error('Error loading aliases:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load aliases.'
        });
        this.loadingTable = false;
        this.translationAliases.set([]); // Clear the table in case of error
      }
    });
  }

  /**
   * Filters the table globally.
   * @param table The PrimeNG table instance.
   * @param event The input event.
   */
  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  /**
   * Opens the dialog to create a new alias.
   */
  openNew(): void {
    this.currentAlias = {};
    this.submitted = false;
    this.dialogVisible = true;
    this.dialogHeader = 'Create New Alias';
  }

  /**
   * Opens the dialog to edit an existing alias.
   * @param alias The alias to edit.
   */
  editAlias(alias: TranslationAlias): void {
    this.currentAlias = { ...alias };
    this.dialogVisible = true;
    this.dialogHeader = 'Edit Alias';
  }

  /**
   * Hides the dialog and resets the state.
   */
  hideDialog(): void {
    this.dialogVisible = false;
    this.submitted = false;
  }

  /**
   * Saves an alias (creates or updates).
   */
  saveAlias(): void {
    this.submitted = true;

    if (!this.currentAlias.name?.trim()) {
      return;
    }

    this.loadingService.show();
    if (this.currentAlias.t_alias_id) {
      // Logic to update
      const updatePayload: TranslationAliasUpdatePayload = { name: this.currentAlias.name };
      this.service.updateTranslationAlias(this.currentAlias.t_alias_id, updatePayload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'Alias updated successfully.',
            life: 3000
          });
          this.loadingService.hide();
          this.hideDialog();
          this.loadTranslationAliases();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to update alias.'
          });
          this.loadingService.hide();
        }
      });
    } else {
      // Logic to create
      const createPayload: TranslationAliasCreatePayload = {
        translation_id: this.translationId,
        name: this.currentAlias.name
      };
      this.service.createTranslationAlias(createPayload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'Alias created successfully.',
            life: 3000
          });
          this.loadingService.hide();
          this.hideDialog();
          this.loadTranslationAliases();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to create alias.'
          });
          this.loadingService.hide();
        }
      });
    }
  }

  /**
   * Deactivates a translation alias.
   * @param alias The alias to deactivate.
   */
  deactivateAlias(alias: TranslationAlias): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to deactivate the alias "${alias.name}"?`,
      header: 'Confirm Deactivation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loadingService.show();
        this.service.deactivateTranslationAlias(alias.t_alias_id).pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message || 'Alias deactivated successfully.',
              life: 3000
            });
            this.loadingService.hide();
            this.loadTranslationAliases();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to deactivate the alias.'
            });
            this.loadingService.hide();
          }
        });
      }
    });
  }

  /**
   * Returns the severity for the status tag.
   * @param isActive The active state.
   * @returns The severity of the tag ('success' or 'danger').
   */
  getSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }
}
