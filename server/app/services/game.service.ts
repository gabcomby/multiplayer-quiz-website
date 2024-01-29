import gameModel, { IGame } from '@app/model/game.model';
import { Service } from 'typedi';

@Service()
export class GameService {
    async getGames(): Promise<(typeof gameModel)[]> {
        return gameModel.find();
    }

    async getGame(gameId: string): Promise<IGame> {
        return gameModel.findOne({ id: gameId });
    }

    async createGame(gameData: IGame): Promise<IGame> {
        return await gameModel.create(gameData);
    }

    async deleteGame(gameId: string): Promise<IGame> {
        return await gameModel.findOneAndDelete({ id: gameId });
    }

    async toggleVisibility(gameId: string, gameData: IGame): Promise<IGame> {
        const updatedGame = await gameModel.findOneAndUpdate({ id: gameId }, { $set: { isVisible: gameData.isVisible } }, { new: true });

        if (!updatedGame) throw new Error('Game not found');
        return updatedGame;
    }
}
