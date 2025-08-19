import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import {
  CentreMedical,
  CentreMedicalCreatePayload,
  CentreMedicalUpdatePayload,
  ApiResponse,
  CentreMedicalListResponse
} from '../models/centre-medical.model';

@Injectable({
  providedIn: 'root'
})
export class CentreMedicalService {
  private apiUrl = `${API_BASE_URL}/centre-medical`; // URL base del endpoint para centros médicos
//src/app/core/auth.service.ts
  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de todos los centros médicos activos.
   * Método: GET /centre-medical
   * @returns Un Observable que emite un array de objetos CentreMedical.
   */
  getCentres(): Observable<CentreMedicalListResponse> {
    return this.http.get<CentreMedicalListResponse>(this.apiUrl);
  }

  /**
   * Obtiene los detalles de un centro médico específico por su ID.
   * Método: GET /centre-medical/{centre_id}
   * @param centreId El ID único del centro médico.
   * @returns Un Observable que emite el objeto CentreMedical correspondiente.
   */
  getCentreById(centreId: string): Observable<CentreMedical> {
    return this.http.get<CentreMedical>(`${this.apiUrl}/${centreId}`);
  }

  /**
   * Crea un nuevo centro médico.
   * Método: POST /centre-medical
   * @param payload Los datos del nuevo centro médico.
   * @returns Un Observable que emite la respuesta de la API, incluyendo el centro creado.
   */
  createCentre(payload: CentreMedicalCreatePayload): Observable<ApiResponse<CentreMedical>> {
    return this.http.post<ApiResponse<CentreMedical>>(this.apiUrl, payload);
  }

  /**
   * Actualiza un centro médico existente.
   * Método: PUT /centre-medical/{centre_id}
   * @param centreId El ID del centro médico a actualizar.
   * @param payload Los nuevos datos del centro médico.
   * @returns Un Observable que emite la respuesta de la API, incluyendo el centro actualizado.
   */
  updateCentre(centreId: string, payload: CentreMedicalUpdatePayload): Observable<ApiResponse<CentreMedical>> {
    return this.http.put<ApiResponse<CentreMedical>>(`${this.apiUrl}/${centreId}`, payload);
  }

  /**
   * Desactiva lógicamente un centro médico (soft delete).
   * Método: DELETE /centre-medical/{centre_id}
   * @param centreId El ID del centro médico a desactivar.
   * @returns Un Observable que emite la respuesta de la API de confirmación.
   */
  deleteCentre(centreId: string): Observable<ApiResponse<CentreMedical>> {
    return this.http.delete<ApiResponse<CentreMedical>>(`${this.apiUrl}/${centreId}`);
  }
}
