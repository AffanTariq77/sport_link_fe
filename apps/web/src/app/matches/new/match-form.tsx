"use client";

import { ActionForm, input, labelClass } from "@sportslink/ui";
import { useState } from "react";
import { UnlistedWarning } from "@/components/unlisted-warning";
import { createMatch } from "../actions";

export function MatchForm({
  sports,
  bookings,
}: {
  sports: { slug: string; name: string }[];
  bookings: { id: string; label: string }[];
}) {
  const [where, setWhere] = useState(bookings.length ? "booking" : "unlisted");
  return (
    <ActionForm action={createMatch} button="Create match">
      <label className={labelClass}>
        Sport
        <select name="sport" required className={input}>
          {sports.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="font-medium">Where</legend>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="where"
            value="booking"
            checked={where === "booking"}
            onChange={() => setWhere("booking")}
            disabled={!bookings.length}
          />
          A slot I have booked and paid the advance for
          {!bookings.length && " (book a slot first)"}
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="where"
            value="unlisted"
            checked={where === "unlisted"}
            onChange={() => setWhere("unlisted")}
          />
          A place that is not on SportsLink
        </label>
      </fieldset>
      {where === "booking" ? (
        <label className={labelClass}>
          Your booking
          <select name="bookingId" required className={input}>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <>
          <UnlistedWarning />
          <label className={labelClass}>
            Place name
            <input
              name="venueName"
              required
              maxLength={120}
              className={input}
            />
          </label>
          <label className={labelClass}>
            Address
            <input
              name="venueAddress"
              required
              maxLength={200}
              className={input}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>
              Latitude
              <input
                name="latitude"
                required
                inputMode="decimal"
                className={input}
              />
            </label>
            <label className={labelClass}>
              Longitude
              <input
                name="longitude"
                required
                inputMode="decimal"
                className={input}
              />
            </label>
            <label className={labelClass}>
              Starts
              <input
                name="startAt"
                type="datetime-local"
                required
                className={input}
              />
            </label>
            <label className={labelClass}>
              Ends
              <input
                name="endAt"
                type="datetime-local"
                required
                className={input}
              />
            </label>
          </div>
        </>
      )}
      <div className="grid grid-cols-2 gap-3">
        <label className={labelClass}>
          Players in total
          <input
            name="slotsTotal"
            type="number"
            min={2}
            max={40}
            required
            defaultValue={4}
            className={input}
          />
        </label>
        <label className={labelClass}>
          Players you bring, you included
          <input
            name="hostBrings"
            type="number"
            min={1}
            max={39}
            required
            defaultValue={1}
            className={input}
          />
        </label>
      </div>
      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="font-medium">Who can join</legend>
        <label className={labelClass}>
          Gender
          <select name="gender" defaultValue="" className={input}>
            <option value="">Anyone</option>
            <option value="female">Women only</option>
            <option value="male">Men only</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Minimum age
            <input
              name="minAge"
              type="number"
              min={5}
              max={100}
              className={input}
            />
          </label>
          <label className={labelClass}>
            Maximum age
            <input
              name="maxAge"
              type="number"
              min={5}
              max={100}
              className={input}
            />
          </label>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="verifiedOnly" /> Verified players only
        </label>
      </fieldset>
      <p className="text-xs">
        You approve every player. You pay for the players you bring; each player
        who joins pays their own share.
      </p>
    </ActionForm>
  );
}
