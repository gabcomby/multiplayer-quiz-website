import { Choice, Game, Question } from '@app/interfaces/game';

const gameSchema: { [key in keyof Game]?: true } = {
    title: true,
    description: true,
    isVisible: true,
    duration: true,
    lastModification: true,
    questions: true,
};

const questionSchema: { [key in keyof Question]?: true } = {
    type: true,
    text: true,
    points: true,
    choices: true,
};

const choiceSchema: { [key in keyof Choice]?: true } = {
    text: true,
    isCorrect: true,
};

const filterObject = <T extends object>(obj: T, schema: { [key in keyof T]?: true }): T => {
    const filteredObj = {} as T;
    Object.keys(schema).forEach((key) => {
        if (key in obj) {
            filteredObj[key as keyof T] = obj[key as keyof T];
        }
    });
    return filteredObj;
};

const removeUnrecognizedAttributes = (game: Game): Game => {
    const cleanedGame = filterObject(game, gameSchema);

    if (cleanedGame.questions) {
        cleanedGame.questions = cleanedGame.questions.map((question) => {
            const cleanedQuestion = filterObject(question, questionSchema);

            if (cleanedQuestion.choices) {
                cleanedQuestion.choices = cleanedQuestion.choices.map((choice) => filterObject(choice, choiceSchema));
            }

            return cleanedQuestion;
        });
    }

    return cleanedGame;
};

export default removeUnrecognizedAttributes;
