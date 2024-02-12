import { Component, Input } from '@angular/core';

import { Choice, Question } from '@app/interfaces/game';
import { QuestionValidationService } from '@app/services/question-validation.service';
import { QuestionService } from '@app/services/question.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { generateNewId } from '@app/utils/assign-new-game-attributes';

@Component({
    selector: 'app-new-question',
    templateUrl: './new-question.component.html',
    styleUrls: ['./new-question.component.scss'],
})
export class NewQuestionComponent {
    @Input() fromBank: boolean;
    addFromQuestionBank: boolean = false;
    createQuestionShown: boolean = false;
    question: Question = { type: 'QCM', text: '', points: 10, id: '12312312', lastModification: new Date(), choices: [] };
    addBankQuestion: boolean = false;

    constructor(
        private questionService: QuestionService,
        private snackbarService: SnackbarService,
        private questionValidationService: QuestionValidationService,
    ) {}

    async addQuestion(event: Choice[], onlyAddQuestionBank: boolean): Promise<void> {
        const newQuestion = this.createNewQuestion(event);
        if (this.questionValidationService.validateQuestion(newQuestion)) {
            if (!onlyAddQuestionBank) {
                if (this.addBankQuestion && (await this.validateQuestionExisting(newQuestion))) {
                    this.questionService.addQuestionBank(newQuestion);
                    this.questionService.addQuestion(newQuestion);
                    this.resetComponent(event);
                } else if (!this.addBankQuestion) {
                    this.questionService.addQuestion(newQuestion);
                    this.resetComponent(event);
                }
            } else if (await this.validateQuestionExisting(newQuestion)) {
                this.questionService.addQuestionBank(newQuestion);
            }
        }
    }
    addQuestionFromBank(event: Question[]): void {
        event.forEach((element) => this.questionService.addQuestion(element));
        this.addFromQuestionBank = false;
    }

    resetComponent(event: Choice[]) {
        this.question.text = '';
        this.question.points = 10;
        this.question.choices = [];
        event.forEach((element) => {
            element.isCorrect = false;
            element.text = '';
        });
        this.addBankQuestion = false;
    }
    createNewQuestion(choices: Choice[]) {
        return {
            type: this.question.type,
            text: this.question.text,
            points: this.question.points,
            id: generateNewId(),
            choices: choices.map((item: Choice) => ({ ...item })),
            lastModification: new Date(),
        };
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
