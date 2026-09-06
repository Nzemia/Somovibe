function withTicket(base: string, ticket: string | null | undefined) {
  if (!ticket || !isSafeReturnPath(ticket)) return base
  return `${base}?callbackUrl=${encodeURIComponent(ticket)}`
}

/** Only same-origin relative paths. Blocks open redirects. */
export function isSafeReturnPath(
  path: string | null | undefined
): path is string {
  if (!path) return false
  if (!path.startsWith("/")) return false
  if (path.startsWith("//")) return false
  if (path.includes("://") || path.includes("\\")) return false
  return true
}

export function loginHref(ticket: string | null | undefined) {
  return withTicket("/login", ticket)
}

export function registerHref(ticket: string | null | undefined) {
  return withTicket("/register", ticket)
}

export function forgotPasswordHref(ticket: string | null | undefined) {
  return withTicket("/forgot-password", ticket)
}

/** Subtitle on login/register when the user is mid-flow. */
export function returnTicketContext(
  ticket: string | null | undefined
): string | null {
  if (!ticket || !isSafeReturnPath(ticket)) return null

  const url = new URL(ticket, "https://somovibe.local")
  const path = url.pathname
  const autoBuy = url.searchParams.has("autoBuy")

  if (path.startsWith("/marketplace/") && path.length > "/marketplace/".length) {
    return autoBuy
      ? "Finish buying this material"
      : "Continue to the material you were viewing"
  }
  if (path.startsWith("/marketplace")) {
    return "Continue to the marketplace"
  }
  if (path.startsWith("/teacher-register") || path.startsWith("/teacher")) {
    return "Continue teacher setup"
  }
  if (path.startsWith("/student")) {
    return "Continue to your files"
  }

  return "You'll return to where you left off"
}
