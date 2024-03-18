import { Game } from '@app/interfaces/game';
import assignNewGameAttributes, { generateLobbyId } from '@app/utils/assign-new-game-attributes';

const ID_LENGTH = 6;
const YEAR = 2020;
const MONTH = 1;
const DAY = 1;

describe('assignNewGameAttributes', () => {
    it('should assign a new ID and lastModification date to the game object', () => {
        const game: Game = {
            id: 'originalId',
            title: 'Test Game',
            description: 'A test game',
            isVisible: true,
            duration: 120,
            lastModification: new Date(YEAR, MONTH, DAY),
            questions: [],
        };

        assignNewGameAttributes(game);

        expect(game.id).not.toBe('originalId');
        expect(game.id.length).toBe(ID_LENGTH);

        const newModificationDate = new Date(game.lastModification).getTime();
        const now = new Date().getTime();
        expect(newModificationDate).toBeLessThanOrEqual(now);
    });

    it('should generate a new lobby id', () => {
        const lobbyId = generateLobbyId();

        expect(lobbyId.length).toBe(ID_LENGTH);
    });
});
