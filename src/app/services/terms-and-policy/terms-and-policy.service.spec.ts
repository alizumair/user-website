import { TestBed } from '@angular/core/testing';

import { TermsAndPolicyService } from './terms-and-policy.service';

describe('TermsAndPolicyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TermsAndPolicyService = TestBed.get(TermsAndPolicyService);
    expect(service).toBeTruthy();
  });
});
