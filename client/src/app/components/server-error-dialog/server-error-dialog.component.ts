import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-server-error-dialog',
    templateUrl: './server-error-dialog.component.html',
    styleUrls: ['./server-error-dialog.component.scss'],
})
export class ServerErrorDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string }) {}
}
