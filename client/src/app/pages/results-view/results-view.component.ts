import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnswersPlayer, Question } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { GameService } from '@app/services/game/game.service';

@Component({
    selector: 'app-results-view',
    templateUrl: './results-view.component.html',
    styleUrls: ['./results-view.component.scss'],
})
export class ResultsViewComponent implements OnInit {
    answersQuestions: AnswersPlayer[] = [];
    questions: Question[] = [];
    playerDataSource: Player[] = [];
    playerDataSorted: Player[] = [];

    constructor(
        private gameService: GameService,
        private router: Router,
    ) {}

    get playerName(): string {
        return this.gameService.playerNameValue;
    }

    get lobbyCode(): string {
        return this.gameService.lobbyCodeValue;
    }

    get isHostValue(): boolean {
        return this.gameService.isHostValue;
    }

    get isTestValue(): boolean {
        return this.gameService.isTestValue;
    }

    get playerList(): Player[] {
        this.playerDataSource = this.gameService.playersListResultValue;
        this.sortDataSource();
        return this.playerDataSource;
    }

    get allAnswersIndex(): [string, number[]][] {
        return this.gameService.allAnswersIndexValue;
    }

    get allQuestionsFromGame(): Question[] {
        return this.gameService.allQuestionsFromGameValue;
    }

    @HostListener('window:beforeunload', ['$event'])
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

    handleGameLeave(): void {
        this.gameService.leaveRoom();
        this.router.navigate(['/home']);
    }

    private sortDataSource() {
        this.playerDataSource.sort((a, b) => {
            return b.score !== a.score ? b.score - a.score : a.name.localeCompare(b.name);
        });
    }
}
