import { Injectable } from '@angular/core';
import { Choice, Question } from '@app/interfaces/game';
import { NewQuestion } from '@app/interfaces/newquestion';
import { QuestionValidationService } from '@app/services/question-validation/question-validation.service';
import { QuestionService } from '@app/services/question/question.service';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { generateNewId } from '@app/utils/assign-new-game-attributes';

@Injectable({
    providedIn: 'root',
})
export class HandlerNewQuestionService {
    constructor(
        private snackbarService: SnackbarService,
        private questionValidationService: QuestionValidationService,
        private questionService: QuestionService,
    ) {}

    async addQuestion(newQuestion: NewQuestion): Promise<boolean> {
        const question = this.createNewQuestion(newQuestion.question, newQuestion.choices);

        if (this.questionValidationService.validateQuestion(question)) {
            if (!newQuestion.onlyAddQuestionBank) {
                return this.addQuestionToQuiz(newQuestion, question);
            } else if (await this.validateQuestionExisting(question)) {
                this.questionService.addQuestionBank(question);
                return true;
            }
        }
        return false;
    }
    async addQuestionToQuiz(newQuestion: NewQuestion, question: Question) {
        if (newQuestion.addToBank && (await this.validateQuestionExisting(question))) {
            this.questionService.addQuestionBank(question);
            this.questionService.addQuestion(question);
            return true;
        } else if (!newQuestion.addToBank) {
            this.questionService.addQuestion(question);
            return true;
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
    createNewQuestion(question: Question, choices?: Choice[]): Question {
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
