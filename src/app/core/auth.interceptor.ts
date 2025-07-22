// src/app/core/auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core'; // Necesario para inyectar servicios en funciones
import { AuthService } from './auth.service';
import { API_BASE_URL } from './constants/api.constants';

/**
 * @function authInterceptor
 * @description Interceptor HTTP funcional para añadir tokens de autenticación
 * y manejar errores 401/403.
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  // Inyecta el AuthService dentro del contexto funcional del interceptor
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Lista de URLs a las que NO se debe añadir el token.
  const excludedUrls = [
    `${API_BASE_URL}/auth/login`,
    `${API_BASE_URL}/auth/register`,
    `${API_BASE_URL}/auth/request-password-reset`,
    `${API_BASE_URL}/auth/reset-password`
  ];

  // Verifica si la URL de la petición está en la lista de excluidas
  const isExcluded = excludedUrls.some(url => req.url.includes(url));

  // Si hay un token y la URL no está excluida, clona la petición y añade el encabezado Authorization
  if (token && !isExcluded) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Continúa con la petición y maneja posibles errores
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es 401 (No autorizado) o 403 (Prohibido)
      if (error.status === 401 || error.status === 403) {
        console.warn('Unauthorized access. Redirecting to login.');
        // Llama al método logout del AuthService para limpiar la sesión y redirigir
        authService.logout();
        // Relanza el error para que el componente/servicio que hizo la petición pueda manejarlo si es necesario
        return throwError(() => error);
      }
      // Para otros tipos de errores, simplemente relanza el error
      return throwError(() => error);
    })
  );
};
