import { TestBed } from '@angular/core/testing';

import { GamePlayedService } from './game-played.service';

describe('GamePlayedService', () => {
  let service: GamePlayedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamePlayedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
