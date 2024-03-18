import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-input-dialog',
    templateUrl: './input-dialog.component.html',
    styleUrls: ['./input-dialog.component.scss'],
})
export class InputDialogComponent {
    inputValue: string = '';

    constructor(
        public dialogRef: MatDialogRef<InputDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { title: string; label: string },
    ) {}

    onCancel(): void {
        this.dialogRef.close();
    }
}
