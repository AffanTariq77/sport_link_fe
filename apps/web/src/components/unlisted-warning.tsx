/** Shown every time before creating or joining a match at an unlisted venue (Foundation 4.3, CLAUDE.md). */
export function UnlistedWarning() {
  return (
    <div className="flex flex-col gap-2 rounded-md border-2 border-neutral-900 p-3 text-sm">
      <p className="font-semibold">This venue is not listed on SportsLink</p>
      <p>
        SportsLink has not visited or verified it and is not responsible for it. Check the place is safe before you go,
        and tell someone where you will be.
      </p>
      <label className="flex items-center gap-2 font-medium">
        <input type="checkbox" name="acceptedUnlistedWarning" required /> I understand
      </label>
    </div>
  );
}
