import { Component, Input, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { QuestionValidationService } from '@app/services/question-validation.service';
import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-modified-question',
    templateUrl: './modified-question.component.html',
    styleUrls: ['./modified-question.component.scss'],
})
export class ModifiedQuestionComponent implements OnInit {
    @Input() gameQuestions: Question[];
    @Input() modifiedShown: boolean;
    @Input() listQuestionBank: boolean;

    questionList: Question[] = [];
    disabled: boolean[] = [];
    menuSelected: boolean = false;

    constructor(
        private questionService: QuestionService,
        private questionValidationService: QuestionValidationService,
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
        this.questionList = await this.questionService.getQuestions();
        this.disabled = this.questionList.map(() => true);
    }

    toggleModify(index: number) {
        this.disabled[index] = false;
    }

    saveQuestion(index: number) {
        this.questionList[index].lastModification = new Date();
        if (this.listQuestionBank && this.verifyOneGoodAndBadAnswer(index) && this.validateQuestion(this.questionList[index])) {
            this.questionService.updateQuestion(this.questionList[index].id, this.questionList[index]);
            this.disabled[index] = true;
        } else {
            if (
                this.questionValidationService.verifyOneGoodAndBadAnswer(this.questionList[index].choices) &&
                this.questionValidationService.validateQuestion(this.questionList[index])
            ) {
                this.questionService.updateList(this.questionList);
                this.disabled[index] = true;
            }
        }
    }

    moveQuestionUp(index: number): void {
        if (index > 0) {
            const temp = this.questionList[index];
            this.questionList[index] = this.questionList[index - 1];
            this.questionList[index - 1] = temp;
        }
    }

    moveQuestionDown(index: number): void {
        if (index < this.questionList.length - 1) {
            const temp = this.questionList[index];
            this.questionList[index] = this.questionList[index + 1];
            this.questionList[index + 1] = temp;
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
}
