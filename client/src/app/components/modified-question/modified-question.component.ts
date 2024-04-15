import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MAX_LENGTH } from '@app/config/client-config';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question/question.service';

@Component({
    selector: 'app-modified-question',
    templateUrl: './modified-question.component.html',
    styleUrls: ['./modified-question.component.scss'],
})
export class ModifiedQuestionComponent implements OnInit {
    @Input() gameQuestions: Question[];
    @Input() modifiedShown: boolean;
    @Input() listQuestionBank: boolean;
    @Input() fromBank: boolean;
    @Input() idQuestionBank: string;

    questionList: Question[] = [];
    disabled: boolean[] = [];
    menuSelected: boolean = false;

    constructor(
        protected questionService: QuestionService,
        private router: Router,
    ) {}

    ngOnInit() {
        if (this.listQuestionBank) {
            this.loadQuestionsFromBank();
        } else {
            this.setQuestionList();
        }
        this.questionService.onQuestionAdded.subscribe((question) => {
            this.questionList.push(question);
            this.disabled.push(true);
        });

        this.questionList.forEach((question) => {
            this.cutText(question);
        });
    }

    setQuestionList() {
        if (!this.gameQuestions) {
            this.questionList = this.questionService.getQuestion().map((item) => ({ ...item }));
        } else {
            this.questionList = this.gameQuestions;
            this.questionList.forEach(() => {
                this.disabled.push(false);
            });
        }
    }

    async loadQuestionsFromBank() {
        const questionsBank = await this.questionService.getQuestions();
        this.disabled = this.questionList.map(() => true);
        this.questionList = questionsBank.filter((question) => question.id === this.idQuestionBank);
    }

    toggleModify(index: number) {
        this.disabled[index] = false;
    }

    saveQuestion(index: number) {
        this.cutText(this.questionList[index]);
        const validated = this.questionService.saveQuestion(index, this.questionList, this.listQuestionBank);

        this.disabled[index] = validated;
        if (this.fromBank) {
            this.router.navigate(['/question-bank']);
        }
    }

    removeQuestion(question: Question, index: number) {
        this.questionList = this.questionList.filter((element) => element.id !== question.id);
        this.questionService.updateList(this.questionList);
        this.disabled[index] = true;
    }

    toggleMenuSelection(): void {
        this.menuSelected = !this.menuSelected;
    }

    cutText(question: Question): void {
        if (question.text.length > MAX_LENGTH) {
            question.text = question.text.substring(0, MAX_LENGTH) + '...';
        }
    }
}
