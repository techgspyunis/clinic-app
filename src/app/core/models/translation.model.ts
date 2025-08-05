// src/app/core/models/translation.model.ts
//
// Este archivo define las interfaces de los modelos para la entidad Translation,
// incluyendo la estructura de los datos, los payloads para las operaciones de creación y actualización,
// y las interfaces para las respuestas de la API.

/**
 * @interface Translation
 * @description Representa la estructura completa de una traducción tal como se recibe del backend.
 */
export interface Translation {
  translation_id: string; // Identificador único de la traducción
  name: string;           // Descripción o nomenclatura de la traducción
  code_labo: string;      // Código del laboratorio asociado (texto, no ID)
  code_hw: string;        // Código del hardware asociado (texto, no ID)
  is_active: boolean;     // Estado de actividad de la traducción (true si está activa, false si está desactivada)
  created_at: string;     // Marca de tiempo de creación del registro
  updated_at: string | null; // Marca de tiempo de la última actualización del registro, puede ser nulo
}

/**
 * @interface TranslationCreatePayload
 * @description Define la estructura de los datos necesarios para crear una nueva traducción.
 * Corresponde al cuerpo de la solicitud POST /translations.
 */
export interface TranslationCreatePayload {
  name: string;           // Descripción o nomenclatura de la traducción (requerido)
  code_labo: string;      // Código del laboratorio (requerido)
  code_hw: string;        // Código del hardware (requerido)
}

/**
 * @interface TranslationUpdatePayload
 * @description Define la estructura de los datos necesarios para actualizar una traducción existente.
 * Corresponde al cuerpo de la solicitud PUT /translations/{translation_id}.
 */
export interface TranslationUpdatePayload {
  name: string;           // Nueva descripción o nomenclatura
  code_labo: string;      // Nuevo código del laboratorio
  code_hw: string;        // Nuevo código del hardware
}

/**
 * @interface ApiResponse<T>
 * @description Interfaz genérica para las respuestas de la API que incluyen un mensaje y datos.
 * Utilizada para las respuestas de creación, actualización y desactivación.
 * @template T El tipo de datos que se espera en la propiedad 'data' de la respuesta.
 */
export interface ApiResponse<T> {
  message: string; // Mensaje descriptivo de la operación
  data: T;         // Los datos del recurso afectado (ej. la traducción creada/actualizada/desactivada)
}

/**
 * @type TranslationListResponse
 * @description Tipo para la respuesta de la API al obtener una lista de traducciones.
 * Corresponde a la respuesta GET /translations.
 */
export type TranslationListResponse = Translation[];

