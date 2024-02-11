import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { Game, Question } from '@app/interfaces/game';
import type { Match } from '@app/interfaces/match';
import { GameService } from '@app/services/games.service';
import { MatchService } from '@app/services/match.service';
import { SocketService } from '@app/services/socket.service';

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
    timerCountdown: number;

    gameScore: { name: string; score: number }[] = [];

    playerName: string;

    private answerIdx: number[];

    constructor(
        private gameService: GameService,
        private router: Router,
        private matchService: MatchService,
        private route: ActivatedRoute,
        private socketService: SocketService,
    ) {}

    get questionTimer(): number {
        return this.gameData?.duration;
    }

    async ngOnInit() {
        // Get the game ID from the URL
        this.gameId = this.route.snapshot.params['id'];
        // Fetch the game data from the server
        await this.fetchGameData(this.gameId);
        // Create a new match and set up the match ID
        await this.createAndSetupMatch();
        // Set up the web socket events for the timer
        this.setupWebSocketEvents();
        // Start the timer
        this.socketService.startTimer();
    }

    async fetchGameData(gameId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.gameService.getGame(gameId).subscribe({
                next: (gameData: Game) => {
                    this.gameData = gameData;
                    resolve();
                },
                error: (error) => {
                    alert(error.message);
                    reject(error);
                },
            });
        });
    }

    async createAndSetupMatch(): Promise<void> {
        this.matchId = crypto.randomUUID();
        return new Promise((resolve, reject) => {
            this.matchService.createNewMatch({ id: this.matchId, playerList: [] }).subscribe({
                next: (matchData) => {
                    this.currentMatch = matchData;
                    this.matchService.addPlayer({ id: 'playertest', name: 'Player 1', score: 0 }, this.matchId).subscribe({
                        next: (data) => {
                            this.currentMatch = data;
                            resolve();
                        },
                        error: (error) => {
                            alert(error.message);
                            reject(error);
                        },
                    });
                },
                error: (error) => {
                    alert(error.message);
                    reject(error);
                },
            });
        });
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
        this.socketService.onTimerDuration((data) => {
            // eslint-disable-next-line no-console
            console.log(data);
        });
        this.socketService.onTimerUpdate((data) => {
            // eslint-disable-next-line no-console
            console.log(data);
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
        // this.socketService
        if (this.currentQuestionIndex < this.getTotalQuestions() - 1) {
            setTimeout(() => {
                this.handleNextQuestion();
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

    private handleNextQuestion(): void {
        this.currentQuestionIndex++;
        this.questionHasExpired = false;
        this.socketService.startTimer();
    }
}
