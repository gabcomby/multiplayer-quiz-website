import mongoose, { Document, Schema } from 'mongoose';

interface IChoice extends Document {
    text: string;
    isCorrect?: boolean;
}

interface IQuestion extends Document {
    id: string;
    type: string;
    text: string;
    points: number;
    choices?: IChoice[];
}

export interface IGame extends Document {
    id: string;
    title: string;
    isVisible: boolean;
    description: string;
    duration: number;
    lastModification: Date;
    questions: IQuestion[];
}

const choiceSchema: Schema = new Schema({
    text: { type: String, required: true },
    isCorrect: Boolean,
});

const questionSchema: Schema = new Schema({
    type: { type: String, required: true },
    text: { type: String, required: true },
    points: { type: Number, required: true },
    id: { type: String, required: true },
    choices: [choiceSchema],
});

const gameSchema: Schema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    isVisible: { type: Boolean, required: true },
    description: String,
    duration: Number,
    lastModification: Date,
    questions: [questionSchema],
});

export default mongoose.model<IGame>('Game', gameSchema);
