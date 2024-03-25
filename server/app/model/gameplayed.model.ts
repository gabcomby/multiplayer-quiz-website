import mongoose, { Document, Schema } from 'mongoose';

export interface IGamePlayed extends Document {
    title: string;
    creationDate: Date;
    numberPlayers: number;
    bestScore: number;
}

const gamePlayedSchema: Schema = new Schema({
    title: { type: String, required: true },
    creationDate: { type: Date, required: true },
    numberPlayers: { type: Number, required: true },
    bestScore: { type: Number, required: true },
});

export default mongoose.model<IGamePlayed>('GamePlayed', gamePlayedSchema);
