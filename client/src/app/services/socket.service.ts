import { Injectable } from '@angular/core';
import type { AnswersPlayer, Question } from '@app/interfaces/game';
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

    // ==================== FUNCTIONS USED AFTER REFACTOR ====================
    connect(): string[] {
        this.socket = io(this.url, { autoConnect: true });
        const arrayM: string[] = [];
        this.socket.on('messageConnect', (mesage) => {
            arrayM.push(mesage);
        });
        return arrayM;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    onRoomCreated(callback: (roomId: string) => void): void {
        this.socket.on('room-created', (roomId: string) => {
            callback(roomId);
        });
    }

    onPlayerListChange(callback: (playerList: [[string, Player]]) => void) {
        this.socket.on('playerlist-change', (playerList: [[string, Player]]) => {
            callback(playerList);
        });
    }

    createRoom(roomId: string): void {
        this.socket.emit('create-room', roomId);
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

    onRoomJoined(callback: (roomId: string) => void) {
        this.socket.on('room-joined', (roomId: string) => {
            callback(roomId);
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

    // ==================== FUNCTIONS USED AFTER REFACTOR ====================

    deletedGame(callback: (gameId: string) => void) {
        this.socket.on('deleteId', (gameId: string) => {
            callback(gameId);
        });
    }

    verifyAnswers(question: Question, answerIdx: number[]) {
        this.socket.emit('assert-answers', question, answerIdx);
    }

    setTimerDuration(duration: number): void {
        this.socket.emit('set-timer-duration', duration);
    }

    startTimer(): void {
        this.socket.emit('start-timer');
    }

    stopTimer(): void {
        this.socket.emit('stop-timer');
    }

    onTimerCountdown(callback: (data: number) => void): void {
        this.socket.on('timer-countdown', (data: number) => {
            callback(data);
        });
    }

    onAnswerVerification(callback: (score: [[string, number]]) => void): void {
        this.socket.on('answer-verification', (score: [[string, number]]) => {
            callback(score);
        });
    }

    startGame(): void {
        this.socket.emit('start');
    }
    onTimerGame(callback: () => void): void {
        this.socket.on('game-timer', () => {
            callback();
        });
    }
    onAdminDisconnect(callback: () => void): void {
        this.socket.on('adminDisconnected', () => {
            callback();
        });
    }
    onPlayerDisconnect(callback: (playerId: string) => void) {
        this.socket.on('playerDisconnected', (playerId: string) => {
            callback(playerId);
        });
    }
    answerSubmit() {
        this.socket.emit('answerSubmitted');
    }
    onStopTimer(callback: () => void) {
        this.socket.on('stop-timer', () => {
            callback();
        });
    }
    onGameLaunch(callback: () => void) {
        this.socket.on('game-started', () => {
            callback();
        });
    }
    submitAnswer() {
        this.socket.emit('answer-submitted');
    }
    submitPlayerAnswer(idPlayer: string, answerIdx: number[]) {
        this.socket.emit('player-answers', idPlayer, answerIdx);
    }
    toggleRoomLock() {
        this.socket.emit('toggle-room-lock');
    }
    verifyRoomLock(roomId: string) {
        this.socket.emit('verify-room-lock', roomId);
    }
    onRoomLockStatus(callback: (isLocked: boolean) => void) {
        this.socket.on('room-lock-status', (isLocked: boolean) => {
            callback(isLocked);
        });
    }

    gameIsFinishedSocket() {
        this.socket.emit('endGame');
    }

    onEndGame(): Observable<unknown> {
        return new Observable((observer) => {
            this.socket.on('endGame', () => {
                observer.next();
            });
        });
    }

    onGotBonus(callback: (playerId: string) => void) {
        this.socket.on('got-bonus', (playerId) => {
            callback(playerId);
        });
    }

    sendPlayerAnswer(answer: AnswersPlayer) {
        const mapToArray = [];

        for (const [key, value] of answer.entries()) {
            mapToArray.push({ key, value });
        }
        this.socket.emit('playerAnswer', mapToArray);
    }

    onPlayerAnswer(): Observable<AnswersPlayer[]> {
        return new Observable((observer) => {
            this.socket.on('sendPlayerAnswers', (answers: AnswersPlayer[]) => {
                observer.next(answers);
            });
        });
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

    onLastPlayerDisconnected(callback: () => void) {
        this.socket.on('lastPlayerDisconnected', () => {
            callback();
        });
    }
    bannedPlayer(idPlayer: string) {
        this.socket.connect();
        this.socket.emit('banFromGame', idPlayer);
    }

    async onBannedPlayer(callback: () => void) {
        await this.socket.on('bannedFromHost', () => {
            callback();
        });
    }

    goToResult() {
        this.socket.emit('goToResult');
    }
    onResultView(callback: () => void) {
        this.socket.on('resultView', () => {
            callback();
        });
    }
    nextQuestion() {
        this.socket.emit('goNextQuestion');
    }
    onNextQuestion(callback: () => void) {
        this.socket.on('handleNextQuestion', () => {
            callback();
        });
    }

    sendClickedAnswer(answerIdx: number[]) {
        this.socket.emit('sendClickedAnswer', answerIdx);
    }

    onLivePlayerAnswers(callback: (answers: [string, number[]][]) => void): void {
        this.socket.on('livePlayerAnswers', (answersArray: [string, number[]][]) => {
            callback(answersArray);
        });
    }
}
