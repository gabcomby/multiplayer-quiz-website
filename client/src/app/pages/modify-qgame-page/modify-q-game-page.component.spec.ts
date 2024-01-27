import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyQGamePageComponent } from './modify-q-game-page.component';

describe('ModifyQGamePageComponent', () => {
    let component: ModifyQGamePageComponent;
    let fixture: ComponentFixture<ModifyQGamePageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ModifyQGamePageComponent],
        });
        fixture = TestBed.createComponent(ModifyQGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
