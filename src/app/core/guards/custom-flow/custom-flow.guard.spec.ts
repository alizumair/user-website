import { TestBed, async, inject } from '@angular/core/testing';

import { CustomFlowGuard } from './custom-flow.guard';

describe('CustomFlowGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomFlowGuard]
    });
  });

  it('should ...', inject([CustomFlowGuard], (guard: CustomFlowGuard) => {
    expect(guard).toBeTruthy();
  }));
});
