import { Component, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
})
export class QuestionBankComponent implements OnInit {
    displayedColumns: string[] = ['question', 'date', 'delete'];
    dataSource: Question[] = [];

    // Track the selected row IDs
    selectedRowIds: string[] = [];

    constructor(private questionService: QuestionService) {}

    ngOnInit() {
        this.questionService.getQuestions().then((questions) => {
            this.dataSource = questions;
        });
    }

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
}
