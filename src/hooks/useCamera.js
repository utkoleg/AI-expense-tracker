import { useRef, useCallback } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

export const isNative = !!(window.Capacitor?.isNativePlatform?.());

/**
 * @param {(b64: string, mediaType: string) => void} onCapture
 * @param {() => void} onInvalidFile  - called when a non-image file is picked
 */
export function useCamera(onCapture, onInvalidFile) {
  const fileRef = useRef(null);

  const openNativeCamera = useCallback(async () => {
    const photo = await Camera.getPhoto({
      quality: 60,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });
    onCapture(photo.base64String, "image/jpeg");
  }, [onCapture]);

  const openPhotoLibrary = useCallback(async () => {
    const photo = await Camera.getPhoto({
      quality: 60,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    });
    onCapture(photo.base64String, "image/jpeg");
  }, [onCapture]);

  const openFilePicker = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileRef.current) fileRef.current.value = "";

    if (!file.type.startsWith("image/")) {
      onInvalidFile?.();
      return;
    }

    const b64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    onCapture(b64, file.type);
  }, [onCapture, onInvalidFile]);

  return { fileRef, openNativeCamera, openPhotoLibrary, openFilePicker, handleFileChange };
}
