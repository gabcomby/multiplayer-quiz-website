export interface Game {
    id: string;
    title: string;
    description: string;
    isVisible: boolean;
    duration: number;
    lastModification: Date;
    questions: Question[];
}

export interface Choice {
    text: string;
    isCorrect?: boolean;
}

export interface Question {
    type: string;
    text: string;
    points: number;
    choices?: Choice[];
    id: number;
    previousIndex?: number;
    currentIndex?: number;
}
