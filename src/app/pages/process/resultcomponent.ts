// src/app/pages/process/result/result.component.ts

import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { InvoiceService } from '../../core/services/invoice.service';
import { AdministrativeRecord, AdministrativeResult } from '../../core/models/administrative.model';
import { LoadingService } from '../../core/services/loading.service'; // Importar el servicio de carga

@Component({
  selector: 'app-result',
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
    DialogModule,
    TagModule,
    TooltipModule
  ],
  template: `
    <p-toast />

    <p-toolbar styleClass="mb-4">
      <ng-template #start>
        <h3>Lab Administrative Records</h3>
      </ng-template>
    </p-toolbar>

    <p-table
      #dt
      [value]="administrativeRecords()"
      [rows]="10"
      [paginator]="true"
      [globalFilterFields]="displayColumns"
      [tableStyle]="{ 'min-width': '75rem' }"
      [rowHover]="true"
      dataKey="administrative_id"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
      [showCurrentPageReport]="true"
      [rowsPerPageOptions]="[10, 20, 30]"
    >
      <ng-template #caption>
        <div class="flex items-center justify-between">
          <h5 class="m-0">Administrative Records Management</h5>
          <p-iconfield>
            <p-inputicon styleClass="pi pi-search" />
            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
          </p-iconfield>
        </div>
      </ng-template>
      <ng-template #header>
        <tr>
          <th pSortableColumn="ident_protocol">Protocol ID <p-sortIcon field="ident_protocol" /></th>
          <th pSortableColumn="surname">Surname <p-sortIcon field="surname" /></th>
          <th pSortableColumn="firstname">First Name <p-sortIcon field="firstname" /></th>
          <th pSortableColumn="sex">Sex <p-sortIcon field="sex" /></th>
          <th pSortableColumn="date_of_birth">DOB <p-sortIcon field="date_of_birth" /></th>
          <th pSortableColumn="external_identifier">Ext. ID <p-sortIcon field="external_identifier" /></th>
          <th pSortableColumn="lab_identification">Lab ID <p-sortIcon field="lab_identification" /></th>
          <th pSortableColumn="prescribing_doctor">Doctor <p-sortIcon field="prescribing_doctor" /></th>
          <th pSortableColumn="date_request">Req. Date <p-sortIcon field="date_request" /></th>
          <th pSortableColumn="protocol_type">Protocol Type <p-sortIcon field="protocol_type" /></th>
          <th pSortableColumn="zip_uploaded">ZIP Uploaded <p-sortIcon field="zip_uploaded" /></th>
          <th pSortableColumn="file_name">File Link</th>
          <th pSortableColumn="status">Status <p-sortIcon field="status" /></th>
          <th pSortableColumn="is_active">Active <p-sortIcon field="is_active" /></th>
          <th>Actions</th>
        </tr>
      </ng-template>
      <ng-template #body let-record>
        <tr>
          <td>{{ record.ident_protocol }}</td>
          <td>{{ record.surname }}</td>
          <td>{{ record.firstname }}</td>
          <td>{{ record.sex }}</td>
          <td>{{ formatDate(record.date_of_birth) }}</td>
          <td>{{ record.external_identifier }}</td>
          <td>{{ record.lab_identification }}</td>
          <td>{{ record.prescribing_doctor }}</td>
          <td>{{ formatDate(record.date_request) }}</td>
          <td>{{ record.protocol_type }}</td>
          <td>{{ record.zip_uploaded }}</td>
          <td>
            <a [href]="record.file_name" target="_blank" rel="noopener noreferrer" class="p-button p-button-link" pTooltip="Download Lab File">
              <i class="pi pi-file-arrow-down"></i> Download
            </a>
          </td>
          <td><p-tag [value]="record.status" [severity]="getStatusSeverity(record.status)" /></td>
          <td><p-tag [value]="record.is_active ? 'Yes' : 'No'" [severity]="getSeverity(record.is_active)" /></td>
          <td>
            <p-button icon="pi pi-eye" severity="info" [rounded]="true" [outlined]="true" (click)="viewResults(record)" pTooltip="View Results" tooltipPosition="bottom" />
          </td>
        </tr>
      </ng-template>
      <ng-template #emptyMessage>
        <tr>
          <td [attr.colspan]="displayColumns.length + 1" class="text-center">No administrative records found.</td>
        </tr>
      </ng-template>
    </p-table>

    <p-dialog [(visible)]="resultsDialog" [style]="{ width: '75vw' }" header="Lab Results for Protocol: {{ selectedAdministrativeRecord?.ident_protocol }}" [modal]="true" styleClass="p-fluid">
      <ng-template #content>
        <div *ngIf="administrativeResults && administrativeResults.length > 0">
          <p-table [value]="administrativeResults" [tableStyle]="{ 'min-width': '50rem' }" [scrollable]="true" scrollHeight="400px">
            <ng-template pTemplate="header">
              <tr>
                <th>Type</th>
                <th>Analytical Code</th>
                <th>Analytical Name</th>
                <th>Result</th>
                <th>Unit</th>
                <th>Reference Value</th>
                <th>Active</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-result>
              <tr>
                <td>{{ result.type }}</td>
                <td>{{ result.analytical_code }}</td>
                <td>{{ result.analytical_name }}</td>
                <td>{{ result.result }}</td>
                <td>{{ result.unit }}</td>
                <td>{{ result.reference_value }}</td>
                <td><p-tag [value]="result.is_active ? 'Yes' : 'No'" [severity]="getSeverity(result.is_active)" /></td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptyMessage">
                <tr>
                    <td colspan="7" class="text-center">No results found for this record.</td>
                </tr>
            </ng-template>
          </p-table>
        </div>
        <div *ngIf="!administrativeResults || administrativeResults.length === 0">
          <p class="text-center">No results available for this record.</p>
        </div>
      </ng-template>
      <ng-template #footer>
        <p-button label="Close" icon="pi pi-times" text (click)="hideResultsDialog()" />
      </ng-template>
    </p-dialog>
  `,
  providers: [MessageService, DatePipe]
})
export class ResultComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  administrativeRecords = signal<AdministrativeRecord[]>([]);
  selectedAdministrativeRecord: AdministrativeRecord | null = null;
  administrativeResults: AdministrativeResult[] | null = null;

  resultsDialog: boolean = false;

  displayColumns: string[] = [
    'ident_protocol',
    'surname',
    'firstname',
    'sex',
    'date_of_birth',
    'external_identifier',
    'lab_identification',
    'prescribing_doctor',
    'date_request',
    'protocol_type',
    'zip_uploaded',
    'file_name',
    'status',
    'is_active',
  ];

  constructor(
    private invoiceService: InvoiceService,
    private messageService: MessageService,
    private datePipe: DatePipe,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.loadAdministrativeRecords();
  }

  loadAdministrativeRecords() {
    this.loadingService.show();
    this.invoiceService.getAdministrativeRecords().subscribe({
      next: (data) => {
        this.administrativeRecords.set(data);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading administrative records:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load administrative records.',
          life: 3000,
        });
        this.loadingService.hide();
      },
    });
  }

  formatDate(dateString: string): string {
    if (!dateString || dateString.length !== 8) {
      return dateString;
    }
    const day = dateString.substring(0, 2);
    const month = dateString.substring(2, 4);
    const year = dateString.substring(4, 8);
    return `${year}-${month}-${day}`;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  viewResults(record: AdministrativeRecord) {
    this.selectedAdministrativeRecord = record;
    this.loadingService.show();
    this.invoiceService.getAdministrativeResults(record.administrative_id).subscribe({
      next: (results) => {
        this.administrativeResults = results;
        this.resultsDialog = true;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading administrative results:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load results for this record.',
          life: 3000,
        });
        this.loadingService.hide();
        this.administrativeResults = null;
        this.resultsDialog = true;
      },
    });
  }

  hideResultsDialog() {
    this.resultsDialog = false;
    this.selectedAdministrativeRecord = null;
    this.administrativeResults = null;
  }

  getSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }

  getStatusSeverity(status: number): string {
    if (status === 0) return 'info';
    return 'secondary';
  }
}