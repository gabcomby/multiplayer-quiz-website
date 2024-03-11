/* eslint-disable max-lines */
import { Inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { API_BASE_URL } from '@app/app.module';
import { generateNewId } from '@app/utils/assign-new-game-attributes';
import { QuestionValidationService } from './question-validation.service';
import { QuestionService } from './question.service';

import { Router } from '@angular/router';
import type { AnswersPlayer, Game, Question } from '@app/interfaces/game';
import type { Player } from '@app/interfaces/match';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { ApiService } from '@app/services/api.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { SnackbarService } from './snackbar.service';
import { SocketService } from './socket.service';

const TIME_BETWEEN_QUESTIONS = 3000;
const START_TIMER_DURATION = 5;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    finalResultsEmitter = new ReplaySubject<Player[]>(1);
    answersSelected = new ReplaySubject<AnswersPlayer[]>(1);
    playerAnswers: Subject<AnswersPlayer> = new Subject<AnswersPlayer>();
    questionGame = new ReplaySubject<Question[]>(1);
    questions: Question[] = [];
    playerChoice: AnswersPlayer = new Map<string, number[]>();

    apiUrl: string;
    timerCountdown: number;
    gameData: Game = {
        id: '',
        title: '',
        description: '',
        isVisible: true,
        duration: 0,
        lastModification: new Date(),
        questions: [],
    };
    lobbyData: MatchLobby = {
        id: '',
        playerList: [],
        gameId: '',
        bannedNames: [],
        lobbyCode: '',
        isLocked: false,
        hostId: '',
    };
    lobbyId: string;
    gameId: string;
    currentPlayerId: string;
    currentPlayerName: string;
    answerIdx: number[];
    questionHasExpired: boolean;
    currentQuestionIndex: number;
    previousQuestionIndex: number;
    answerIsCorrect: boolean;
    subscription: Subscription;
    endGame = false;
    private minDuration: number;
    private maxDuration: number;
    private isLaunchTimer: boolean;

    // eslint-disable-next-line max-params
    constructor(
        private apiService: ApiService,
        private questionService: QuestionService,
        private questionValidationService: QuestionValidationService,
        @Inject(API_BASE_URL) apiBaseURL: string,
        private matchLobbyService: MatchLobbyService,
        private socketService: SocketService,
        private snackbarService: SnackbarService,
        private router: Router,
    ) {
        this.apiUrl = `${apiBaseURL}/games`;
    }

    get timerCountdownValue(): number {
        return this.timerCountdown;
    }

    get gameDataValue(): Game {
        return this.gameData;
    }

    get currentQuestionIndexValue(): number {
        return this.currentQuestionIndex;
    }

    get currentGameLength(): number {
        return this.gameData.questions.length;
    }

    get currentGameTitle(): string {
        return this.gameData.title;
    }

    get currentPlayerNameValue(): string {
        if (this.currentPlayerId === this.lobbyData.hostId) {
            this.currentPlayerName = 'Organisateur';
        }
        return this.currentPlayerName;
    }

    get totalGameDuration(): number {
        return this.gameData.duration;
    }

    get currentQuestion(): Question {
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

    get questionHasExpiredValue(): boolean {
        return this.questionHasExpired;
    }

    get answerIsCorrectValue(): boolean {
        return this.answerIsCorrect;
    }

    get playerListFromLobby(): Player[] {
        return this.lobbyData.playerList;
    }

    get matchLobby(): MatchLobby {
        return this.lobbyData;
    }

    get game(): Game {
        return this.gameData;
    }

    get isLaunchTimerValue(): boolean {
        return this.isLaunchTimer;
    }

    set answerIndex(answerIdx: number[]) {
        this.answerIdx = answerIdx;
    }

    gameEnded(): void {
        this.socketService.onEndGame().subscribe(() => {
            this.calculateFinalResults();
        });
    }

    gameIsFinished(): void {
        if (this.currentQuestionIndex + 1 === this.gameDataValue.questions.length) {
            this.socketService.gameIsFinishedSocket();
        }
    }
    calculateFinalResults(): void {
        this.endGame = true;
        const finalResults: Player[] = this.playerListFromLobby;
        this.finalResultsEmitter.next(finalResults);
    }

    async validateDuplicationGame(game: Game, error: string[]) {
        const gameList = await this.apiService.getGames();
        const titleExisting = gameList.find((element) => element.title.trim() === game.title.trim() && element.id !== game.id);
        const descriptionExisting = gameList.find((element) => element.description.trim() === game.description.trim() && element.id !== game.id);
        if (titleExisting) {
            error.push('Il y a déjà un jeu avec ce nom');
        }
        if (descriptionExisting) {
            error.push('Il y a déjà un jeu avec cet description');
        }
    }
    async validateDeletedGame(game: Game) {
        const gameList = await this.apiService.getGames();
        const idExisting = gameList.find((element) => element.id === game.id);
        if (idExisting) {
            return true;
        } else {
            return false;
        }
    }
    async gameValidationWhenModified(gameForm: FormGroup, gameModified: Game): Promise<boolean> {
        const modifiedGame = this.createNewGame(false, gameForm, gameModified);
        try {
            if (await this.isValidGame(modifiedGame)) {
                if (await this.validateDeletedGame(modifiedGame)) {
                    await this.apiService.patchGame(modifiedGame);
                } else {
                    await this.apiService.createGame(modifiedGame);
                }
                return true;
            }
            return false;
        } catch (error) {
            throw new Error('handling error');
        }
    }

    createNewGame(isNewGame: boolean, gameForm: FormGroup, gameModified: Game) {
        return {
            id: isNewGame ? generateNewId() : gameModified.id,
            title: gameForm.get('name')?.value,
            description: gameForm.get('description')?.value,
            isVisible: isNewGame ? false : gameModified.isVisible,
            duration: gameForm.get('time')?.value,
            lastModification: new Date(),
            questions: isNewGame ? this.questionService.getQuestion() : gameModified.questions,
        };
    }
    async isValidGame(game: Game) {
        const errors: string[] = [];
        try {
            this.validateBasicGameProperties(game, errors);
            for (const question of game.questions) {
                if (!this.questionValidationService.validateQuestion(question)) {
                    return false;
                }
                if (!this.questionValidationService.verifyOneGoodAndBadAnswer(question.choices)) {
                    return false;
                }
                if (!this.questionValidationService.answerValid(question.choices)) {
                    return false;
                }
            }
        } catch (error) {
            throw new Error('handling error');
        }

        await this.validateDuplicationGame(game, errors);
        if (errors.length > 0) {
            this.snackbarService.openSnackBar(errors.join('\n'));
            return false;
        }
        return true;
    }

    validateBasicGameProperties(game: Game, errors: string[]): void {
        if (!game.title) errors.push('Le titre est requis');
        if (game.title.trim().length === 0) errors.push('Pas juste des espaces');
        if (!game.description) errors.push('La description est requise');
        if (!game.duration) errors.push('La durée est requise');
        if (game.duration && (game.duration < this.minDuration || game.duration > this.maxDuration)) {
            errors.push('La durée doit être entre 10 et 60 secondes');
        }
        if (!game.lastModification) errors.push('La date de mise à jour est requise');
        if (game.questions.length < 1) errors.push('Au moins une question');
    }

    initializeLobbyAndGame(lobbyId: string, playerId: string): void {
        this.lobbyId = lobbyId;
        this.currentPlayerId = playerId;
        this.currentQuestionIndex = 0;
        this.previousQuestionIndex = 0;
        this.answerIdx = [];
        this.questionHasExpired = false;
        this.isLaunchTimer = true;
        this.endGame = false;
        this.matchLobbyService.getLobby(this.lobbyId).subscribe({
            next: (lobbyData) => {
                this.lobbyData = lobbyData;
                if (this.lobbyData.playerList.find((player) => player.id === this.currentPlayerId)) {
                    // eslint-disable-next-line
                    this.currentPlayerName = this.lobbyData.playerList.find((player) => player.id === this.currentPlayerId)!.name;
                }
                this.apiService.getGame(this.lobbyData.gameId).subscribe({
                    next: (gameData) => {
                        this.gameData = gameData;
                        this.setupWebsocketEvents();
                    },
                    error: (error) => {
                        this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante en chargeant le lobby: ${error}`);
                    },
                });
            },
        });
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

    sendPlayerAnswer(answer: AnswersPlayer) {
        this.socketService.sendPlayerAnswer(answer);
    }

    getPlayerAnswers(): Observable<AnswersPlayer[]> {
        return this.answersSelected.asObservable();
    }

    handleGameLeave() {
        if (this.matchLobby.hostId === this.currentPlayerId) {
            this.matchLobbyService.deleteLobby(this.lobbyId).subscribe({
                next: () => {
                    this.socketService.adminDisconnect();
                    this.socketService.disconnect();
                    this.router.navigate(['/home']);
                },
                error: (error) => {
                    this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante en quittant et en supprimant la partie: ${error}`);
                },
            });
        } else {
            this.matchLobbyService.lobbyExists(this.lobbyId).subscribe({
                next: (data) => {
                    if (data === false) {
                        this.socketService.disconnect();
                        this.router.navigate(['/home']);
                    } else {
                        this.matchLobbyService.removePlayer(this.lobbyId, this.currentPlayerId).subscribe({
                            next: () => {
                                this.socketService.playerDisconnect();
                                this.socketService.disconnect();
                                this.router.navigate(['/home']);
                            },
                            error: (error) => {
                                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante en quittant la partie: ${error}`);
                            },
                        });
                    }
                },
                error: (error) => {
                    this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante en chargeant le lobby: ${error}`);
                },
            });
        }
    }

    onTimerComplete(): void {
        if (this.isLaunchTimer) {
            this.socketService.stopTimer();
            this.isLaunchTimer = false;
            this.socketService.setTimerDuration(this.gameData.duration);
            this.socketService.startTimer();
            return;
        } else {
            this.socketService.stopTimer();
            this.questionHasExpired = true;
            this.previousQuestionIndex = this.currentQuestionIndex;
            this.socketService.verifyAnswers(this.gameData.questions[this.previousQuestionIndex].choices, this.answerIdx, this.currentPlayerId);
            if (this.currentQuestionIndex < this.gameData.questions.length - 1) {
                setTimeout(() => {
                    this.handleNextQuestion();
                }, TIME_BETWEEN_QUESTIONS);
            } else {
                if (this.currentPlayerId !== this.lobbyData.hostId) {
                    this.playerChoice.set(this.currentQuestion.text, this.answerIdx);
                    this.sendPlayerAnswer(this.playerChoice);
                    // this.handleGameLeave();
                } else {
                    this.questions.push(this.currentQuestion);
                    this.questionGame.next(this.questions);
                    // this.handleGameLeave();
                }
            }
            this.gameIsFinished();
        }
    }

    refreshPlayerList(): void {
        this.matchLobbyService.getPlayers(this.lobbyId).subscribe({
            next: (data) => {
                this.lobbyData.playerList = data;
            },
            error: (error) => {
                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante en actualisant la liste des joueurs: ${error}`);
            },
        });
    }

    setupWebsocketEvents(): void {
        this.socketService.onTimerCountdown((data) => {
            this.timerCountdown = data;
            if (this.timerCountdown === 0) {
                this.onTimerComplete();
            }
        });

        this.socketService.onPlayerAnswer().subscribe((answer: AnswersPlayer[]) => {
            this.answersSelected.next(answer);
        });

        this.socketService.onEndGame().subscribe(() => {
            this.calculateFinalResults();
        });

        this.socketService.onStopTimer(() => {
            this.onTimerComplete();
        });

        this.socketService.onAdminDisconnect(() => {
            this.handleGameLeave();
        });

        this.socketService.onPlayerDisconnect((playerId) => {
            // this.refreshPlayerList();
            this.lobbyData.playerList = this.lobbyData.playerList.filter((player) => player.id !== playerId);
        });
        this.socketService.onLastPlayerDisconnected(() => {
            this.handleGameLeave();
        });
        this.socketService.onNewPlayerJoin(() => {
            this.refreshPlayerList();
        });

        this.socketService.onGameLaunch(() => {
            if (this.currentPlayerId === this.lobbyData.hostId) {
                this.router.navigate(['/host-game-page']);
            } else {
                this.router.navigate(['/game']);
            }
            this.socketService.setTimerDuration(START_TIMER_DURATION);
            this.socketService.startTimer();
        });

        this.socketService.onAnswerVerification((isCorrect: boolean, playerId: string, multiplier: number) => {
            if (isCorrect) {
                const index = this.lobbyData.playerList.findIndex((player) => {
                    return player.id === playerId;
                });
                this.lobbyData.playerList[index].score += this.currentQuestion.points * multiplier;
            }
        });
    }

    private handleNextQuestion(): void {
        // this.refreshPlayerList();
        if (this.currentPlayerId !== this.lobbyData.hostId) {
            this.playerChoice.set(this.currentQuestion.text, this.answerIdx);
        } else {
            this.questions.push(this.currentQuestion);
        }
        this.currentQuestionIndex++;
        this.questionHasExpired = false;
        this.socketService.startTimer();
    }
}
