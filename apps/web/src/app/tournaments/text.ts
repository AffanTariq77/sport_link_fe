export const formatName = { knockout: 'Knockout', league: 'League', round_robin: 'Round robin', groups_knockout: 'Groups then knockout' } as const;
export const entryText: Record<string, string> = {
  pending_payment: 'Pay the entry fee to confirm',
  submitted: 'Payment being checked',
  confirmed: 'Entered',
  rejected: 'Payment not found: send it again',
  withdrawn: 'Withdrawn',
};
