import { Component } from '@angular/core';

@Component({
    selector: 'app-new-question-qbank',
    templateUrl: './new-question-qbank.component.html',
    styleUrls: ['./new-question-qbank.component.scss'],
})
export class NewQuestionQbankComponent {
    addQuestionShown: boolean = false;
    // constructor() {}
    toggleAddQuestion() {
        this.addQuestionShown = !this.addQuestionShown;
    }
}
