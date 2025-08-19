// src/app/core/services/translation-labo.service.ts
//
// Este servicio se encarga de la comunicación con el backend para la entidad TranslationLabo.
// Utiliza HttpClient para realizar las operaciones CRUD (Crear, Leer, Actualizar, Borrar).

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import {
  TranslationLabo,
  TranslationLaboCreatePayload,
  TranslationLaboUpdatePayload,
  ApiResponse,
  TranslationLaboListResponse
} from '../models/translation-labo.model';

@Injectable({
  providedIn: 'root'
})
export class TranslationLaboService {
  private apiUrl = `${API_BASE_URL}/translationLabos`; // URL base del endpoint para laboratorios de traducción

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de todos los laboratorios de traducción activos.
   * Método: GET /translationLabos
   * @returns Un Observable que emite un array de objetos TranslationLabo.
   */
  getTranslationLabos(): Observable<TranslationLaboListResponse> {
    return this.http.get<TranslationLaboListResponse>(this.apiUrl);
  }

  /**
   * Obtiene los detalles de un laboratorio de traducción específico por su ID.
   * Método: GET /translationLabos/{labo_id}
   * @param laboId El ID único del laboratorio de traducción.
   * @returns Un Observable que emite el objeto TranslationLabo correspondiente.
   */
  getTranslationLaboById(laboId: string): Observable<TranslationLabo> {
    return this.http.get<TranslationLabo>(`${this.apiUrl}/${laboId}`);
  }

  /**
   * Crea un nuevo laboratorio de traducción.
   * Método: POST /translationLabos
   * @param payload Los datos del nuevo laboratorio de traducción.
   * @returns Un Observable que emite la respuesta de la API, incluyendo el laboratorio creado.
   */
  createTranslationLabo(payload: TranslationLaboCreatePayload): Observable<ApiResponse<TranslationLabo>> {
    return this.http.post<ApiResponse<TranslationLabo>>(this.apiUrl, payload);
  }

  /**
   * Actualiza un laboratorio de traducción existente.
   * Método: PUT /translationLabos/{labo_id}
   * @param laboId El ID del laboratorio de traducción a actualizar.
   * @param payload Los nuevos datos del laboratorio de traducción.
   * @returns Un Observable que emite la respuesta de la API, incluyendo el laboratorio actualizado.
   */
  updateTranslationLabo(laboId: string, payload: TranslationLaboUpdatePayload): Observable<ApiResponse<TranslationLabo>> {
    return this.http.put<ApiResponse<TranslationLabo>>(`${this.apiUrl}/${laboId}`, payload);
  }

  /**
   * Desactiva lógicamente un laboratorio de traducción (soft delete).
   * Método: DELETE /translationLabos/{labo_id}
   * @param laboId El ID del laboratorio de traducción a desactivar.
   * @returns Un Observable que emite la respuesta de la API de confirmación.
   */
  deactivateTranslationLabo(laboId: string): Observable<ApiResponse<TranslationLabo>> {
    return this.http.delete<ApiResponse<TranslationLabo>>(`${this.apiUrl}/${laboId}`);
  }
}
