import { Routes } from "@angular/router";
import { OrderPreviewComponent } from "./orderpreview.component";

export default [
    { path: 'generate-order', data: { breadcrumb: 'Order Preview' }, component: OrderPreviewComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes