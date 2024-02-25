import matchLobbyModel, { ILobby } from '@app/model/match-lobby.model';
import { IPlayer } from '@app/model/match.model';
import { Service } from 'typedi';

@Service()
export class MatchLobbyService {
    async getAllLobbies(): Promise<ILobby[]> {
        return await matchLobbyModel.find();
    }

    async getLobby(lobbyId: string): Promise<ILobby> {
        return await matchLobbyModel.findOne({ id: lobbyId });
    }

    async getLobbyByCode(lobbyCode: string): Promise<ILobby> {
        return await matchLobbyModel.findOne({ code: lobbyCode });
    }

    async createLobby(lobbyData: ILobby): Promise<ILobby> {
        return await matchLobbyModel.create(lobbyData);
    }

    async deleteLobby(lobbyId: string): Promise<ILobby> {
        return await matchLobbyModel.findOneAndDelete({ id: lobbyId });
    }

    async addPlayer(lobbyId: string, player: IPlayer): Promise<ILobby> {
        return await matchLobbyModel.findOneAndUpdate(
            { id: lobbyId },
            {
                $push: {
                    playerList: player,
                },
            },
            { new: true },
        );
    }

    async removePlayer(lobbyId: string, playerName: string): Promise<ILobby> {
        return await matchLobbyModel.findOneAndUpdate(
            { id: lobbyId },
            {
                $pull: {
                    playerList: { name: playerName },
                },
            },
            { new: true },
        );
    }

    async getBannedPlayers(lobbyId: string): Promise<string[]> {
        const lobby = await matchLobbyModel.findOne({ id: lobbyId });

        if (lobby) {
            return lobby.bannedNames;
        } else {
            return [];
        }
    }

    async banPlayer(lobbyId: string, playerName: string): Promise<ILobby> {
        return await matchLobbyModel.findOneAndUpdate(
            { id: lobbyId },
            {
                $push: {
                    bannedNames: playerName,
                },
            },
            { new: true },
        );
    }
}
