import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import type { Player } from '@app/interfaces/match';
import { JoinGameValidationService } from '@app/services/join-game-validation.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-page-scoresheet',
    templateUrl: './game-page-scoresheet.component.html',
    styleUrls: ['./game-page-scoresheet.component.scss'],
})
export class GamePageScoresheetComponent implements OnInit, OnDestroy {
    @Input() isHost: boolean;
    @Input() playerList: Player[];
    lobbyCode: string;
    bannedPlayers: string[];
    leftPlayers: Player[] = [];
    private playerLeftSubscription: Subscription;

    constructor(
        private matchLobbyService: MatchLobbyService,
        private joinGameValidationService: JoinGameValidationService,
    ) {}
    ngOnInit() {
        this.playerLeftSubscription = this.matchLobbyService.playerLeft$.subscribe((playerId) => {
            const player = this.playerList.find((p) => p.id === playerId);
            if (player) {
                this.leftPlayers.push(player);
                console.log(this.leftPlayers);
            }
        });
    }

    ngOnDestroy() {
        // Unsubscribe to ensure no memory leaks
        this.playerLeftSubscription.unsubscribe();
    }

    makeBannedPlayer(name: string) {
        this.lobbyCode = this.joinGameValidationService.getLobby();
        this.matchLobbyService.banPlayer(name, this.lobbyCode).subscribe();
    }
}
