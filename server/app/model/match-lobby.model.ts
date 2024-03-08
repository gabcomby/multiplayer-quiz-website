import mongoose, { Document, Schema } from 'mongoose';
import { IPlayer, playerSchema } from './match.model';

export interface ILobby extends Document {
    id: string;
    playerList: IPlayer[];
    gameId: string;
    bannedNames: string[];
    lobbyCode: string;
    isLocked: boolean;
    hostId: string;
}

const lobbySchema: Schema = new Schema({
    id: { type: String, required: true },
    playerList: [playerSchema],
    gameId: { type: String, required: true },
    bannedNames: { type: [String], required: true },
    lobbyCode: { type: String, required: true },
    isLocked: { type: Boolean, required: true },
    hostId: { type: String, required: true },
});

export default mongoose.model<ILobby>('Lobby', lobbySchema);
