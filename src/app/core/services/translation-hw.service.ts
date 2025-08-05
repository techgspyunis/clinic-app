// src/app/core/services/translation-hw.service.ts
//
// Este servicio se encarga de la comunicación con el backend para la entidad TranslationHw.
// Utiliza HttpClient para realizar las operaciones CRUD (Crear, Leer, Actualizar, Borrar).

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TranslationHw,
  TranslationHwCreatePayload,
  TranslationHwUpdatePayload,
  ApiResponse,
  TranslationHwListResponse
} from '../models/translation-hw.model';

@Injectable({
  providedIn: 'root'
})
export class TranslationHwService {
  private apiUrl = 'https://clinic-express.onrender.com/translationHw'; // URL base del endpoint para hardware de traducción

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de todo el hardware de traducción activo.
   * Método: GET /translationHw
   * @returns Un Observable que emite un array de objetos TranslationHw.
   */
  getTranslationHw(): Observable<TranslationHwListResponse> {
    return this.http.get<TranslationHwListResponse>(this.apiUrl);
  }

  /**
   * Obtiene los detalles de un hardware de traducción específico por su ID.
   * Método: GET /translationHw/{hw_id}
   * @param hwId El ID único del hardware de traducción.
   * @returns Un Observable que emite el objeto TranslationHw correspondiente.
   */
  getTranslationHwById(hwId: string): Observable<TranslationHw> {
    return this.http.get<TranslationHw>(`${this.apiUrl}/${hwId}`);
  }

  /**
   * Crea un nuevo hardware de traducción.
   * Método: POST /translationHw
   * @param payload Los datos del nuevo hardware de traducción.
   * @returns Un Observable que emite la respuesta de la API, incluyendo el hardware creado.
   */
  createTranslationHw(payload: TranslationHwCreatePayload): Observable<ApiResponse<TranslationHw>> {
    return this.http.post<ApiResponse<TranslationHw>>(this.apiUrl, payload);
  }

  /**
   * Actualiza un hardware de traducción existente.
   * Método: PUT /translationHw/{hw_id}
   * @param hwId El ID del hardware de traducción a actualizar.
   * @param payload Los nuevos datos del hardware de traducción.
   * @returns Un Observable que emite la respuesta de la API, incluyendo el hardware actualizado.
   */
  updateTranslationHw(hwId: string, payload: TranslationHwUpdatePayload): Observable<ApiResponse<TranslationHw>> {
    return this.http.put<ApiResponse<TranslationHw>>(`${this.apiUrl}/${hwId}`, payload);
  }

  /**
   * Desactiva lógicamente un hardware de traducción (soft delete).
   * Método: DELETE /translationHw/{hw_id}
   * @param hwId El ID del hardware de traducción a desactivar.
   * @returns Un Observable que emite la respuesta de la API de confirmación.
   */
  deactivateTranslationHw(hwId: string): Observable<ApiResponse<TranslationHw>> {
    return this.http.delete<ApiResponse<TranslationHw>>(`${this.apiUrl}/${hwId}`);
  }
}
