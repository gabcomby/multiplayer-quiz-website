// describe('isValidGame', () => {
//     it('should return true for a valid game object', () => {
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

//         expect(isValidGame(game)).toBeTrue();
//     });

//     it('should return false if the game title is missing', () => {
//         const game: Game = {
//             id: '123456',
//             title: '',
//             description: 'Game without title',
//             isVisible: true,
//             duration: 60,
//             lastModification: new Date(),
//             questions: [],
//         };

//         expect(isValidGame(game)).toBeFalse();
//     });

//     it('should return false if the game has no questions', () => {
//         const game: Game = {
//             id: '123456',
//             title: 'Game',
//             description: 'A game with no questions',
//             isVisible: true,
//             duration: 60,
//             lastModification: new Date(),
//             questions: [],
//         };

//         expect(isValidGame(game)).toBeFalse();
//     });

//     it('should return false if a question is missing a type', () => {
//         const game: Game = {
//             id: '123456',
//             title: 'Game',
//             description: 'A game with no questions',
//             isVisible: true,
//             duration: 60,
//             lastModification: new Date(),
//             questions: [
//                 {
//                     id: '123',
//                     lastModification: new Date(),
//                     type: '',
//                     text: 'Sample Question',
//                     points: 10,
//                     choices: [],
//                 },
//             ],
//         };

//         expect(isValidGame(game)).toBeFalse();
//     });

//     it('should return false if a question is missing text', () => {
//         const game: Game = {
//             id: '123456',
//             title: 'Game',
//             description: 'A game with no questions',
//             isVisible: true,
//             duration: 60,
//             lastModification: new Date(),
//             questions: [
//                 {
//                     id: '12378',
//                     lastModification: new Date(),
//                     type: 'QCM',
//                     text: '',
//                     points: 10,
//                     choices: [],
//                 },
//             ],
//         };

//         expect(isValidGame(game)).toBeFalse();
//     });

//     it('should return false if a question is missing points', () => {
//         const game: Game = {
//             id: '123456',
//             title: 'Game',
//             description: 'A game with no questions',
//             isVisible: true,
//             duration: 60,
//             lastModification: new Date(),
//             questions: [
//                 {
//                     id: '12309',
//                     lastModification: new Date(),
//                     type: 'QCM',
//                     text: 'Sample Question',
//                     choices: [],
//                     points: null as unknown as number,
//                 },
//             ],
//         };

//         expect(isValidGame(game)).toBeFalse();
//     });

//     it('should return false if a question has no choices', () => {
//         const game: Game = {
//             id: '123456',
//             title: 'Game',
//             description: 'A game with no questions',
//             isVisible: true,
//             duration: 60,
//             lastModification: new Date(),
//             questions: [
//                 {
//                     id: '12',
//                     lastModification: new Date(),
//                     type: 'QCM',
//                     text: 'Sample Question',
//                     points: 10,
//                     choices: [],
//                 },
//             ],
//         };

//         expect(isValidGame(game)).toBeFalse();
//     });

//     it('should return false if a question has no correct choice', () => {
//         const game: Game = {
//             id: '123456',
//             title: 'Game',
//             description: 'A game with no questions',
//             isVisible: true,
//             duration: 60,
//             lastModification: new Date(),
//             questions: [
//                 {
//                     id: '123765',
//                     lastModification: new Date(),
//                     type: 'QCM',
//                     text: 'Sample Question',
//                     points: 10,
//                     choices: [
//                         { text: 'Choice 1', isCorrect: false },
//                         { text: 'Choice 2', isCorrect: false },
//                     ],
//                 },
//             ],
//         };

//         expect(isValidGame(game)).toBeFalse();
//     });
// });
