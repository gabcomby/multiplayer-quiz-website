import matchModel, { IMatch, IPlayer } from '@app/model/match.model';
import { Service } from 'typedi';

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

    async deleteGame(matchId: string): Promise<IMatch> {
        return await matchModel.findOneAndDelete({ id: matchId });
    }

    // TODO: Add a player to a game
    async addPlayer(player: IPlayer, matchId: string): Promise<IMatch> {
        return await matchModel.findOneAndUpdate({ id: matchId }, { $push: { playerList: player } });
    }

    // TODO: Remove a player from a game
    async removePlayer(playerId: string, matchId: string): Promise<IMatch> {
        return await matchModel.findOneAndUpdate({ id: matchId }, { $pull: { playerList: playerId } });
    }

    // TODO: Get a list of all the players in the game
    async getAllPlayersFromMatch(matchId: string): Promise<IPlayer[]> {
        return (await matchModel.findOne({ id: matchId })).playerList;
    }
}
