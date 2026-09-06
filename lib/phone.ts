/**
 * Some `local_resources.contact` strings list alternatives or asides —
 * "14416 or 1-800-...", "044-2464-0050 (24hr) or 044-2464-0060" — a tel:
 * link needs just the first real number. Takes the leading run of
 * phone-ish characters only, so a stray digit inside a parenthetical like
 * "(24hr)" never gets appended to the number.
 */
export function firstPhone(contact: string): string {
  return (contact.match(/^[\d+\s-]+/)?.[0] ?? contact).replace(/[^\d+]/g, "");
}
