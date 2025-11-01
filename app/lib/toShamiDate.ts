import { toJalaali } from 'jalaali-js';

export function toShamsiDate(isoString: string) {
  const date = new Date(isoString);
  const j = toJalaali(date);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${j.jy}/${j.jm.toString().padStart(2, '0')}/${j.jd
    .toString()
    .padStart(2, '0')} ${hours}:${minutes}`;
}

// Example:
// console.log(toShamsiDate('2025-10-10T07:14:08.805Z'));
// Output: e.g. "1404/07/18 10:44" (depending on your timezone)
