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
        console.log('allo');
        console.log('lobby', lobbyId);
        const lobby = await matchLobbyModel.findOne({ lobbyCode: lobbyId });
        console.log('lobby', lobby);
        if (lobby) {
            return lobby.bannedNames;
        } else {
            return [];
        }
    }

    async banPlayer(playerName: string, lobbyId: string): Promise<ILobby> {
        console.log('banPlayer', playerName, lobbyId);
        try {
            const updatedLobby = await matchLobbyModel.findOneAndUpdate(
                { lobbyCode: lobbyId },
                {
                    $push: {
                        bannedNames: playerName,
                    },
                },
                { new: true },
            );
            return updatedLobby;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du lobby :', error);
            throw error;
        }
    }

    async getPlayers(lobbyId: string): Promise<IPlayer[]> {
        const lobby = await matchLobbyModel.findOne({ id: lobbyId });
        return lobby.playerList;
    }

    async getPlayer(lobbyId: string, playerId: string): Promise<IPlayer> {
        const lobby = await matchLobbyModel.findOne({ id: lobbyId });
        return lobby.playerList.find((player) => player.id === playerId);
    }

    async updatePlayerScore(lobbyId: string, playerId: string, incr: number): Promise<ILobby> {
        const lobby = await this.getLobby(lobbyId);
        const index = lobby.playerList.findIndex((player) => player.id === playerId);
        lobby.playerList[index].score += incr;
        return await matchLobbyModel.findOneAndUpdate({ id: lobbyId }, lobby, { new: true });
    }
}
