'use server';

import { toMinor } from '@sportslink/api-client';
import { redirect } from 'next/navigation';
import type { FormState } from '@sportslink/ui';
import { api } from '@/lib/api';
import { authHeaders } from '@/lib/session';

const text = (form: FormData, name: string) => String(form.get(name) ?? '').trim();
const fail = (error?: { message?: string }) => ({ message: error?.message ?? 'Something went wrong. Please try again.' });

export async function applyAsVendor(_: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/vendor/apply', {
    headers: await authHeaders(),
    body: { businessName: text(form, 'businessName') },
  });
  if (error) return fail(error);
  redirect('/vendor');
}

function branchBody(form: FormData) {
  return {
    name: text(form, 'name'),
    address: text(form, 'address'),
    city: text(form, 'city'),
    latitude: Number(text(form, 'latitude')),
    longitude: Number(text(form, 'longitude')),
    facilities: text(form, 'facilities')
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean),
    rules: text(form, 'rules') || null,
  };
}

export async function createBranch(_: FormState, form: FormData): Promise<FormState> {
  const { data, error } = await api.POST('/vendor/branches', { headers: await authHeaders(), body: branchBody(form) });
  if (!data) return fail(error);
  redirect(`/vendor/branches/${data.id}`);
}

export async function updateBranch(id: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.PATCH('/vendor/branches/{id}', {
    params: { path: { id } },
    headers: await authHeaders(),
    body: branchBody(form),
  });
  if (error) return fail(error);
  redirect(`/vendor/branches/${id}?saved=details`);
}

export async function setPolicy(id: string, currency: string, _: FormState, form: FormData): Promise<FormState> {
  const advanceType = text(form, 'advanceType') as 'percentage' | 'fixed' | 'none';
  const typed = text(form, 'advanceValue');
  const advanceValue =
    advanceType === 'percentage' ? Math.round(Number(typed) * 100) : advanceType === 'fixed' ? toMinor(typed, currency) : 0;
  if (advanceValue === null || Number.isNaN(advanceValue)) return { message: 'Enter the advance amount.' };
  const { error } = await api.PUT('/vendor/branches/{id}/policy', {
    params: { path: { id } },
    headers: await authHeaders(),
    body: {
      advanceType,
      advanceValue,
      cancelRefund: form.get('cancelRefund') === 'on',
      cancelWindowHours: Number(text(form, 'cancelWindowHours')),
      noShowRefund: form.get('noShowRefund') === 'on',
      recurringAllowed: form.get('recurringAllowed') === 'on',
      allowUnpaidCash: form.get('allowUnpaidCash') === 'on',
    },
  });
  if (error) return fail(error);
  redirect(`/vendor/branches/${id}?saved=policy`);
}

function courtBody(form: FormData) {
  return {
    name: text(form, 'name'),
    surface: text(form, 'surface') || null,
    slotMinutes: Number(text(form, 'slotMinutes')),
    sports: form.getAll('sports').map(String),
  };
}

export async function createCourt(branchId: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/vendor/branches/{id}/courts', {
    params: { path: { id: branchId } },
    headers: await authHeaders(),
    body: courtBody(form),
  });
  if (error) return fail(error);
  redirect(`/vendor/branches/${branchId}?saved=court`);
}

export async function updateCourt(branchId: string, courtId: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.PATCH('/vendor/courts/{id}', {
    params: { path: { id: courtId } },
    headers: await authHeaders(),
    body: { ...courtBody(form), active: form.get('active') === 'on' },
  });
  if (error) return fail(error);
  redirect(`/vendor/branches/${branchId}?saved=court`);
}

/** One opening window per weekday in this form; a day left blank is closed. */
export async function setHours(branchId: string, courtId: string, _: FormState, form: FormData): Promise<FormState> {
  const hours = [0, 1, 2, 3, 4, 5, 6]
    .map((weekday) => ({ weekday, opensAt: text(form, `opens${weekday}`), closesAt: text(form, `closes${weekday}`) }))
    .filter((h) => h.opensAt && h.closesAt);
  const { error } = await api.PUT('/vendor/courts/{id}/hours', {
    params: { path: { id: courtId } },
    headers: await authHeaders(),
    body: { hours },
  });
  if (error) return fail(error);
  redirect(`/vendor/branches/${branchId}?saved=hours`);
}

