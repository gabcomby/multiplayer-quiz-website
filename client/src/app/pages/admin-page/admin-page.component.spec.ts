import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { API_BASE_URL } from '@app/app.module';
import { Game, GamePlayed } from '@app/interfaces/game';
import { AdminService } from '@app/services/admin.service';
import { GamePlayedService } from '@app/services/game-played.service';
import { of } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';

const mockData = {
    id: '1zkjdm',
    title: 'VISIBILITY TEST',
    description: 'asdfasdfasdfasd',
    duration: 10,
    lastModification: new Date('2024-02-12T14:48:55.329Z'),
    questions: [
        {
            type: 'QCM',
            text: 'test retour',
            points: 10,
            lastModification: new Date('2024-02-12T14:48:55.329Z'),
            id: 'vdkp2a',
            choices: [
                { text: 'ca marche', isCorrect: true },
                { text: 'ou pas', isCorrect: false },
            ],
        },
        {
            type: 'QCM',
            text: ' cv',
            points: 10,
            lastModification: new Date('2024-02-12T14:48:55.329Z'),
            id: 'fjfdl1',
            choices: [
                { text: 'c dvfb', isCorrect: true },
                { text: 'hola', isCorrect: true },
                { text: 'rghtyj', isCorrect: false },
            ],
        },
        {
            type: 'QCM',
            text: 'test2',
            points: 10,
            lastModification: new Date('2024-02-12T14:48:55.329Z'),
            id: 'jssar7',
            choices: [
                { text: 'cdcd==', isCorrect: true },
                { text: 'ouioui', isCorrect: true },
                { text: 'cdcd', isCorrect: false },
            ],
        },
        {
            type: 'QCM',
            text: 'Quelle est la capitale du Canada?',
            points: 10,
            lastModification: new Date('2024-02-05T00:58:28.573Z'),
            id: 'qrvbvo',
            choices: [
                { text: 'Toronto', isCorrect: false },
                { text: 'Ottawa', isCorrect: true },
            ],
        },
    ],
} as Game;

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let router: Router;
    const matDialogMock = jasmine.createSpyObj('MatDialog', ['open', 'afterClosed']);
    const gamePlayedServiceMock = jasmine.createSpyObj('GamePlayedService', ['getGamesPlayed', 'formatDate', 'deleteGamesPLayed']);

    const adminServiceMock = jasmine.createSpyObj('AdminService', [
        'init',
        'toggleVisibility',
        'exportGameAsJson',
        'importGamesFromFile',
        'getValidGameTitle',
        'createGame',
        'deleteGame',
        'readFileFromInput',
        'hasValidInput',
        'addGame',
        'formatLastModificationDate',
    ]);

    beforeEach(async () => {
        adminServiceMock.init.and.returnValue(Promise.resolve(mockData));
        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent],
            imports: [
                HttpClientTestingModule,
                MatSnackBarModule,
                RouterTestingModule,
                MatDialogModule,
                MatTableModule,
                MatIconModule,
                MatToolbarModule,
            ],
            providers: [
                { provide: MatDialog, useValue: matDialogMock },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: AdminService, useValue: adminServiceMock },
                { provide: API_BASE_URL, useValue: 'http://localhost:3000/api' },
                { provide: GamePlayedService, useValue: gamePlayedServiceMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        spyOn(router, 'navigate');
        fixture.detectChanges();
        component.dataSource = [mockData as Game];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call init when ngOnInit is called', fakeAsync(() => {
        component.ngOnInit();
        tick();
        expect(adminServiceMock.init).toHaveBeenCalled();
    }));

    it('should call importGamesFromFile when onFileSelected is called', () => {
        const event = {
            target: {
                files: [{ name: 'test' }],
            },
        } as unknown as Event;
        const spy = spyOn(component, 'importGamesFromFile');
        component.onFileSelected(event);
        expect(spy).toHaveBeenCalled();
    });

    it('should correctly initialize historicDataSource data', async () => {
        const mockGamePlayed = { id: 'abc123', title: 'Game 1', creationDate: new Date(), numberPlayers: 4, bestScore: 100 } as GamePlayed;
        const mockHistoricData = [mockGamePlayed];
        gamePlayedServiceMock.getGamesPlayed.and.returnValue(Promise.resolve(mockHistoricData));

        await component.ngOnInit();

        expect(component.historicDataSource.data).toEqual(mockHistoricData);
    });

    it('should call getGameTitle when getValidGameTitle is called', async () => {
        adminServiceMock.hasValidInput.and.returnValues(false);
        const result = await component.getValidGameTitle(mockData);
        expect(result).toBe(mockData.title);
    });
    it('should call return new title', async () => {
        adminServiceMock.hasValidInput.and.returnValues(true, false, false, false);
        matDialogMock.open.and.returnValue({ afterClosed: () => of('test') });
        const result = await component.getValidGameTitle(mockData);
        expect(result).toBe('test');
    });
    it('should return null if new title is null', async () => {
        adminServiceMock.hasValidInput.and.returnValues(true, false, false, false);
        matDialogMock.open.and.returnValue({ afterClosed: () => of('') });
        const result = await component.getValidGameTitle(mockData);
        expect(result).toBe(null);
    });
    it('should navigate to create-qgame when createGame is called', () => {
        component.createGame();
        expect(router.navigate).toHaveBeenCalledWith(['/create-qgame']);
    });

    it('should toggleVisibility', () => {
        adminServiceMock.toggleVisibility.and.returnValue(Promise.resolve());
        component.toggleVisibility(mockData, true);
        expect(adminServiceMock.toggleVisibility).toHaveBeenCalled();
    });

    it('should export game as json', () => {
        adminServiceMock.exportGameAsJson.and.returnValue();
        component.exportGameAsJson(mockData);
        expect(adminServiceMock.exportGameAsJson).toHaveBeenCalled();
    });

    it('should return nothing if the input lenght is 0', () => {
        const result = component.onFileSelected({ target: { files: [] } } as unknown as Event);
        expect(result).toBeUndefined();
    });

    it("should import game's data from file", async () => {
        spyOn(component, 'getValidGameTitle').and.returnValue(Promise.resolve('hello'));
        adminServiceMock.readFileFromInput.and.returnValue(Promise.resolve(mockData));
        await component.importGamesFromFile({} as File);
        expect(adminServiceMock.readFileFromInput).toHaveBeenCalled();
        expect(adminServiceMock.addGame).toHaveBeenCalled();
    });
    it('should return if no game title', async () => {
        adminServiceMock.readFileFromInput.and.returnValue(Promise.resolve(mockData));
        spyOn(component, 'getValidGameTitle').and.returnValue(Promise.resolve(null));
        adminServiceMock.addGame.and.returnValue([mockData]);
        const result = await component.importGamesFromFile({} as File);
        expect(adminServiceMock.readFileFromInput).toHaveBeenCalled();
        expect(result).toBe(undefined);
    });

    it('should format date last modification date', () => {
        adminServiceMock.formatLastModificationDate.and.returnValue('2024-02-12T14:48:55.329Z');
        const result = component.formatDate('2024-02-12T14:48:55.329Z');
        expect(result).toBeDefined();
    });
    it('should delete game with deleteGame', () => {
        component.dataSource = [mockData];
        matDialogMock.open.and.returnValue({ afterClosed: () => of(true) });
        adminServiceMock.deleteGame.and.returnValue(Promise.resolve());
        component.deleteGame('123');
        expect(adminServiceMock.deleteGame).toHaveBeenCalled();
    });
    it('should not delete game when false', async () => {
        component.dataSource = [mockData];
        const copyData = [...component.dataSource];

        matDialogMock.open.and.returnValue({ afterClosed: () => of(false) });
        component.deleteGame(mockData.id);
        expect(component.dataSource).toEqual(copyData);
    });

    it('should call deleteGamesPlayed on GamePlayedService when deleteGameHistoric is called', () => {
        component.deleteGameHistoric();
        expect(gamePlayedServiceMock.deleteGamesPLayed).toHaveBeenCalled();
    });

    it('should call formatDate on GamePlayedService and return its result', () => {
        const testDate = '2024-03-29';
        const expectedFormattedDate = '29 March 2024';
        gamePlayedServiceMock.formatDate.and.returnValue(expectedFormattedDate);

        const result = component.formatDateHistoric(testDate);

        expect(gamePlayedServiceMock.formatDate).toHaveBeenCalledWith(testDate);
        expect(result).toEqual(expectedFormattedDate);
    });
});
