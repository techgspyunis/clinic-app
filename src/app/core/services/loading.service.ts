// src/app/core/services/loading.service.ts

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // `loading` es una señal que indica si la aplicación está cargando
  loading = signal<boolean>(false);

  constructor() { }

  /**
   * Muestra el indicador de carga.
   */
  show(): void {
    this.loading.set(true);
  }

  /**
   * Oculta el indicador de carga.
   */
  hide(): void {
    this.loading.set(false);
  }
}