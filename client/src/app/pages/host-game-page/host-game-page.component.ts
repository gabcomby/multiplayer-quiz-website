import { Component } from '@angular/core';
import { MatchLobby } from '@app/interfaces/match-lobby';

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent {
    endGame = false;
    lobby: MatchLobby;
}
