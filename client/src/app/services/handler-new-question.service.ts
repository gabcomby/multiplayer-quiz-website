import { Injectable } from '@angular/core';
import { Choice, Question } from '@app/interfaces/game';
import { generateNewId } from '@app/utils/assign-new-game-attributes';
import { QuestionValidationService } from './question-validation.service';
import { QuestionService } from './question.service';
import { SnackbarService } from './snackbar.service';

@Injectable({
    providedIn: 'root',
})
export class HandlerNewQuestionService {
    constructor(
        private snackbarService: SnackbarService,
        private questionValidationService: QuestionValidationService,
        private questionService: QuestionService,
    ) {}
    // eslint-disable-next-line max-params -- Single responsibility principle
    async addQuestion(question: Question, onlyAddQuestionBank: boolean, addToBank: boolean, choices?: Choice[]): Promise<boolean> {
        const newQuestion = this.createNewQuestion(question, choices);

        if (this.questionValidationService.validateQuestion(newQuestion)) {
            if (!onlyAddQuestionBank) {
                if (addToBank && (await this.validateQuestionExisting(newQuestion))) {
                    this.questionService.addQuestionBank(newQuestion);
                    this.questionService.addQuestion(newQuestion);
                    return true;
                } else if (!addToBank) {
                    this.questionService.addQuestion(newQuestion);
                    return true;
                }
                return false;
            } else if (await this.validateQuestionExisting(newQuestion)) {
                this.questionService.addQuestionBank(newQuestion);
                return true;
            }
            return false;
        }
        return false;
    }

    async validateQuestionExisting(question: Question): Promise<boolean> {
        const questionInBank = await this.questionService.getQuestions();
        const findQuestion = questionInBank.find((element) => element.text === question.text);
        if (findQuestion) {
            this.snackbarService.openSnackBar('Une question avec un nom similaire existe deja dans la banque de question');
            return false;
        }
        return true;
    }
    createNewQuestion(question: Question, choices?: Choice[]) {
        return {
            type: question.type,
            text: question.text,
            points: question.points,
            id: generateNewId(),
            choices: choices ? choices.map((item: Choice) => ({ ...item })) : undefined,
            lastModification: new Date(),
        };
    }
}
