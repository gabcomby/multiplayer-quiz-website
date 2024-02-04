import gameModel, { IGame } from '@app/model/game.model';
import { Service } from 'typedi';

@Service()
export class GameService {
    async getGames(): Promise<IGame[]> {
        return gameModel.find({}, { _id: 0, __v: 0 });
    }

    async getGame(gameId: string): Promise<IGame> {
        return gameModel.findOne({ id: gameId }, { _id: 0, __v: 0 });
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

    async updateGame(gameID: string, gameData: IGame): Promise<IGame> {
        const updatedGame = await gameModel.findOneAndUpdate({ gameID }, gameData);
        return updatedGame;
    }
}