export async function setPrices(
  branchId: string,
  courtId: string,
  currency: string,
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const prices = [];
  for (let i = 0; form.has(`dayType${i}`); i++) {
    const price = text(form, `price${i}`);
    if (!price) continue; // empty row
    const pricePerHour = toMinor(price, currency);
    if (pricePerHour === null) return { message: `Row ${i + 1}: enter a price above zero.` };
    prices.push({
      dayType: text(form, `dayType${i}`) as 'weekday' | 'weekend' | 'holiday' | 'all',
      startTime: text(form, `start${i}`),
      endTime: text(form, `end${i}`),
      pricePerHour,
    });
  }
  const { error } = await api.PUT('/vendor/courts/{id}/prices', {
    params: { path: { id: courtId } },
    headers: await authHeaders(),
    body: { prices },
  });
  if (error) return fail(error);
  redirect(`/vendor/branches/${branchId}?saved=prices`);
}

export async function submitBranch(id: string): Promise<FormState> {
  const { error } = await api.POST('/vendor/branches/{id}/submit', {
    params: { path: { id } },
    headers: await authHeaders(),
  });
  if (error) return fail(error);
  redirect(`/vendor/branches/${id}?saved=submitted`);
}

export async function addAccount(_: FormState, form: FormData): Promise<FormState> {
  const method = text(form, 'method') as 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'cash';
  const { error } = await api.POST('/vendor/payment-accounts', {
    headers: await authHeaders(),
    body: {
      method,
      accountTitle: text(form, 'accountTitle'),
      accountNumber: text(form, 'accountNumber') || undefined,
      bankName: text(form, 'bankName') || undefined,
      replacesAccountId: text(form, 'replacesAccountId') || undefined,
    },
  });
  if (error) return fail(error);
  redirect('/vendor?saved=account');
}

export async function manualBooking(back: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/vendor/bookings/manual', {
    headers: await authHeaders(),
    body: {
      courtId: text(form, 'courtId'),
      startAt: text(form, 'startAt'),
      endAt: text(form, 'endAt'),
      customerName: text(form, 'customerName'),
      customerPhone: text(form, 'customerPhone') || undefined,
    },
  });
  if (error) return fail(error);
  redirect(back);
}

export async function blockSlot(back: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/vendor/blocks', {
    headers: await authHeaders(),
    body: { courtId: text(form, 'courtId'), startAt: text(form, 'startAt'), endAt: text(form, 'endAt'), reason: text(form, 'reason') },
  });
  if (error) return fail(error);
  redirect(back);
}

export async function markNoShow(back: string, id: string): Promise<FormState> {
  const { error } = await api.POST('/vendor/bookings/{id}/no-show', { params: { path: { id } }, headers: await authHeaders() });
  if (error) return fail(error);
  redirect(back);
}

export async function addStaff(vendorId: string, _: FormState, form: FormData): Promise<FormState> {
  const { error } = await api.POST('/vendor/{vendorId}/staff', {
    params: { path: { vendorId } },
    headers: await authHeaders(),
    body: {
      phone: text(form, 'phone'),
      permissions: form.getAll('permissions').map(String) as (
        | 'view_bookings'
        | 'create_bookings'
        | 'confirm_payments'
        | 'edit_prices'
        | 'view_revenue'
        | 'manage_staff'
      )[],
      branchIds: form.getAll('branchIds').map(String),
    },
  });
  if (error) return fail(error);
  redirect('/vendor?saved=staff');
}

export async function removeStaff(vendorId: string, userId: string): Promise<FormState> {
  const { error } = await api.DELETE('/vendor/{vendorId}/staff/{userId}', {
    params: { path: { vendorId, userId } },
    headers: await authHeaders(),
  });
  if (error) return fail(error);
  redirect('/vendor?saved=staff');
}
