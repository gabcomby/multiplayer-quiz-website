import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { API_BASE_URL } from '@app/app.module';
import type { Question } from '@app/interfaces/game';
import type { Player } from '@app/interfaces/match';
import { SocketService } from './socket.service';

const TIME_BETWEEN_QUESTIONS = 3000;
const LAUNCH_TIMER_DURATION = 5;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    lobbyCode: string = '';
    playerList: Player[] = [];
    isHost: boolean = false;
    roomLocked: boolean = false;
    launchTimer: boolean = true;
    currentQuestionIndex: number = 0;
    nbrOfQuestions: number = 0;
    totalQuestionDuration: number = 0;
    currentQuestion: Question | null;
    timerStopped: boolean = false;
    answersClicked: [string, number[]][] = [];
    answerIdx: number[] = [];
    allQuestionsFromGame: Question[] = [];
    allAnswersIndex: [string, number[]][] = [];
    apiUrl: string;
    timerCountdown: number;
    playerLeftList: Player[] = [];

    constructor(
        @Inject(API_BASE_URL) apiBaseURL: string,
        private socketService: SocketService,
        private router: Router,
    ) {
        this.apiUrl = `${apiBaseURL}/games`;
    }

    get lobbyCodeValue(): string {
        return this.lobbyCode;
    }

    get playerListValue(): Player[] {
        return this.playerList;
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

    get currentQuestionValue(): Question | null {
        return this.currentQuestion;
    }

    get timerStoppedValue(): boolean {
        return this.timerStopped;
    }

    get liveAnswersClickedValue(): [string, number[]][] {
        return this.answersClicked;
    }

    get allQuestionsFromGameValue(): Question[] {
        return this.allQuestionsFromGame;
    }

    get allAnswersIndexValue(): [string, number[]][] {
        return this.allAnswersIndex;
    }

    set answerIndex(answerIdx: number[]) {
        this.answerIdx = answerIdx;
        this.socketService.sendLiveAnswers(this.answerIdx);
    }

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
        this.currentQuestion = null;
        this.answerIdx = [];
        this.allQuestionsFromGame = [];
        this.allAnswersIndex = [];
        this.answersClicked = [];
        this.playerLeftList = [];
    }

    startGame(): void {
        this.socketService.startGame();
    }

    nextQuestion(): void {
        if (this.currentQuestionIndex + 1 === this.nbrOfQuestions) {
            this.socketService.nextQuestion();
        } else {
            setTimeout(() => {
                this.socketService.nextQuestion();
            }, TIME_BETWEEN_QUESTIONS);
        }
    }

    submitAnswer(): void {
        this.socketService.sendLockedAnswers(this.answerIdx);
    }

    setupWebsocketEvents(): void {
        this.socketService.onRoomCreated((roomId) => {
            this.lobbyCode = roomId;
            this.isHost = true;
        });

        this.socketService.onTimerCountdown((data) => {
            this.timerCountdown = data;
        });

        this.socketService.onPlayerListChange((playerList: [[string, Player]]) => {
            const playerListOriginal = new Map(playerList);
            const newPlayerList = [...playerListOriginal.values()];
            this.playerList = [...newPlayerList];
        });

        this.socketService.onPlayerLeftListChange((playerList: Player[]) => {
            this.playerLeftList = playerList;
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
            this.timerStopped = false;
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

        this.socketService.onQuestion((question: Question, questionIndex: number) => {
            this.timerStopped = false;
            this.currentQuestionIndex = questionIndex;
            this.currentQuestion = question;
        });

        this.socketService.onTimerStopped(() => {
            this.timerStopped = true;
            this.socketService.sendAnswers(this.answerIdx);
        });

        this.socketService.onLivePlayerAnswers((answers: [string, number[]][]) => {
            this.answersClicked = answers;
        });

        this.socketService.onGoToResult((playerList: [[string, Player]], questionList: Question[], allAnswersIndex: [string, number[]][]) => {
            const playerListOriginal = new Map(playerList);
            const newPlayerList = [...playerListOriginal.values()];
            this.playerList = [...newPlayerList];
            this.allQuestionsFromGame = questionList;
            this.allAnswersIndex = allAnswersIndex;
            this.router.navigate(['/resultsView']);
        });
    }
}
