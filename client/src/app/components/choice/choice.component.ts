import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Choice, Question } from '@app/interfaces/game';
@Component({
    selector: 'app-choice',
    templateUrl: './choice.component.html',
    styleUrls: ['./choice.component.scss'],
})
export class ChoiceComponent {
    @Input() questionString: string;
    @Output() buttonClick: EventEmitter<void> = new EventEmitter<void>();
    @Output() registerAnswer: EventEmitter<Choice[]> = new EventEmitter();
    type: string = '0';
    answers: Choice[] = [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ];
    questions: Question[] = [{ type: '', text: '', points: 0, choices: [{ text: '', isCorrect: false }], id: 0 }];
    choices: { id: number; question: string; allChoices: Choice[] }[] = [];

    addQuestion() {
        this.questions.push({ type: this.type, text: this.questionString, points: 0, choices: this.answers, id: 0 });
        // console.log(this.questions);
    }
    addAnswer() {
        this.registerAnswer.emit(this.answers);
        this.answers.forEach((element) => {
            element.text = '';
            element.isCorrect = false;
        });
    }
}
