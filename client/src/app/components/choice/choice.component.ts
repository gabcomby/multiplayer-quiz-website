import { Component } from '@angular/core';

@Component({
    selector: 'app-choice',
    templateUrl: './choice.component.html',
    styleUrls: ['./choice.component.scss'],
})
export class ChoiceComponent {
    id: number;
    text: string;
    isCorrect: boolean;
}
