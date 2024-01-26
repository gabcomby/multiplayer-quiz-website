import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Question } from '@app/interfaces/game';
import { generateNewId } from '@app/utils/assign-new-game-attributes';

/*
export interface QuestionBank {
    position: number;
    question: string;
    date: Date;
    selected?: boolean;
    id?: string;
}
*/

const ELEMENT_DATA: Question[] = [
    { id: generateNewId(), type: 'QCM', text: 'Quelle est la capitale de la France?', lastModification: new Date(), points: 2 },
    { id: generateNewId(), type: 'QCM', text: 'Quelle est la capitale de l Allemagne?', lastModification: new Date(), points: 2 },
    { id: generateNewId(), type: 'QCM', text: 'Quelle est la capitale de l Angleterre?', lastModification: new Date(), points: 2 },
    { id: generateNewId(), type: 'QCM', text: 'Quelle est la capitale de l Espagne?', lastModification: new Date(), points: 2 },
];

@Component({
    selector: 'app-question-bank',
    standalone: true,
    imports: [MatTableModule],
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
})
export class QuestionBankComponent implements OnInit {
    displayedColumns: string[] = ['question', 'date'];
    dataSource = ELEMENT_DATA;

    // Track the selected row
    selectedRow: Question | null = null;

    constructor(private http: HttpClient) {}
    /*
    // Handle row click event
    rowClicked(row: Question): void {
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
    */

    ngOnInit() {
        this.loadQuestions();
    }

    loadQuestions(): void {
        this.http.get<Question[]>('http://localhost:3000/api/games').subscribe({
            next: (data) => {
                this.dataSource = data;
            },
            error: (error) => {
                alert(error);
            },
        });
    }

    deleteQuestion(questionId: string): void {
        this.dataSource = this.dataSource.filter((question) => question.id !== questionId);
        this.http.delete(`http://localhost:3000/api/games/${questionId}`).subscribe({
            next: () => {
                alert('Question deleted successfully');
            },
            error: (error) => {
                alert(`Error deleting question: ${error}`);
            },
        });
    }

    createGame(): void {
        // Implement logic to create a new game
    }
}
