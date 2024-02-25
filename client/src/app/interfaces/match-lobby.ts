import { Player } from './match';
export interface MatchLobby {
    id: string;
    playerList: Player[];
    bannedNames: string[];
    lobbyCode: string;
    isLocked: boolean;
}
