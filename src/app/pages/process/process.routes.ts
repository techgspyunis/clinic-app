import { Routes } from "@angular/router";
import { OrderComponent } from "./ordercomponent";
import { InvoiceComponent } from "./invoicecomponent";

export default [
    { path: 'order', data: { breadcrumb: 'Order' }, component: OrderComponent },
    { path: 'invoice', data: { breadcrumb: 'Invoice' }, component: InvoiceComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes