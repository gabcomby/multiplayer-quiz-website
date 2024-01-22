import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

export interface QuestionBank {
    position: number;
    question: string;
    date: Date;
}

const ELEMENT_DATA: QuestionBank[] = [
    { position: 1, question: 'Question 1', date: new Date() },
    { position: 2, question: 'Question 2', date: new Date() },
    { position: 3, question: 'Question 3', date: new Date() },
    { position: 4, question: 'Question 4', date: new Date() },
];

@Component({
    selector: 'app-question-bank',
    standalone: true,
    imports: [MatTableModule],
    templateUrl: './question-bank.component.html',
    styleUrl: './question-bank.component.scss',
})
export class QuestionBankComponent {
    displayedColumns: string[] = ['position', 'question', 'date'];
    dataSource = ELEMENT_DATA;
    clickedRows = new Set<QuestionBank>();
}
