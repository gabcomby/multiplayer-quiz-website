// // import { Game } from '@app/interfaces/game';
// // import isValidGame from '@app/utils/is-valid-game';

// // describe('isValidGame', () => {
// //     it('should return true for a valid game object', () => {
// //         const game: Game = {
// //             id: '123456',
// //             title: 'Valid Game',
// //             description: 'A valid game description',
// //             isVisible: true,
// //             duration: 60,
// //             lastModification: new Date(),
// //             questions: [
// //                 {
// //                     id: '12345',
// //                     lastModification: new Date(),
// //                     type: 'QCM',
// //                     text: 'Sample Question',
// //                     points: 10,
// //                     choices: [
// //                         { text: 'Choice 1', isCorrect: true },
// //                         { text: 'Choice 2', isCorrect: false },
// //                     ],
// //                 },
// //             ],
// //         };

// //         expect(isValidGame(game)).toBeTrue();
// //     });

// //     it('should return false if the game title is missing', () => {
// //         const game: Game = {
// //             id: '123456',
// //             title: '',
// //             description: 'Game without title',
// //             isVisible: true,
// //             duration: 60,
// //             lastModification: new Date(),
// //             questions: [],
// //         };

// //         expect(isValidGame(game)).toBeFalse();
// //     });

// //     it('should return false if the game has no questions', () => {
// //         const game: Game = {
// //             id: '123456',
// //             title: 'Game',
// //             description: 'A game with no questions',
// //             isVisible: true,
// //             duration: 60,
// //             lastModification: new Date(),
// //             questions: [],
// //         };

// //         expect(isValidGame(game)).toBeFalse();
// //     });

// //     it('should return false if a question is missing a type', () => {
// //         const game: Game = {
// //             id: '123456',
// //             title: 'Game',
// //             description: 'A game with no questions',
// //             isVisible: true,
// //             duration: 60,
// //             lastModification: new Date(),
// //             questions: [
// //                 {
// //                     id: '123',
// //                     lastModification: new Date(),
// //                     type: '',
// //                     text: 'Sample Question',
// //                     points: 10,
// //                     choices: [],
// //                 },
// //             ],
// //         };

// //         expect(isValidGame(game)).toBeFalse();
// //     });

// //     it('should return false if a question is missing text', () => {
// //         const game: Game = {
// //             id: '123456',
// //             title: 'Game',
// //             description: 'A game with no questions',
// //             isVisible: true,
// //             duration: 60,
// //             lastModification: new Date(),
// //             questions: [
// //                 {
// //                     id: '12378',
// //                     lastModification: new Date(),
// //                     type: 'QCM',
// //                     text: '',
// //                     points: 10,
// //                     choices: [],
// //                 },
// //             ],
// //         };

// //         expect(isValidGame(game)).toBeFalse();
// //     });

// //     it('should return false if a question is missing points', () => {
// //         const game: Game = {
// //             id: '123456',
// //             title: 'Game',
// //             description: 'A game with no questions',
// //             isVisible: true,
// //             duration: 60,
// //             lastModification: new Date(),
// //             questions: [
// //                 {
// //                     id: '12309',
// //                     lastModification: new Date(),
// //                     type: 'QCM',
// //                     text: 'Sample Question',
// //                     choices: [],
// //                     points: null as unknown as number,
// //                 },
// //             ],
// //         };

// //         expect(isValidGame(game)).toBeFalse();
// //     });

// //     it('should return false if a question has no choices', () => {
// //         const game: Game = {
// //             id: '123456',
// //             title: 'Game',
// //             description: 'A game with no questions',
// //             isVisible: true,
// //             duration: 60,
// //             lastModification: new Date(),
// //             questions: [
// //                 {
// //                     id: '12',
// //                     lastModification: new Date(),
// //                     type: 'QCM',
// //                     text: 'Sample Question',
// //                     points: 10,
// //                     choices: [],
// //                 },
// //             ],
// //         };

// //         expect(isValidGame(game)).toBeFalse();
// //     });

// //     it('should return false if a question has no correct choice', () => {
// //         const game: Game = {
// //             id: '123456',
// //             title: 'Game',
// //             description: 'A game with no questions',
// //             isVisible: true,
// //             duration: 60,
// //             lastModification: new Date(),
// //             questions: [
// //                 {
// //                     id: '123765',
// //                     lastModification: new Date(),
// //                     type: 'QCM',
// //                     text: 'Sample Question',
// //                     points: 10,
// //                     choices: [
// //                         { text: 'Choice 1', isCorrect: false },
// //                         { text: 'Choice 2', isCorrect: false },
// //                     ],
// //                 },
// //             ],
// //         };

