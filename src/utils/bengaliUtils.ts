/**
 * Utility functions for Bengali localization, numbers, and dates
 */

const bnDigits: { [key: string]: string } = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯'
};

export function toBengaliNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '০';
  const str = String(num);
  return str.replace(/\d/g, (d) => bnDigits[d] || d);
}

export function formatTaka(amount: number | string | undefined | null): string {
  if (!amount && amount !== 0) return '০ ৳';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '০ ৳';
  const formatted = new Intl.NumberFormat('en-IN').format(num);
  return `${toBengaliNumber(formatted)} ৳`;
}

export function toBengaliDate(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const months = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const day = toBengaliNumber(d.getDate());
    const month = months[d.getMonth()];
    const year = toBengaliNumber(d.getFullYear());
    return `${day} ${month}, ${year}`;
  } catch {
    return isoString;
  }
}

export function toBengaliRelativeTime(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'এইমাত্র';
    if (diffMinutes < 60) return `${toBengaliNumber(diffMinutes)} মিনিট আগে`;
    if (diffHours < 24) return `${toBengaliNumber(diffHours)} ঘণ্টা আগে`;
    if (diffDays < 30) return `${toBengaliNumber(diffDays)} দিন আগে`;
    return toBengaliDate(isoString);
  } catch {
    return isoString;
  }
}
