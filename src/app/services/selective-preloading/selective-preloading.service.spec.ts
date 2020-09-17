import { TestBed } from '@angular/core/testing';

import { SelectivePreloadingService } from './selective-preloading.service';

describe('SelectivePreloadingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SelectivePreloadingService = TestBed.get(SelectivePreloadingService);
    expect(service).toBeTruthy();
  });
});
