import { Player } from './match';
export interface MatchLobby {
    id: string;
    playerList: Player[];
    gameId: string;
    bannedNames: string[];
    playerGoneList: Player[];
    lobbyCode: string;
    isLocked: boolean;
    hostId: string;
}
