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

// const TIME_BETWEEN_QUESTIONS = 3000;
const LAUNCH_TIMER_DURATION = 5;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    // ==================== NEW VARIABLES USED AFTER REFACTOR ====================
    lobbyCode: string = '';
    playerList: Player[] = [];
    isHost: boolean = false;
    roomLocked: boolean = false;
    launchTimer: boolean = true;
    currentQuestionIndex: number = 0;
    nbrOfQuestions: number = 0;
    totalQuestionDuration: number = 0;
    currentQuestion: Question;
    // ==================== NEW VARIABLES USED AFTER REFACTOR ====================
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
    // currentQuestionIndex: number;
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

    // ==================== NEW GETTERS USED AFTER REFACTOR ====================
    get lobbyCodeValue(): string {
        return this.lobbyCode;
    }

    get playerListValue(): Player[] {
        return this.playerList;
    }

    get isHostValue(): boolean {
        return this.isHost;
    }

    get roomIsLockedValue(): boolean {
        return this.roomLocked;
    }

    get launchTimerValue(): boolean {
        return this.launchTimer;
    }

    get timerCountdownValue(): number {
        return this.timerCountdown;
    }

    get currentQuestionIndexValue(): number {
        return this.currentQuestionIndex;
    }

    get nbrOfQuestionsValue(): number {
        return this.nbrOfQuestions;
    }

    get totalQuestionDurationValue(): number {
        if (this.launchTimer) {
            return LAUNCH_TIMER_DURATION;
        } else {
            return this.totalQuestionDuration;
        }
    }

    get currentQuestionValue(): Question {
        // if (this.currentQuestion) {
        //     return this.currentQuestion;
        // } else {
        //     return {
        //         type: '',
        //         text: '',
        //         points: 0,
        //         lastModification: new Date(),
        //         id: '',
        //         choices: [],
        //     };
        // }
        return this.currentQuestion;
    }
    // ==================== NEW GETTERS USED AFTER REFACTOR ====================

    get gameDataValue(): Game {
        return this.gameData;
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

    // ==================== NEW FUNCTIONS USED AFTER REFACTOR ====================
    leaveRoom(): void {
        this.socketService.leaveRoom();
        this.socketService.disconnect();
        this.router.navigate(['/home']);
    }

    banPlayer(name: string): void {
        this.socketService.banPlayer(name);
    }

    resetGameVariables(): void {
        this.lobbyCode = '';
        this.playerList = [];
        this.isHost = false;
        this.roomLocked = false;
    }

    startGame(): void {
        this.socketService.startGame();
    }

    setupWebsocketEvents(): void {
        // ==================== SOCKETS USED AFTER REFACTOR ====================

        this.socketService.onRoomCreated((roomId) => {
            this.lobbyCode = roomId;
            this.isHost = true;
        });

        this.socketService.onTimerCountdown((data) => {
            this.timerCountdown = data;
        });

        this.socketService.onPlayerListChange((playerList: [[string, Player]]) => {
            const playerListOriginal = new Map(playerList);
            this.playerList = [...playerListOriginal.values()];
        });

        this.socketService.onLobbyDeleted(() => {
            this.socketService.disconnect();
            this.router.navigate(['/home']);
        });

        this.socketService.onRoomJoined((roomId) => {
            this.lobbyCode = roomId;
        });

        this.socketService.onBannedFromGame(() => {
            this.leaveRoom();
        });

        this.socketService.onRoomLockStatus((isLocked: boolean) => {
            this.roomLocked = isLocked;
        });

        this.socketService.onGameLaunch((questionDuration: number, nbrOfQuestions: number) => {
            this.launchTimer = true;
            this.nbrOfQuestions = nbrOfQuestions;
            this.totalQuestionDuration = questionDuration;
            this.currentQuestionIndex = 0;
            if (this.isHost) {
                this.router.navigate(['/host-game-page']);
            } else {
                this.router.navigate(['/game']);
            }
        });

        this.socketService.onQuestionTimeUpdated((data: number) => {
            this.launchTimer = false;
            this.totalQuestionDuration = data;
        });

        this.socketService.onQuestion((question: Question) => {
            this.currentQuestion = question;
        });

        // ==================== SOCKETS USED AFTER REFACTOR ====================

        // this.socketService.onStopTimer(() => {
        //     // this.onTimerComplete();
        //     // if (this.currentQuestionIndex < this.gameData.questions.length - 1) {
        //     //     this.nextQuestion = true;
        //     // }
        //     console.log('stop-timer');
        // });

        // this.socketService.onPlayerAnswer().subscribe((answer: AnswersPlayer[]) => {
        //     this.answersSelected.next(answer);
        // });

        // this.socketService.onEndGame().subscribe(() => {
        //     this.calculateFinalResults();
        // });

        // this.socketService.onAdminDisconnect(() => {
        //     this.handleGameLeave();
        // });

        // this.socketService.onPlayerDisconnect((playerId) => {
        //     const playerGone = this.lobbyData.playerList.find((player) => player.id === playerId);
        //     if (playerGone) {
        //         this.playerGoneList.push(playerGone);
        //     }
        //     this.lobbyData.playerList = this.lobbyData.playerList.filter((player) => player.id !== playerId);
        // });
        // this.socketService.onLastPlayerDisconnected(() => {
        //     this.handleGameLeave();
        // });

        // this.socketService.onGotBonus((playerId: string) => {
        //     this.calculateBonus(playerId);
        // });

        // this.socketService.onResultView(() => {
        //     this.router.navigate(['/resultsView']);
        // });
        // this.socketService.onNextQuestion(() => {
        //     setTimeout(() => {
        //         this.handleNextQuestion();
        //     }, TIME_BETWEEN_QUESTIONS);
        //     this.nextQuestion = false;
        // });
        // this.socketService.onBannedPlayer(() => {
        //     this.handleGameLeave();
        // });

        // this.socketService.onAnswerVerification((score) => {
        //     const scoreMap = new Map(score);
        //     for (const player of this.lobbyData.playerList) {
        //         const newScore = scoreMap.get(player.id);
        //         if (newScore) {
        //             player.score = newScore;
        //         } else {
        //             player.score = 0;
        //         }
        //         // if (multiplier === BONUS_MULTIPLIER) {
        //         // this.lobbyData.playerList[index].bonus++;
        //         // }
        //     }
        // });

        // this.socketService.onLivePlayerAnswers((answers) => {
        //     this.addAnswersClicked(answers);
        // });
    }
    // ==================== NEW FUNCTIONS USED AFTER REFACTOR ====================

    // gameEnded(): void {
    //     this.socketService.onEndGame().subscribe(() => {
    //         this.calculateFinalResults();
    //     });
    // }

    // gameIsFinished(): void {
    //     if (this.currentQuestionIndex + 1 === this.gameDataValue.questions.length) {
    //         this.socketService.gameIsFinishedSocket();
    //     }
    // }
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

    // clickPlayerAnswer(answerIdx: number[]) {
    //     this.socketService.sendClickedAnswer(answerIdx);
    // }

    // sendPlayerAnswer(answer: AnswersPlayer) {
    //     this.socketService.sendPlayerAnswer(answer);
    // }

    getPlayerAnswers(): Observable<AnswersPlayer[]> {
        return this.answersSelected.asObservable();
    }

    // onTimerComplete(): void {
    //     if (this.isLaunchTimer) {
    //         this.isLaunchTimer = false;
    //         this.socketService.setTimerDuration(this.gameData.duration);
    //         this.socketService.startTimer();
    //         return;
    //     } else {
    //         this.questionHasExpired = true;
    //         this.previousQuestionIndex = this.currentQuestionIndex;
    //         if (this.currentPlayerId !== this.lobbyData.hostId) {
    //             this.socketService.verifyAnswers(this.gameData.questions[this.previousQuestionIndex], this.answerIdx);
    //         }
    //         if (!(this.currentQuestionIndex < this.gameData.questions.length - 1)) {
    //             if (this.currentPlayerId !== this.lobbyData.hostId) {
    //                 this.playerChoice.set(this.currentQuestion.text, this.answerIdx);
    //                 this.sendPlayerAnswer(this.playerChoice);
    //             }

    //             this.questions.push(this.currentQuestion);
    //             this.questionGame.next(this.questions);
    //             // this.handleGameLeave();
    //         }
    //         this.gameIsFinished();
    //     }
    // }

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

    addAnswersClicked(answersClicked: [string, number[]][]): void {
        this.answersClicked = answersClicked;
    }

    // private calculateBonus(playerId: string) {
    //     let player: Player;
    //     for (player of this.playerListFromLobby) {
    //         if (player.id === playerId) {
    //             player.bonus++;
    //         }
    //     }
    // }

    // private handleNextQuestion(): void {
    //     if (this.currentPlayerId !== this.lobbyData.hostId) {
    //         this.playerChoice.set(this.currentQuestion.text, this.answerIdx);
    //     }
    //     this.questions.push(this.currentQuestion);

    //     this.currentQuestionIndex++;
    //     this.questionHasExpired = false;
    //     this.socketService.startTimer();
    // }
}
