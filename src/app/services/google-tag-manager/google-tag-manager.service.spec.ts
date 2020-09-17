import { TestBed } from '@angular/core/testing';

import { GoogleTagManagerService } from './google-tag-manager.service';

describe('GoogleTagManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GoogleTagManagerService = TestBed.get(GoogleTagManagerService);
    expect(service).toBeTruthy();
  });
});
