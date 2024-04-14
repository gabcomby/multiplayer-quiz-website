/* eslint-disable @typescript-eslint/no-explicit-any */
import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuestionType } from '@app/interfaces/game';
import { GameService } from '@app/services/game/game.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MAX_QUESTIONS_CHOICES, NAVIGATE_LEFT } from 'src/config/game-config';
import { HistogramComponent } from './histogram.component';

describe('HistogramComponent', () => {
    let component: HistogramComponent;
    let fixture: ComponentFixture<HistogramComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    const answersPlayerQRL: [string, number[]][] = [['What is the capital of France?', [1, 0, 1]]];

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', [''], {
            currentQuestionValue: {
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
            playerListValue: [
                { id: '123', name: 'Player 1', score: 10, bonus: 0 },
                { id: '456', name: 'Player 2', score: 20, bonus: 0 },
            ],
        });

        await TestBed.configureTestingModule({
            declarations: [HistogramComponent],
            imports: [MatIconModule, NgxChartsModule, BrowserAnimationsModule],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HistogramComponent);
        component = fixture.componentInstance;

        component.nbModified = 1;
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

    it('should call constructLiveHistogramData', () => {
        const constructLiveHistogramDataSpy = spyOn<any>(component, 'constructLiveHistogramData').and.callFake(() => {
            return;
        });
        if (gameServiceSpy.currentQuestionValue) gameServiceSpy.currentQuestionValue.type = QuestionType.QCM;

        component.ngOnChanges({ answersPlayer: new SimpleChange(null, component.answersPlayer, true) });

        expect(constructLiveHistogramDataSpy).toHaveBeenCalled();
    });

    it('should call constructLiveHistogramData with QRL', () => {
        const constructLiveHistogramQrlSpy = spyOn<any>(component, 'constructLiveHistogramQrl').and.callFake(() => {
            return;
        });
        if (gameServiceSpy.currentQuestionValue) gameServiceSpy.currentQuestionValue.type = QuestionType.QRL;

        component.ngOnChanges({ nbModified: new SimpleChange(null, {}, true) });

        expect(constructLiveHistogramQrlSpy).toHaveBeenCalled();
    });
    it('should update live histogram data when constructLiveHistogramData is called', () => {
        const constructLiveHistogramDataSpy = spyOn<any>(component, 'constructLiveHistogramData').and.callThrough();
        constructLiveHistogramDataSpy.call(component);
        expect(component.histogramsData.length).toBe(1);
        expect(component.histogramsData[0].data.length).toBe(MAX_QUESTIONS_CHOICES);
        expect(component.histogramsData[0].data[0].name).toBe('Paris (correct)');
        expect(component.histogramsData[0].data[0].value).toBe(3);
        expect(component.histogramsData[0].data[1].name).toBe('London');
        expect(component.histogramsData[0].data[1].value).toBe(3);
    });

    it('should return an empty array when there is no choices', () => {
        component.questionsGame = [];
        const countQuestionChoicesSpy = spyOn<any>(component, 'countQuestionChoices').and.callThrough();

        expect(countQuestionChoicesSpy.call(component, [])).toEqual([]);
    });

    it('should update live histogram data when constructLiveHistogramQrl is called', () => {
        const constructLiveHistogramQrlSpy = spyOn<any>(component, 'constructLiveHistogramQrl').and.callThrough();
        constructLiveHistogramQrlSpy.call(component);

        expect(component.dataQrl).toEqual([
            {
                question: 'What is the capital of France?',
                data: [
                    { name: 'modified', value: 1 },
                    { name: 'not modified', value: 1 },
                ],
            },
        ]);
    });

    it('should update live histogram data when constructLiveHistogramQrl is called', () => {
        component.questionsGame = [];
        const constructLiveHistogramQrlSpy = spyOn<any>(component, 'constructLiveHistogramQrl').and.callThrough();
        constructLiveHistogramQrlSpy.call(component);

        expect(component.dataQrl).toEqual([]);
    });

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

    it('should get playerlist', () => {
        const result = component.playerListValue;
        expect(result).toBe(gameServiceSpy.playerListValue);
    });

    it('should get TimerStoppedValue', () => {
        const result = component.timerStoppedValue;
        expect(result).toBe(gameServiceSpy.timerStoppedValue);
    });

    it('should construct the QRL result histogram', () => {
        component.questionsGame = [
            { text: 'What is the capital of France?', type: QuestionType.QRL, points: 10, lastModification: new Date(), id: 'abc' },
        ];
        const constructHistogramsDataSpy = spyOn<any>(component, 'constructHistogramsData').and.callThrough();
        const answerCountsQRLSpy = spyOn<any>(component, 'calculateAnswerCountsQRL').and.callFake(() => {
            return new Map();
        });
        const mapToHistogramDataQrlSpy = spyOn<any>(component, 'mapToHistogramDataQrl').and.callFake(() => {
            return [];
        });
        constructHistogramsDataSpy.call(component);

        expect(answerCountsQRLSpy).toHaveBeenCalled();
        expect(mapToHistogramDataQrlSpy).toHaveBeenCalled();
    });

    it('should construct the QRL result histogram with correct values', () => {
        component.questionsGame = [
            { text: 'What is the capital of France?', type: QuestionType.QRL, points: 10, lastModification: new Date(), id: 'abc' },
        ];
        component.answersPlayer = answersPlayerQRL;
        const calculateAnswerCountsSpy = spyOn<any>(component, 'calculateAnswerCountsQRL').and.callThrough();
        expect(component.questionsGame[0].text).toBe('What is the capital of France?');

        expect(calculateAnswerCountsSpy.call(component, component.questionsGame[0])).toEqual(
            new Map([
                ['0', 1],
                ['0.5', 0],
                ['1', 1],
            ]),
        );
    });

    it('should format the QRL histogram result', () => {
        const answerCountsMap = new Map([
            ['0', 1],
            ['0.5', 0],
            ['1', 1],
        ]);
        const mapToHistogramDataQrlSpy = spyOn<any>(component, 'mapToHistogramDataQrl').and.callThrough();

        expect(mapToHistogramDataQrlSpy.call(component, answerCountsMap)).toEqual([
            { name: '0', value: 1 },
            { name: '0.5', value: 0 },
            { name: '1', value: 1 },
        ]);
    });

    it('should return empty map if no choices', () => {
        const calculateAnswerCountsSpy = spyOn<any>(component, 'calculateAnswerCounts').and.callThrough();
        expect(calculateAnswerCountsSpy.call(component, [])).toEqual(new Map());
    });

    it('should return empty map if no choices', () => {
        const calculateAnswerCountsSpy = spyOn<any>(component, 'calculateAnswerCounts').and.callThrough();
        expect(calculateAnswerCountsSpy.call(component, [])).toEqual(new Map());
    });

    it('returns empty map when question choices are null', () => {
        const question = {
            type: QuestionType.QCM,
            text: 'What is the capital of France?',
            points: 10,
            choices: [
                { text: 'True', isCorrect: false },
                { text: 'False', isCorrect: true },
            ],
            lastModification: new Date(),
            id: 'abc',
        };
        const calculateAnswerCountsSpy = spyOn<any>(component, 'calculateAnswerCounts').and.callThrough();
        const result = calculateAnswerCountsSpy.call(component, question);
        expect(result.size).toEqual(2);
    });

    it('ignores null choices', () => {
        const question = {
            type: QuestionType.QCM,
            text: 'What is the capital of France?',
            points: 10,
            choices: [null],
            lastModification: new Date(),
            id: 'abc',
        };

        const calculateAnswerCountsSpy = spyOn<any>(component, 'calculateAnswerCounts').and.callThrough();
        expect(calculateAnswerCountsSpy.call(component, question).size).toEqual(1);
    });
});
