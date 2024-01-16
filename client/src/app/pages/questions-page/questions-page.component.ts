import { Component } from '@angular/core';
import { Question } from '@app/interfaces/question';

const FAKE_QUESTIONS: Question[] = [
    { id: 1, label: 'Quelle est la capitale actuelle de la France ?' },
    { id: 2, label: "Quelle est la capitale actuelle de l'Espagne ?" },
    { id: 3, label: "Quelle est la capitale actuelle de l'Allemagne ?" },
    { id: 4, label: "Quelle est la capitale actuelle de l'Italie ?" },
    { id: 5, label: 'Quelle est la capitale actuelle de la Belgique ?' },
    { id: 6, label: 'Quelle est la capitale actuelle de la Suisse ?' },
    { id: 7, label: 'Quelle est la capitale actuelle de la Russie ?' },
    { id: 8, label: 'Quelle est la capitale actuelle de la Chine ?' },
    { id: 9, label: 'Quelle est la capitale actuelle du Japon ?' },
    { id: 10, label: "Quelle est la capitale actuelle de l'Australie ?" },
];

@Component({
    selector: 'app-questions-page',
    templateUrl: './questions-page.component.html',
    styleUrls: ['./questions-page.component.scss'],
})
export class QuestionsPageComponent {
    displayedColumns: string[] = ['id', 'label'];
    dataSource = FAKE_QUESTIONS;
}
