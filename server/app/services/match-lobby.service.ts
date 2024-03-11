import matchLobbyModel, { ILobby } from '@app/model/match-lobby.model';
import { IPlayer } from '@app/model/match.model';
import { Service } from 'typedi';

@Service()
export class MatchLobbyService {
    async getLobbies(): Promise<ILobby[]> {
        return await matchLobbyModel.find();
    }

    async getLobby(lobbyId: string): Promise<ILobby> {
        return await matchLobbyModel.findOne({ id: lobbyId });
    }

    async getLobbyByCode(lobbyCode: string): Promise<ILobby> {
        return await matchLobbyModel.findOne({ lobbyCode });
    }

    async lobbyExists(lobbyId: string): Promise<boolean> {
        const count = await matchLobbyModel.countDocuments({ id: lobbyId }, { limit: 1 });
        return count > 0;
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

    async removePlayer(playerId: string, lobbyId: string): Promise<ILobby> {
        return await matchLobbyModel.findOneAndUpdate(
            { id: lobbyId },
            {
                $pull: {
                    playerList: { id: playerId },
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

    async getPlayers(lobbyId: string): Promise<IPlayer[]> {
        const lobby = await matchLobbyModel.findOne({ id: lobbyId });
        return lobby.playerList;
    }

    async getPlayer(lobbyId: string, playerId: string): Promise<IPlayer> {
        const lobby = await matchLobbyModel.findOne({ id: lobbyId });
        return lobby.playerList.find((player) => player.id === playerId);
    }

    async updatePlayerScore(lobbyId: string, playersId: string[], incr: number): Promise<ILobby> {
        const lobby = await this.getLobby(lobbyId);
        console.log(lobby);
        if (lobby) {
            playersId.forEach((playerId) => {
                const index = lobby.playerList.findIndex((player) => playerId === player.id);
                lobby.playerList[index].score += incr;
            });
        }

        return await matchLobbyModel.findOneAndUpdate({ id: lobbyId }, lobby, { new: true });

    }
}
