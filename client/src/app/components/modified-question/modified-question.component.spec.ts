// import { DragDropModule } from '@angular/cdk/drag-drop';
// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
// import { Question } from '@app/interfaces/game';
// import { QuestionService } from '@app/services/question.service';
// import { Subject } from 'rxjs';
// import { ModifiedQuestionComponent } from './modified-question.component';
// import SpyObj = jasmine.SpyObj;

// describe('ModifiedQuestionComponent', () => {
//     let questionServiceSpy: SpyObj<QuestionService>;
//     let component: ModifiedQuestionComponent;
//     let fixture: ComponentFixture<ModifiedQuestionComponent>;
//     let onQuestionAddedSubject: Subject<Question>;
//     beforeEach(() => {
//         onQuestionAddedSubject = new Subject();

//         questionServiceSpy = jasmine.createSpyObj('QuestionService', {
//             addQuestion: {},
//             updateQuestion: {},
//             getQuestion: [
//                 {
//                     type: '',
//                     text: 'Ceci est une question de test',
//                     points: 2,
//                     id: 0,
//                 } as Question,
//             ],
//             onQuestionAdded: onQuestionAddedSubject.asObservable(),
//         });
//     });
//     beforeEach(waitForAsync(() => {
//         TestBed.configureTestingModule({
//             declarations: [ModifiedQuestionComponent],
//             providers: [{ provide: QuestionService, useValue: questionServiceSpy }],
//             // providers:[QuestionService],
//             imports: [DragDropModule],
//         }).compileComponents();
//     }));

//     beforeEach(() => {
//         fixture = TestBed.createComponent(ModifiedQuestionComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });
//     it('should create', waitForAsync(() => {
//         fixture.detectChanges();
//         fixture.whenStable().then(() => {
//             expect(component).toBeTruthy();
//         });
//     }));

//     it('should initialize questionList with data from QuestionService', () => {
//         const mockQuestionList: Question[] = [
//             { id: 1, text: 'Question 1', type: '', points: 10 },
//             { id: 2, text: 'Question 2', type: 'QCM', points: 10 },
//         ];

//         questionServiceSpy.getQuestion.and.returnValue(mockQuestionList);
//         fixture.detectChanges();

//         expect(component.questionList).toEqual(mockQuestionList);
//     });
//     it('should enable modification', () => {
//         const index = 1;
//         expect(component.disabled).toBeTrue();
//         component.toggleModify(index);
//         expect(component.disabled).toBeFalse();
//     });

//     it('should update questionList and disable modification on modifiedQuestion', () => {
//         const index = 1;
//         const mockQuestionList: Question[] = [
//             { id: 1, text: 'Question 1', type: '', points: 10 },
//             { id: 2, text: 'Question 2', type: '', points: 10 },
//         ];

//         component.questionList = mockQuestionList;
//         component.saveQuestion(index);

//         expect(questionServiceSpy.updateList).toHaveBeenCalledWith(mockQuestionList);
//         expect(component.disabled[index]).toBeTrue();
//     });

//     it('should remove a question from questionList', () => {
//         const mockQuestionList: Question[] = [
//             { id: 1, text: 'Question 1', type: '', points: 10 },
//             { id: 2, text: 'Question 2', type: '', points: 10 },
//         ];

//         const questionToRemove: Question = { id: 1, text: 'Question 1', type: '', points: 10 };

//         component.questionList = mockQuestionList;
//         component.removeQuestion(questionToRemove);

//         expect(component.questionList).not.toContain(questionToRemove);
//         expect(questionServiceSpy.updateList).toHaveBeenCalledWith(component.questionList);
//     });
// });
