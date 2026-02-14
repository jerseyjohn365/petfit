import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { RefObject } from 'react';
import { View } from 'react-native';

export async function shareMilestoneCard(viewRef: RefObject<View | null>): Promise<boolean> {
  try {
    if (!viewRef.current) return false;

    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) return false;

    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share your milestone!',
    });

    return true;
  } catch {
    return false;
  }
}
