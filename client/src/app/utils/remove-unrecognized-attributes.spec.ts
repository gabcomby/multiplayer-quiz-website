import { Choice, Game, Question } from '@app/interfaces/game';
import removeUnrecognizedAttributes from '@app/utils/remove-unrecognized-attributes';

type MalformedGame = Partial<Game> & { extraAttribute: string };
type MalformedChoice = Partial<Choice> & { extraAttribute: string };
type MalformedQuestion = Partial<Question> & { extraAttribute: string; choices: MalformedChoice[] };

describe('removeUnrecognizedAttributes', () => {
    it('should remove unrecognized attributes from a game object', () => {
        const game: MalformedGame = {
            title: 'Test Game',
            description: 'A test game',
            duration: 60,
            lastModification: new Date(),
            questions: [],
            extraAttribute: 'extra',
        };

        const cleanedGame = removeUnrecognizedAttributes(game as unknown as Game);
        expect(cleanedGame.lastModification).toBeDefined();
        expect((cleanedGame as unknown as MalformedGame).extraAttribute).toBeUndefined();
    });

    it('should remove unrecognized attributes from questions in a game object', () => {
        const game: MalformedGame = {
            id: '123456',
            isVisible: true,
            title: 'Test Game',
            description: 'A test game',
            duration: 60,
            lastModification: new Date(),
            extraAttribute: 'extra',
            questions: [
                {
                    type: 'QCM',
                    text: 'Sample Question',
                    points: 10,
                    choices: [],
                    extraAttribute: 'extra',
                },
            ] as unknown as Question[],
        };

        const cleanedGame = removeUnrecognizedAttributes(game as unknown as Game);
        expect((cleanedGame.questions[0] as unknown as MalformedQuestion).extraAttribute).toBeUndefined();
    });

    it('should remove unrecognized attributes from choices in a question', () => {
        const game: MalformedGame = {
            id: '123456',
            isVisible: true,
            title: 'Test Game',
            description: 'A test game',
            duration: 60,
            lastModification: new Date(),
            extraAttribute: 'extra',
            questions: [
                {
                    type: 'QCM',
                    text: 'Sample Question',
                    points: 10,
                    choices: [
                        {
                            text: 'Choice 1',
                            isCorrect: true,
                            extraAttribute: 'extra',
                        },
                    ] as unknown as Choice[],
                },
            ] as unknown as Question[],
        };

        const cleanedGame = removeUnrecognizedAttributes(game as unknown as Game);
        if (cleanedGame.questions && cleanedGame.questions.length > 0) {
            const cleanedQuestion = cleanedGame.questions[0] as MalformedQuestion;
            if (cleanedQuestion.choices && cleanedQuestion.choices.length > 0) {
                const cleanedChoice = cleanedQuestion.choices[0] as MalformedChoice;
                expect(cleanedChoice.extraAttribute).toBeUndefined();
            } else {
                fail('No choices found in the cleaned question');
            }
        } else {
            fail('No questions found in the cleaned game');
        }
    });
});
