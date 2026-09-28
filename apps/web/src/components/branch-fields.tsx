import { ActionForm, input, labelClass } from './action-form';

export function BranchFields({
  action,
  button,
  branch,
}: {
  action: (state: { message?: string }, form: FormData) => Promise<{ message?: string }>;
  button: string;
  branch?: {
    name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    facilities: string[];
    rules: string | null;
  };
}) {
  return (
    <ActionForm action={action} button={button}>
      <label className={labelClass}>
        Venue name
        <input name="name" required maxLength={120} defaultValue={branch?.name} className={input} />
      </label>
      <label className={labelClass}>
        Address
        <input name="address" required maxLength={200} defaultValue={branch?.address} className={input} />
      </label>
      <label className={labelClass}>
        City
        <input name="city" required maxLength={80} defaultValue={branch?.city} className={input} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className={labelClass}>
          Latitude
          <input name="latitude" required inputMode="decimal" placeholder="31.5204" defaultValue={branch?.latitude} className={input} />
        </label>
        <label className={labelClass}>
          Longitude
          <input name="longitude" required inputMode="decimal" placeholder="74.3587" defaultValue={branch?.longitude} className={input} />
        </label>
      </div>
      <p className="text-xs">In Google Maps, press and hold on your venue to copy its coordinates.</p>
      <label className={labelClass}>
        Facilities, separated by commas
        <input
          name="facilities"
          placeholder="parking, floodlights, changing rooms"
          defaultValue={branch?.facilities.join(', ')}
          className={input}
        />
      </label>
      <label className={labelClass}>
        Venue rules (optional)
        <textarea name="rules" maxLength={2000} rows={3} defaultValue={branch?.rules ?? ''} className={input} />
      </label>
    </ActionForm>
  );
}
