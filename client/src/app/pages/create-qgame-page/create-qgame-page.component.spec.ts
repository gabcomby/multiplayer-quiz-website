// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
// import { FormControl, FormGroup } from '@angular/forms';
// import { ActivatedRoute, convertToParamMap } from '@angular/router';
// import { Game, Question } from '@app/interfaces/game';
// import { GameService } from '@app/services/game.service';
// import { QuestionService } from '@app/services/question.service';
// import * as gameUtilsModule from '@app/utils/is-valid-game';
// import { of } from 'rxjs';
// import { CreateQGamePageComponent } from './create-qgame-page.component';
// import SpyObj = jasmine.SpyObj;

// describe('CreateQGamePageComponent', () => {
//     let questionServiceSpy: SpyObj<QuestionService>;
//     let gameServiceSpy: SpyObj<GameService>;
//     let component: CreateQGamePageComponent;
//     let fixture: ComponentFixture<CreateQGamePageComponent>;
//     const defaultDate = new Date();

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
//                     choices: [
//                         { text: '1', isCorrect: false },
//                         { text: '2', isCorrect: true },
//                     ],
//                     lastModification: new Date(),
//                 },
//                 {
//                     type: 'QCM',
//                     text: 'Ceci est une question de test 2',
//                     points: 20,
//                     id: '45',
//                     choices: [
//                         { text: '1', isCorrect: false },
//                         { text: '2', isCorrect: true },
//                     ],
//                     lastModification: new Date(),
//                 } as Question,
//             ],
//             resetQuestions: {},
//         });
//         gameServiceSpy = jasmine.createSpyObj('GameService', {
//             getGames: [],
//             createGame: {},
//             patchGame: Promise.resolve({
//                 id: 'ddwd',
//                 title: 'string',
//                 description: 'string',
//                 isVisible: false,
//                 duration: 10,
//                 lastModification: defaultDate,
//                 questions: [{ type: 'QCM', text: 'Ceci est une question de test', points: 10, id: 'dsdsd', lastModification: defaultDate }],
//             } as Game),
//         });
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
//         expect(component.modifiedQuestion).toBeFalse();
//         expect(component.gamesFromDB).toEqual([]);
//         expect(component.dataReady).toBeFalse();
//         expect(component.gamesFromDB).toEqual([]);
//     });

//     it('initialize forms controls', () => {
//         expect(component.gameForm.get('name')).toBeTruthy();
//         expect(component.gameForm.get('description')).toBeTruthy();
//         expect(component.gameForm.get('time')).toBeTruthy();
//     });
//     it('find game with id in list should return game if found', () => {
//         component.gamesFromDB = [
//             {
//                 id: '123',
//                 title: 'allo',
//                 description: 'test',
//                 isVisible: false,
//                 duration: 10,
//                 lastModification: defaultDate,
//                 questions: [
//                     {
//                         type: 'QCM',
//                         text: 'Ceci est une question de test',
//                         points: 10,
//                         id: 'dsdsd',
//                         choices: [
//                             { text: '1', isCorrect: false },
//                             { text: '2', isCorrect: true },
//                         ],
//                         lastModification: defaultDate,
//                     },
//                 ],
//             },
//             {
//                 id: '124',
//                 title: 'bonjour',
//                 description: 'test2',
//                 isVisible: false,
//                 duration: 20,
//                 lastModification: defaultDate,
//                 questions: [
//                     {
//                         type: 'QCM',
//                         text: 'Ceci est une question de test',
//                         points: 10,
//                         id: 'dsdsd',
//                         choices: [
//                             { text: '1', isCorrect: false },
//                             { text: '2', isCorrect: true },
//                         ],
//                         lastModification: defaultDate,
//                     },
//                 ],
//             },
//         ];
//         component.getGame('123');
//         expect(component.gameFromDB).toEqual({
//             id: '123',
//             title: 'allo',
//             description: 'test',
//             isVisible: false,
//             duration: 10,
//             lastModification: defaultDate,
//             questions: [
//                 {
//                     type: 'QCM',
//                     text: 'Ceci est une question de test',
//                     points: 10,
//                     id: 'dsdsd',
//                     choices: [
//                         { text: '1', isCorrect: false },
//                         { text: '2', isCorrect: true },
//                     ],
//                     lastModification: defaultDate,
//                 },
//             ],
//         });
//     });
//     it('find game with id in list should return undefined if not found', () => {
//         component.gameFromDB = {
//             id: '',
//             title: '',
//             description: '',
//             isVisible: false,
//             duration: 10,
//             lastModification: defaultDate,
//             questions: [],
//         };
//         component.gamesFromDB = [
//             {
//                 id: '123',
//                 title: 'allo',
//                 description: 'test',
//                 isVisible: false,
//                 duration: 10,
//                 lastModification: defaultDate,
//                 questions: [
//                     {
//                         type: 'QCM',
//                         text: 'Ceci est une question de test',
//                         points: 10,
//                         id: 'dsdsd',
//                         choices: [
//                             { text: '1', isCorrect: false },
//                             { text: '2', isCorrect: true },
//                         ],
//                         lastModification: defaultDate,
//                     },
//                 ],
//             },
//         ];
//         component.getGame('124');
//         expect(component.gameFromDB).toEqual({
//             id: '',
//             title: '',
//             description: '',
//             isVisible: false,
//             duration: 10,
//             lastModification: defaultDate,
//             questions: [],
//         });
//     });

