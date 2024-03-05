import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { SnackbarService } from '@app/services/snackbar.service';
// import { generateNewId } from '@app/utils/assign-new-game-attributes';

@Component({
    selector: 'app-game-wait',
    templateUrl: './game-wait.component.html',
    styleUrls: ['./game-wait.component.scss'],
})
export class GameWaitComponent implements OnInit {
    matchLobby: MatchLobby = {
        id: '',
        playerList: [],
        gameId: '',
        bannedNames: [],
        lobbyCode: '',
        isLocked: false,
        hostId: '',
    };
    playerId: string;
    isHost: boolean;
    private gameId: string;
    // eslint-disable-next-line max-params
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private matchLobbyService: MatchLobbyService,
        private snackbarService: SnackbarService,
    ) {}
    ngOnInit() {
        this.playerId = this.route.snapshot.params['host'];

        this.matchLobbyService.getLobby(this.route.snapshot.params['id']).subscribe({
            next: (data) => {
                this.matchLobby = data;
                this.isHost = this.playerId === `${this.matchLobby.hostId}`;
                this.gameId = this.matchLobby.gameId;
            },
            error: (error) => {
                this.snackbarService.openSnackBar('Erreur' + error + "lors de l'obtention du lobby");
            },
        });
    }

    handleGameLaunch() {
        this.router.navigate(['/gameTimer', this.gameId, this.matchLobby.id, this.playerId]);
    }

    handleGameLeave() {
        this.matchLobbyService.removePlayer(this.playerId, this.matchLobby.id).subscribe({
            next: () => {
                this.router.navigate(['/']);
            },
            error: (error) => {
                this.snackbarService.openSnackBar('Erreur' + error + 'lors de la suppression du joueur');
            },
        });
    }
}
