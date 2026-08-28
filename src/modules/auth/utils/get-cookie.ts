export function getCookie(
  cookies: Record<string, unknown> | undefined,
  name: string,
): string | undefined {
  const value = cookies?.[name];

  return typeof value === 'string' ? value : undefined;
}
