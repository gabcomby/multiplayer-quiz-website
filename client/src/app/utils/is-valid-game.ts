import { Choice, Game, Question } from '@app/interfaces/game';

const isValidGame = (game: Game): boolean => {
    const errors: string[] = [];

    validateBasicGameProperties(game, errors);
    validateGameQuestions(game, errors);

    if (errors.length > 0) {
        alert(errors.join('\n'));
        return false;
    }
    return true;
};

const validateBasicGameProperties = (game: Game, errors: string[]): void => {
    if (!game.title) errors.push('Title is required');
    if (!game.description) errors.push('Description is required');
    if (!game.duration) errors.push('Duration is required');
    if (!game.lastModification) errors.push('LastModification is required');
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

    validateQuestionChoices(question, index, errors);
};

const validateQuestionChoices = (question: Question, questionIndex: number, errors: string[]): void => {
    if (question.type === 'QRL') return;

    if (!question.choices || !question.choices.length) {
        errors.push(`Question ${questionIndex + 1}: At least one choice is required`);
        return;
    }

    question.choices.forEach((choice: Choice, choiceIndex: number) => {
        if (!choice.text) {
            errors.push(`Question ${questionIndex + 1}, Choice ${choiceIndex + 1}: Text is required`);
        }
        if (choice.isCorrect === undefined) {
            errors.push(`Question ${questionIndex + 1}, Choice ${choiceIndex + 1}: Correctness status is required`);
        }
    });
};

export default isValidGame;
