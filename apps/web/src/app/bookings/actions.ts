"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { authHeaders } from "@/lib/session";

/** Holds the chosen slot, then shows it in My bookings with the advance to pay. */
export async function holdSlot(form: FormData) {
  const courtId = String(form.get("courtId") ?? "");
  const [startAt = "", endAt = ""] = String(form.get("slot") ?? "").split("|");
  const { data, error } = await api.POST("/bookings", {
    headers: await authHeaders(),
    body: { courtId, startAt, endAt },
  });
  const params = data
    ? `held=${data.id}`
    : `error=${encodeURIComponent(error?.message ?? "Could not hold this slot.")}`;
  redirect(`/bookings?${params}`);
}

export type PayState = { message?: string };

/** Player reports the advance payment (or chooses to pay at the venue when allowed). */
export async function submitPayment(
  bookingId: string,
  _: PayState,
  form: FormData,
): Promise<PayState> {
  const method = String(form.get("method") ?? "") as
    "jazzcash" | "easypaisa" | "bank_transfer" | "cash";
  const txnReference =
    method === "cash" ? undefined : String(form.get("txnReference") ?? "");
  const { data, error } = await api.POST("/bookings/{id}/payment", {
    params: { path: { id: bookingId } },
    headers: await authHeaders(),
    body: { method, txnReference },
  });
  if (!data)
    return {
      message: error?.message ?? "Something went wrong. Please try again.",
    };
  redirect(`/bookings?held=${bookingId}`);
}

export async function cancelBooking(id: string): Promise<PayState> {
  const { data, error } = await api.POST("/bookings/{id}/cancel", {
    params: { path: { id } },
    headers: await authHeaders(),
  });
  if (!data)
    return {
      message: error?.message ?? "Something went wrong. Please try again.",
    };
  redirect(`/bookings?cancelled=${data.refunds ? "refund" : "none"}`);
}

export async function answerRefund(
  id: string,
  received: boolean,
): Promise<PayState> {
  const headers = await authHeaders();
  const { error } = received
    ? await api.POST("/refunds/{id}/received", {
        params: { path: { id } },
        headers,
      })
    : await api.POST("/refunds/{id}/dispute", {
        params: { path: { id } },
        headers,
        body: {},
      });
  if (error) return { message: error.message };
  redirect("/bookings");
}
