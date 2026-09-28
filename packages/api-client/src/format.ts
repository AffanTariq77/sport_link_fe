// Display helpers for API values. The UI never calculates prices (CLAUDE.md), it only formats them.

// ISO 4217 minor units, which is what the API stores. Not Intl's display digits: Intl shows PKR without
// decimals, but the API still counts paisa (1/100). Currencies not listed use 2.
const MINOR_DIGITS: Record<string, number> = { BHD: 3, IQD: 3, JOD: 3, KWD: 3, LYD: 3, OMR: 3, TND: 3, JPY: 0, KRW: 0 };

/** Minor units (paisa for PKR) to a display amount, for example 600000 PKR -> "Rs 6,000". */
export function formatMoney(minor: number, currency: string) {
  const digits = MINOR_DIGITS[currency] ?? 2;
  const amount = minor / 10 ** digits;
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : digits,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : digits,
  }).format(amount);
}

/** "19:00" at the venue, whatever the viewer's own time zone. */
export function formatTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(
    new Date(iso),
  );
}

/** "Tue 29 Sep" at the venue. */
export function formatDay(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'short', day: 'numeric', month: 'short' }).format(
    new Date(iso),
  );
}

/** Today and the following days as YYYY-MM-DD at the venue. */
export function nextDates(timeZone: string, count: number, now = new Date()) {
  return Array.from({ length: count }, (_, i) =>
    new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(now.getTime() + i * 86_400_000)),
  );
}

/** The advance and refund rules in words, shown before the player pays. */
export function describePolicy(
  p: { advanceType: string; advanceValue: number; cancelRefund: boolean; cancelWindowHours: number; noShowRefund: boolean },
  currency: string,
) {
  const advance =
    p.advanceType === 'none'
      ? 'No advance needed.'
      : p.advanceType === 'fixed'
        ? `Advance: ${formatMoney(p.advanceValue, currency)}.`
        : `Advance: ${p.advanceValue / 100}% of the price.`;
  const cancel = p.cancelRefund
    ? `Cancel at least ${p.cancelWindowHours} hours before for a refund.`
    : 'Cancellations are not refunded.';
  const noShow = p.noShowRefund ? 'No-shows are refunded.' : 'No-shows are not refunded.';
  return [advance, cancel, noShow];
}

export const paymentMethodName: Record<string, string> = {
  jazzcash: 'JazzCash',
  easypaisa: 'Easypaisa',
  bank_transfer: 'Bank transfer',
  cash: 'Cash at the venue',
};

export const bookingStatusText: Record<string, string> = {
  held: 'Held for you',
  pending_payment: 'Waiting for the venue to confirm your payment',
  confirmed: 'Confirmed',
  completed: 'Played',
  cancelled: 'Cancelled',
  no_show: 'No-show',
  expired: 'Expired',
};
