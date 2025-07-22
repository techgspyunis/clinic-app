import { Routes } from "@angular/router";
import { OrderComponent } from "./ordercomponent";

export default [
    { path: 'order', data: { breadcrumb: 'Order' }, component: OrderComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes