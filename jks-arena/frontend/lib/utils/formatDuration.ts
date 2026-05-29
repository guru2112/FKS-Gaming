export function formatDuration(decimalHours: number | string | undefined | null): string {
  if (decimalHours == null) return "0:00 Hrs";
  const num = Number(decimalHours);
  if (isNaN(num)) return "0:00 Hrs";
  
  const hrs = Math.floor(num);
  const mins = Math.round((num - hrs) * 60);
  return `${hrs}:${mins.toString().padStart(2, '0')} Hrs`;
}
