import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { environment } from '@env/environment';
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

    onRoomJoined(callback: (roomId: string, gameTitle: string) => void) {
        this.socket.on('room-joined', (roomId: string, gameTitle: string) => {
            callback(roomId, gameTitle);
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

    nextQuestion(): void {
        this.socket.emit('next-question');
    }

    sendAnswers(answerIdx: number[]): void {
        this.socket.emit('send-answers', answerIdx);
    }

    sendLockedAnswers(answerIdx: number[]): void {
        this.socket.emit('send-locked-answers', answerIdx);
    }

    sendLiveAnswers(answerIdx: number[]) {
        this.socket.emit('send-live-answers', answerIdx);
    }

    onLivePlayerAnswers(callback: (answers: [string, number[]][]) => void): void {
        this.socket.on('livePlayerAnswers', (answersArray: [string, number[]][]) => {
            callback(answersArray);
        });
    }

    onGoToResult(callback: (playerList: [[string, Player]], questionList: Question[], allAnswersIndex: [string, number[]][]) => void): void {
        this.socket.on('go-to-results', (playerList: [[string, Player]], questionList: Question[], allAnswersIndex: [string, number[]][]) => {
            callback(playerList, questionList, allAnswersIndex);
        });
    }
}
