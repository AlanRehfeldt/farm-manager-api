export function catalogVisibilityWhere(organizationId: string, farmId: string) {
  return {
    organizationId,
    OR: [{ farmId: null }, { farmId }],
  };
}
