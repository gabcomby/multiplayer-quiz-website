import { Component } from '@angular/core';
import { Choice, Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-new-question',
    templateUrl: './new-question.component.html',
    styleUrls: ['./new-question.component.scss'],
})
export class NewQuestionComponent {
    // @Output() registerQuestion: EventEmitter<Question> = new EventEmitter();
    question: Question = { type: '', text: '', points: 0, id: 0 };
    addBankQuestion: boolean = false;
    constructor(private questionService: QuestionService) {}

    addQuestion(event: Choice[]) {
        const newChoices = event.map((item) => ({ ...item }));
        const newQuestion = {
            type: this.question.type,
            text: this.question.text,
            points: this.question.points,
            id: this.questionService.getQuestion().length,
            choices: newChoices,
        };
        if (newQuestion.text !== '') {
            // this.registerQuestion.emit(newQuestion);
            this.questionService.addQuestion(newQuestion);
            if (this.addBankQuestion) {
                // console.log('banque question'); // lier avec la banque de question
            }
        }

        this.question.text = '';
        this.question.points = 0;
        this.question.choices = [];
        this.addBankQuestion = false;
    }
    // registerAnswer(event: Choice[]) {
    //     return event;
    // }
}
