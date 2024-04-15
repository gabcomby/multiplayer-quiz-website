import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAX_DURATION, MIN_DURATION } from '@app/config/client-config';
import { Game, QuestionType } from '@app/interfaces/game';
import { ApiService } from '@app/services/api/api.service';
import { QuestionValidationService } from '@app/services/question-validation/question-validation.service';
import { QuestionService } from '@app/services/question/question.service';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { generateNewId } from '@app/utils/assign-new-game-attributes';

@Injectable({
    providedIn: 'root',
})
export class GameValidationService {
    // eslint-disable-next-line max-params -- Single responsibility principle
    constructor(
        private questionService: QuestionService,
        private questionValidationService: QuestionValidationService,
        private apiService: ApiService,
        private snackbarService: SnackbarService,
    ) {}

    async validateDuplicationGame(game: Game, error: string[]) {
        const gameList = await this.apiService.getGames();
        const titleExisting = gameList.find((element) => element.title.trim() === game.title.trim() && element.id !== game.id);

        if (titleExisting) {
            error.push('Il y a déjà un jeu avec ce nom');
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
                if (question.choices && question.type === QuestionType.QCM) {
                    if (!this.questionValidationService.verifyOneGoodAndBadAnswer(question.choices)) {
                        return false;
                    }
                    if (!this.questionValidationService.answerValid(question.choices)) {
                        return false;
                    }
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
        if (game.description.trim().length === 0) errors.push('Pas juste des espaces');
        if (!game.description) errors.push('La description est requise');
        if (!game.duration) errors.push('La durée est requise');
        if (game.duration < MIN_DURATION || game.duration > MAX_DURATION) {
            errors.push('La durée doit être entre 10 et 60 secondes');
        }
        if (!game.lastModification) errors.push('La date de mise à jour est requise');
        if (game.questions.length < 1) errors.push('Au moins une question');
    }
}
