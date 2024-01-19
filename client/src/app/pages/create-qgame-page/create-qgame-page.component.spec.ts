import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateQGamePageComponent } from './create-qgame-page.component';

describe('CreateQGamePageComponent', () => {
    let component: CreateQGamePageComponent;
    let fixture: ComponentFixture<CreateQGamePageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CreateQGamePageComponent],
        });
        fixture = TestBed.createComponent(CreateQGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
