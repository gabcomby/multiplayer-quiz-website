import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { SnackbarService } from '@app/services/snackbar.service';

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
    };
    private gameId: string;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private matchLobbyService: MatchLobbyService,
        private snackbarService: SnackbarService,
    ) {}
    ngOnInit() {
        this.gameId = this.route.snapshot.params['gameId'];
        const matchLobbyId = this.route.snapshot.params['matchLobbyId'];
        this.matchLobbyService.getLobby(matchLobbyId).subscribe({
            next: (data) => {
                this.matchLobby = data;
            },
            error: (error) => {
                this.snackbarService.openSnackBar('Error' + error + 'fetching match lobby');
            },
        });
    }

    handleGameLaunch() {
        this.router.navigate(['/game', this.gameId]);
    }
}
