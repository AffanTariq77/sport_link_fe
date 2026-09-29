import { ActionForm, input, labelClass } from "@sportslink/ui";
import Link from "next/link";
import { askGuardian, decideWard } from "@/app/family/actions";
import { api } from "@/lib/api";
import { authHeaders } from "@/lib/session";

/** A locked minor names their parent or guardian (spec 5). */
export async function GuardianStep() {
  const { data } = await api.GET("/me/guardian", {
    headers: await authHeaders(),
  });
  return (
    <section className="flex w-full max-w-sm flex-col gap-3 rounded-lg border p-4 text-left text-sm">
      <h2 className="text-base font-semibold">Ask a parent or guardian</h2>
      {data?.status === "pending" ? (
        <p>
          We have asked {data.guardianName ?? "your parent or guardian"} to
          approve your account. Once they accept in their own SportsLink
          account, you can book and join matches.
        </p>
      ) : (
        <p>
          Players under 18 need a parent or guardian to approve their account.
          They need their own SportsLink account first.
        </p>
      )}
      <ActionForm
        action={askGuardian}
        button={
          data?.status === "pending" ? "Ask someone else" : "Send request"
        }
      >
        <label className={labelClass}>
          Their mobile number
          <input
            name="phone"
            type="tel"
            required
            placeholder="0300 1234567"
            className={input}
          />
        </label>
      </ActionForm>
    </section>
  );
}

/** Children who asked this user to be their guardian, with the consent text to accept. */
export async function WardsSection() {
  const headers = await authHeaders();
  const [{ data: wards }, { data: consent }] = await Promise.all([
    api.GET("/me/wards", { headers }),
    api.GET("/me/guardian/consent-text", { headers }),
  ]);
  if (!wards?.length || !consent) return null;
  return (
    <section className="flex w-full max-w-md flex-col gap-3 text-left text-sm">
      <h2 className="text-base font-semibold">Your children</h2>
      {wards.map((w) =>
        w.consentAt ? (
          <Link
            key={w.id}
            href={`/family/${w.id}`}
            className="rounded-lg border p-3 underline"
          >
            {w.name ?? "Your child"}: see bookings and matches
          </Link>
        ) : (
          <div key={w.id} className="flex flex-col gap-2 rounded-lg border p-3">
            <p className="font-medium">
              {w.name ?? "A player"} has asked you to approve their account.
            </p>
            <p className="whitespace-pre-wrap text-xs">{consent.text}</p>
            <ActionForm
              action={decideWard.bind(null, w.id, consent.version)}
              button="Save"
              className="flex items-center gap-4"
            >
              <label className="flex items-center gap-1">
                <input type="radio" name="decision" value="accept" required /> I
                agree
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" name="decision" value="decline" /> This is
                not my child
              </label>
            </ActionForm>
          </div>
        ),
      )}
    </section>
  );
}
