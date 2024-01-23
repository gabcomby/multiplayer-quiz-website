import gameModel, { IGame } from '@app/model/game.model';
import { Service } from 'typedi';

@Service()
export class GameService {
    async getGames(): Promise<(typeof gameModel)[]> {
        return gameModel.find();
    }

    async createGame(gameData: IGame): Promise<IGame> {
        return await gameModel.create(gameData);
    }

    async deleteGame(gameId: string): Promise<IGame> {
        return await gameModel.findOneAndDelete({ id: gameId });
    }
}
