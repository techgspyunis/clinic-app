// src/app/core/models/order.model.ts

/**
 * Interfaz para representar un detalle de la orden tal como viene de la API (GET).
 */
export interface OrderDetail {
  orderdetail_id: string;
  order_id: string;
  number: number;
  centre_medical: string;
  ref_patient: string;
  name_patient: string;
  ref_analyze: string;
  nomenclature_examen: string;
  code: string;
  created_at: string; // ISO 8601 string
  updated_at: string | null; // ISO 8601 string or null
  is_active: boolean;
}

/**
 * Interfaz para representar una orden tal como viene de la API (GET).
 */
export interface Order {
  order_id: string;
  date: string; // "YYYY-MM-DD"
  description: string;
  created_at: string; // ISO 8601 string
  updated_at: string | null; // ISO 8601 string or null
  is_active: boolean;
  upload_file: string;
}

/**
 * Interfaz para el detalle de la orden que se envía en el cuerpo de la solicitud POST.
 * No incluye IDs ni timestamps generados por el backend.
 */
export interface OrderDetailPayload {
  number: number;
  centre_medical: string;
  ref_patient: string;
  name_patient: string;
  ref_analyze: string;
  nomenclature_examen: string;
  code: string;
}

/**
 * Interfaz para la solicitud de creación de una orden (POST).
 * Incluye los detalles como un array.
 */
export interface CreateOrderPayload {
  date: string; // "YYYY-MM-DD"
  description: string;
  upload_file: string; // Nombre del archivo, e.g., "my_excel.xls"
  details: OrderDetailPayload[];
}

/**
 * Interfaz para la respuesta de una solicitud de creación de orden (POST 201).
 */
export interface CreateOrderResponse {
  message: string;
  order: {
    order_id: string;
  };
  details: OrderDetail[]; // Los detalles con sus IDs y timestamps
}