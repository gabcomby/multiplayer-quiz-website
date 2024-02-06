// server-error-dialog.component.ts

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-server-error-dialog',
    template: `
        <h1 mat-dialog-title>Erreur serveur</h1>
        <div mat-dialog-content>
            <p>{{ data.message }}</p>
        </div>
        <div mat-dialog-actions>
            <button mat-button mat-dialog-close>OK</button>
        </div>
    `,
})
export class ServerErrorDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string }) {}
}
