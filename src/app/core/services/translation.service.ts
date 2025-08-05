// src/app/core/services/translation.service.ts
//
// Este servicio se encarga de la comunicación con el backend para la entidad Translation.
// Utiliza HttpClient para realizar las operaciones CRUD (Crear, Leer, Actualizar, Borrar).

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Translation,
  TranslationCreatePayload,
  TranslationUpdatePayload,
  ApiResponse,
  TranslationListResponse
} from '../models/translation.model';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private apiUrl = 'https://clinic-express.onrender.com/translations'; // URL base del endpoint para traducciones

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de todas las traducciones activas.
   * Método: GET /translations
   * @returns Un Observable que emite un array de objetos Translation.
   */
  getTranslations(): Observable<TranslationListResponse> {
    return this.http.get<TranslationListResponse>(this.apiUrl);
  }

  /**
   * Obtiene los detalles de una traducción específica por su ID.
   * Método: GET /translations/{translation_id}
   * @param translationId El ID único de la traducción.
   * @returns Un Observable que emite el objeto Translation correspondiente.
   */
  getTranslationById(translationId: string): Observable<Translation> {
    return this.http.get<Translation>(`${this.apiUrl}/${translationId}`);
  }

  /**
   * Crea una nueva traducción.
   * Método: POST /translations
   * @param payload Los datos de la nueva traducción.
   * @returns Un Observable que emite la respuesta de la API, incluyendo la traducción creada.
   */
  createTranslation(payload: TranslationCreatePayload): Observable<ApiResponse<Translation>> {
    return this.http.post<ApiResponse<Translation>>(this.apiUrl, payload);
  }

  /**
   * Actualiza una traducción existente.
   * Método: PUT /translations/{translation_id}
   * @param translationId El ID de la traducción a actualizar.
   * @param payload Los nuevos datos de la traducción.
   * @returns Un Observable que emite la respuesta de la API, incluyendo la traducción actualizada.
   */
  updateTranslation(translationId: string, payload: TranslationUpdatePayload): Observable<ApiResponse<Translation>> {
    return this.http.put<ApiResponse<Translation>>(`${this.apiUrl}/${translationId}`, payload);
  }

  /**
   * Desactiva lógicamente una traducción (soft delete).
   * Método: DELETE /translations/{translation_id}
   * @param translationId El ID de la traducción a desactivar.
   * @returns Un Observable que emite la respuesta de la API de confirmación.
   */
  deactivateTranslation(translationId: string): Observable<ApiResponse<Translation>> {
    return this.http.delete<ApiResponse<Translation>>(`${this.apiUrl}/${translationId}`);
  }
}
