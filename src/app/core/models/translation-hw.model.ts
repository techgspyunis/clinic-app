// src/app/core/models/translation-hw.model.ts
//
// Este archivo define las interfaces de los modelos para la entidad TranslationHw,
// incluyendo la estructura de los datos, los payloads para las operaciones de creación y actualización,
// y las interfaces para las respuestas de la API.

/**
 * @interface TranslationHw
 * @description Representa la estructura completa de un hardware de traducción tal como se recibe del backend.
 */
export interface TranslationHw {
  hw_id: string;     // Identificador único del hardware de traducción
  code: string;      // Código del hardware (ej. "CP001")
  price: number | null; // Precio asociado al hardware, puede ser nulo
  is_active: boolean;  // Estado de actividad del hardware (true si está activo, false si está desactivado)
  created_at: string;  // Marca de tiempo de creación del registro
  updated_at: string | null; // Marca de tiempo de la última actualización del registro, puede ser nulo
}

/**
 * @interface TranslationHwCreatePayload
 * @description Define la estructura de los datos necesarios para crear un nuevo hardware de traducción.
 * Corresponde al cuerpo de la solicitud POST /translationHw.
 */
export interface TranslationHwCreatePayload {
  code: string;      // Código del hardware (requerido para la creación)
  price: number | null;     // Precio (requerido para la creación)
}

/**
 * @interface TranslationHwUpdatePayload
 * @description Define la estructura de los datos necesarios para actualizar un hardware de traducción existente.
 * Corresponde al cuerpo de la solicitud PUT /translationHw/{hw_id}.
 */
export interface TranslationHwUpdatePayload {
  code: string;      // Nuevo código del hardware
  price: number | null;     // Nuevo precio
}

/**
 * @interface ApiResponse<T>
 * @description Interfaz genérica para las respuestas de la API que incluyen un mensaje y datos.
 * Utilizada para las respuestas de creación, actualización y desactivación.
 * @template T El tipo de datos que se espera en la propiedad 'data' de la respuesta.
 */
export interface ApiResponse<T> {
  message: string; // Mensaje descriptivo de la operación
  data: T;         // Los datos del recurso afectado (ej. el hardware creado/actualizado/desactivado)
}

/**
 * @type TranslationHwListResponse
 * @description Tipo para la respuesta de la API al obtener una lista de hardware de traducción.
 * Corresponde a la respuesta GET /translationHw.
 */
export type TranslationHwListResponse = TranslationHw[];

