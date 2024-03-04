// import { TestBed } from '@angular/core/testing';

// import { HandlerNewQuestionService } from './handler-new-question.service';
// import { SnackbarService } from './snackbar.service';

// describe('HandlerNewQuestionService', () => {
//     let service: HandlerNewQuestionService;
//     let snackbarService: SnackbarService;
//     beforeEach(() => {
//         TestBed.configureTestingModule({});
//         service = TestBed.inject(HandlerNewQuestionService);
//         snackbarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });
//     it('should create question when createNewQuestion is called', () => {
//         spyOn(gameUtilsModule, 'generateNewId').and.returnValue('334');
//         const newChoices: Choice[] = [
//             { text: '1', isCorrect: false },
//             { text: '2', isCorrect: true },
//         ];

//         component.question = { type: 'QCM', text: 'allo', points: 10, id: '12312312', choices: newChoices, lastModification: defaultDate };
//         const newQuestion = component.createNewQuestion(newChoices);
//         expect(newQuestion).toEqual({
//             text: 'allo',
//             points: 10,
//             choices: newChoices,
//             type: 'QCM',
//             id: '334',
//             lastModification: new Date(),
//         });
//     });

//     it('should return false when calling validateQuestionExisting with question already in questionBank', async () => {
//         const newQuestion = {
//             type: 'QCM',
//             text: 'Ceci est une question de test',
//             points: 10,
//             id: 'dsdsd',
//             choices: [
//                 { text: '1', isCorrect: false },
//                 { text: '2', isCorrect: true },
//             ],
//             lastModification: new Date(),
//         };
//         const valid = await component.validateQuestionExisting(newQuestion);
//         expect(valid).toEqual(false);
//     });
//     it('should return true when calling validateQuestionExisting with question not in questionBank', async () => {
//         const newQuestion = {
//             type: 'QCM',
//             text: 'Ceci est une question de test 2',
//             points: 10,
//             id: '1234',
//             choices: [
//                 { text: '1', isCorrect: false },
//                 { text: '2', isCorrect: true },
//             ],
//             lastModification: new Date(),
//         };
//         const valid = await component.validateQuestionExisting(newQuestion);
//         expect(valid).toEqual(true);
//     });
// });
