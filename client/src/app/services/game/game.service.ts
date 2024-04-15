/* eslint-disable max-lines */
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { API_BASE_URL } from '@app/app.module';
import { QRL_TIMER_DURATION, SOCKET_TIMER_DURATION, TIME_BETWEEN_QUESTIONS, WAIT_UNTIL_FIRE_DISCONNECTS } from '@app/config/client-config';
import { QuestionType, type Question } from '@app/interfaces/game';
import type { Player } from '@app/interfaces/match';
import { AnswerStateService } from '@app/services/answer-state/answer-state.service';
import { ChatService } from '@app/services/chat/chat.service';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { SocketService } from '@app/services/socket/socket.service';

const AUDIO_CLIP_PATH = 'assets/chipi-chipi-chapa-chapa.mp3';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    apiUrl: string;
    private playerName: string;
    private lobbyCode: string = '';
    private playerList: Player[] = [];
    private isHost: boolean = false;
    private roomLocked: boolean = false;
    private launchTimer: boolean = true;
    private currentQuestionIndex: number = 0;
    private currentQRLIndex: number = 0;
    private nbrOfQuestions: number = 0;
    private totalQuestionDuration: number = 0;
    private currentQuestion: Question | null;
    private timerStopped: boolean = false;
    private answersClicked: [string, number[] | string][] = [];
    private answerIndex: number[] = [];
    private allQuestionsFromGame: Question[] = [];
    private allAnswersIndex: [string, number[]][] = [];
    private timerCountdown: number;
    private playerLeftList: Player[] = [];
    private gameTitle = '';
    private answerText: string = '';
    private answersTextQRL: [string, [Player, string][]][];
    private currentPlayer: Player;
    private pointsQRL: [Player, number][];
    private gameTimerPaused = false;
    private audio = new Audio();
    private gameType: number;
    private numberInputModified: number = 0;
    private playersListResult: Player[] = [];
    private countAnswerQrl: number = 0;
    private isTest: boolean = false;

    // eslint-disable-next-line -- needed for SoC (Separation of Concerns)
    constructor(
        @Inject(API_BASE_URL) apiBaseURL: string,
        private socketService: SocketService,
        private router: Router,
        private snackbar: SnackbarService,
        private chatService: ChatService,
        private answerStateService: AnswerStateService,
    ) {
        this.apiUrl = `${apiBaseURL}/games`;
    }

    get playerNameValue(): string {
        return this.playerName;
    }

    get lobbyCodeValue(): string {
        return this.lobbyCode;
    }

    get playerListValue(): Player[] {
        return this.playerList;
    }

    get playersListResultValue(): Player[] {
        return this.playersListResult;
    }

    get playerLeftListValue(): Player[] {
        return this.playerLeftList;
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

    get currentQRLIndexValue(): number {
        return this.currentQRLIndex;
    }

    get nbrOfQuestionsValue(): number {
        return this.nbrOfQuestions;
    }

    get currentPlayerValue(): Player {
        return this.currentPlayer;
    }

    get totalQuestionDurationValue(): number {
        if (this.launchTimer) {
            return SOCKET_TIMER_DURATION;
        } else if (this.currentQuestion?.type === QuestionType.QRL) {
            return QRL_TIMER_DURATION;
        } else {
            return this.totalQuestionDuration;
        }
    }

    get currentQuestionValue(): Question | null {
        return this.currentQuestion;
    }

    get timerStoppedValue(): boolean {
        return this.timerStopped;
    }

    get liveAnswersClickedValue(): [string, number[] | string][] {
        return this.answersClicked;
    }

    get allQuestionsFromGameValue(): Question[] {
        return this.allQuestionsFromGame;
    }

    get allAnswersIndexValue(): [string, number[]][] {
        return this.allAnswersIndex;
    }

    get gameTitleValue(): string {
        return this.gameTitle;
    }

    get answersTextQRLValue(): [string, [Player, string][]][] {
        return this.answersTextQRL;
    }
    get answerTextQRLValue() {
        return this.answerText;
    }

    get answersClickedValue(): [string, number[] | string][] {
        return this.answersClicked;
    }

    get gameTimerPausedValue(): boolean {
        return this.gameTimerPaused;
    }
    get numberInputModifidedValue(): number {
        return this.numberInputModified;
    }

    get gameTypeValue(): number {
        return this.gameType;
    }

    get isTestValue(): boolean {
        return this.isTest;
    }

    set answerIndexSetter(answerIdx: number[]) {
        this.answerIndex = answerIdx;
        this.socketService.sendLiveAnswers(this.answerIndex, this.currentPlayer, true);
    }
    set answerTextSetter(answerText: string) {
        this.countAnswerQrl += 1;
        this.answerText = answerText;
        if (this.currentQuestionIndex === 0 && this.countAnswerQrl > 2) {
            this.socketService.sendLiveAnswers(this.answerText, this.currentPlayer, false);
        } else if (this.currentQuestionIndex > 0 && this.countAnswerQrl > 1) {
            this.socketService.sendLiveAnswers(this.answerText, this.currentPlayer, false);
        } else {
            this.socketService.sendLiveAnswers(this.answerText, this.currentPlayer, true);
        }
    }

    set playerQRLPoints(points: [Player, number][]) {
        if (points.length === this.answersTextQRL[this.currentQRLIndex][1].length) {
            this.pointsQRL = points;
        }
    }

    updatePointsQRL(): void {
        this.currentQRLIndex++;
        this.socketService.updatePointsQRL(this.pointsQRL);
    }

    setPlayerName(playerName: string): void {
        this.playerName = playerName;
    }

    leaveRoom(): void {
        this.socketService.leaveRoom();
        setTimeout(() => {
            this.socketService.disconnect();
        }, WAIT_UNTIL_FIRE_DISCONNECTS);
    }

    banPlayer(name: string): void {
        this.socketService.banPlayer(name);
    }

    resetGameVariables(): void {
        this.lobbyCode = '';
        this.playerList = [];
        this.isHost = false;
        this.roomLocked = false;
        this.currentQuestion = null;
        this.answerIndex = [];
        this.currentQRLIndex = 0;
        this.answersTextQRL = [];
        this.answerText = '';
        this.allQuestionsFromGame = [];
        this.allAnswersIndex = [];
        this.answersClicked = [];
        this.playerLeftList = [];
        this.chatService.resetMessages();
        this.answerStateService.resetAnswerState();
        this.gameTimerPaused = false;
        this.audio.src = AUDIO_CLIP_PATH;
        this.audio.load();
        this.countAnswerQrl = 0;
        this.isTest = false;
    }

    startGame(): void {
        this.socketService.startGame();
    }

    pauseTimer(): void {
        this.gameTimerPaused = !this.gameTimerPaused;
        this.socketService.pauseTimer();
    }

    enablePanicMode(): void {
        this.socketService.enablePanicMode();
    }

    nextQuestion(): void {
        if (this.currentQuestion?.type === QuestionType.QRL) this.updatePointsQRL();
        if (this.currentQuestionIndex + 1 === this.nbrOfQuestions) {
            this.socketService.nextQuestion();
        } else {
            setTimeout(() => {
                this.gameTimerPaused = false;
                this.socketService.nextQuestion();
            }, TIME_BETWEEN_QUESTIONS);
        }
    }

    submitAnswer(): void {
        if (this.currentQuestion?.type === QuestionType.QRL) {
            this.socketService.sendLockedAnswers(this.answerText, this.currentPlayer);
        } else {
            this.socketService.sendLockedAnswers(this.answerIndex, this.currentPlayer);
        }
    }
    gameLaunch(nbrOfQuestions: number, questionDuration: number): void {
        this.launchTimer = true;
        this.timerStopped = false;
        this.nbrOfQuestions = nbrOfQuestions;
        this.totalQuestionDuration = questionDuration;
        this.currentQuestionIndex = 0;
        if (this.isHost && this.gameType === 0) {
            this.router.navigate(['/host-game-page']);
        } else {
            this.router.navigate(['/game']);
        }
    }
    goToResult(playerList: [[string, Player]], questionList: Question[], allAnswersIndex: [string, number[]][]) {
        const playerListOriginal = new Map(playerList);
        const newPlayerList: Player[] = [...playerListOriginal.values()];
        this.playerList = [...newPlayerList];
        this.playersListResult = [...newPlayerList];
        this.allQuestionsFromGame = questionList;
        this.allAnswersIndex = allAnswersIndex;
        this.router.navigate(['/resultsView']);
    }
    roomCreated(roomId: string, gameTitle: string, gameType: number) {
        this.lobbyCode = roomId;
        this.isHost = true;
        this.gameTitle = gameTitle;
        this.gameType = gameType;
    }
    roomTestCreated(gameTitle: string, playerList: [[string, Player]]) {
        const playerListOriginal = new Map(playerList);
        const newPlayerList = [...playerListOriginal.values()];
        this.playerList = [...newPlayerList];
        this.gameTitle = gameTitle;
        this.isTest = true;
    }
    playerListChange(playerList: [[string, Player]]) {
        const playerListOriginal = new Map(playerList);
        const newPlayerList = [...playerListOriginal.values()];
        this.playerList = [...newPlayerList];
    }
    lobbyDeleted() {
        this.snackbar.openSnackBar('The host has left the game', 'Close');
        setTimeout(() => {
            this.socketService.disconnect();
        }, TIME_BETWEEN_QUESTIONS);
        this.router.navigate(['/home']);
    }
    questionSwitch(question: Question, questionIndex: number) {
        this.countAnswerQrl = 0;
        this.timerStopped = false;
        this.currentQuestionIndex = questionIndex;
        this.currentQuestion = question;
    }
    onTimerStopped() {
        this.timerStopped = true;
        if (this.currentQuestion?.type === QuestionType.QRL) {
            this.socketService.sendAnswers(this.answerText, this.currentPlayer);
        } else {
            this.socketService.sendAnswers(this.answerIndex, this.currentPlayer);
        }
    }
    onRoomJoined(roomId: string, gameTitle: string, currentPlayer: Player) {
        this.lobbyCode = roomId;
        this.gameTitle = gameTitle;
        this.currentPlayer = currentPlayer;
    }

    setupWebsocketEvents(): void {
        this.socketService.onRoomCreated((roomId: string, gameTitle: string, gameType: number) => {
            this.roomCreated(roomId, gameTitle, gameType);
        });

        this.socketService.onRoomTestCreated((gameTitle: string, playerList: [[string, Player]]) => {
            this.roomTestCreated(gameTitle, playerList);
        });

        this.socketService.onTimerCountdown((data) => {
            this.timerCountdown = data;
        });

        this.socketService.onPlayerListChange((playerList: [[string, Player]]) => {
            this.playerListChange(playerList);
        });

        this.socketService.onPlayerLeftListChange((playerList: Player[]) => {
            this.playerLeftList = playerList;
        });

        this.socketService.onLobbyDeleted(() => {
            this.lobbyDeleted();
        });

        this.socketService.onRoomJoined((roomId: string, gameTitle: string, currentPlayer: Player) => {
            this.onRoomJoined(roomId, gameTitle, currentPlayer);
        });

        this.socketService.onBannedFromGame(() => {
            this.leaveRoom();
            this.router.navigate(['/home']);
        });

        this.socketService.onRoomLockStatus((isLocked: boolean) => {
            this.roomLocked = isLocked;
        });

        this.socketService.onGameLaunch((questionDuration: number, nbrOfQuestions: number) => {
            this.gameLaunch(nbrOfQuestions, questionDuration);
        });
        this.socketService.onQuestionTimeUpdated((data: number) => {
            this.totalQuestionDuration = data;
        });
        this.socketService.onQuestion((question: Question, questionIndex: number) => {
            if (this.launchTimer) {
                this.launchTimer = false;
            }
            this.questionSwitch(question, questionIndex);
        });
        this.socketService.onTimerStopped(() => {
            this.onTimerStopped();
        });
        this.socketService.onLivePlayerAnswers((answers: [string, number[] | string][]) => {
            this.answersClicked = answers;
        });
        this.socketService.onLockedAnswersQRL((answers: [string, [Player, string][]][]) => {
            this.answersTextQRL = answers;
        });
        this.socketService.onGoToResult((playerList: [[string, Player]], questionList: Question[], allAnswersIndex: [string, number[]][]) => {
            this.goToResult(playerList, questionList, allAnswersIndex);
        });
        this.socketService.onPanicModeEnabled(() => {
            this.audio.play();
        });
        this.socketService.onUpdateNbModified((nbModification: number) => {
            this.numberInputModified = nbModification;
        });
        this.socketService.onPanicModeDisabled(() => {
            this.audio.pause();
            this.audio.currentTime = 0;
        });
    }
}
