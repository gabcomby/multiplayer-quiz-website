import { TestBed } from '@angular/core/testing';

import { JoinGameValidationService } from './join-game-validation.service';

describe('JoinGameValidationService', () => {
  let service: JoinGameValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JoinGameValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
