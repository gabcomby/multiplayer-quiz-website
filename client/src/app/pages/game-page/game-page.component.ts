import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { Game, Question } from '@app/interfaces/game';
import type { Match, Player } from '@app/interfaces/match';
import { AnswerStateService } from '@app/services/answer-state.service';
import { GameService } from '@app/services/game.service';
import { MatchService } from '@app/services/match.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';
import { generateNewId } from '@app/utils/assign-new-game-attributes';
import { Observable, switchMap } from 'rxjs';

const TIME_BETWEEN_QUESTIONS = 3000;
const FIRST_TO_ANSWER_MULTIPLIER = 1.2;

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    gameData: Game = {
        id: '',
        title: '',
        description: '',
        isVisible: true,
        duration: 0,
        lastModification: new Date(),
        questions: [],
    };
    currentQuestionIndex: number = 0;
    questionHasExpired: boolean = false;
    currentMatch: Match = { id: '', playerList: [] }; // faut faire une interface pour les joueurs et avoir un host
    matchId: string;
    gameId: string;
    timerCountdown: number;
    answerIsCorrect: boolean;

    gameScore: { name: string; score: number }[] = [];
    playerName: string;
    currentPlayer: Player;
    // allLocked: number = 0;
    answerIdx: number[];
    previousQuestionIndex: number;
    idLobby: string;
    idPlayer: string;

    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private matchService: MatchService,
        private route: ActivatedRoute,
        private socketService: SocketService,
        private gameService: GameService,
        private snackbarService: SnackbarService,
        private answerStateService: AnswerStateService,
    ) {}

    ngOnInit() {
        // Get the game ID from the URL
        this.gameId = this.route.snapshot.params['id'];
        this.idLobby = this.route.snapshot.params['idLobby'];
        this.idPlayer = this.route.snapshot.params['idPlayer'];

        // Fetch the game data from the server
        this.gameService.getGame(this.gameId).subscribe({
            next: (data) => {
                this.gameData = data;
            },
            error: (error) => {
                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante: ${error}`);
            },
        });
        // Create a new match with a new player, and then setup the WebSocket events
        this.createAndSetupMatch();
        this.allAnswerlocked();
    }

    createAndSetupMatch() {
        this.createMatch()
            .pipe(
                switchMap((matchData) => {
                    this.currentMatch = matchData;
                    return this.addPlayerToMatch(this.matchId);
                }),
            )
            .subscribe({
                next: (data) => {
                    this.currentMatch = data;
                    this.setupWebSocketEvents();
                    this.socketService.startTimer();
                },
                error: (error) => {
                    alert(error.message);
                },
            });
    }

    createMatch(): Observable<Match> {
        this.matchId = generateNewId();
        return this.matchService.createNewMatch({ id: this.matchId, playerList: [] });
    }

    addPlayerToMatch(matchId: string): Observable<Match> {
        this.currentPlayer = { id: generateNewId(), name: this.playerName, score: 0, isLocked: false };
        return this.matchService.addPlayer(this.currentPlayer, matchId);
    }

    setupWebSocketEvents() {
        this.socketService.connect();
        this.socketService.onTimerCountdown((data) => {
            this.timerCountdown = data;
            if (this.timerCountdown === 0) {
                this.onTimerComplete();
            }
            if (this.answerStateService.allLocked >= this.currentMatch.playerList.length) {
                this.onTimerComplete();
            }
        });
        if (this.gameData && this.gameData.duration) {
            this.socketService.setTimerDuration(this.gameData.duration);
        }
        this.socketService.onAnswerVerification((data) => {
            this.answerIsCorrect = data;
            if (data === true) {
                this.updatePlayerScore(this.gameData.questions[this.previousQuestionIndex].points * FIRST_TO_ANSWER_MULTIPLIER);
            }
        });
    }

    updatePlayerScore(scoreFromQuestion: number): void {
        this.matchService.updatePlayerScore(this.matchId, 'playertest', this.currentMatch.playerList[0].score + scoreFromQuestion).subscribe({
            next: (data) => {
                this.currentMatch.playerList[0] = data;
            },
            error: (error) => {
                alert(error.message);
            },
        });
    }

    handleGameLeave() {
        this.matchService.deleteMatch(this.matchId).subscribe({
            next: () => {
                this.socketService.stopTimer();
                this.socketService.disconnect();
                this.router.navigate(['/new-game']);
            },
            error: (error) => {
                alert(error.message);
            },
        });
    }

    onTimerComplete(): void {
        this.socketService.stopTimer();
        this.questionHasExpired = true;
        this.previousQuestionIndex = this.currentQuestionIndex;
        this.socketService.verifyAnswers(this.gameData.questions[this.previousQuestionIndex].choices, this.answerIdx);
        if (this.currentQuestionIndex < this.gameData.questions.length - 1) {
            setTimeout(() => {
                this.handleNextQuestion();
            }, TIME_BETWEEN_QUESTIONS);
        } else {
            setTimeout(() => {
                this.handleGameLeave();
            }, TIME_BETWEEN_QUESTIONS);
        }
    }

    getCurrentQuestion(): Question {
        if (this.gameData.questions.length > 0) {
            return this.gameData.questions[this.currentQuestionIndex];
        } else {
            return {
                type: '',
                text: '',
                points: 0,
                lastModification: new Date(),
                id: '',
                choices: [],
            };
        }
    }

    setAnswerIndex(answerIdx: number[]) {
        this.answerIdx = answerIdx;
    }

    handleNextQuestion(): void {
        this.currentQuestionIndex++;
        this.questionHasExpired = false;
        this.answerStateService.allLocked = 0;
        this.socketService.startTimer();
    }

    allAnswerlocked() {
        this.answerStateService.answerLocked.subscribe((locked) => {
            this.currentPlayer.isLocked = locked;
            if (locked === true) {
                this.answerStateService.allLocked += 1;
            }
        });
    }
}
