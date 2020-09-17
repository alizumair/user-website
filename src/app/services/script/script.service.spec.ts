import { TestBed } from '@angular/core/testing';

import { ScriptService } from './script.service';

describe('ScriptServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScriptService = TestBed.get(ScriptService);
    expect(service).toBeTruthy();
  });
});
