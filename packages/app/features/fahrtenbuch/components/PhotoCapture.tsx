import React, { useState, useEffect, useRef } from 'react'
import { View, Image } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { YStack, Button, Text } from 'tamagui'
import { Camera as CameraIcon, X, Check } from 'lucide-react'

interface PhotoCaptureProps {
  onCapture: (photoUri: string) => void
  onCancel: () => void
}

export function PhotoCapture({ onCapture, onCancel }: PhotoCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions()
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const cameraRef = useRef<CameraView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCameraReady, setCameraReady] = useState(false)
  const onCameraReady = () => {
    setCameraReady(true)
  }

  const takePicture = async () => {
    if (!cameraRef.current) return

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        exif: true,
        skipProcessing: false,
      })

      if (photo && photo.uri) {
        setPreviewUri(photo.uri)
      } else {
        throw new Error('No photo data received')
      }
    } catch (error) {
      console.error('Failed to take picture:', error)
      // Show error message
    }
  }

  const confirmPicture = () => {
    if (previewUri) {
      onCapture(previewUri)
    }
  }

  if (!permission) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text>Kamerazugriff wird angefordert...</Text>
      </YStack>
    )
  }

  if (!permission.granted) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" space="$4" padding="$4">
        <Text>Kein Zugriff auf die Kamera</Text>
        <Text color="$gray11" textAlign="center">
          Bitte aktivieren Sie den Kamerazugriff in den Einstellungen, um den Kilometerstand zu
          fotografieren.
        </Text>
        <Button onPress={requestPermission} backgroundColor="$blue10" color="white">
          Zugriff erlauben
        </Button>
        <Button onPress={onCancel} backgroundColor="$red10" color="white">
          Schließen
        </Button>
      </YStack>
    )
  }

  if (previewUri) {
    return (
      <YStack flex={1}>
        <Image source={{ uri: previewUri }} style={{ flex: 1 }} resizeMode="contain" />
        <YStack
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          padding="$4"
          backgroundColor="$background"
          space="$2"
        >
          <Button
            onPress={confirmPicture}
            backgroundColor="$green10"
            icon={<Check size={24} color="white" />}
            color="white"
          >
            Foto verwenden
          </Button>
          <Button
            onPress={() => setPreviewUri(null)}
            backgroundColor="$red10"
            icon={<X size={24} color="white" />}
            color="white"
          >
            Neu aufnehmen
          </Button>
        </YStack>
      </YStack>
    )
  }

  return (
    <YStack flex={1}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        ratio="16:9"
        autofocus="on"
        mode="picture"
        animateShutter={true}
        onMountError={(error) => {
          console.error('Camera mount error:', error)
          setError('Failed to initialize camera')
        }}
        onCameraReady={onCameraReady}
      >
        {error && (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Text color="$red10">{error}</Text>
          </YStack>
        )}
        {!isCameraReady && !error && (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Text>Kamera wird initialisiert...</Text>
          </YStack>
        )}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      </CameraView>

      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        padding="$4"
        backgroundColor="$background"
        space="$2"
      >
        <Button
          onPress={takePicture}
          backgroundColor="$blue10"
          icon={<CameraIcon size={24} color="white" />}
          color="white"
          disabled={!isCameraReady}
        >
          Kilometerstand fotografieren
        </Button>
        <Button
          onPress={onCancel}
          backgroundColor="$red10"
          icon={<X size={24} color="white" />}
          color="white"
        >
          Abbrechen
        </Button>
      </YStack>
    </YStack>
  )
}
