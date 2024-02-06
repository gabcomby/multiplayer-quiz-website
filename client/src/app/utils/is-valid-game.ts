import { Choice, Game, Question } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';

export const isValidGame = async (game: Game, gameService: GameService, newGame: boolean): Promise<boolean> => {
    const errors: string[] = [];
    validateBasicGameProperties(game, errors);
    validateGameQuestions(game, errors);
    if (newGame) {
        await validateDuplicationGame(game, errors, gameService);
    }
    if (errors.length > 0) {
        alert(errors.join('\n'));
        return false;
    }
    return true;
};

const validateBasicGameProperties = (game: Game, errors: string[]): void => {
    if (!game.title) errors.push('Title is required');
    if (game.title.trim().length === 0) errors.push('not just whitespace');
    if (!game.description) errors.push('Description is required');
    if (!game.duration) errors.push('Duration is required');
    if (!game.lastModification) errors.push('LastModification is required');
};

const validateDuplicationGame = async (game: Game, errors: string[], gameService: GameService): Promise<void> => {
    const gameList = await gameService.getGames();
    const titleExisting = gameList.find((element) => element.title === game.title);
    const descriptionExisting = gameList.find((element) => element.description === game.description);
    if (titleExisting) {
        errors.push('Il y a déjà un jeu avec ce nom');
    }
    if (descriptionExisting) {
        errors.push('Il y a déjà un jeu avec cet description');
    }
};

export const validateDeletedGame = async (game: Game, gameService: GameService): Promise<boolean> => {
    const gameList = await gameService.getGames();
    const idExisting = gameList.find((element) => element.id === game.id);
    if (idExisting) {
        return true;
    } else {
        return false;
    }
};

const validateGameQuestions = (game: Game, errors: string[]): void => {
    if (!game.questions || !game.questions.length) {
        errors.push('At least one question is required');
        return;
    }

    game.questions.forEach((question, index) => {
        validateQuestion(question, index, errors);
    });
};

const validateQuestion = (question: Question, index: number, errors: string[]): void => {
    if (!question.type) errors.push(`Question ${index + 1}: Type is required`);
    if (!question.text) errors.push(`Question ${index + 1}: Text is required`);
    if (!question.points) errors.push(`Question ${index + 1}: Points are required`);
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (question.points % 10 !== 0) {
        errors.push(`Question ${index + 1}: Les points doivent être des multiples de 10`);
    }
    if (question.text.trim().length === 0) errors.push('not just whitespace');

    validateQuestionChoices(question, index, errors);
};

const validateQuestionChoices = (question: Question, questionIndex: number, errors: string[]): void => {
    if (question.type === 'QRL') return;

    if (!question.choices || !question.choices.length) {
        errors.push(`Question ${questionIndex + 1}: At least one choice is required`);
        return;
    }

    let hasCorrectChoice = false;
    question.choices.forEach((choice: Choice, choiceIndex: number) => {
        if (!choice.text) {
            errors.push(`Question ${questionIndex + 1}, Choice ${choiceIndex + 1}: Text is required`);
        }
        if (choice.isCorrect === undefined) {
            errors.push(`Question ${questionIndex + 1}, Choice ${choiceIndex + 1}: Correctness status is required`);
        } else if (choice.isCorrect) {
            hasCorrectChoice = true;
        }
        if (choice.text.trim().length === 0) errors.push('not just whitespace');
    });

    if (!hasCorrectChoice) {
        errors.push(`Question ${questionIndex + 1}: At least one choice must be correct`);
    }
};

export default isValidGame;
