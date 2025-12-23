// Dynamic copyright year: "2025" in 2025, "2025-2026" in 2026, "2025-2027" in 2027, etc.
export function getCopyrightYear(): string {
  const startYear = 2025;
  const currentYear = new Date().getFullYear();
  
  if (currentYear <= startYear) {
    return String(startYear);
  }
  return `${startYear}-${currentYear}`;
}
