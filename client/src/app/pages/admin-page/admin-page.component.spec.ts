import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Game } from '@app/interfaces/game';
import { AdminService } from '@app/services/admin.service';
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
    const dialogMock = {
        open: () => {
            return { afterClosed: () => of(true) };
        },
    };

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
        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule, RouterTestingModule, MatDialogModule, MatTableModule, MatIconModule],
            providers: [
                { provide: MatDialogRef, useValue: dialogMock },
                { provide: MatDialog, useValue: matDialogMock },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: AdminService, useValue: adminServiceMock },
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

    it('should call init when ngOnInit is called', async () => {
        await component.ngOnInit();
        expect(adminServiceMock.init).toHaveBeenCalled();
    });

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

    it('should call getGameTitle when getValidGameTitle is called', async () => {
        const spy = spyOn(component, 'getValidGameTitle');
        await component.getValidGameTitle(mockData);
        expect(spy).toHaveBeenCalled();
    });

    it('should navigate to create-qgame when createGame is called', () => {
        component.createGame();
        expect(router.navigate).toHaveBeenCalledWith(['/create-qgame']);
    });

    it("should validate game's title", async () => {
        const spy = spyOn(component, 'getValidGameTitle');
        await component.getValidGameTitle(mockData);
        expect(spy).toHaveBeenCalled();
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
        adminServiceMock.readFileFromInput.and.returnValue(Promise.resolve(mockData));
        adminServiceMock.addGame.and.returnValue([mockData]);
        await component.importGamesFromFile({} as File);
        expect(adminServiceMock.readFileFromInput).toHaveBeenCalled();
        expect(adminServiceMock.addGame).toHaveBeenCalled();
    });

    it('should format date last modification date', () => {
        adminServiceMock.formatLastModificationDate.and.returnValue('2024-02-12T14:48:55.329Z');
        const result = component.formatDate('2024-02-12T14:48:55.329Z');
        expect(result).toBeDefined();
    });
});
