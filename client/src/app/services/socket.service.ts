import { Injectable } from '@angular/core';
import type { AnswersPlayer, Question } from '@app/interfaces/game';
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
    onNewPlayerJoin(callback: () => void) {
        this.socket.on('new-player-connected', () => {
            callback();
        });
    }
    leaveRoom() {
        this.socket.emit('leave-room');
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
    updatePlayerList(lobbyId: string, incr: number) {
        this.socket.emit('update', lobbyId, incr);
    }
    onUpdateList(callback: () => void) {
        this.socket.on('updatePlayerList', () => {
            callback();
        });
    }
    onLastPlayerDisconnected(callback: () => void) {
        this.socket.on('lastPlayerDisconnected', () => {
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
}
