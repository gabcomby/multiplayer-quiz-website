import { Service } from 'typedi';
import matchModel, { IMatch } from '../model/match.model';

@Service()
export class MatchService {
    async getAllMatches(): Promise<(typeof matchModel)[]> {
        return await matchModel.find();
    }

    async getMatch(matchId: string): Promise<IMatch> {
        return await matchModel.findOne({ id: matchId });
    }

    async createMatch(matchData: IMatch): Promise<IMatch> {
        return await matchModel.create(matchData);
    }

    async deleteGame(matchId: string): Promise<IGame> {
        return await matchModel.findOneAndDelete({ id: matchId });
    }

    // TODO: Add a player to a game
    // async addPlayer(player: IPlayer, matchId: string) {
    //     await matchModel.findOneAndUpdate({})
    // }

    // TODO: Remove a player from a game
    // async addPlayer(player: IPlayer, matchId: string) {
    //     await matchModel.findOneAndUpdate({})
    // }

    // TODO: Get a list of all the players in the game
    // async addPlayer(player: IPlayer, matchId: string) {
    //     await matchModel.findOneAndUpdate({})
    // }
}
