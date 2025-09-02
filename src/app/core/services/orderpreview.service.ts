// src/app/core/services/order.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';

import { OrderPreview, OrderDetailPreview, NewOrderPreviewPayload } from '../models/orderpreview.model';

@Injectable({
  providedIn: 'root'
})
export class OrderPreviewService {
  private apiUrl = `${API_BASE_URL}/order-previews`;

  constructor(private http: HttpClient) {}

  getOrders(year: number, month: number): Observable<OrderPreview[]> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString())

    return this.http.get<OrderPreview[]>(this.apiUrl, { params });
  }

  getOrderDetails(orderId: string): Observable<OrderDetailPreview[]> {
    return this.http.get<OrderDetailPreview[]>(`${this.apiUrl}/${orderId}/details`);
  }

  createOrder(payload: NewOrderPreviewPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  deleteOrder(orderId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${orderId}`);
  }
}