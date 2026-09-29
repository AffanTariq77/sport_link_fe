"use client";

import { keepValues } from "@sportslink/ui";
import { useActionState } from "react";
import { type FormState, saveProfile } from "../actions";
import { button, input, label, labelText } from "../fields";

const genders = [
  ["female", "Female"],
  ["male", "Male"],
  ["other", "Other"],
  ["prefer_not_to_say", "Prefer not to say"],
] as const;

export function ProfileForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveProfile,
    {},
  );
  return (
    <form
      onSubmit={keepValues(action)}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <label className={label}>
        <span className={labelText}>Full name, as on your ID</span>
        <input
          name="name"
          autoComplete="name"
          required
          maxLength={80}
          className={input}
        />
      </label>
      <label className={label}>
        <span className={labelText}>Date of birth</span>
        <input name="dob" type="date" required className={input} />
      </label>
      <fieldset className="flex flex-col gap-1">
        <legend className={labelText}>Gender</legend>
        {genders.map(([value, text]) => (
          <label key={value} className="flex items-center gap-2">
            <input type="radio" name="gender" value={value} required /> {text}
          </label>
        ))}
      </fieldset>
      <label className={label}>
        <span className={labelText}>City</span>
        <input
          name="city"
          autoComplete="address-level2"
          required
          maxLength={80}
          className={input}
        />
      </label>
      <p aria-live="polite" className="min-h-6 text-sm">
        {state.message}
      </p>
      <button disabled={pending} className={button}>
        Continue
      </button>
    </form>
  );
}
