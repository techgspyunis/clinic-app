import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'Process',
                items: [
                    { label: 'Orders', icon: 'pi pi-fw pi-id-card', routerLink: ['/process/order'] },
                    { label: 'Invoices', icon: 'pi pi-fw pi-check-square', routerLink: ['/process/invoice'] },
                    { label: 'Results', icon: 'pi pi-fw pi-tablet', routerLink: ['/process/result'] }
                ]
            },
             {
                label: 'Tools',
                items: [
                    { label: 'Generate order', icon: 'pi pi-fw pi-id-card', routerLink: ['/tool/generate-order'] }
                ]
            },
             {
                label: 'Reports',
                items: [
                    { label: 'Orders', icon: 'pi pi-fw pi-id-card', routerLink: ['/reports/issues'] },
                    { label: 'Invoices', icon: 'pi pi-fw pi-check-square', routerLink: ['/reports/compare'] }
                ]
            }
        ];
    }
}
