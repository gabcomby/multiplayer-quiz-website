import gameModel, { IGame } from '@app/model/game.model';
import { Service } from 'typedi';

@Service()
export class GameService {
    async getGames(): Promise<IGame[]> {
        return gameModel.find({}, { _id: 0 });
    }

    async getGame(gameId: string): Promise<IGame> {
        return gameModel.findOne({ id: gameId }, { _id: 0 });
    }

    async createGame(gameData: IGame): Promise<IGame> {
        return await gameModel.create(gameData);
    }

    async deleteGame(gameId: string): Promise<IGame> {
        return await gameModel.findOneAndDelete({ id: gameId });
    }

    async updateGame(gameData: IGame): Promise<IGame> {
        return await gameModel.findOneAndUpdate({ id: gameData.id }, { $set: gameData }, { new: true });
    }
}
