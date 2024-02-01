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

    async deleteMatch(matchId: string): Promise<IMatch> {
        return await matchModel.findOneAndDelete({ id: matchId });
    }

    async addPlayer(matchId: string, player: IPlayer): Promise<IMatch> {
        return await matchModel.findOneAndUpdate({ id: matchId }, { $push: { playerList: player } });
    }

    async removePlayer(matchId: string, playerId: string): Promise<IMatch> {
        return await matchModel.findOneAndUpdate({ id: matchId }, { $pull: { playerList: playerId } });
    }

    async getAllPlayersFromMatch(matchId: string): Promise<IPlayer[]> {
        const match = await matchModel.findOne({ id: matchId });
        if (!match) throw new Error("Can't fetch players from a game that doesn't exit");
        return match.playerList;
    }
}
