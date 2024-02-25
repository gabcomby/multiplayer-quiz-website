import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-player-name-dialog',
    templateUrl: './player-name-dialog.component.html',
    styleUrls: ['./player-name-dialog.component.scss'],
})
export class PlayerNameDialogComponent {
    userName: string = '';

    constructor(public dialogRef: MatDialogRef<PlayerNameDialogComponent>) {}

    onSubmit(): void {
        this.dialogRef.close(this.userName);
    }
}
