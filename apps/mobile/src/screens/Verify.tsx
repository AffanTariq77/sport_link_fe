import type { Schemas } from '@sportslink/api-client';
import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { api, authHeaders } from '../session';
import { Button, failed, Field, Message, type Runner, styles, TextButton } from '../ui';

type Photo = { uri: string };
const MAX_SIDE = 1600; // px: ID text stays sharp

/**
 * Phone photos are often several MB; both go in one request, and hosting caps request bodies (Vercel: 4.5 MB).
 * Re-encoding at most 1600 px a side as JPEG keeps each photo to a few hundred KB.
 */
async function shrink(asset: ImagePicker.ImagePickerAsset) {
  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > MAX_SIDE)
    context.resize(asset.width >= asset.height ? { width: MAX_SIDE, height: null } : { width: null, height: MAX_SIDE });
  const image = await context.renderAsync();
  return (await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 })).uri;
}

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: 'images',
  quality: 0.7,
  // iOS: ask for JPEG rather than HEIC, which the API does not accept.
  preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
};

export function Verify({
  status,
  onSubmitted,
  run,
}: {
  status: Schemas['VerificationStatus'];
  onSubmitted: (s: Schemas['VerificationStatus']) => void;
  run: Runner;
}) {
  const docLabel = status.docType === 'b_form' ? 'B-Form' : 'CNIC';
  const [docNumber, setDocNumber] = useState('');
  const [front, setFront] = useState<Photo | null>(null);
  const [back, setBack] = useState<Photo | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function pick(set: (p: Photo) => void, source: 'camera' | 'library') {
    setMessage('');
    if (source === 'camera' && !(await ImagePicker.requestCameraPermissionsAsync()).granted) {
      return setMessage('Allow camera access in Settings, or choose a photo instead.');
    }
    const result = await (source === 'camera'
      ? ImagePicker.launchCameraAsync(pickerOptions)
      : ImagePicker.launchImageLibraryAsync(pickerOptions));
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) return;
    set({ uri: await shrink(asset).catch(() => asset.uri) });
  }

  const submit = () =>
    run(setBusy, setMessage, async () => {
      if (!front || !back) return setMessage('Add photos of the front and back.');
      const form = new FormData();
      form.append('docNumber', docNumber);
      // Expo's fetch does not support React Native's { uri, name, type } form entries; expo-file-system's
      // File implements Blob, so it is read and sent as real multipart file data.
      form.append('front', new File(front.uri) as unknown as Blob, 'front.jpg');
      form.append('back', new File(back.uri) as unknown as Blob, 'back.jpg');
      const { data, error } = await api.POST('/me/verification', {
        headers: await authHeaders(),
        body: {} as never, // multipart: replaced by the FormData above
        bodySerializer: () => form,
      });
      if (!data) return setMessage(error?.message ?? failed);
      onSubmitted(data);
    });

  const photo = (title: string, value: Photo | null, set: (p: Photo) => void) => (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{title}</Text>
      {value && <Image source={{ uri: value.uri }} style={{ width: '100%', aspectRatio: 1.6, borderRadius: 6 }} />}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextButton title={value ? 'Retake photo' : 'Take photo'} onPress={() => pick(set, 'camera')} busy={busy} />
        <TextButton title="Choose from gallery" onPress={() => pick(set, 'library')} busy={busy} />
      </View>
    </View>
  );

  return (
    <View style={styles.form}>
      <Text style={styles.heading}>Verify your identity</Text>
      {process.env.EXPO_PUBLIC_DEMO === '1' && (
        <Text style={[styles.body, { fontWeight: '800' }]}>Demo version: upload a made-up image, never a real ID.</Text>
      )}
      <Text style={styles.body}>
        Upload your {docLabel} so other players know you are real. It is encrypted, never shown to other players, and
        only our verification team can see it.
      </Text>
      {status.status === 'rejected' && (
        <Text style={[styles.body, { fontWeight: '600' }]}>
          Your last upload was not accepted{status.rejectionReason ? `: ${status.rejectionReason}` : '.'} Please try
          again.
        </Text>
      )}
      <Field
        label={`${docLabel} number`}
        value={docNumber}
        onChangeText={setDocNumber}
        placeholder="xxxxx-xxxxxxx-x"
        keyboardType="numbers-and-punctuation"
        maxLength={15}
      />
      {photo('Photo of the front', front, setFront)}
      {photo('Photo of the back', back, setBack)}
      <Message>{message}</Message>
      <Button title={busy ? 'Uploading…' : 'Submit for review'} onPress={submit} busy={busy} />
    </View>
  );
}
