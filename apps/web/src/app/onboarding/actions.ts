"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { authHeaders } from "@/lib/session";

export type FormState = { message?: string };
const failed = "Something went wrong. Please try again.";

export async function saveProfile(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { error } = await api.PATCH("/me/profile", {
    headers: await authHeaders(),
    body: {
      name: String(form.get("name") ?? ""),
      dob: String(form.get("dob") ?? ""),
      gender: String(form.get("gender") ?? "") as
        "male" | "female" | "other" | "prefer_not_to_say",
      city: String(form.get("city") ?? ""),
    },
  });
  if (error) return { message: error.message ?? failed };
  redirect("/");
}

export async function submitDocument(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const front = form.get("front");
  const back = form.get("back");
  if (
    !(front instanceof File) ||
    !front.size ||
    !(back instanceof File) ||
    !back.size
  ) {
    return { message: "Add photos of the front and back." };
  }
  const upload = new FormData();
  upload.set("docNumber", String(form.get("docNumber") ?? ""));
  upload.set("front", front);
  upload.set("back", back);
  const { error } = await api.POST("/me/verification", {
    headers: await authHeaders(),
    // Multipart: the typed body is replaced by the FormData built above.
    body: {} as never,
    bodySerializer: () => upload,
  });
  if (error) return { message: error.message ?? failed };
  redirect("/");
}
