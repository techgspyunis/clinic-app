// src/app.config.ts
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
// Importaciones necesarias para HTTP
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'; // <--- Añadido 'withInterceptors'
// Importaciones para PrimeNG y tu interceptor
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MessageService } from 'primeng/api'; // <--- Importa MessageService
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { registerLocaleData } from '@angular/common';
import { appRoutes } from './app.routes';
import { authInterceptor } from './app/core/auth.interceptor'; // <--- Importa tu interceptor funcional
import { provideAnimations } from '@angular/platform-browser/animations';
import localeEs from '@angular/common/locales/uk';

registerLocaleData(localeEs, 'uk');
export const appConfig: ApplicationConfig = {
  providers: [
    // Provisión de las rutas de la aplicación
    provideRouter(
      appRoutes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withEnabledBlockingInitialNavigation()
    ),

    // Habilita el HttpClient con la API Fetch y registra los interceptores funcionales
    provideHttpClient(
      withFetch(), // Mantienes tu configuración de Fetch
      withInterceptors([authInterceptor]) // <--- Registra tu interceptor funcional aquí
    ),

    // Habilita las animaciones asíncronas (común en nuevas apps Angular)
    provideAnimationsAsync(),

    provideAnimations(),
    // Provee el MessageService de PrimeNG globalmente para mensajes de notificación
    MessageService, // <--- Añadido MessageService

    { provide: LOCALE_ID, useValue: 'uk' },
    // Configuración de PrimeNG
    providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } })
  ]
};
