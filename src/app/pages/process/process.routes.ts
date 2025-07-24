import { Routes } from "@angular/router";
import { OrderComponent } from "./ordercomponent";
import { InvoiceComponent } from "./invoicecomponent";
import { ResultComponent } from "./resultcomponent";

export default [
    { path: 'order', data: { breadcrumb: 'Order' }, component: OrderComponent },
    { path: 'invoice', data: { breadcrumb: 'Invoice' }, component: InvoiceComponent },
    { path: 'result', data: { breadcrumb: 'Result' }, component: ResultComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes