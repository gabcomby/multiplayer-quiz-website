import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistogramQrlComponent } from './histogram-qrl.component';

describe('HistogramQrlComponent', () => {
  let component: HistogramQrlComponent;
  let fixture: ComponentFixture<HistogramQrlComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistogramQrlComponent]
    });
    fixture = TestBed.createComponent(HistogramQrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
