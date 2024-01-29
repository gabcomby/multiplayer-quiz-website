import { Component } from '@angular/core';

@Component({
    selector: 'app-player-name-dialog',
    templateUrl: './player-name-dialog.component.html',
    styleUrls: ['./player-name-dialog.component.scss'],
})
export class PlayerNameDialogComponent {
    playerName: string = '';
}
