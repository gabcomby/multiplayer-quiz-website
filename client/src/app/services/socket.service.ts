import { Injectable } from '@angular/core';
import type { AnswersPlayer, Choice } from '@app/interfaces/game';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private socket: Socket;
    private readonly url: string = environment.socketUrl;

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
    deletedGame(callback: (gameId: string) => void) {
        this.socket.on('deleteId', (gameId: string) => {
            callback(gameId);
        });
    }

    async deleteId(): Promise<string> {
        return new Promise<string>((resolve) => {
            this.socket = io(this.url, { autoConnect: true });
            this.socket.on('deleteId', (gameId) => {
                resolve(gameId);
            });
        });
    }

    verifyAnswers(choices: Choice[] | undefined, answerIdx: number[], playerId: string) {
        this.socket.emit('assert-answers', choices, answerIdx, playerId);
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

    onAnswerVerification(callback: (data: boolean, playerId: string, multiplier: number) => void): void {
        this.socket.on('answer-verification', (data: boolean, playerId: string, multiplier: number) => {
            callback(data, playerId, multiplier);
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
    createRoom(roomId: string): void {
        this.socket.emit('create-room', roomId);
    }
    joinRoom(roomId: string, playerId: string): void {
        this.socket.emit('join-room', roomId, playerId);
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
    newPlayerJoin() {
        this.socket.emit('new-player');
    }
    onNewPlayerJoin(callback: () => void) {
        this.socket.on('new-player-connected', () => {
            callback();
        });
    }
    adminDisconnect() {
        this.socket.emit('admin-disconnect');
    }
    playerDisconnect() {
        this.socket.emit('player-disconnect');
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

    sendMessages(message: string, playerName: string, isHost: boolean) {
        this.socket.emit('chatMessage', { message, playerName, isHost });
    }

    onChatMessage(): Observable<{ text: string; sender: string; timestamp: string }> {
        return new Observable((observer) => {
            this.socket.on('chatMessage', (data) => {
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
}
