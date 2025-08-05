// src/app/core/models/centre-medical.model.ts
//
// Este archivo define las interfaces de los modelos para la entidad CentreMedical,
// incluyendo la estructura de los datos, los payloads para las operaciones de creación y actualización,
// y las interfaces para las respuestas de la API.

/**
 * @interface CentreMedical
 * @description Representa la estructura completa de un centro médico tal como se recibe del backend.
 */
export interface CentreMedical {
  centre_id: string; // Identificador único del centro médico
  name: string;      // Nombre del centro médico
  abbreviation: string; // Abreviatura del centro médico
  is_active: boolean;  // Estado de actividad del centro médico (true si está activo, false si está desactivado)
  created_at: string;  // Marca de tiempo de creación del registro
  updated_at: string | null; // Marca de tiempo de la última actualización del registro, puede ser nulo
}

/**
 * @interface CentreMedicalCreatePayload
 * @description Define la estructura de los datos necesarios para crear un nuevo centro médico.
 * Corresponde al cuerpo de la solicitud POST /centre-medical.
 */
export interface CentreMedicalCreatePayload {
  name: string;        // Nombre del centro médico (requerido para la creación)
  abbreviation: string; // Abreviatura del centro médico (requerido para la creación)
}

/**
 * @interface CentreMedicalUpdatePayload
 * @description Define la estructura de los datos necesarios para actualizar un centro médico existente.
 * Corresponde al cuerpo de la solicitud PUT /centre-medical/{centre_id}.
 */
export interface CentreMedicalUpdatePayload {
  name: string;        // Nuevo nombre del centro médico
  abbreviation: string; // Nueva abreviatura del centro médico
}

/**
 * @interface ApiResponse<T>
 * @description Interfaz genérica para las respuestas de la API que incluyen un mensaje y datos.
 * Utilizada para las respuestas de creación, actualización y desactivación.
 * @template T El tipo de datos que se espera en la propiedad 'data' de la respuesta.
 */
export interface ApiResponse<T> {
  message: string; // Mensaje descriptivo de la operación
  data: T;         // Los datos del recurso afectado (ej. el centro médico creado/actualizado/desactivado)
}

/**
 * @type CentreMedicalListResponse
 * @description Tipo para la respuesta de la API al obtener una lista de centros médicos.
 * Corresponde a la respuesta GET /centre-medical.
 */
export type CentreMedicalListResponse = CentreMedical[];

