import { Component, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { GameService } from '@app/services/game.service';
// import { SocketService } from '@app/services/socket.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnInit {
    isHost: boolean;
    lobby: MatchLobby;
    answersClicked: [string, number[]][] = [];
    unsubscribeSubject: Subscription[];
    constructor(
        private gameService: GameService, // private socketService: SocketService,
    ) {}

    // ==================== GETTERS USED AFTER REFACTOR ====================
    get currentQuestionIndexValue(): number {
        return this.gameService.currentQuestionIndexValue;
    }

    get nbrOfQuestions(): number {
        return this.gameService.nbrOfQuestionsValue;
    }

    get currentTimerCountdown(): number {
        return this.gameService.timerCountdownValue;
    }

    get totalGameDuration(): number {
        return this.gameService.totalQuestionDurationValue;
    }

    // ==================== GETTERS USED AFTER REFACTOR ====================

    get currentGameTitle(): string {
        return this.gameService.currentGameTitle;
    }

    get currentQuestion(): Question {
        return this.gameService.getCurrentQuestion();
    }

    get currentQuestionArray(): Question[] {
        return [this.gameService.currentQuestion];
    }

    get playerListValue(): Player[] {
        return this.gameService.playerListFromLobby;
    }

    get isLaunchTimer(): boolean {
        return this.gameService.isLaunchTimerValue;
    }

    get currentPlayerNameValue(): string {
        return this.gameService.currentPlayerNameValue;
    }

    get endGame(): boolean {
        return this.gameService.endGame;
    }
    get nextQuestion(): boolean {
        return this.gameService.nextQuestion;
    }

    get playerGoneList() {
        return this.gameService.playerGoneList;
    }

    get answersClickedValue() {
        return this.gameService.answersClicked;
    }

    get getHost() {
        return this.gameService.matchLobby.hostId === this.gameService.currentPlayerId;
    }

    get lobbyCode() {
        return this.gameService.matchLobby.lobbyCode;
    }

    ngOnInit(): void {
        // this.socketService.onLivePlayerAnswers((answers) => {
        //     this.answersClicked = answers;
        // });
        console.log('lol');
    }

    handleGameLeave(): void {
        // this.gameService.handleGameLeave();
    }

    goToResult(): void {
        // this.socketService.goToResult();
    }
    goNextQuestion(): void {
        // this.socketService.nextQuestion();
    }
}
