import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-player-name-dialog',
    templateUrl: './player-name-dialog.component.html',
    styleUrls: ['./player-name-dialog.component.scss'],
})
export class PlayerNameDialogComponent {
    @Input() showLobbyCodePrompt: boolean = false;

    userName: string = '';
    lobbyCode: string = '';

    constructor(
        public dialogRef: MatDialogRef<PlayerNameDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { showLobbyCodePrompt: boolean },
    ) {
        this.showLobbyCodePrompt = data.showLobbyCodePrompt;
    }

    onSubmit(): void {
        const result = {
            userName: this.userName,
            lobbyCode: this.lobbyCode,
        };
        this.dialogRef.close(result);
    }
}
