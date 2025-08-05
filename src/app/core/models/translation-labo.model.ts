// src/app/core/models/translation-labo.model.ts
//
// Este archivo define las interfaces de los modelos para la entidad TranslationLabo,
// incluyendo la estructura de los datos, los payloads para las operaciones de creación y actualización,
// y las interfaces para las respuestas de la API.

/**
 * @interface TranslationLabo
 * @description Representa la estructura completa de un laboratorio de traducción tal como se recibe del backend.
 */
export interface TranslationLabo {
  labo_id: string;   // Identificador único del laboratorio de traducción
  code: string;      // Código del laboratorio (ej. "A1TRYP")
  // ⭐ CAMBIO AQUÍ: price puede ser number o null
  price: number | null; // Precio asociado a la traducción, puede ser nulo
  is_active: boolean;  // Estado de actividad del laboratorio (true si está activo, false si está desactivado)
  created_at: string;  // Marca de tiempo de creación del registro
  updated_at: string | null; // Marca de tiempo de la última actualización del registro, puede ser nulo
}

/**
 * @interface TranslationLaboCreatePayload
 * @description Define la estructura de los datos necesarios para crear un nuevo laboratorio de traducción.
 * Corresponde al cuerpo de la solicitud POST /translationLabos.
 */
export interface TranslationLaboCreatePayload {
  code: string;      // Código del laboratorio (requerido para la creación)
  // ⭐ CAMBIO AQUÍ: price puede ser number o null
  price: number | null;     // Precio (requerido para la creación)
}

/**
 * @interface TranslationLaboUpdatePayload
 * @description Define la estructura de los datos necesarios para actualizar un laboratorio de traducción existente.
 * Corresponde al cuerpo de la solicitud PUT /translationLabos/{labo_id}.
 */
export interface TranslationLaboUpdatePayload {
  code: string;      // Nuevo código del laboratorio
  // ⭐ CAMBIO AQUÍ: price puede ser number o null
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
  data: T;         // Los datos del recurso afectado (ej. el laboratorio creado/actualizado/desactivado)
}

/**
 * @type TranslationLaboListResponse
 * @description Tipo para la respuesta de la API al obtener una lista de laboratorios de traducción.
 * Corresponde a la respuesta GET /translationLabos.
 */
export type TranslationLaboListResponse = TranslationLabo[];

