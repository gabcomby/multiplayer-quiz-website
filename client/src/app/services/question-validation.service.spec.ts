import { TestBed } from '@angular/core/testing';

import { QuestionValidationService } from './question-validation.service';

describe('QuestionValidationService', () => {
  let service: QuestionValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
