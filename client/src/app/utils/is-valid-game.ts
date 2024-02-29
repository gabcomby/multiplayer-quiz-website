// import { Choice, Game, Question } from '@app/interfaces/game';
// import { GameService } from '@app/services/game.service';
// import { SnackbarService } from '@app/services/snackbar.service';

// const MULTIPLE = 10;
// const MAX_DURATION = 60;
// const MIN_DURATION = 10;
// export const isValidGame = async (game: Game, snackbarService: SnackbarService, gameService: GameService): Promise<boolean> => {
//     const errors: string[] = [];
//     validateBasicGameProperties(game, errors);
//     validateGameQuestions(game, errors);
//     await gameService.validateDuplicationGame(game, errors);
//     if (errors.length > 0) {
//         snackbarService.openSnackBar(errors.join('\n'));
//         return false;
//     }
//     return true;
// };

// export const validateBasicGameProperties = (game: Game, errors: string[]): void => {
//     if (!game.title) errors.push('Le titre est requis');
//     if (game.title.trim().length === 0) errors.push('Pas juste des espaces');
//     if (!game.description) errors.push('La description est requise');
//     if (!game.duration) errors.push('La durée est requise');
//     if (game.duration && (game.duration < MIN_DURATION || game.duration > MAX_DURATION)) {
//         errors.push('La durée doit être entre 10 et 60 secondes');
//     }
//     if (!game.lastModification) errors.push('La date de mise à jour est requise');
// };

// export const validateGameQuestions = (game: Game, errors: string[]): void => {
//     if (!game.questions || !game.questions.length) {
//         errors.push('Au moins une question est requise');
//         return;
//     }

//     game.questions.forEach((question, index) => {
//         validateQuestionImport(question, index, errors);
//     });
// };

// export const validateQuestionImport = (question: Question, index: number, errors: string[]): void => {
//     if (!question.type) errors.push(`Question ${index + 1}: Type est requis`);
//     if (!question.text) errors.push(`Question ${index + 1}: Text est requis`);
//     if (!question.points) errors.push(`Question ${index + 1}: Points sont requis`);
//     if (question.points && question.points % MULTIPLE !== 0) {
//         errors.push(`Question ${index + 1}: Les points doivent être des multiples de 10`);
//     }
//     if (question.text.trim().length === 0) errors.push('Pas juste des espaces');

//     validateQuestionChoicesImport(question, index, errors);
// };

// export const validateQuestionChoicesImport = (question: Question, questionIndex: number, errors: string[]): void => {
//     if (question.type === 'QRL') return;

//     if (!question.choices || !question.choices.length) {
//         errors.push(`Question ${questionIndex + 1}: Au moins un choix est requis`);
//         return;
//     }

//     let hasCorrectChoice = false;
//     question.choices.forEach((choice: Choice, choiceIndex: number) => {
//         if (!choice.text) {
//             errors.push(`Question ${questionIndex + 1}, Choix ${choiceIndex + 1}: Text est requis`);
//         }
//         if (choice.isCorrect === null) {
//             errors.push(`Question ${questionIndex + 1}, Choix ${choiceIndex + 1}: Status de validité requis`);
//         } else if (choice.isCorrect) {
//             hasCorrectChoice = true;
//         }
//         if (choice.text.trim().length === 0) errors.push('Pas juste des espaces');
//     });

//     if (!hasCorrectChoice) {
//         errors.push(`Question ${questionIndex + 1}: Au moins un choix doit être correct`);
//     }
// };

// export default isValidGame;
