import { Routes } from "@angular/router";
import { CentreMedicalComponent } from "./centre-medical.component";
import { TranslationLaboComponent } from "./translation-labo.component";
import { TranslationHwComponent } from "./translation-hw.component";
import { TranslationComponent } from "./translation.component";

export default [
    { path: 'centre-medical', data: { breadcrumb: 'Centre Medical' }, component: CentreMedicalComponent },
    { path: 'translation-labo', data: { breadcrumb: 'Translation Labo' }, component: TranslationLaboComponent },
    { path: 'translation-hw', data: { breadcrumb: 'Translation Hw' }, component: TranslationHwComponent },
    { path: 'translation', data: { breadcrumb: 'Translation Nom' }, component: TranslationComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes