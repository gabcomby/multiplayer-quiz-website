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
            this.dataSource = questions.sort((a, b) => {
                const dateA = new Date(a.lastModification).getTime();
                const dateB = new Date(b.lastModification).getTime();
                return dateB - dateA;
            });
        });
    }

    deleteQuestion(questionId: string): void {
        this.dataSource = this.dataSource.filter((question) => question.id !== questionId);
        this.questionService.deleteQuestion(questionId);
    }
}
