// src/app/core/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { API_BASE_URL } from '../core/constants/api.constants';
import {
  AuthApiResponse,
  LoginRequest,
  LoginResponseData, // Cambiado de UserData a LoginResponseData
  RegisterRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  UserInfoResponseData, // Nueva interfaz para user-info
  GenericSuccessData // Nueva interfaz para respuestas booleanas
} from '../core/models/auth.models'; // Importa todas tus interfaces actualizadas

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Define los endpoints específicos
  private loginUrl = `${API_BASE_URL}/login`;
  private registerUrl = `${API_BASE_URL}/auth/register`;
  private userInfoUrl = `${API_BASE_URL}/auth/user-info`;
  private requestPasswordResetUrl = `${API_BASE_URL}/auth/request-password-reset`;
  private resetPasswordUrl = `${API_BASE_URL}/auth/reset-password`;


  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('authToken');
    this.isAuthenticatedSubject.next(!!token);
  }

  /**
   * Método para iniciar sesión de usuario.
   * @param credentials Datos de nombre de usuario y contraseña.
   * @returns Un Observable con la respuesta de la API.
   */
  login(credentials: LoginRequest): Observable<LoginResponseData> {
    return this.http.post<LoginResponseData>(this.loginUrl, credentials).pipe(
      tap(response => {
          localStorage.setItem('authToken', response?.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.isAuthenticatedSubject.next(true);
          this.router.navigate(['/']);
      }),
      catchError(error => {
        console.error('Error on login:', error);
        this.isAuthenticatedSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Método para registrar un nuevo usuario.
   * @param userData Datos del nuevo usuario (nombreUsuario, email, password, personaId).
   * @returns Un Observable con la respuesta de la API (generalmente un booleano en data).
   */
  register(userData: RegisterRequest): Observable<AuthApiResponse<GenericSuccessData>> {
    return this.http.post<AuthApiResponse<GenericSuccessData>>(this.registerUrl, userData).pipe(
      tap(response => {
        if (!response.succeeded || !response.data?.success) {
          // Si la operación no fue exitosa según la API
          throw new Error(response.message || response.data?.message || 'Registro fallido.');
        }
      }),
      catchError(error => {
        console.error('Error en la petición de registro:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Método para obtener la información del usuario autenticado.
   * Requiere un token de autenticación.
   * @returns Un Observable con la información del usuario.
   */
  getUserInfo(): Observable<AuthApiResponse<UserInfoResponseData>> {
    // No necesitamos añadir el token aquí, el interceptor ya lo hará.
    return this.http.get<AuthApiResponse<UserInfoResponseData>>(this.userInfoUrl).pipe(
      tap(response => {
        if (!response.succeeded || !response.data?.success) {
          throw new Error(response.message || response.data?.message || 'Fallo al obtener información del usuario.');
        }
      }),
      catchError(error => {
        console.error('Error en la petición de user info:', error);
        // El interceptor manejará el 401/403, aquí solo propagamos el error.
        return throwError(() => error);
      })
    );
  }

  /**
   * Método para solicitar el reseteo de contraseña.
   * @param request Datos con el email del usuario.
   * @returns Un Observable con la respuesta de la API.
   */
  requestPasswordReset(request: RequestPasswordResetRequest): Observable<AuthApiResponse<GenericSuccessData>> {
    return this.http.post<AuthApiResponse<GenericSuccessData>>(this.requestPasswordResetUrl, request).pipe(
      tap(response => {
        if (!response.succeeded || !response.data?.success) {
          throw new Error(response.message || response.data?.message || 'Fallo al solicitar reseteo de contraseña.');
        }
      }),
      catchError(error => {
        console.error('Error en la petición de solicitud de reseteo:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Método para confirmar y establecer una nueva contraseña.
   * @param request Datos con el token de reseteo y la nueva contraseña.
   * @returns Un Observable con la respuesta de la API.
   */
  resetPassword(request: ResetPasswordRequest): Observable<AuthApiResponse<GenericSuccessData>> {
    return this.http.post<AuthApiResponse<GenericSuccessData>>(this.resetPasswordUrl, request).pipe(
      tap(response => {
        if (!response.succeeded || !response.data?.success) {
          throw new Error(response.message || response.data?.message || 'Fallo al restablecer la contraseña.');
        }
      }),
      catchError(error => {
        console.error('Error en la petición de reseteo de contraseña:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getCurrentUser(): LoginResponseData | null { // Cambiado a LoginResponseData
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }
}
