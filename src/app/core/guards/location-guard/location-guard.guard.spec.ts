import { TestBed, async, inject } from '@angular/core/testing';

import { LocationGuard } from './location-guard.guard';

describe('LocationGuardGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocationGuard]
    });
  });

  it('should ...', inject([LocationGuard], (guard: LocationGuard) => {
    expect(guard).toBeTruthy();
  }));
});
