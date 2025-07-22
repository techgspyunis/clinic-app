// src/app/core/models/auth.models.ts

/**
 * @interface AuthError
 * @description Representa la estructura de un error de validación individual de la API.
 */
export interface AuthError {
  field?: string; // Nombre del campo donde ocurrió el error (opcional)
  message: string; // Mensaje de error
  severity?: string; // Nivel de severidad del error (ej: "Error", "Warning")
}

/**
 * @interface AuthApiResponse
 * @template T Tipo de datos esperado en el campo 'data' de la respuesta exitosa.
 * @description Estructura genérica para todas las respuestas de la API de autenticación.
 */
export interface AuthApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T | null; // Puede ser null o el tipo de dato esperado
  errors: AuthError[] | null; // Ahora es un array de AuthError o null
}

// --- Interfaces para Peticiones (Request Bodies) ---

/**
 * @interface RegisterRequest
 * @description Datos requeridos para el registro de un nuevo usuario.
 */
export interface RegisterRequest {
  nombreUsuario: string;
  email: string;
  password: string;
  personaId: number; // Asumiendo que es un número por tu ejemplo
}

/**
 * @interface LoginRequest
 * @description Datos requeridos para iniciar sesión.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * @interface RequestPasswordResetRequest
 * @description Datos requeridos para solicitar un reseteo de contraseña.
 */
export interface RequestPasswordResetRequest {
  email: string;
}

/**
 * @interface ResetPasswordRequest
 * @description Datos requeridos para confirmar el reseteo de contraseña.
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// --- Interfaces para Respuestas (Response Data) ---

/**
 * @interface LoginResponseData
 * @description Datos devueltos tras un login exitoso.
 * Nota: Coincide con UserData, pero lo mantenemos separado para claridad de intención.
 */
export interface LoginResponseData {
  // success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface User{
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

/**
 * @interface UserInfoResponseData
 * @description Datos devueltos al solicitar información del usuario.
 * Nota: Similar a LoginResponseData pero el token aquí es null en tu ejemplo.
 */
export interface UserInfoResponseData {
  success: boolean;
  message: string;
  usuarioId: string;
  nombreUsuario: string;
  email: string;
  roles: string[];
  token: string | null; // El token puede ser null en esta respuesta
}

/**
 * @interface GenericSuccessData
 * @description Interfaz para respuestas donde 'data' es simplemente un booleano o un mensaje simple.
 */
export interface GenericSuccessData {
  success: boolean;
  message: string;
}
