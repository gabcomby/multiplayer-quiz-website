import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-player-name-dialog',
    templateUrl: './player-name-dialog.component.html',
    styleUrls: ['./player-name-dialog.component.scss'],
})
export class PlayerNameDialogComponent {
    @Input() isShown: boolean = false;

    userName: string = '';
    lobbyCode: string = '';

    constructor(
        public dialogRef: MatDialogRef<PlayerNameDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { isShown: boolean },
    ) {
        this.isShown = data.isShown;
    }

    onSubmit(): void {
        this.dialogRef.close({ userName: this.userName, lobbyCode: this.lobbyCode });
    }
}
