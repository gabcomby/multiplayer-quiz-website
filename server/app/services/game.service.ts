import gameModel from '@app/model/game.model';
import { Service } from 'typedi';

@Service()
export class GameService {
    async getGames(): Promise<(typeof gameModel)[]> {
        return gameModel.find();
    }
}
