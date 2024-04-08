import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Choice, Question, QuestionType } from '@app/interfaces/game';
import { HandlerNewQuestionService } from '@app/services/handler-new-question/handler-new-question.service';
import { QuestionService } from '@app/services/question/question.service';

@Component({
    selector: 'app-new-question',
    templateUrl: './new-question.component.html',
    styleUrls: ['./new-question.component.scss'],
})
export class NewQuestionComponent {
    @Input() fromBank: boolean;
    addFromQuestionBank: boolean = false;
    createQuestionShown: boolean = false;
    // TODO: add a question type
    question: Question = { type: QuestionType.QCM, text: '', points: 10, id: '', lastModification: new Date(), choices: [] };
    addBankQuestion: boolean = false;
    isQCM: boolean = false;

    // eslint-disable-next-line max-params -- single responsibility principle
    constructor(
        private questionService: QuestionService,
        private router: Router,
        private handlerQuestionService: HandlerNewQuestionService,
    ) {}

    async addQuestion(onlyAddQuestionBank: boolean, event?: Choice[]): Promise<void> {
        const questionValidated = await this.handlerQuestionService.addQuestion(this.question, onlyAddQuestionBank, this.addBankQuestion, event);
        if (questionValidated) {
            if (!onlyAddQuestionBank) {
                this.resetComponent(event);
            } else {
                this.router.navigate(['/question-bank']);
            }
        }
    }
    addQuestionFromBank(event: Question[]): void {
        event.forEach((element) => this.questionService.addQuestion(element));
        this.addFromQuestionBank = false;
    }

    resetComponent(event: Choice[] | undefined) {
        this.question.text = '';
        this.question.points = 10;
        this.question.choices = [];
        if (event) {
            event.forEach((element) => {
                element.isCorrect = false;
                element.text = '';
            });
        }

        this.addBankQuestion = false;
    }
    createQcm() {
        this.createQuestionShown = true;
        this.question.type = QuestionType.QCM;
        this.isQCM = true;
    }
    createQrl() {
        this.createQuestionShown = true;
        this.question.type = QuestionType.QRL;
        this.isQCM = false;
    }
}
