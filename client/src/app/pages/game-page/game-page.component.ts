import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { Game, Question } from '@app/interfaces/game';
import type { Match } from '@app/interfaces/match';
import { GameService } from '@app/services/games.service';
import { MatchService } from '@app/services/match.service';
import { SocketService } from '@app/services/socket.service';
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
    timerCountdown: number;

    gameScore: { name: string; score: number }[] = [];

    playerName: string;

    constructor(
        private timerService: TimerService,
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
        // Extract game ID from route parameters first. This doesn't need to be awaited.
        this.gameId = this.route.snapshot.params['id'];

        // Fetch game data synchronously before setting up WebSocket and other dependencies.
        await this.fetchGameData(this.gameId);

        // After game data is fetched, proceed with match creation and player addition.
        await this.createAndSetupMatch();

        // Now that the match is set up and we have the necessary game data,
        // connect to the WebSocket and set up real-time event listeners.
        this.setupWebSocketEvents();

        // Finally, start the WebSocket timer now that everything is set up.
        this.socketService.startTimer();
    }

    // Convert fetchGameData to return a Promise.
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

    // Create and setup match as a promise to ensure sequential execution.
    async createAndSetupMatch(): Promise<void> {
        this.matchId = crypto.randomUUID();
        // Wrap the entire operation in a Promise to handle both match creation and player addition.
        return new Promise((resolve, reject) => {
            this.matchService.createNewMatch({ id: this.matchId, playerList: [] }).subscribe({
                next: (matchData) => {
                    this.currentMatch = matchData;
                    // After match creation, add player.
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

    // Setup WebSocket events without awaiting them since they are real-time and continuous.
    setupWebSocketEvents() {
        this.socketService.connect();
        this.socketService.onTimerCountdown((data) => {
            this.timerCountdown = data;
            if (this.timerCountdown === 0) {
                this.onTimerComplete();
            }
        });
        // Ensure game data duration is available before setting timer duration.
        if (this.gameData && this.gameData.duration) {
            this.socketService.setTimerDuration(this.gameData.duration);
        }
        // Additional WebSocket event listeners.
        this.socketService.onTimerDuration((data) => {
            // eslint-disable-next-line no-console
            console.log(data);
        });
        this.socketService.onTimerUpdate((data) => {
            // eslint-disable-next-line no-console
            console.log(data);
        });
    }

    // async ngOnInit() {
    //     this.socketService.connect();
    //     await this.socketService.onTimerCountdown((data) => {
    //         this.timerCountdown = data;
    //     });
    //     this.socketService.setTimerDuration(this.gameData.duration);
    //     this.route.params.subscribe((params) => {
    //         this.gameId = params['id'];
    //     });
    //     this.fetchGameData(this.gameId);
    //     this.matchId = crypto.randomUUID();
    //     this.matchService.createNewMatch({ id: this.matchId, playerList: [] }).subscribe({
    //         next: (data) => {
    //             this.currentMatch = data;
    //         },
    //         error: (error) => {
    //             alert(error.message);
    //         },
    //     });
    //     this.matchService.addPlayer({ id: 'playertest', name: 'Player 1', score: 0 }, this.matchId).subscribe({
    //         next: (data) => {
    //             this.currentMatch = data;
    //         },
    //         error: (error) => {
    //             alert(error.message);
    //         },
    //     });
    //     this.socketService.onTimerDuration((data) => {
    //         // eslint-disable-next-line no-console
    //         console.log(data);
    //     });

    //     this.socketService.onTimerUpdate((data) => {
    //         // eslint-disable-next-line no-console
    //         console.log(data);
    //     });
    //     this.socketService.startTimer();
    // }

    // async fetchGameData(gameId: string): void {
    //     this.gameService.getGame(gameId).subscribe({
    //         next: (gameData: Game) => {
    //             this.gameData = gameData;
    //             this.startQuestionTimer();
    //         },
    //         error: (error) => {
    //             alert(error.message);
    //         },
    //     });
    // }

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

    startQuestionTimer() {
        this.timerService.startTimer(this.questionTimer).subscribe({
            complete: () => {
                this.onTimerComplete();
            },
        });
    }

    onTimerComplete(): void {
        this.socketService.stopTimer();
        this.questionHasExpired = true;
        if (this.currentQuestionIndex < this.getTotalQuestions() - 1) {
            setTimeout(() => {
                this.currentQuestionIndex++;
                this.questionHasExpired = false;
                this.socketService.setTimerDuration(this.gameData.duration);
                this.socketService.startTimer();
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
