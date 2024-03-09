import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostGamePageComponent } from './host-game-page.component';

describe('HostGamePageComponent', () => {
  let component: HostGamePageComponent;
  let fixture: ComponentFixture<HostGamePageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HostGamePageComponent]
    });
    fixture = TestBed.createComponent(HostGamePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
