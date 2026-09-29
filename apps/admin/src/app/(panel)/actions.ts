'use server';

import type { FormState } from '@sportslink/ui';
import { redirect } from 'next/navigation';
import { adminHeaders, api } from '@/lib/api';

const text = (form: FormData, name: string) => String(form.get(name) ?? '').trim();
const fail = (error?: { message?: string }) => ({ message: error?.message ?? 'Something went wrong. Please try again.' });

export async function decideVerification(id: string, _: FormState, form: FormData): Promise<FormState> {
  const headers = await adminHeaders();
  const { error } =
    form.get('decision') === 'approve'
      ? await api.POST('/admin/verifications/{id}/approve', { params: { path: { id } }, headers })
      : await api.POST('/admin/verifications/{id}/reject', {
          params: { path: { id } },
          headers,
          body: { reason: text(form, 'reason') },
        });
  if (error) return fail(error);
  redirect('/verifications?done=1');
}

export async function scheduleVisit(id: string, _: FormState, form: FormData): Promise<FormState> {
  const local = text(form, 'scheduledAt'); // datetime-local, Pakistan time
  const { error } = await api.POST('/admin/branches/{id}/visit/schedule', {
    params: { path: { id } },
    headers: await adminHeaders(),
    body: { scheduledAt: `${local}:00+05:00` },
  });
  if (error) return fail(error);
  redirect('/venues?done=1');
}

export async function recordVisit(id: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/admin/branches/{id}/visit/result', {
    params: { path: { id } },
    headers: await adminHeaders(),
    body: { passed: form.get('decision') === 'pass', notes: text(form, 'notes') },
  });
  if (error) return fail(error);
  redirect('/venues?done=1');
}

export async function setBranchStatus(id: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/admin/branches/{id}/status', {
    params: { path: { id } },
    headers: await adminHeaders(),
    body: { status: text(form, 'status') as 'live' | 'hidden' | 'suspended' | 'banned', reason: text(form, 'reason') },
  });
  if (error) return fail(error);
  redirect(`/venues?status=${text(form, 'status')}&done=1`);
}

export async function setBilling(vendorId: string, _: FormState, form: FormData): Promise<FormState> {
  const billingModel = text(form, 'billingModel') as 'percentage' | 'monthly';
  const value = Number(text(form, 'value'));
  if (!Number.isFinite(value) || value < 0) return { message: 'Enter a number.' };
  const { error } = await api.PUT('/admin/vendors/{id}/billing', {
    params: { path: { id: vendorId } },
    headers: await adminHeaders(),
    body:
      billingModel === 'percentage'
        ? { billingModel, commissionBps: Math.round(value * 100) }
        : { billingModel, monthlyFee: Math.round(value * 100) }, // ponytail: rupees to paisa, Pakistan-only vendors for now
  });
  if (error) return fail(error);
  redirect('/venues?done=1');
}

export async function decideAccount(id: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/admin/payment-accounts/{id}/{decision}', {
    params: { path: { id, decision: form.get('decision') === 'approve' ? 'approve' : 'reject' } },
    headers: await adminHeaders(),
  });
  if (error) return fail(error);
  redirect('/payment-accounts?done=1');
}

export async function moderateUser(id: string, q: string, _: FormState, form: FormData): Promise<FormState> {
  const days = Number(text(form, 'days'));
  const { error } = await api.POST('/admin/users/{id}/moderate', {
    params: { path: { id } },
    headers: await adminHeaders(),
    body: {
      action: text(form, 'action') as 'warning' | 'suspension' | 'ban' | 'reinstate',
      reason: text(form, 'reason'),
      days: days > 0 ? days : undefined,
    },
  });
  if (error) return fail(error);
  redirect(`/users?q=${encodeURIComponent(q)}&done=1`);
}

export async function resolveReport(id: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/admin/reports/{id}/resolve', {
    params: { path: { id } },
    headers: await adminHeaders(),
    body: { status: form.get('decision') === 'actioned' ? 'actioned' : 'dismissed', note: text(form, 'note') },
  });
  if (error) return fail(error);
  redirect('/reports?done=1');
}

export async function settleInvoice(id: string, _: FormState, form: FormData): Promise<FormState> {
  const headers = await adminHeaders();
  const { error } =
    form.get('decision') === 'paid'
      ? await api.POST('/admin/invoices/{id}/paid', { params: { path: { id } }, headers })
      : await api.POST('/admin/invoices/{id}/write-off', { params: { path: { id } }, headers, body: { reason: text(form, 'reason') } });
  if (error) return fail(error);
  redirect('/invoices?done=1');
}

export async function runBilling(): Promise<FormState> {
  const { data, error } = await api.POST('/admin/invoices/run', { headers: await adminHeaders() });
  if (error) return fail(error);
  return { message: data ? `Done: ${data.completed} bookings completed, ${data.issued} invoices issued, ${data.ladder} overdue steps.` : 'Another server is running billing right now.' };
}

export async function decideResult(id: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/admin/results/{id}/decide', {
    params: { path: { id } },
    headers: await adminHeaders(),
    body: { outcome: text(form, 'outcome') as 'a' | 'b' | 'draw' | 'void', note: text(form, 'note') },
  });
  if (error) return fail(error);
  redirect('/results?done=1');
}
