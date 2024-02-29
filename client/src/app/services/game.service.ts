import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

import { FormGroup } from '@angular/forms';
import { API_BASE_URL } from '@app/app.module';
import type { Game } from '@app/interfaces/game';
import { generateNewId } from '@app/utils/assign-new-game-attributes';
// import isValidGame from '@app/utils/is-valid-game';
// import { GameValidationService } from './game-validation.service';
import { QuestionValidationService } from './question-validation.service';
import { QuestionService } from './question.service';
import { SnackbarService } from './snackbar.service';
@Injectable({
    providedIn: 'root',
})
export class GameService {
    private apiUrl: string;
    // private multiple: number;
    private minDuration: number;
    private maxDuration: number;

    constructor(
        private http: HttpClient,
        private questionService: QuestionService,
        private snackbarService: SnackbarService,
        private questionValidationService: QuestionValidationService,
        @Inject(API_BASE_URL) apiBaseURL: string,
    ) {
        this.apiUrl = `${apiBaseURL}/api/games`;
    }

    getGame(gameId: string): Observable<Game> {
        return this.http.get<Game>(`${this.apiUrl}/${gameId}`);
    }

    async getGames(): Promise<Game[]> {
        const games$ = this.http.get<Game[]>(this.apiUrl);
        const games = await firstValueFrom(games$);
        return games;
    }

    async createGame(game: Game): Promise<Game> {
        const game$ = this.http.post<Game>(this.apiUrl, game);
        const newGame = await firstValueFrom(game$);
        return newGame;
    }

    async deleteGame(gameId: string): Promise<void> {
        const game$ = this.http.delete(`${this.apiUrl}/${gameId}`);
        await firstValueFrom(game$);
    }

    async patchGame(game: Game): Promise<Game> {
        const game$ = this.http.patch<Game>(`${this.apiUrl}/${game.id}`, game);
        const newGame = await firstValueFrom(game$);
        return newGame;
    }
    async validateDuplicationGame(game: Game, error: string[]) {
        const gameList = await this.getGames();
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
        const gameList = await this.getGames();
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
                    await this.patchGame(modifiedGame);

                    // this.router.navigate(['/admin']);
                } else {
                    await this.createGame(modifiedGame);
                    // this.router.navigate(['/admin']);
                }
                return true;
            }
            return false;
        } catch (error) {
            throw new Error('handling error');
            // this.handleServerError();
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

        this.validateBasicGameProperties(game, errors);
        game.questions.forEach((question) => {
            if (this.questionValidationService.validateQuestion(question)) {
                return false;
            }
        });

        game.questions.forEach((question) => this.questionValidationService.verifyOneGoodAndBadAnswer(question.choices));
        game.questions.forEach((question) => this.questionValidationService.answerValid(question.choices));

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
    }

    // validateGameQuestions(game: Game, errors: string[]): void {
    //     if (!game.questions || !game.questions.length) {
    //         errors.push('Au moins une question est requise');
    //         return;
    //     }

    //     game.questions.forEach((question, index) => {
    //         this.validateQuestion(question, index, errors);
    //     });
    // }

    // validateQuestion(question: Question, index: number, errors: string[]): void {
    //     if (!question.type) errors.push(`Question ${index + 1}: Type est requis`);
    //     if (!question.text) errors.push(`Question ${index + 1}: Text est requis`);
    //     if (!question.points) errors.push(`Question ${index + 1}: Points sont requis`);
    //     if (question.points && question.points % this.multiple !== 0) {
    //         errors.push(`Question ${index + 1}: Les points doivent être des multiples de 10`);
    //     }
    //     if (question.text.trim().length === 0) errors.push('Pas juste des espaces');

    //     this.questionValidationService.validateQuestion(question);
    // }

    // validateQuestionChoices(question: Question, questionIndex: number, errors: string[]): void {
    //     if (question.type === 'QRL') return;

    //     if (!question.choices || !question.choices.length) {
    //         errors.push(`Question ${questionIndex + 1}: Au moins un choix est requis`);
    //         return;
    //     }

    //     let hasCorrectChoice = false;
    //     question.choices.forEach((choice: Choice, choiceIndex: number) => {
    //         if (!choice.text) {
    //             errors.push(`Question ${questionIndex + 1}, Choix ${choiceIndex + 1}: Text est requis`);
    //         }
    //         if (choice.isCorrect === null) {
    //             errors.push(`Question ${questionIndex + 1}, Choix ${choiceIndex + 1}: Status de validité requis`);
    //         } else if (choice.isCorrect) {
    //             hasCorrectChoice = true;
    //         }
    //         if (choice.text.trim().length === 0) errors.push('Pas juste des espaces');
    //     });

    //     if (!hasCorrectChoice) {
    //         errors.push(`Question ${questionIndex + 1}: Au moins un choix doit être correct`);
    //     }
    // }
}
