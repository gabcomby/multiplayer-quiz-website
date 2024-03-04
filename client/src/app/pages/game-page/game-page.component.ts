import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { Game, Question } from '@app/interfaces/game';
import type { Match } from '@app/interfaces/match';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { GameService } from '@app/services/game.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { MatchService } from '@app/services/match.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';

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
    lobbyData: MatchLobby = {
        id: '',
        playerList: [],
        gameId: '',
        bannedNames: [],
        lobbyCode: '',
        isLocked: false,
    };
    lobbyId: string;
    gameId: string;
    currentPlayerId: string;

    currentQuestionIndex: number = 0;
    questionHasExpired: boolean = false;
    currentMatch: Match = { id: '', playerList: [] };
    matchId: string;

    timerCountdown: number;
    answerIsCorrect: boolean;

    gameScore: { name: string; score: number }[] = [];

    playerName: string;

    answerIdx: number[];
    previousQuestionIndex: number;

    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private matchService: MatchService,
        private route: ActivatedRoute,
        private socketService: SocketService,
        private gameService: GameService,
        private snackbarService: SnackbarService,
        private matchLobbyService: MatchLobbyService,
    ) {}

    // REFACTOR DONE
    ngOnInit() {
        this.lobbyId = this.route.snapshot.params['lobbyId'];
        this.currentPlayerId = this.route.snapshot.params['playerId'];
        this.matchLobbyService.getLobby(this.lobbyId).subscribe({
            next: (lobbyData) => {
                this.lobbyData = lobbyData;
                this.gameService.getGame(this.lobbyData.gameId).subscribe({
                    next: (gameData) => {
                        this.gameData = gameData;
                        this.setupWebSocketEvents();
                        this.socketService.startTimer();
                    },
                    error: (error) => {
                        this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante en chargeant la partie: ${error}`);
                    },
                });
            },
            error: (error) => {
                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante en chargeant le lobby: ${error}`);
            },
        });
    }

    // REFACTOR DONE
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

    // REFACTOR DONE
    updatePlayerScore(scoreFromQuestion: number): void {
        this.matchLobbyService.updatePlayerScore(this.lobbyId, this.currentPlayerId, scoreFromQuestion).subscribe({
            next: (data) => {
                this.lobbyData = data;
            },
            error: (error) => {
                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante en mettant à jour le score du joueur: ${error}`);
            },
        });
    }

    // REFACTOR DONE
    // TODO: Delete the game and kick everyone out when the host leaves or when 0 players are left or when the game is over
    handleGameLeave() {
        this.matchLobbyService.removePlayer(this.currentPlayerId, this.lobbyId).subscribe({
            next: (data) => {
                this.lobbyData = data;
                if (this.lobbyData.playerList.length === 0) {
                    this.matchLobbyService.deleteLobby(this.lobbyId).subscribe({
                        next: () => {
                            this.socketService.disconnect();
                            this.router.navigate(['/new-game']);
                        },
                        error: (error) => {
                            this.snackbarService.openSnackBar(
                                `Nous avons rencontré l'erreur suivante en quittant et en supprimant la partie: ${error}`,
                            );
                        },
                    });
                } else {
                    this.socketService.disconnect();
                    this.router.navigate(['/new-game']);
                }
            },
            error: (error) => {
                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante en quittant la partie: ${error}`);
            },
        });
    }

    // TODO: Inside of function should be moved to a service
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
                choices: [],
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
