import gamePlayedModel, { IGamePlayed } from '@app/model/gameplayed.model';
import { Service } from 'typedi';

@Service()
export class GameService {
    async getGamesPlayed(): Promise<IGamePlayed[]> {
        return gamePlayedModel.find({}, { _id: 0 });
    }

    async getGamePlayed(gameId: string): Promise<IGamePlayed> {
        return gamePlayedModel.findOne({ id: gameId }, { _id: 0 });
    }

    async createGamePlayed(gameData: IGamePlayed): Promise<IGamePlayed> {
        return await gamePlayedModel.create(gameData);
    }

    async deleteGame(gameId: string): Promise<IGamePlayed> {
        return await gamePlayedModel.findOneAndDelete({ id: gameId });
    }

    async updateGame(gameData: IGamePlayed): Promise<IGamePlayed> {
        return await gamePlayedModel.findOneAndUpdate({ id: gameData.id }, { $set: gameData }, { new: true });
    }
}
