// File: src/app/core/models/translation-alias.model.ts
//
// Este archivo define las interfaces de datos para la entidad de alias de traducción.

/**
 * @interface TranslationAlias
 * @description
 * Representa la estructura de un alias de traducción tal como es devuelto por la API.
 */
export interface TranslationAlias {
  t_alias_id: string;
  translation_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * @interface TranslationAliasCreatePayload
 * @description
 * Estructura de datos para crear un nuevo alias de traducción.
 * Contiene solo los campos requeridos para la creación.
 */
export interface TranslationAliasCreatePayload {
  translation_id: string;
  name: string;
}

/**
 * @interface TranslationAliasUpdatePayload
 * @description
 * Estructura de datos para actualizar un alias de traducción existente.
 * Contiene solo los campos que pueden ser modificados.
 */
export interface TranslationAliasUpdatePayload {
  name: string;
}

/**
 * @interface GenericResponse
 * @description
 * Estructura de respuesta genérica utilizada por la API para operaciones
 * como creación, actualización y desactivación.
 */
export interface GenericResponse<T> {
  message: string;
  data: T;
}

/**
 * @interface TranslationAliasesApiResponse
 * @description
 * Estructura de la respuesta para el endpoint que devuelve una lista de alias.
 */
export type TranslationAliasesApiResponse = TranslationAlias[];

/**
 * @interface TranslationAliasApiResponse
 * @description
 * Estructura de la respuesta para el endpoint que devuelve un solo alias.
 */
export type TranslationAliasApiResponse = TranslationAlias;
