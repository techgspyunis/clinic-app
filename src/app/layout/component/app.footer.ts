import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        CLINIC by
        <a href="https://franklin-developments.com" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Company</a>
    </div>`
})
export class AppFooter {}
