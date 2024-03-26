import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-game-wait',
    templateUrl: './game-wait.component.html',
    styleUrls: ['./game-wait.component.scss'],
})
export class GameWaitComponent implements OnInit {
    constructor(
        private socketService: SocketService,
        private gameService: GameService,
        private router: Router,
    ) {}

    get playerName() {
        return this.gameService.playerNameValue;
    }

    get playerList() {
        return this.gameService.playerListValue;
    }

    get playerLeftList() {
        return this.gameService.playerLeftListValue;
    }

    get isHost() {
        return this.gameService.isHostValue;
    }

    get lobbyCode() {
        return this.gameService.lobbyCodeValue;
    }

    get roomIsLocked() {
        return this.gameService.roomIsLockedValue;
    }

    get currentGameTitle() {
        return this.gameService.gameTitleValue;
    }

    @HostListener('window:beforeunload', ['$event'])
    // eslint-disable-next-line no-unused-vars
    beforeUnloadHandler(event: Event) {
        event.preventDefault();
        this.gameService.leaveRoom();
        localStorage.setItem('refreshedPage', '/home');
    }

    ngOnInit(): void {
        const refreshedPage = localStorage.getItem('refreshedPage');
        if (refreshedPage) {
            localStorage.removeItem('refreshedPage');
            this.router.navigate([refreshedPage]);
        }
    }

    banPlayer(name: string) {
        this.gameService.banPlayer(name);
    }

    handleGameLeave(): void {
        this.gameService.leaveRoom();
        this.router.navigate(['/home']);
    }

    toggleRoomLock() {
        this.socketService.toggleRoomLock();
    }

    handleGameLaunch() {
        this.gameService.startGame();
    }
}
