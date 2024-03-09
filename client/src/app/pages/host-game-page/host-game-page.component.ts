import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { GameService } from '@app/services/game.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { Subject, Subscription } from 'rxjs';

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnInit, OnDestroy {
    endGame = false;
    lobby: MatchLobby;
    unsubscribeSubject: Subscription[];
    private destroy = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private matchLobbyService: MatchLobbyService,
        private gameService: GameService,
    ) {}

    ngOnInit(): void {
        return;
    }
    ngOnDestroy() {
        this.destroy.next();
        this.destroy.complete();
        this.unsubscribeSubject.forEach((subject) => {
            subject.unsubscribe();
        });
    }
}
