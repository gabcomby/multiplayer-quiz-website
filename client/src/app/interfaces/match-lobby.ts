import { Player } from './match';
export interface MatchLobby {
    id: string;
    playerList: Player[];
    gameId: string;
    bannedNames: string[];
    lobbyCode: string;
    isLocked: boolean;
}
