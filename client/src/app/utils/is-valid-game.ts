import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { SnackbarService } from '@app/services/snackbar.service';

// const MULTIPLE = 10;
const MAX_DURATION = 60;
const MIN_DURATION = 10;
export const isValidGame = async (game: Game, snackbarService: SnackbarService, gameService: GameService): Promise<boolean> => {
    const errors: string[] = [];
    validateBasicGameProperties(game, errors);
    validateGameQuestions(game, errors);
    await gameService.validateDuplicationGame(game, errors);
    if (errors.length > 0) {
        snackbarService.openSnackBar(errors.join('\n'));
        return false;
    }
    return true;
};

const validateBasicGameProperties = (game: Game, errors: string[]): void => {
    if (!game.title) errors.push('Title is required');
    if (game.title.trim().length === 0) errors.push('not just whitespace');
    if (!game.description) errors.push('Description is required');
    if (!game.duration) errors.push('Duration is required');
    if (game.duration < MIN_DURATION || game.duration > MAX_DURATION) {
        errors.push('Duration must be between 10 and 60 seconds');
    }
    if (!game.lastModification) errors.push('LastModification is required');
};

const validateGameQuestions = (game: Game, errors: string[]): void => {
    if (!game.questions || !game.questions.length) {
        errors.push('At least one question is required');
        return;
    }

    // game.questions.forEach((question, index) => {
    //     validateQuestion(question, index, errors);
    // });
};

// const validateQuestion = (question: Question, index: number, errors: string[]): void => {
//     if (!question.type) errors.push(`Question ${index + 1}: Type is required`);
//     if (!question.text) errors.push(`Question ${index + 1}: Text is required`);
//     if (!question.points) errors.push(`Question ${index + 1}: Points are required`);
//     if (question.points % MULTIPLE !== 0) {
//         errors.push(`Question ${index + 1}: Les points doivent être des multiples de 10`);
//     }
//     if (question.text.trim().length === 0) errors.push('not just whitespace');

//     validateQuestionChoices(question, index, errors);
// };

// const validateQuestionChoices = (question: Question, questionIndex: number, errors: string[]): void => {
//     if (question.type === 'QRL') return;

//     if (!question.choices || !question.choices.length) {
//         errors.push(`Question ${questionIndex + 1}: At least one choice is required`);
//         return;
//     }

//     let hasCorrectChoice = false;
//     question.choices.forEach((choice: Choice, choiceIndex: number) => {
//         if (!choice.text) {
//             errors.push(`Question ${questionIndex + 1}, Choice ${choiceIndex + 1}: Text is required`);
//         }
//         if (choice.isCorrect === undefined) {
//             errors.push(`Question ${questionIndex + 1}, Choice ${choiceIndex + 1}: Correctness status is required`);
//         } else if (choice.isCorrect) {
//             hasCorrectChoice = true;
//         }
//         if (choice.text.trim().length === 0) errors.push('not just whitespace');
//     });

//     if (!hasCorrectChoice) {
//         errors.push(`Question ${questionIndex + 1}: At least one choice must be correct`);
//     }
// };

export default isValidGame;
