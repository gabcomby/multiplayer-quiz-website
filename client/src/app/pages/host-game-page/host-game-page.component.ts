import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Question } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { GameService } from '@app/services/game.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnInit {
    isHost: boolean;
    isNoted: boolean = false;
    lobby: MatchLobby;
    currentQuestionQRLIndex: number = 0;
    unsubscribeSubject: Subscription[];
    nextQuestionButtonText: string = 'Prochaine question';
    constructor(
        private gameService: GameService,
        private router: Router,
    ) {}
    get gameTimerPaused(): boolean {
        return this.gameService.gameTimerPausedValue;
    }
    get lobbyCode(): string {
        return this.gameService.lobbyCodeValue;
    }

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

    get playerLeftList() {
        return this.gameService.playerLeftListValue;
    }

    get answersQRL() {
        return this.gameService.answersTextQRLValue;
    }
    get answersClicked() {
        return this.gameService.answersClickedValue;
    }

    get isLaunchTimer(): boolean {
        return this.gameService.launchTimerValue;
    }

    get currentQuestionArray(): Question[] {
        if (this.gameService.currentQuestionValue === null) {
            return [];
        } else {
            return [this.gameService.currentQuestionValue];
        }
    }

    get currentGameTitle(): string {
        return this.gameService.gameTitleValue;
    }
    @HostListener('window:beforeunload', ['$event'])
    // eslint-disable-next-line no-unused-vars
    beforeUnloadHandler(event: Event) {
        event.preventDefault();
        this.gameService.leaveRoom();
        localStorage.setItem('refreshedPage', '/home');
    }

    ngOnInit(): void {
        const refreshedPage = localStorage.getItem('refreshedPage');
        if (refreshedPage) {
            localStorage.removeItem('refreshedPage');
            this.router.navigate([refreshedPage]);
        }
    }

    setplayerPointsQRL(points: [Player, number][]) {
        this.gameService.playerQRLPoints = points;
    }

    setIsNoted(isNoted: boolean) {
        this.isNoted = isNoted;
    }

    nextQuestion(): void {
        const timerLength = 1000;
        this.isNoted = false;
        this.gameService.nextQuestion();
        if (this.currentQuestion?.type === 'QRL') this.currentQuestionQRLIndex++;
        let timer = 3;
        this.nextQuestionButtonText = String(timer);
        const intervalId = setInterval(() => {
            timer--;
            if (timer > 0) {
                this.nextQuestionButtonText = String(timer);
            } else {
                clearInterval(intervalId);
                this.nextQuestionButtonText = 'Prochaine question';
            }
        }, timerLength);
    }

    handleGameLeave(): void {
        this.gameService.leaveRoom();
        this.router.navigate(['/home']);
    }

    handlePauseTimer(): void {
        this.gameService.pauseTimer();
    }

    handlePanicMode(): void {
        this.gameService.enablePanicMode();
    }
}
