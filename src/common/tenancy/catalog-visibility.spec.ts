import { catalogVisibilityWhere } from './catalog-visibility';

describe('catalogVisibilityWhere', () => {
  it('includes org-wide rows and the active farm', () => {
    expect(catalogVisibilityWhere('org-1', 'farm-a')).toEqual({
      organizationId: 'org-1',
      OR: [{ farmId: null }, { farmId: 'farm-a' }],
    });
  });
});
