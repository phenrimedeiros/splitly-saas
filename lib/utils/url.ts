export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export function normalizeUrl(url: string): string {
  if (url.includes("://")) return url
  return `https://${url}`
}
