import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Player } from '@app/interfaces/match';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { GameService } from '@app/services/game.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnInit {
    lobby: MatchLobby;

    constructor(
        private route: ActivatedRoute,
        private gameService: GameService,
        private matchLobbyService: MatchLobbyService,
    ) {}

    get currentQuestionIndexValue(): number {
        return this.gameService.currentQuestionIndexValue;
    }

    get currentGameLength(): number {
        return this.gameService.currentGameLength;
    }

    get currentGameTitle(): string {
        return this.gameService.currentGameTitle;
    }

    get playerListValue(): Player[] {
        return this.gameService.playerListFromLobby;
    }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            const lobbyId = params.id;
            this.matchLobbyService.getLobby(lobbyId).subscribe((lobby) => {
                this.lobby = lobby;
            });
        });
    }
}
