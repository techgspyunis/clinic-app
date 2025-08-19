// File: src/app/core/services/translation-alias.service.ts
//
// Este servicio maneja las peticiones CRUD a la API para la entidad TranslationAlias.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TranslationAlias,
  TranslationAliasCreatePayload,
  TranslationAliasUpdatePayload,
  GenericResponse
} from '../models/translation-alias.model';

@Injectable({
  providedIn: 'root'
})
export class TranslationAliasService {
  private apiUrl = 'https://clinic-express.onrender.com/translationAliases'; // Reemplaza con la URL de tu API

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los alias de traducción para un translation_id específico.
   * @param translationId El ID de la traducción principal.
   * @returns Un Observable que emite un array de TranslationAlias.
   */
  getTranslationAliases(translationId: string): Observable<TranslationAlias[]> {
    return this.http.get<TranslationAlias[]>(`${this.apiUrl}/${translationId}/aliases`);
  }

  /**
   * Obtiene un solo alias de traducción por su ID.
   * @param tAliasId El ID del alias.
   * @returns Un Observable que emite un solo TranslationAlias.
   */
  getTranslationAliasById(tAliasId: string): Observable<TranslationAlias> {
    return this.http.get<TranslationAlias>(`${this.apiUrl}/${tAliasId}`);
  }

  /**
   * Crea un nuevo alias de traducción.
   * @param payload Los datos del nuevo alias.
   * @returns Un Observable que emite la respuesta de la API.
   */
  createTranslationAlias(payload: TranslationAliasCreatePayload): Observable<GenericResponse<TranslationAlias>> {
    return this.http.post<GenericResponse<TranslationAlias>>(this.apiUrl, payload);
  }

  /**
   * Actualiza un alias de traducción existente.
   * @param tAliasId El ID del alias a actualizar.
   * @param payload Los datos actualizados del alias.
   * @returns Un Observable que emite la respuesta de la API.
   */
  updateTranslationAlias(tAliasId: string, payload: TranslationAliasUpdatePayload): Observable<GenericResponse<TranslationAlias>> {
    return this.http.put<GenericResponse<TranslationAlias>>(`${this.apiUrl}/${tAliasId}`, payload);
  }

  /**
   * Desactiva un alias de traducción (soft-delete).
   * @param tAliasId El ID del alias a desactivar.
   * @returns Un Observable que emite la respuesta de la API.
   */
  deactivateTranslationAlias(tAliasId: string): Observable<GenericResponse<TranslationAlias>> {
    return this.http.delete<GenericResponse<TranslationAlias>>(`${this.apiUrl}/${tAliasId}`);
  }
}
