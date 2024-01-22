export interface Game {
    id: string;
    title: string;
    description: string;
    isVisible: boolean;
    duration: number;
    lastModification: Date;
    questions: Question[];
}

interface Choice {
    text: string;
    isCorrect?: boolean;
}

interface Question {
    type: string;
    text: string;
    points: number;
    choices?: Choice[];
}
