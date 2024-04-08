import { HttpClient } from '@angular/common/http';
import { EventEmitter, Inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@app/app.module';
import { Choice, Question, QuestionType } from '@app/interfaces/game';
import { Observable, firstValueFrom } from 'rxjs';
import { QuestionValidationService } from './question-validation.service';

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
        if (questionList[index]) {
            questionList[index].lastModification = new Date();
            let validated = this.questionValidationService.validateQuestion(questionList[index]);

            if (questionList[index].choices && questionList[index].type === QuestionType.QCM) {
                // TODO: Remove the eslint-disable-line comment when the following issue is fixed:
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                validated = this.questionValidationService.verifyOneGoodAndBadAnswer(questionList[index].choices!);
            }

            if (validated) {
                if (listQuestionBank) {
                    this.updateQuestion(questionList[index].id, questionList[index]);
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