// //         expect(isValidGame(game)).toBeFalse();
// //     });
// // });

// import { Game } from '@app/interfaces/game';
// import { GameService } from '@app/services/game.service';

// import validateBasicGameProperties from './is-valid-game';
// describe('validateBasicGameProperties function', () => {
//     let gameServiceMock: GameService;

//     it('should not add errors for a game with all required properties', () => {
//         const game: Game = {
//             title: 'Sample Title',
//             description: 'Sample Description',
//             duration: 60,
//             lastModification: new Date(),
//         };
//         const errors: string[] = [];

//         validateBasicGameProperties(game, errors);

//         expect(errors.length).toBe(0);
//     });

//     it('should add "Title is required" error for a game with empty title', () => {
//         const game: Game = {
//             title: '',
//             description: 'Sample Description',
//             duration: 60,
//             lastModification: new Date(),
//         };
//         const errors: string[] = [];

//         validateBasicGameProperties(game, errors);

//         expect(errors).toContain('Title is required');
//     });

//     it('should add "not just whitespace" error for a game with title containing only whitespace', () => {
//         const game: Game = {
//             title: '   ',
//             description: 'Sample Description',
//             duration: 60,
//             lastModification: new Date(),
//         };
//         const errors: string[] = [];

//         validateBasicGameProperties(game, errors);

//         expect(errors).toContain('not just whitespace');
//     });

//     it('should add "Description is required" error for a game without description', () => {
//         const game: Game = {
//             title: 'Sample Title',
//             description: '',
//             duration: 60,
//             lastModification: new Date(),
//         };
//         const errors: string[] = [];

//         validateBasicGameProperties(game, errors);

//         expect(errors).toContain('Description is required');
//     });

//     it('should add "Duration is required" error for a game without duration', () => {
//         const game: Game = {
//             title: 'Sample Title',
//             description: 'Sample Description',
//             duration: undefined,
//             lastModification: new Date(),
//         };
//         const errors: string[] = [];

//         validateBasicGameProperties(game, errors);

//         expect(errors).toContain('Duration is required');
//     });

//     it('should add "LastModification is required" error for a game without lastModification', () => {
//         const game: Game = {
//             title: 'Sample Title',
//             description: 'Sample Description',
//             duration: 60,
//             lastModification: null,
//         };
//         const errors: string[] = [];

//         validateBasicGameProperties(game, errors);

//         expect(errors).toContain('LastModification is required');
//     });
//     it('should return true for a valid game', async () => {
//         const game: Game = {
//             id: '123456',
//             title: 'Valid Game',
//             description: 'A valid game description',
//             isVisible: true,
//             duration: 60,
//             lastModification: new Date(),
//             questions: [
//                 {
//                     id: '12345',
//                     lastModification: new Date(),
//                     type: 'QCM',
//                     text: 'Sample Question',
//                     points: 10,
//                     choices: [
//                         { text: 'Choice 1', isCorrect: true },
//                         { text: 'Choice 2', isCorrect: false },
//                     ],
//                 },
//             ],
//         };

//         const result = await isValidGame(game, gameServiceMock as GameService, false);

//         expect(result).toBe(true);
//     });

//     it('should return false and display errors if basic game properties are invalid', async () => {
//         const game: Game = {
//             id: '123456',
//             title: '',
//             description: 'A valid game description',
//             isVisible: true,
//             duration: 60,
//             lastModification: new Date(),
//             questions: [
//                 {
//                     id: '12345',
//                     lastModification: new Date(),
//                     type: 'QCM',
//                     text: 'Sample Question',
//                     points: 10,
//                     choices: [
//                         { text: 'Choice 1', isCorrect: true },
//                         { text: 'Choice 2', isCorrect: false },
//                     ],
//                 },
//             ],
//         };

//         const result = await isValidGame(game, gameServiceMock as GameService, false);

//         expect(result).toBe(false);
//         // Assert that errors are displayed
//     });

//     it('should return false and display errors if game questions are invalid', async () => {
//         const game: Game = {
//             // Define a game object with invalid questions
//         };

//         const result = await isValidGame(game, gameServiceMock as GameService, false);

//         expect(result).toBe(false);
//         // Assert that errors are displayed
//     });

//     it('should return false and display errors if game is a duplicate', async () => {
//         const game: Game = {
//             // Define a game object
//         };

//         // Ensure gameServiceMock.validateDuplicationGame is set up to return true

//         const result = await isValidGame(game, gameServiceMock as GameService, true);

//         expect(result).toBe(false);
//         // Assert that errors are displayed
//     });
// });
