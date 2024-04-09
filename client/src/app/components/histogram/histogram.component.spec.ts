import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuestionType } from '@app/interfaces/game';
import { GameService } from '@app/services/game/game.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HistogramComponent } from './histogram.component';

// const LENGTH_CHOICES_TEST = 4;
const NAVIGATE_LEFT = -1;
describe('HistogramComponent', () => {
    let component: HistogramComponent;
    let fixture: ComponentFixture<HistogramComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['']);

        await TestBed.configureTestingModule({
            declarations: [HistogramComponent],
            imports: [MatIconModule, NgxChartsModule, BrowserAnimationsModule],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HistogramComponent);
        component = fixture.componentInstance;

        component.questionsGame = [
            {
                type: QuestionType.QCM,
                text: 'What is the capital of France?',
                points: 10,
                choices: [
                    { text: 'Paris', isCorrect: true },
                    { text: 'London', isCorrect: false },
                    { text: 'Berlin', isCorrect: false },
                    { text: 'Rome', isCorrect: false },
                ],
                lastModification: new Date(),
                id: 'abc',
            },
            {
                type: QuestionType.QCM,
                text: 'The Earth is flat.',
                points: 20,
                choices: [
                    { text: 'True', isCorrect: false },
                    { text: 'False', isCorrect: true },
                ],
                lastModification: new Date(),
                id: 'def',
            },
        ];

        component.answersPlayer = [
            ['What is the capital of France?', [0, 0, 1]],
            ['The Earth is flat.', [1, 1, 0]],
        ];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('constructHistogramsData should call calculateAnswerCounts and mapToHistogramData', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const calculateAnswerCountsSpy = spyOn<any>(component, 'calculateAnswerCounts').and.callThrough();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapToHistogramDataSpy = spyOn<any>(component, 'mapToHistogramData').and.callThrough();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const constructHistogramsDataSpy = spyOn<any>(component, 'constructHistogramsData').and.callThrough();
        constructHistogramsDataSpy.call(component);

        expect(calculateAnswerCountsSpy).toHaveBeenCalled();
        expect(mapToHistogramDataSpy).toHaveBeenCalled();
    });

    it('calculateAnswerCounts should count the numbers of time the choice was selected', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const calculateAnswerCountsSpy = spyOn<any>(component, 'calculateAnswerCounts').and.callThrough();
        const answerCounts = calculateAnswerCountsSpy.call(component, component.questionsGame[0]);

        const expectedAnswerCounts = Object.fromEntries([
            [{ text: 'Paris', isCorrect: true }, 2],
            [{ text: 'London', isCorrect: false }, 1],
            [{ text: 'Berlin', isCorrect: false }, 0],
            [{ text: 'Rome', isCorrect: false }, 0],
        ]);

        const answerCountsJSON = JSON.stringify(Object.fromEntries(answerCounts));
        const expectedAnswerCountsJSON = JSON.stringify(expectedAnswerCounts);

        expect(answerCountsJSON).toEqual(expectedAnswerCountsJSON);
        expect(calculateAnswerCountsSpy).toHaveBeenCalled();
        expect(calculateAnswerCountsSpy).toHaveBeenCalledWith(component.questionsGame[0]);
    });

    it('mapToHistogramData should format the data', () => {
        const answerCounts = [
            { choice: { text: 'Paris', isCorrect: true }, count: 2 },
            { choice: { text: 'London', isCorrect: false }, count: 1 },
            { choice: { text: 'Berlin', isCorrect: false }, count: 0 },
            { choice: { text: 'Rome', isCorrect: false }, count: 0 },
        ];

        const answerCountsMap = new Map(answerCounts.map(({ choice, count }) => [choice, count]));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapToHistogramDataSpy = spyOn<any>(component, 'mapToHistogramData').and.callThrough();
        const histogramsData: { name: string; value: number }[] = mapToHistogramDataSpy.call(component, answerCountsMap);

        const expectedAnswerCounts = [
            { name: 'Paris (correct)', value: 2 },
            { name: 'London', value: 1 },
            { name: 'Berlin', value: 0 },
            { name: 'Rome', value: 0 },
        ];

        expect(histogramsData).toEqual(expectedAnswerCounts);
    });

    // it('should update live histogram data on ngOnChanges', () => {
    //     component.ngOnChanges({ answersPlayer: { currentValue: component.answersPlayer } as SimpleChange });

    //     expect(component.histogramsData.length).toBe(1);
    //     expect(component.histogramsData[0].data.length).toBe(LENGTH_CHOICES_TEST);
    //     expect(component.histogramsData[0].data[0].name).toBe('Paris (correct)');
    //     expect(component.histogramsData[0].data[0].value).toBe(3); // wtf
    //     expect(component.histogramsData[0].data[1].name).toBe('London');
    //     expect(component.histogramsData[0].data[1].value).toBe(3); // wtf
    // });

    it('should navigate to the next histogram', () => {
        component.histogramsData = [
            {
                question: 'Question 1',
                data: [
                    { name: 'Choice A (correct)', value: 5 },
                    { name: 'Choice B', value: 3 },
                ],
            },
            {
                question: 'Question 2',
                data: [
                    { name: 'Choice C (correct)', value: 7 },
                    { name: 'Choice D', value: 2 },
                ],
            },
        ];

        expect(component.currentIndex).toBe(0);

        component.navigate(1);
        expect(component.currentIndex).toBe(1);

        component.navigate(NAVIGATE_LEFT);
        expect(component.currentIndex).toBe(0);
    });

    it('if theres no question it should not construct live histogram', () => {
        component.questionsGame = [];
        component.ngOnChanges({ answersPlayer: { currentValue: component.answersPlayer } as SimpleChange });

        expect(component.histogramData.length).toBe(0);
    });
});
