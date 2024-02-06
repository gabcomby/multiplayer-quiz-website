import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdminPageComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule],
            providers: [],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        httpTestingController = TestBed.inject(HttpTestingController);
        fixture.detectChanges();
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should create', () => {
        const req = httpTestingController.expectOne('http://localhost:3000/api/games');
        expect(req.request.method).toEqual('GET');
        req.flush([]);

        expect(component).toBeTruthy();
    });

    it('should format dates correctly', () => {
        const req = httpTestingController.expectOne('http://localhost:3000/api/games');
        req.flush([]);

        const testDate = '2022-11-19T21:17:24.000Z';
        const formattedDate = component.formatLastModificationDate(testDate);

        expect(formattedDate).toBe('2022-11-19 16 h 17');
    });
});
