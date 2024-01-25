import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifiedQuestionComponent } from './modified-question.component';

describe('ModifiedQuestionComponent', () => {
  let component: ModifiedQuestionComponent;
  let fixture: ComponentFixture<ModifiedQuestionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModifiedQuestionComponent]
    });
    fixture = TestBed.createComponent(ModifiedQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
