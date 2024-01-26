import { Component, OnInit } from '@angular/core';
import { GameService } from '@app/services/games.service';
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

    gameScore: { name: string; score: number }[] = [
        { name: 'Gabriel', score: 0 },
        { name: 'Julie', score: 0 },
        { name: 'Maxime', score: 0 },
        { name: 'Alexane', score: 0 },
    ];

    constructor(
        private timerService: TimerService,
        private gameService: GameService,
    ) {}

    get questionTimer(): number {
        return this.gameData?.duration;
    }

    ngOnInit() {
        this.fetchGameData('8javry');
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
        if (this.currentQuestionIndex < this.getTotalQuestions() - 1) {
            this.currentQuestionIndex++;
            this.questionHasExpired = false;
            setTimeout(() => {
                this.startQuestionTimer();
            }, TIME_BETWEEN_QUESTIONS);
        } else {
            alert('Game over!');
        }
    }

    getTotalQuestions(): number {
        return this.gameData?.questions.length || 0;
    }

    getCurrentQuestion(): Question {
        return this.gameData.questions[this.currentQuestionIndex];
    }
}
