import { Choice, Question } from './game';

export interface NewQuestion {
    question: Question;
    onlyAddQuestionBank: boolean;
    addToBank: boolean;
    choices?: Choice[];
}
