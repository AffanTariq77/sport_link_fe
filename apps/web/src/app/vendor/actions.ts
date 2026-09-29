"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { authHeaders } from "@/lib/session";

export type DecisionState = { message?: string };

export async function decidePayment(
  _: DecisionState,
  form: FormData,
): Promise<DecisionState> {
  const id = String(form.get("id") ?? "");
  const headers = await authHeaders();
  const { error } =
    form.get("decision") === "confirm"
      ? await api.POST("/vendor/payments/{id}/confirm", {
          params: { path: { id } },
          headers,
        })
      : await api.POST("/vendor/payments/{id}/reject", {
          params: { path: { id } },
          headers,
          body: { reason: String(form.get("reason") ?? "") },
        });
  if (error) return { message: error.message };
  redirect("/vendor/payments"); // reload the queue; errors above stay on the page
}
