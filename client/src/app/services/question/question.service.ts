import { HttpClient } from '@angular/common/http';
import { EventEmitter, Inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@app/app.module';
import { Choice, Question, QuestionType } from '@app/interfaces/game';
import { QuestionValidationService } from '@app/services/question-validation/question-validation.service';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    questions: Question[] = [];

    onQuestionAdded: EventEmitter<Question> = new EventEmitter();
    private apiUrl: string;

    constructor(
        private http: HttpClient,
        private questionValidationService: QuestionValidationService,
        @Inject(API_BASE_URL) apiBaseURL: string,
    ) {
        this.apiUrl = `${apiBaseURL}/questions`;
    }

    resetQuestions() {
        this.questions = [];
    }

    addQuestion(question: Question) {
        this.questions.push(question);
        this.onQuestionAdded.emit(question);
    }

    getQuestion() {
        return this.questions;
    }

    async getQuestions(): Promise<Question[]> {
        const questions$ = this.http.get<Question[]>(this.apiUrl);
        const questions = await firstValueFrom(questions$);
        return questions;
    }

    async addQuestionBank(question: Question): Promise<Question> {
        const question$ = this.http.post<Question>(this.apiUrl, question);
        const newQuestion = await firstValueFrom(question$);
        return newQuestion;
    }

    getQuestionById(questionId: string): Observable<Question> {
        return this.http.get<Question>(`${this.apiUrl}/${questionId}`);
    }

    async updateQuestion(questionId: string, questionData: Question): Promise<Question> {
        const question$ = this.http.patch<Question>(`${this.apiUrl}/${questionId}`, questionData);
        const updatedQuestion = await firstValueFrom(question$);
        return updatedQuestion;
    }
    async deleteQuestion(questionId: string): Promise<void> {
        await firstValueFrom(this.http.delete(`${this.apiUrl}/${questionId}`));
    }

    updateList(question: Question[]) {
        this.questions = [];
        this.questions = question.map((item) => ({ ...item }));
    }
    saveQuestion(index: number, questionList: Question[], listQuestionBank: boolean): boolean {
        const question = questionList[index];

        if (question) {
            question.lastModification = new Date();
            let validated = this.questionValidationService.validateQuestion(question);

            if (question.choices && question.type === QuestionType.QCM)
                validated = this.questionValidationService.verifyOneGoodAndBadAnswer(question.choices);

            if (validated) {
                if (listQuestionBank) {
                    this.updateQuestion(question.id, question);
                } else {
                    this.updateList(questionList);
                }
            }

            return validated;
        }

        return false;
    }

    moveQuestionUp(index: number, array: Choice[] | Question[]): void {
        if (index > 0) {
            const temp = array[index];
            array[index] = array[index - 1];
            array[index - 1] = temp;
        }
    }

    moveQuestionDown(index: number, array: Choice[] | Question[]): void {
        if (index < array.length - 1) {
            const temp = array[index];
            array[index] = array[index + 1];
            array[index + 1] = temp;
        }
    }
}
