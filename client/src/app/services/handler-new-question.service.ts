import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/game';
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
    async addQuestion(newQuestion: Question, onlyAddQuestionBank: boolean, addToBank: boolean): Promise<boolean> {
        if (this.questionValidationService.validateQuestion(newQuestion)) {
            if (!onlyAddQuestionBank) {
                if (addToBank && (await this.validateQuestionExisting(newQuestion))) {
                    this.questionService.addQuestionBank(newQuestion);
                    this.questionService.addQuestion(newQuestion);
                } else if (!addToBank) {
                    this.questionService.addQuestion(newQuestion);
                }

            } else if (await this.validateQuestionExisting(newQuestion)) {
                this.questionService.addQuestionBank(newQuestion);
                // this.router.navigate(['/question-bank']);
            }
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
}

// createNewQuestion(choices: Choice[]) {
//   return {
//       type: this.question.type,
//       text: this.question.text,
//       points: this.question.points,
//       id: generateNewId(),
//       choices: choices.map((item: Choice) => ({ ...item })),
//       lastModification: new Date(),
//   };
// }
