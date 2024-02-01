// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
// import { ActivatedRoute, convertToParamMap } from '@angular/router';
// // import * as gameUtilsModule from '@app/utils/is-valid-game';
// // import { Question } from '@app/interfaces/game';
// import { FormControl, FormGroup } from '@angular/forms';
// import { Question } from '@app/interfaces/game';
// import { GameService } from '@app/services/game.service';
// import { QuestionService } from '@app/services/question.service';
// import { of } from 'rxjs';
// import { CreateQGamePageComponent } from './create-qgame-page.component';
// import SpyObj = jasmine.SpyObj;

// describe('CreateQGamePageComponent', () => {
//     let questionServiceSpy: SpyObj<QuestionService>;
//     let gameServiceSpy: SpyObj<GameService>;
//     let component: CreateQGamePageComponent;
//     let fixture: ComponentFixture<CreateQGamePageComponent>;
//     let mockIsValidGame: jasmine.Spy;
//     beforeEach(() => {
//         questionServiceSpy = jasmine.createSpyObj('QuestionService', {
//             addQuestion: {},
//             updateList: {},
//             getQuestion: [
//                 {
//                     type: 'QCM',
//                     text: 'Ceci est une question de test',
//                     points: 10,
//                     id: 'dsdsd',
//                     lastModification: new Date(),
//                 } as Question,
//             ],
//             resetQuestions: {},
//         });
//         // questionServiceSpy = jasmine.createSpyObj('QuestionService', ['addQuestion', 'getQuestion', 'resetQuestions']);
//         gameServiceSpy = jasmine.createSpyObj('GameService', ['getGames', 'createGame']);
//         mockIsValidGame = jasmine.createSpy('isValidGame');
//     });
//     beforeEach(waitForAsync(() => {
//         TestBed.configureTestingModule({
//             declarations: [CreateQGamePageComponent],
//             providers: [
//                 { provide: QuestionService, useValue: questionServiceSpy },
//                 { provide: GameService, useValue: gameServiceSpy },
//                 { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '123' })) } },
//             ],
//             imports: [HttpClientTestingModule],
//         }).compileComponents();
//     }));
//     beforeEach(() => {
//         fixture = TestBed.createComponent(CreateQGamePageComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });
//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
//     it('should initialize with default values', () => {
//         expect(component.questions).toEqual([
//             {
//                 type: 'QCM',
//                 text: 'Ceci est une question de test',
//                 points: 10,
//                 id: 'dsdsd',
//                 lastModification: new Date(),
//             },
//         ]);
//         expect(component.isNotVisible).toBeFalse();
//         expect(component.modifiedQuestion).toBeFalse();
//         expect(component.addQuestionShown).toBeFalse();
//         expect(component.gamesFromDB).toEqual([]);
//         expect(component.dataReady).toBeFalse();
//     });

//     it('initialize forms controls', () => {
//         expect(component.gameForm.get('name')).toBeTruthy();
//         expect(component.gameForm.get('description')).toBeTruthy();
//         expect(component.gameForm.get('time')).toBeTruthy();
//     });

//     it('should toggle addQuestionShown property', () => {
//         expect(component.addQuestionShown).toBeFalse();
//         component.toggleAddQuestion();
//         expect(component.addQuestionShown).toBeTrue();
//     });
//     it('should toggle modifiedQuestion property', () => {
//         expect(component.modifiedQuestion).toBeFalse();
//         component.toggleModifiedQuestion();
//         expect(component.modifiedQuestion).toBeTrue();
//     });
//     it('should call createGame from GameService when onSubmit is called with valid data', () => {
//         const mockQuestionList = [
//             { type: 'QCM', text: 'Ceci est une question de test', points: 10, id: 'dsdsd', lastModification: new Date() },
//             { type: 'QCM', text: 'question 2', points: 10, id: 'akak', lastModification: new Date() },
//         ];
//         const mockGameForm = new FormGroup({
//             name: new FormControl('Test Game'),
//             description: new FormControl('Description'),
//             time: new FormControl(10),
//         });
//         component.onSubmit(mockQuestionList, mockGameForm, true);
//         mockIsValidGame.and.returnValue(true);
//         expect(gameServiceSpy.createGame).toHaveBeenCalled();
//     });
// });
