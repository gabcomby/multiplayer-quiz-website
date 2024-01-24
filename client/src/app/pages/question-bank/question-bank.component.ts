import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

export interface QuestionBank {
    position: number;
    question: string;
    date: Date;
    selected?: boolean;
}

const ELEMENT_DATA: QuestionBank[] = [
    { position: 1, question: 'Quelle est la capitale de la France?', date: new Date() },
    { position: 2, question: 'Question 2', date: new Date() },
    { position: 3, question: 'Question 3', date: new Date() },
    { position: 4, question: 'Question 4', date: new Date() },
];

@Component({
    selector: 'app-question-bank',
    standalone: true,
    imports: [MatTableModule],
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
})
export class QuestionBankComponent {
    displayedColumns: string[] = ['position', 'question', 'date'];
    dataSource = ELEMENT_DATA;

    // Track the selected row
    selectedRow: QuestionBank | null = null;

    // Handle row click event
    rowClicked(row: QuestionBank): void {
        if (this.selectedRow === row) {
            // Deselect the row if it's already selected
            this.selectedRow.selected = false;
            this.selectedRow = null;
        } else {
            // Deselect the currently selected row (if any)
            if (this.selectedRow) {
                this.selectedRow.selected = false;
            }

            // Select the clicked row
            row.selected = true;
            this.selectedRow = row;
        }
    }
}
