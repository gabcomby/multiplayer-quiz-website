import matchModel, { IMatch, IPlayer } from '@app/model/match.model';
import { Service } from 'typedi';

@Service()
export class MatchService {
    async getAllMatches(): Promise<IMatch[]> {
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
        return await matchModel.findOneAndUpdate({ id: matchId }, { $push: { playerList: player } }, { new: true });
    }

    async removePlayer(matchId: string, playerId: string): Promise<IMatch> {
        return await matchModel.findOneAndUpdate({ id: matchId }, { $pull: { playerList: { id: playerId } } }, { new: true });
    }

    async getAllPlayersFromMatch(matchId: string): Promise<IPlayer[]> {
        const match = await matchModel.findOne({ id: matchId });
        if (!match) throw new Error("Can't fetch players from a game that doesn't exit");
        return match.playerList;
    }

    async updatePlayerScore(matchId: string, playerId: string, score: number): Promise<IPlayer> {
        /*eslint-disable */
        const match: IMatch = await matchModel.findOneAndUpdate(
            { id: matchId },
            { $set: { 'playerList.$[elem].score': score } },
            { arrayFilters: [{ 'elem.id': playerId }], new: true },
        );
        return match.playerList.find((player) => player.id === playerId);
        /* eslint-enable */
    }
}
