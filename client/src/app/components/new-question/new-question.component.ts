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
    question: Question = { type: QuestionType.QCM, text: '', points: 10, id: '', lastModification: new Date(), choices: [] };
    addBankQuestion: boolean = false;
    isQCM: boolean = false;

    constructor(
        private questionService: QuestionService,
        private router: Router,
        private handlerQuestionService: HandlerNewQuestionService,
    ) {}

    async addQuestion(onlyQuestionBank: boolean, event?: Choice[]): Promise<void> {
        const questionValidated = await this.handlerQuestionService.addQuestion({
            question: this.question,
            onlyAddQuestionBank: onlyQuestionBank,
            addToBank: this.addBankQuestion,
            choices: event,
        });
        if (questionValidated) {
            if (!onlyQuestionBank) {
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

    resetComponent(event: Choice[] | undefined): void {
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
    createQcm(): void {
        this.createQuestionShown = true;
        this.question.type = QuestionType.QCM;
        this.isQCM = true;
    }
    createQrl(): void {
        this.createQuestionShown = true;
        this.question.type = QuestionType.QRL;
        this.isQCM = false;
    }
}
