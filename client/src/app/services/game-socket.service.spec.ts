import { TestBed } from '@angular/core/testing';

import { GameSocketService } from './game-socket.service';

describe('GameSocketService', () => {
  let service: GameSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
