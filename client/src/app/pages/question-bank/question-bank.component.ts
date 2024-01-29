import { Component, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';
/*
const ELEMENT_DATA: Question[] = [
    { id: generateNewId(), type: 'QCM', text: 'Quelle est la capitale de la France?', lastModification: new Date(), points: 2 },
    { id: generateNewId(), type: 'QCM', text: 'Quelle est la capitale de l Allemagne?', lastModification: new Date(), points: 2 },
    { id: generateNewId(), type: 'QCM', text: 'Quelle est la capitale de l Angleterre?', lastModification: new Date(), points: 2 },
    { id: generateNewId(), type: 'QCM', text: 'Quelle est la capitale de l Espagne?', lastModification: new Date(), points: 2 },
];
*/

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
})
export class QuestionBankComponent implements OnInit {
    displayedColumns: string[] = ['question', 'date', 'delete', 'modify'];
    dataSource: Question[] = [];

    // Track the selected row IDs
    selectedRowIds: string[] = [];

    constructor(
        // private http: HttpClient,
        private questionService: QuestionService,
    ) {}

    ngOnInit() {
        this.questionService.getQuestions().then((questions) => {
            this.dataSource = questions;
        });
    }
    /*
    loadQuestions(): void {
        this.questionService.getQuestions().subscribe({
            next: (data) => {
                this.dataSource = data.sort((a, b) => a.lastModification.getTime() - b.lastModification.getTime());
            },
            error: (error) => {
                alert(error);
            },
        });
    }
    */

    deleteQuestion(questionId: string): void {
        this.dataSource = this.dataSource.filter((question) => question.id !== questionId);
        /*
        this.http.delete(`http://localhost:3000/api/questions/${questionId}`).subscribe({
            next: () => {
                alert('Question deleted successfully');
            },
            error: (error) => {
                alert(`Error deleting question: ${error}`);
            },
        });
        */
    }

    createQuestion(): void {
        // Implement logic to create a new game
    }

    modifyQuestion(): void {
        // Implement logic to modify a question
    }
}
