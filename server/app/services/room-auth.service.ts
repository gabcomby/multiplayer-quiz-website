import { RoomState } from '@app/classes/room';
import { IPlayer } from '@app/model/match.model';
import { rooms } from '@app/module';
import { Service } from 'typedi';

@Service()
export class RoomAuthService {
    async verifyPlayerCanJoinRoom(roomId: string, player: IPlayer): Promise<boolean> {
        if (player.name.trim().toLowerCase() === 'organisateur') {
            return false;
        }
        const room = rooms.get(roomId);
        if (room) {
            if (room.roomState !== RoomState.WAITING) {
                return false;
            }
            const bannedNames = room.bannedNames;
            const currentPlayerNames = [...room.playerList.values()].map((p) => p.name.toLowerCase());

            if (bannedNames.includes(player.name.trim().toLowerCase()) || currentPlayerNames.includes(player.name.trim().toLowerCase())) {
                return false;
            }
            if (room.roomLocked) {
                return false;
            }
            return true;
        }
        return false;
    }
}
