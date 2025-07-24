import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner'; // Importar el módulo del spinner
import { BlockUIModule } from 'primeng/blockui'; // Importar el módulo BlockUI
import { CommonModule } from '@angular/common';
import { LoadingService } from './app/core/services/loading.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ProgressSpinnerModule,
        BlockUIModule],
    template: `<div class="app-container">
      <router-outlet />
    </div>

    <p-blockUI [blocked]="loadingService.loading()">
      <div class="loading-content-wrapper">
        <span style="font-size: 1.5em; font-weight: bold;">Loading...</span>
        </div>
    </p-blockUI>`
})
export class AppComponent implements OnInit{
    constructor(public loadingService: LoadingService) { // Inyectar el servicio de carga
    // El servicio es público para poder acceder a `loadingService.loading()` directamente en el template
  }

  ngOnInit() {
    console.log('AppComponent ngOnInit: loadingService.loading() en ngOnInit:', this.loadingService.loading());
     this.loadingService.hide();
    // Puedes inicializar algo aquí si es necesario
  }
}
