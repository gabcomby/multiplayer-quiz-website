import gamePlayedModel, { IGamePlayed } from '@app/model/gameplayed.model';
import { Service } from 'typedi';

@Service()
export class GamePlayedService {
    async getGamesPlayed(): Promise<IGamePlayed[]> {
        return gamePlayedModel.find({}, { _id: 0 });
    }

    async createGamePlayed(gamePlayedData: IGamePlayed): Promise<IGamePlayed> {
        return gamePlayedModel.create(gamePlayedData);
    }

    async deletePlayedGames(): Promise<{ deletedCount: number }> {
        return gamePlayedModel.deleteMany({});
    }
}
