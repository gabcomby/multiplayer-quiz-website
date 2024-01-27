import { Component, EventEmitter, Output } from '@angular/core';
import { Question } from '@app/interfaces/game';

@Component({
    selector: 'app-new-question',
    templateUrl: './new-question.component.html',
    styleUrls: ['./new-question.component.scss'],
})
export class NewQuestionComponent {
    @Output() registerQuestion: EventEmitter<Question> = new EventEmitter();
    question: Question = { type: '', text: '', points: 0, id: 0 };
    addBankQuestion: boolean = false;

    addQuestion() {
        const newQuestion = { type: this.question.type, text: this.question.text, points: this.question.points, id: this.question.id };
        this.registerQuestion.emit(newQuestion);
        if (this.addBankQuestion) {
            // console.log('banque question'); // lier avec la banque de question
        }
        this.question.text = '';
        this.question.points = 0;
        this.addBankQuestion = false;
    }
}
