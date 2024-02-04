import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@app/services/games.service';
// import { MatchService } from '@app/services/match.service';
import { PlayerService } from '@app/services/player.service';
import { TimerService } from '@app/services/timer.service';

import type { Game, Question } from '@app/interfaces/game';

const TIME_BETWEEN_QUESTIONS = 4000;
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    gameData: Game;
    currentQuestionIndex: number = 0;
    questionHasExpired: boolean = false;

    gameScore: { name: string; score: number }[] = [];

    playerName: string;

    constructor(
        private timerService: TimerService,
        private gameService: GameService,
        private playerService: PlayerService,
        private router: Router, // private matchService: MatchService,
    ) {}

    get questionTimer(): number {
        return this.gameData?.duration;
    }

    handleGameLeave() {
        this.router.navigate(['/']);
        this.timerService.killTimer();
    }

    ngOnInit() {
        this.fetchGameData('8javry');
        this.initializePlayerScore();
    }

    initializePlayerScore() {
        this.playerName = this.playerService.getPlayerName();
        if (this.playerName) {
            this.gameScore.push({ name: this.playerName, score: 0 });
        }
    }

    fetchGameData(gameId: string): void {
        this.gameService.getGame(gameId).subscribe({
            next: (gameData: Game) => {
                this.gameData = gameData;
                this.startQuestionTimer();
            },
            error: (error) => {
                alert(error.message);
            },
        });
    }

    startQuestionTimer() {
        this.timerService.startTimer(this.questionTimer).subscribe({
            complete: () => {
                this.onTimerComplete();
            },
        });
    }

    onTimerComplete(): void {
        this.questionHasExpired = true;
        if (this.currentQuestionIndex < this.getTotalQuestions() - 1) {
            setTimeout(() => {
                this.currentQuestionIndex++;
                this.questionHasExpired = false;
                this.startQuestionTimer();
            }, TIME_BETWEEN_QUESTIONS);
        } else {
            setTimeout(() => {
                this.router.navigate(['/']);
                this.timerService.killTimer();
                // TODO: Delete match when it ends
                // this.matchService.deleteMatch().subscribe();
            }, TIME_BETWEEN_QUESTIONS);
        }
    }

    getTotalQuestions(): number {
        return this.gameData?.questions.length || 0;
    }

    getCurrentQuestion(): Question {
        return this.gameData.questions[this.currentQuestionIndex];
    }
}