//     it('initialize forms controls with value when gameId is not null', () => {
//         const MAGIC_NUMB = 10;
//         component.gameForm = new FormGroup({
//             name: new FormControl(''),
//             description: new FormControl(''),
//             time: new FormControl(''),
//         });
//         component.gameFromDB = {
//             id: '123',
//             title: 'allo',
//             description: 'test',
//             isVisible: false,
//             duration: MAGIC_NUMB,
//             lastModification: new Date(),
//             questions: [
//                 {
//                     type: 'QCM',
//                     text: 'Ceci est une question de test',
//                     points: 10,
//                     id: 'dsdsd',
//                     choices: [
//                         { text: '1', isCorrect: false },
//                         { text: '2', isCorrect: true },
//                     ],
//                     lastModification: new Date(),
//                 },
//             ],
//         };
//         component.insertIfExist();
//         expect(component.gameForm).toBeTruthy();
//         expect(component.gameForm.get('name')?.value).toBe('allo');
//         expect(component.gameForm.get('description')?.value).toBe('test');
//         expect(component.gameForm.get('time')?.value).toBe(MAGIC_NUMB);
//     });

//     it('should call createNewGame when onSubmit', async () => {
//         spyOn(component, 'createNewGame');
//         await component.onSubmit().then(() => {
//             fixture.detectChanges();
//             expect(component.createNewGame).toHaveBeenCalled();
//         });
//     });
//     it('should call create new game when calling createNewGame', () => {
//         component.gameForm = new FormGroup({
//             name: new FormControl(''),
//             description: new FormControl(''),
//             visibility: new FormControl(''),
//             time: new FormControl(''),
//         });
//         const MAGIC_NUMB = 10;
//         component.gameForm.controls['name'].setValue('Test Game');
//         component.gameForm.controls['description'].setValue('Test Description');
//         component.gameForm.controls['time'].setValue(MAGIC_NUMB);

//         const newGame = component.createNewGame(true);
//         expect(newGame).toBeTruthy();
//         expect(newGame.id).toBeDefined();
//         expect(newGame.title).toBe('Test Game');
//         expect(newGame.description).toBe('Test Description');
//         expect(newGame.duration).toBe(MAGIC_NUMB);
//         expect(newGame.lastModification).toBeInstanceOf(Date);
//         expect(newGame.questions).toEqual(questionServiceSpy.getQuestion());
//     });

//     it('should call gameValidationWhenModified when gameID is not null', async () => {
//         spyOn(component, 'gameValidationWhenModified');
//         await component.onSubmit().then(async () => {
//             expect(component.gameId).toBe('123');
//             fixture.detectChanges();
//             expect(component.gameValidationWhenModified).toHaveBeenCalled();
//         });
//     });
//     it('should call patch when gameID is not null and validateDeletedGame return true', async () => {
//         spyOn(gameUtilsModule, 'isValidGame').and.returnValue(Promise.resolve(true));
//         spyOn(gameUtilsModule, 'validateDeletedGame').and.returnValue(Promise.resolve(true));

//         component.gameValidationWhenModified().then(() => {
//             fixture.detectChanges();
//             expect(gameServiceSpy.patchGame).toHaveBeenCalled();
//         });
//     });
//     it('should call create when gameID is not null and validateDeletedGame return false', async () => {
//         spyOn(gameUtilsModule, 'isValidGame').and.returnValue(Promise.resolve(true));
//         spyOn(gameUtilsModule, 'validateDeletedGame').and.returnValue(Promise.resolve(false));

//         await component.gameValidationWhenModified().then(() => {
//             fixture.detectChanges();
//             expect(gameServiceSpy.createGame).toHaveBeenCalled();
//         });
//     });
//     it('should toggle modifiedQuestion property', () => {
//         expect(component.modifiedQuestion).toBeFalse();

//         component.toggleModifiedQuestion();
//         expect(component.modifiedQuestion).toBeTrue();

//         component.toggleModifiedQuestion();
//         expect(component.modifiedQuestion).toBeFalse();
//     });
// });
