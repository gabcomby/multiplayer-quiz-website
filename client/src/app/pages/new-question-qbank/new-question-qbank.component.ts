import { Component } from '@angular/core';

@Component({
    selector: 'app-new-question-qbank',
    templateUrl: './new-question-qbank.component.html',
    styleUrls: ['./new-question-qbank.component.scss'],
})
export class NewQuestionQbankComponent {
    addQuestionShown: boolean = false;
    addQuestionInBank: boolean = true;
    // constructor() {}
    toggleAddQuestion() {
        this.addQuestionShown = !this.addQuestionShown;
    }
}
