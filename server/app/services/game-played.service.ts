import gamePlayedModel, { IGamePlayed } from '@app/model/gameplayed.model';
import { Service } from 'typedi';

@Service()
export class GamePlayedService {
    async getGamesPlayed(): Promise<IGamePlayed[]> {
        return gamePlayedModel.find({}, { _id: 0 });
    }

    async getGamePlayed(gamePlayedId: string): Promise<IGamePlayed> {
        return gamePlayedModel.findOne({ id: gamePlayedId }, { _id: 0 });
    }

    async createGamePlayed(gamePlayedData: IGamePlayed): Promise<IGamePlayed> {
        return await gamePlayedModel.create(gamePlayedData);
    }

    async deleteGame(gamePlayedId: string): Promise<IGamePlayed> {
        return await gamePlayedModel.findOneAndDelete({ id: gamePlayedId });
    }

    async updateGame(gamePlayedData: IGamePlayed): Promise<IGamePlayed> {
        return await gamePlayedModel.findOneAndUpdate({ id: gamePlayedData.id }, { $set: gamePlayedData }, { new: true });
    }
}
