/* eslint-disable max-lines */
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { API_BASE_URL } from '@app/app.module';
import type { AnswersPlayer, Game, Question } from '@app/interfaces/game';
import type { Player } from '@app/interfaces/match';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { AnswerStateService } from '@app/services/answer-state.service';
import { ApiService } from '@app/services/api.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { SnackbarService } from './snackbar.service';
import { SocketService } from './socket.service';

const TIME_BETWEEN_QUESTIONS = 3000;
const START_TIMER_DURATION = 5;
// const BONUS_MULTIPLIER = 1.2;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    lobbyCode: string;
    finalResultsEmitter = new ReplaySubject<Player[]>(1);
    answersSelected = new ReplaySubject<AnswersPlayer[]>(1);
    playerAnswers: Subject<AnswersPlayer> = new Subject<AnswersPlayer>();
    questionGame = new ReplaySubject<Question[]>(1);
    questions: Question[] = [];
    playerChoice: AnswersPlayer = new Map<string, number[]>();

    apiUrl: string;
    timerCountdown: number;
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
        hostId: '',
    };
    lobbyId: string;
    gameId: string;
    currentPlayerId: string;
    currentPlayerName: string;
    answerIdx: number[];
    playerGoneList: Player[] = [];
    answersClicked: [string, number[]][] = [];
    // À BOUGER DANS LE SERVEUR??
    questionHasExpired: boolean;
    currentQuestionIndex: number;
    previousQuestionIndex: number;
    answerIsCorrect: boolean;
    subscription: Subscription;
    endGame = false;
    nextQuestion = false;
    private isLaunchTimer: boolean;
    // À BOUGER DANS LE SERVEUR??

    // eslint-disable-next-line max-params
    constructor(
        private apiService: ApiService,
        @Inject(API_BASE_URL) apiBaseURL: string,
        private matchLobbyService: MatchLobbyService,
        private socketService: SocketService,
        private snackbarService: SnackbarService,
        private router: Router,
        private answerStateService: AnswerStateService,
    ) {
        this.apiUrl = `${apiBaseURL}/games`;
    }

    get lobbyCodeValue(): string {
        return this.lobbyCode;
    }

    get timerCountdownValue(): number {
        return this.timerCountdown;
    }

    get gameDataValue(): Game {
        return this.gameData;
    }

    get currentQuestionIndexValue(): number {
        return this.currentQuestionIndex;
    }

    get currentGameLength(): number {
        return this.gameData.questions.length;
    }

    get currentGameTitle(): string {
        return this.gameData.title;
    }

    get currentPlayerNameValue(): string {
        if (this.currentPlayerId === this.lobbyData.hostId) {
            this.currentPlayerName = 'Organisateur';
        }
        return this.currentPlayerName;
    }

    get totalGameDuration(): number {
        return this.gameData.duration;
    }

    get currentQuestion(): Question {
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

    get questionHasExpiredValue(): boolean {
        return this.questionHasExpired;
    }

    get answerIsCorrectValue(): boolean {
        return this.answerIsCorrect;
    }

    get playerListFromLobby(): Player[] {
        return this.lobbyData.playerList;
    }

    get playerGoneListValue(): Player[] {
        return this.playerGoneList;
    }

    get matchLobby(): MatchLobby {
        return this.lobbyData;
    }

    get game(): Game {
        return this.gameData;
    }

    get isLaunchTimerValue(): boolean {
        return this.isLaunchTimer;
    }

    get lockStatus(): boolean {
        return this.lobbyData.isLocked;
    }

    set answerIndex(answerIdx: number[]) {
        this.answerIdx = answerIdx;
    }

    gameEnded(): void {
        this.socketService.onEndGame().subscribe(() => {
            this.calculateFinalResults();
        });
    }

    gameIsFinished(): void {
        if (this.currentQuestionIndex + 1 === this.gameDataValue.questions.length) {
            this.socketService.gameIsFinishedSocket();
        }
    }
    calculateFinalResults(): void {
        this.endGame = true;
        const finalResults: Player[] = this.playerListFromLobby;
        this.finalResultsEmitter.next(finalResults);
    }

    initializeLobbyAndGame(lobbyId: string, playerId: string): void {
        this.lobbyId = lobbyId;
        this.answersClicked = [];
        this.currentPlayerId = playerId;
        this.currentQuestionIndex = 0;
        this.previousQuestionIndex = 0;
        this.answerIdx = [];
        this.questionHasExpired = false;
        this.isLaunchTimer = true;
        this.endGame = false;
        this.questions = [];
        this.playerChoice = new Map();
        this.answerStateService.resetAnswerState();
        this.matchLobbyService.getLobby(this.lobbyId).subscribe({
            next: (lobbyData) => {
                this.lobbyData = lobbyData;
                if (this.lobbyData.playerList.find((player) => player.id === this.currentPlayerId)) {
                    // eslint-disable-next-line
                    this.currentPlayerName = this.lobbyData.playerList.find((player) => player.id === this.currentPlayerId)!.name;
                }
                this.apiService.getGame(this.lobbyData.gameId).subscribe({
                    next: (gameData) => {
                        this.gameData = gameData;
                        this.setupWebsocketEvents();
                    },
                    error: (error) => {
                        this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante en chargeant le lobby: ${error}`);
                    },
                });
            },
        });
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

    clickPlayerAnswer(answerIdx: number[]) {
        this.socketService.sendClickedAnswer(answerIdx);
    }

    sendPlayerAnswer(answer: AnswersPlayer) {
        this.socketService.sendPlayerAnswer(answer);
    }

    getPlayerAnswers(): Observable<AnswersPlayer[]> {
        return this.answersSelected.asObservable();
    }

    handleGameLeave() {
        if (this.matchLobby.hostId === this.currentPlayerId) {
            this.matchLobbyService.deleteLobby(this.lobbyId).subscribe({
                next: () => {
                    this.socketService.leaveRoom();
                    this.socketService.disconnect();
                    this.router.navigate(['/home']);
                },
                error: (error) => {
                    this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante en quittant et en supprimant la partie: ${error}`);
                },
            });
        } else {
            this.matchLobbyService.lobbyExists(this.lobbyId).subscribe({
                next: (data) => {
                    if (data === false) {
                        this.socketService.disconnect();
                        this.router.navigate(['/home']);
                    } else {
                        this.matchLobbyService.removePlayer(this.lobbyId, this.currentPlayerId).subscribe({
                            next: () => {
                                this.socketService.leaveRoom();
                                this.socketService.disconnect();
                                this.router.navigate(['/home']);
                            },
                            error: (error) => {
                                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante en quittant la partie: ${error}`);
                            },
                        });
                    }
                },
                error: (error) => {
                    this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante en chargeant le lobby: ${error}`);
                },
            });
        }
    }

    onTimerComplete(): void {
        if (this.isLaunchTimer) {
            this.isLaunchTimer = false;
            this.socketService.setTimerDuration(this.gameData.duration);
            this.socketService.startTimer();
            return;
        } else {
            this.questionHasExpired = true;
            this.previousQuestionIndex = this.currentQuestionIndex;
            if (this.currentPlayerId !== this.lobbyData.hostId) {
                this.socketService.verifyAnswers(this.gameData.questions[this.previousQuestionIndex], this.answerIdx);
            }
            if (!(this.currentQuestionIndex < this.gameData.questions.length - 1)) {
                if (this.currentPlayerId !== this.lobbyData.hostId) {
                    this.playerChoice.set(this.currentQuestion.text, this.answerIdx);
                    this.sendPlayerAnswer(this.playerChoice);
                }

                this.questions.push(this.currentQuestion);
                this.questionGame.next(this.questions);
                // this.handleGameLeave();
            }
            this.gameIsFinished();
        }
    }

    refreshPlayerList(): void {
        this.matchLobbyService.getPlayers(this.lobbyId).subscribe({
            next: (data) => {
                this.lobbyData.playerList = data;
            },
            error: (error) => {
                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante en actualisant la liste des joueurs: ${error}`);
            },
        });
    }

    setupWebsocketEvents(): void {
        // ==================== FUNCTIONS USED AFTER REFACTOR ====================

        this.socketService.onRoomCreated((roomId) => {
            this.lobbyCode = roomId;
        });

        this.socketService.onTimerCountdown((data) => {
            this.timerCountdown = data;
        });

        // ==================== FUNCTIONS USED AFTER REFACTOR ====================

        this.socketService.onPlayerAnswer().subscribe((answer: AnswersPlayer[]) => {
            this.answersSelected.next(answer);
        });

        this.socketService.onEndGame().subscribe(() => {
            this.calculateFinalResults();
        });

        this.socketService.onStopTimer(() => {
            this.onTimerComplete();
            if (this.currentQuestionIndex < this.gameData.questions.length - 1) {
                this.nextQuestion = true;
            }
        });

        this.socketService.onAdminDisconnect(() => {
            this.handleGameLeave();
        });

        this.socketService.onPlayerDisconnect((playerId) => {
            const playerGone = this.lobbyData.playerList.find((player) => player.id === playerId);
            if (playerGone) {
                this.playerGoneList.push(playerGone);
            }
            this.lobbyData.playerList = this.lobbyData.playerList.filter((player) => player.id !== playerId);
        });
        this.socketService.onLastPlayerDisconnected(() => {
            this.handleGameLeave();
        });

        // TODO: Quand new player join emit du serveur, le serveur devrait emit sa lite de joueurs
        this.socketService.onNewPlayerJoin(() => {
            this.refreshPlayerList();
        });

        this.socketService.onGotBonus((playerId: string) => {
            this.calculateBonus(playerId);
        });

        this.socketService.onGameLaunch(() => {
            if (this.currentPlayerId === this.lobbyData.hostId) {
                this.router.navigate(['/host-game-page']);
            } else {
                this.router.navigate(['/game']);
            }
            this.socketService.setTimerDuration(START_TIMER_DURATION);
            this.socketService.startTimer();
        });
        this.socketService.onResultView(() => {
            this.router.navigate(['/resultsView']);
        });
        this.socketService.onNextQuestion(() => {
            setTimeout(() => {
                this.handleNextQuestion();
            }, TIME_BETWEEN_QUESTIONS);
            this.nextQuestion = false;
        });
        this.socketService.onBannedPlayer(() => {
            this.handleGameLeave();
        });

        this.socketService.onAnswerVerification((score) => {
            const scoreMap = new Map(score);
            for (const player of this.lobbyData.playerList) {
                const newScore = scoreMap.get(player.id);
                if (newScore) {
                    player.score = newScore;
                } else {
                    player.score = 0;
                }
                // if (multiplier === BONUS_MULTIPLIER) {
                // this.lobbyData.playerList[index].bonus++;
                // }
            }
        });

        // this.socketService.onLivePlayerAnswers((answers) => {
        //     this.addAnswersClicked(answers);
        // });
    }

    addAnswersClicked(answersClicked: [string, number[]][]): void {
        this.answersClicked = answersClicked;
    }

    private calculateBonus(playerId: string) {
        let player: Player;
        for (player of this.playerListFromLobby) {
            if (player.id === playerId) {
                player.bonus++;
            }
        }
    }

    private handleNextQuestion(): void {
        if (this.currentPlayerId !== this.lobbyData.hostId) {
            this.playerChoice.set(this.currentQuestion.text, this.answerIdx);
        }
        this.questions.push(this.currentQuestion);

        this.currentQuestionIndex++;
        this.questionHasExpired = false;
        this.socketService.startTimer();
    }
}
