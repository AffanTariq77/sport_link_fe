// Wording shared by the match screens.
export const playerStatusText: Record<string, string> = {
  requested: 'Asked to join',
  approved: 'Approved, paying their share',
  confirmed: 'Playing',
  waitlisted: 'On the waitlist',
  declined: 'Declined',
  withdrawn: 'Left',
  removed: 'Removed',
};
export const myStatusText: Record<string, string> = {
  ...playerStatusText,
  requested: 'You asked to join. The host approves every player.',
  approved: 'Approved: pay your share below to confirm your place.',
  confirmed: 'You are playing.',
  waitlisted: 'You are on the waitlist.',
};
export const UNLISTED_WARNING =
  'SportsLink has not visited or verified this venue and is not responsible for it. Check the place is safe before you go, and tell someone where you will be.';
