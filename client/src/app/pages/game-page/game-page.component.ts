import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { Game, Question } from '@app/interfaces/game';
import type { Match } from '@app/interfaces/match';
import { ApiService } from '@app/services/api.service';
import { MatchService } from '@app/services/match.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';
import { Observable, switchMap } from 'rxjs';

const TIME_BETWEEN_QUESTIONS = 3000;
const FIRST_TO_ANSWER_MULTIPLIER = 1.2;

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    gameData: Game = {
        id: '',
        title: '',
        description: '',
        isVisible: true,
        duration: 0,
        lastModification: new Date(),
        questions: [],
    };
    currentQuestionIndex: number = 0;
    questionHasExpired: boolean = false;
    currentMatch: Match = { id: '', playerList: [] };
    matchId: string;
    gameId: string;
    timerCountdown: number;
    answerIsCorrect: boolean;

    gameScore: { name: string; score: number }[] = [];

    playerName: string;

    answerIdx: number[];
    previousQuestionIndex: number;

    constructor(
        private router: Router,
        private matchService: MatchService,
        private route: ActivatedRoute,
        private socketService: SocketService,
        private apiService: ApiService,
        private snackbarService: SnackbarService,
    ) {}

    ngOnInit() {
        // Get the game ID from the URL
        this.gameId = this.route.snapshot.params['id'];
        // Fetch the game data from the server
        this.apiService.getGame(this.gameId).subscribe({
            next: (data) => {
                this.gameData = data;
            },
            error: (error) => {
                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante: ${error}`);
            },
        });

        this.createAndSetupMatch();
    }

    createAndSetupMatch() {
        this.createMatch()
            .pipe(
                switchMap((matchData) => {
                    this.currentMatch = matchData;
                    return this.addPlayerToMatch(this.matchId);
                }),
            )
            .subscribe({
                next: (data) => {
                    this.currentMatch = data;
                    this.setupWebSocketEvents();
                    this.socketService.startTimer();
                },
                error: (error) => {
                    alert(error.message);
                },
            });
    }

    createMatch(): Observable<Match> {
        this.matchId = crypto.randomUUID();
        return this.matchService.createNewMatch({ id: this.matchId, playerList: [] });
    }

    addPlayerToMatch(matchId: string): Observable<Match> {
        return this.matchService.addPlayer({ id: 'playertest', name: 'Player 1', score: 0 }, matchId);
    }

    setupWebSocketEvents() {
        this.socketService.connect();
        this.socketService.onTimerCountdown((data) => {
            this.timerCountdown = data;
            if (this.timerCountdown === 0) {
                this.onTimerComplete();
            }
        });
        if (this.gameData && this.gameData.duration) {
            this.socketService.setTimerDuration(this.gameData.duration);
        }
        this.socketService.onAnswerVerification((data) => {
            this.answerIsCorrect = data;
            if (data === true) {
                this.updatePlayerScore(this.gameData.questions[this.previousQuestionIndex].points * FIRST_TO_ANSWER_MULTIPLIER);
            }
        });
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
        this.matchService.deleteMatch(this.matchId).subscribe({
            next: () => {
                this.socketService.stopTimer();
                this.socketService.disconnect();
                this.router.navigate(['/new-game']);
            },
            error: (error) => {
                alert(error.message);
            },
        });
    }

    onTimerComplete(): void {
        this.socketService.stopTimer();
        this.questionHasExpired = true;
        this.previousQuestionIndex = this.currentQuestionIndex;
        this.socketService.verifyAnswers(this.gameData.questions[this.previousQuestionIndex].choices, this.answerIdx);
        if (this.currentQuestionIndex < this.gameData.questions.length - 1) {
            setTimeout(() => {
                this.handleNextQuestion();
            }, TIME_BETWEEN_QUESTIONS);
        } else {
            setTimeout(() => {
                this.handleGameLeave();
            }, TIME_BETWEEN_QUESTIONS);
        }
    }

    getCurrentQuestion(): Question {
        if (this.gameData.questions.length > 0) {
            return this.gameData.questions[this.currentQuestionIndex];
        } else {
            return {
                type: '',
                text: '',
                points: 0,
                lastModification: new Date(),
                id: '',
            };
        }
    }

    setAnswerIndex(answerIdx: number[]) {
        this.answerIdx = answerIdx;
    }

    handleNextQuestion(): void {
        this.currentQuestionIndex++;
        this.questionHasExpired = false;
        this.socketService.startTimer();
    }
}
