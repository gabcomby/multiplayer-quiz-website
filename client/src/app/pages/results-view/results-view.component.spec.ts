import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsViewComponent } from './results-view.component';

describe('ResultsViewComponent', () => {
    let component: ResultsViewComponent;
    let fixture: ComponentFixture<ResultsViewComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ResultsViewComponent],
        });
        fixture = TestBed.createComponent(ResultsViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
