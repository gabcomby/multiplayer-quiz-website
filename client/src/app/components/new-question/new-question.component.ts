import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Choice, Question } from '@app/interfaces/game';
import { HandlerNewQuestionService } from '@app/services/handler-new-question.service';
import { QuestionService } from '@app/services/question.service';

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

    // eslint-disable-next-line max-params -- single responsibility principle
    constructor(
        private questionService: QuestionService,
        private router: Router,
        private handlerQuestionService: HandlerNewQuestionService,
    ) {}

    async addQuestion(event: Choice[], onlyAddQuestionBank: boolean): Promise<void> {
        const questionValidated = await this.handlerQuestionService.addQuestion(event, this.question, onlyAddQuestionBank, this.addBankQuestion);
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
}
