const PUBLIC_PATH_PREFIXES = ["/login", "/register", "/auth", "/api/auth"];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
