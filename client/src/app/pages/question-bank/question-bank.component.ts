import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';
import { SnackbarService } from '@app/services/snackbar.service';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
})
export class QuestionBankComponent implements OnInit {
    @Input() fromCreateNewGame: boolean;
    @Output() registerQuestion: EventEmitter<Question[]> = new EventEmitter();
    questionToAdd: Question[] = [];
    displayedColumns: string[];
    dataSource: Question[] = [];
    defaultDisplayedColumns: string[] = ['question', 'date', 'delete'];

    // Track the selected row IDs
    selectedRowIds: string[] = [];

    constructor(
        private questionService: QuestionService,
        private snackbarService: SnackbarService,
    ) {}

    ngOnInit() {
        this.displayedColumns = this.fromCreateNewGame ? ['question', 'delete'] : this.defaultDisplayedColumns;
        this.loadQuestions();
    }

    loadQuestions() {
        this.questionService.getQuestions().then((questions) => {
            this.dataSource = questions.sort((a, b) => {
                const dateA = new Date(a.lastModification).getTime();
                const dateB = new Date(b.lastModification).getTime();
                return dateB - dateA;
            });
        });
    }

    deleteQuestion(questionId: string): void {
        const confirmDelete = window.confirm('Êtes-vous sûr de vouloir supprimer cette question?');
        if (!confirmDelete) return;

        this.questionService
            .deleteQuestion(questionId)
            .then(() => {
                this.dataSource = this.dataSource.filter((question) => question.id !== questionId);
                this.snackbarService.openSnackBar('Le jeu a été supprimé avec succès.');
            })
            .catch((error) => {
                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante: ${error.message || error}`);
            });
    }

    addQuestionToGame() {
        this.registerQuestion.emit(this.questionToAdd);
        this.questionToAdd = [];
    }
    onChange(question: Question) {
        if (this.questionToAdd.includes(question)) {
            this.questionToAdd = this.questionToAdd.filter((element) => element.id !== question.id);
        } else {
            this.questionToAdd.push(question);
        }
    }
}
