import mongoose, { Document, Schema } from 'mongoose';

interface IChoice extends Document {
    text: string;
    isCorrect?: boolean;
}

export interface IQuestion extends Document {
    type: string;
    text: string;
    points: number;
    choices?: IChoice[];
}

const choiceSchema: Schema = new Schema({
    text: { type: String, required: true },
    isCorrect: Boolean,
});

const questionSchema: Schema = new Schema({
    type: { type: String, required: true },
    text: { type: String, required: true },
    points: { type: Number, required: true },
    choices: [choiceSchema],
});

export default mongoose.model<IQuestion>('Question', questionSchema);
