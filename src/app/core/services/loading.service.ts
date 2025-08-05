// src/app/core/services/loading.service.ts

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // `loading` es una señal que indica si la aplicación está cargando
  loading = signal<boolean>(false);

  constructor() { }

  
 show(): void {
    // console.log('⚡ LOADING SERVICE: show() llamado', new Error().stack); // ⭐ Añade stack para ver la Pila de Llamadas ⭐
    this.loading.set(true);
  }

  hide(): void {
    // console.log('⚡ LOADING SERVICE: hide() llamado', new Error().stack); // ⭐ Añade stack para ver la Pila de Llamadas ⭐
    this.loading.set(false);
  }
}