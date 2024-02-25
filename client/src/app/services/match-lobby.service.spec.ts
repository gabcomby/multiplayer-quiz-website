import { TestBed } from '@angular/core/testing';

import { MatchLobbyService } from './match-lobby.service';

describe('MatchLobbyService', () => {
  let service: MatchLobbyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatchLobbyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
