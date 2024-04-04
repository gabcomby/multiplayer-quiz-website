import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private socket: Socket;
    private readonly url: string = environment.socketUrl;

    connect(): void {
        this.socket = io(this.url, { autoConnect: true });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    onRoomCreated(callback: (roomId: string, gameTitle: string) => void): void {
        this.socket.on('room-created', (roomId: string, gameTitle: string) => {
            callback(roomId, gameTitle);
        });
    }

    onPlayerListChange(callback: (playerList: [[string, Player]]) => void) {
        this.socket.on('playerlist-change', (playerList: [[string, Player]]) => {
            callback(playerList);
        });
    }

    onPlayerLeftListChange(callback: (playerList: Player[]) => void) {
        this.socket.on('playerleftlist-change', (playerList: Player[]) => {
            callback(playerList);
        });
    }

    createRoom(gameId: string): void {
        this.socket.emit('create-room', gameId);
    }

    createRoomTest(gameId: string, player: Player): void {
        this.socket.emit('create-room-test', gameId, player);
    }

    onRoomTestCreated(callback: (gameTitle: string, playerList: [[string, Player]]) => void) {
        this.socket.on('room-test-created', (gameTitle: string, playerList: [[string, Player]]) => {
            callback(gameTitle, playerList);
        });
    }

    joinRoom(roomId: string, player: Player): void {
        this.socket.emit('join-room', roomId, player);
    }

    leaveRoom() {
        this.socket.emit('leave-room');
    }

    onLobbyDeleted(callback: () => void) {
        this.socket.on('lobby-deleted', () => {
            callback();
        });
    }

    onRoomJoined(callback: (roomId: string, gameTitle: string, playerJoined: Player) => void) {
        this.socket.on('room-joined', (roomId: string, gameTitle: string, playerJoined: Player) => {
            callback(roomId, gameTitle, playerJoined);
        });
    }

    banPlayer(name: string) {
        this.socket.emit('ban-player', name);
    }

    onBannedFromGame(callback: () => void) {
        this.socket.on('banned-from-game', () => {
            callback();
        });
    }

    toggleRoomLock() {
        this.socket.emit('toggle-room-lock');
    }

    onRoomLockStatus(callback: (isLocked: boolean) => void) {
        this.socket.on('room-lock-status', (isLocked: boolean) => {
            callback(isLocked);
        });
    }

    startGame(): void {
        this.socket.emit('start-game');
    }

    onGameLaunch(callback: (questionDuration: number, nbrOfQuestions: number) => void) {
        this.socket.on('game-started', (questionDuration: number, nbrOfQuestions: number) => {
            callback(questionDuration, nbrOfQuestions);
        });
    }

    onTimerCountdown(callback: (data: number) => void): void {
        this.socket.on('timer-countdown', (data: number) => {
            callback(data);
        });
    }

    onQuestionTimeUpdated(callback: (data: number) => void): void {
        this.socket.on('question-time-updated', (data: number) => {
            callback(data);
        });
    }

    onQuestion(callback: (question: Question, questionIndex: number) => void): void {
        this.socket.on('question', (question: Question, questionIndex: number) => {
            callback(question, questionIndex);
        });
    }

    onTimerStopped(callback: () => void): void {
        this.socket.on('timer-stopped', () => {
            callback();
        });
    }

    updatePointsQRL(points: [Player, number][]): void {
        this.socket.emit('update-points-QRL', points);
    }

    nextQuestion(): void {
        this.socket.emit('next-question');
    }

    sendAnswers(answer: number[] | string, player: Player): void {
        this.socket.emit('send-answers', answer, player);
    }

    sendLockedAnswers(answerIdx: number[] | string, player: Player): void {
        this.socket.emit('send-locked-answers', answerIdx, player);
    }

    sendLiveAnswers(answer: number[] | string, player: Player, reset: boolean) {
        this.socket.emit('send-live-answers', answer, player, reset);
    }

    sendMessageToServer(message: string, playerName: string, roomId: string): void {
        this.socket.emit('chat-message', { message, playerName, roomId });
    }

    onChatMessage(): Observable<{ text: string; sender: string; timestamp: string }> {
        return new Observable((observer) => {
            this.socket.on('chat-message', (data) => {
                observer.next(data);
            });
        });
    }

    onLockedAnswersQRL(callback: (answers: [string, [Player, string][]][]) => void): void {
        this.socket.on('locked-answers-QRL', (answersArray: [string, [Player, string][]][]) => {
            callback(answersArray);
        });
    }

    onLivePlayerAnswers(callback: (answers: [string, number[] | string][], player: Player) => void): void {
        this.socket.on('livePlayerAnswers', (answersArray: [string, string | number[]][], player: Player) => {
            callback(answersArray, player);
        });
    }

    onGoToResult(callback: (playerList: [[string, Player]], questionList: Question[], allAnswersIndex: [string, number[]][]) => void): void {
        this.socket.on('go-to-results', (playerList: [[string, Player]], questionList: Question[], allAnswersIndex: [string, number[]][]) => {
            callback(playerList, questionList, allAnswersIndex);
        });
    }

    pauseTimer(): void {
        this.socket.emit('pause-timer');
    }

    enablePanicMode(): void {
        this.socket.emit('enable-panic-mode');
    }

    onPanicModeEnabled(callback: () => void): void {
        this.socket.on('panic-mode-enabled', () => {
            callback();
        });
    }

    onPanicModeDisabled(callback: () => void): void {
        this.socket.on('panic-mode-disabled', () => {
            callback();
        });
    }
    updateHistogram(): void {
        this.socket.emit('update-histogram');
    }
    onUpdateNbModified(callback: (nbModification: number) => void): void {
        this.socket.on('number-modifications', (nbModification: number) => {
            callback(nbModification);
        });
    }
}
