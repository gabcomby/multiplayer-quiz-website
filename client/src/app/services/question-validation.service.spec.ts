// import { TestBed } from '@angular/core/testing';

// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import { Question } from '@app/interfaces/game';
// import { QuestionValidationService } from './question-validation.service';
// import { SnackbarService } from './snackbar.service';

// describe('QuestionValidationService', () => {
//     let service: QuestionValidationService;
//     let httpController: HttpTestingController;
//     let snackbarServiceMock: jasmine.SpyObj<SnackbarService>;
//     const defaultDate = new Date();
//     const question: Question = {
//         type: 'QCM',
//         id: 'abc123',
//         lastModification: defaultDate,
//         text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
//         points: 40,
//         choices: [
//             {
//                 text: 'var',
//                 isCorrect: true,
//             },
//             {
//                 text: 'self',
//                 isCorrect: false,
//             },
//             {
//                 text: 'this',
//                 isCorrect: true,
//             },
//             {
//                 text: 'int',
//             },
//         ],
//     };

//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             imports: [HttpClientTestingModule],
//             providers: [QuestionValidationService],
//         });
//         service = TestBed.inject(QuestionValidationService);
//         httpController = TestBed.inject(HttpTestingController);
//         snackbarServiceMock = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
//     });

//     afterEach(() => {
//         httpController.verify();
//         // service.questions = [];
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });
//     it('should return true when validateQuestion with valid data', () => {
//         // const newQuestion = { type: 'QCM', text: 'allo', points: 10, id: '12312312', choices: [], lastModification: defaultDate };
//         const valid = service.validateQuestion(question);
//         expect(valid).toEqual(true);
//     });
//     it('should return false when validateQuestion with no text in question', () => {
//         // const question = { type: 'QCM', text: '', points: 10, id: '12312312', choices: [], lastModification: defaultDate };
//         const valid = service.validateQuestion(question);
//         expect(valid).toEqual(false);
//     });
//     it('should return false when validateQuestion with no points in question', () => {
//         // const question = { type: 'QCM', text: 'allo', points: 0, id: '12312312', choices: [], lastModification: defaultDate };
//         const valid = service.validateQuestion(question);
//         expect(valid).toEqual(false);
//     });
//     it('should return false when validateQuestion with just whitespaces in question text', () => {
//         // const question = { type: 'QCM', text: '   ', points: 10, id: '12312312', choices: [], lastModification: defaultDate };
//         const valid = service.validateQuestion(question);
//         expect(valid).toEqual(false);
//     });
// });
