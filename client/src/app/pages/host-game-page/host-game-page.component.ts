import { Component, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/game';
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

    get currentQuestion(): Question | null {
        return this.gameService.currentQuestionValue;
    }

    get timerStopped(): boolean {
        return this.gameService.timerStoppedValue;
    }

    get playerList() {
        return this.gameService.playerListValue;
    }

    // ==================== GETTERS USED AFTER REFACTOR ====================

    get currentGameTitle(): string {
        return this.gameService.currentGameTitle;
    }

    get currentQuestionArray(): Question[] {
        if (this.gameService.currentQuestion === null) {
            return [];
        } else {
            return [this.gameService.currentQuestion];
        }
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

    // ==================== FCT USED AFTER REFACTOR ====================
    nextQuestion(): void {
        this.gameService.nextQuestion();
    }
    // ==================== FCT USED AFTER REFACTOR ====================

    ngOnInit(): void {
        // this.socketService.onLivePlayerAnswers((answers) => {
        //     this.answersClicked = answers;
        // });
        console.log('lol');
    }

    handleGameLeave(): void {
        this.gameService.leaveRoom();
    }

    goToResult(): void {
        // this.socketService.goToResult();
    }
}
