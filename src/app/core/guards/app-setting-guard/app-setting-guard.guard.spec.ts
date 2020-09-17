import { TestBed, async, inject } from '@angular/core/testing';

import { AppSettingGuard } from './app-setting-guard.guard';

describe('AppSettingGuardGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppSettingGuard]
    });
  });

  it('should ...', inject([AppSettingGuard], (guard: AppSettingGuard) => {
    expect(guard).toBeTruthy();
  }));
});
