import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Question, QuestionType } from '@app/interfaces/game';
import { AdminService } from '@app/services/admin.service';
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
    displayedColumns: string[];
    dataSource: Question[] = [];
    filteredQuestions: Question[] = [];
    private questionToAdd: Question[] = [];
    private defaultDisplayedColumns: string[] = ['question', 'type', 'modify', 'date', 'delete'];

    constructor(
        private questionService: QuestionService,
        private snackbarService: SnackbarService,
        private adminService: AdminService,
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
            this.filteredQuestions = this.dataSource;
        });
    }

    deleteQuestion(questionId: string): void {
        const confirmDelete = window.confirm('Êtes-vous sûr de vouloir supprimer cette question?');
        if (!confirmDelete) return;

        this.questionService
            .deleteQuestion(questionId)
            .then(() => {
                this.filteredQuestions = this.dataSource.filter((question) => question.id !== questionId);
                this.snackbarService.openSnackBar('Le jeu a été supprimé avec succès.');
            })
            .catch((error) => {
                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante: ${error}`);
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

    filter(type?: string) {
        if (!type) {
            this.filteredQuestions = this.dataSource;
        } else if (type === 'QCM') {
            this.filteredQuestions = this.dataSource.filter((question) => question.type === QuestionType.QCM);
        } else if (type === 'QRL') {
            this.filteredQuestions = this.dataSource.filter((question) => question.type === QuestionType.QRL);
        }
    }

    formatDate(date: string): string {
        return this.adminService.formatLastModificationDate(date);
    }
}
