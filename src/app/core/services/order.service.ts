// src/app/core/services/order.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import {
  Order,
  OrderDetail,
  CreateOrderPayload,
  CreateOrderResponse,
} from '../models/order.model'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root', // Esto lo hace un servicio singleton disponible en toda la aplicación (standalone)
})
export class OrderService {
  private apiUrl = `${API_BASE_URL}/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las órdenes.
   */
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  /**
   * Obtiene los detalles de una orden específica por su ID.
   * @param orderId El ID de la orden.
   */
  getOrderDetails(orderId: string): Observable<OrderDetail[]> {
    return this.http.get<OrderDetail[]>(`${this.apiUrl}/${orderId}/details`);
  }

  /**
   * Crea una nueva orden con sus detalles.
   * @param payload Los datos de la orden y sus detalles a crear.
   */
  createOrder(payload: CreateOrderPayload): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.apiUrl, payload);
  }

  /**
   * Marca una orden y sus detalles como inactivos (eliminación lógica).
   * @param orderId El ID de la orden a eliminar.
   */
  deleteOrder(orderId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${orderId}`);
  }
}