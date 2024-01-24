import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-password-dialog',
    templateUrl: './password-dialog.component.html',
    styleUrls: ['./password-dialog.component.scss'],
})
export class PasswordDialogComponent {
    password: string = '';

    constructor(public dialogRef: MatDialogRef<PasswordDialogComponent>) {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}
