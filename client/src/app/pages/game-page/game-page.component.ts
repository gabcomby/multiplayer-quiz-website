import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { Game, Question } from '@app/interfaces/game';
import type { Match } from '@app/interfaces/match';
import { GameService } from '@app/services/games.service';
import { MatchService } from '@app/services/match.service';
import { TimerService } from '@app/services/timer.service';

const TIME_BETWEEN_QUESTIONS = 3000;
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    gameData: Game;
    currentQuestionIndex: number = 0;
    questionHasExpired: boolean = false;
    currentMatch: Match;
    matchId: string;
    gameId: string;

    gameScore: { name: string; score: number }[] = [];

    playerName: string;

    constructor(
        private timerService: TimerService,
        private gameService: GameService,
        private router: Router,
        private matchService: MatchService,
        private route: ActivatedRoute,
    ) {}

    get questionTimer(): number {
        return this.gameData?.duration;
    }

    updatePlayerScore(scoreFromQuestion: number): void {
        this.matchService.updatePlayerScore(this.matchId, 'playertest', this.currentMatch.playerList[0].score + scoreFromQuestion).subscribe({
            next: (data) => {
                this.currentMatch.playerList[0] = data;
            },
            error: (error) => {
                alert(error.message);
            },
        });
    }

    handleGameLeave() {
        this.matchService.deleteMatch(this.matchId).subscribe();
        this.timerService.killTimer();
        this.router.navigate(['/']);
    }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            this.gameId = params['id'];
        });
        this.fetchGameData(this.gameId);
        this.matchId = crypto.randomUUID();
        this.matchService.createNewMatch({ id: this.matchId, playerList: [] }).subscribe({
            next: (data) => {
                this.currentMatch = data;
            },
            error: (error) => {
                alert(error.message);
            },
        });
        this.matchService.addPlayer({ id: 'playertest', name: 'Player 1', score: 0 }, this.matchId).subscribe({
            next: (data) => {
                this.currentMatch = data;
            },
            error: (error) => {
                alert(error.message);
            },
        });
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
                this.handleGameLeave();
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
