import React, { useState, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { YStack, Button, Text } from 'tamagui'

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
      setError('Failed to take picture')
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
        <Text>Requesting camera access...</Text>
      </YStack>
    )
  }

  if (!permission.granted) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" space="$4" padding="$4">
        <Text>Camera access not granted</Text>
        <Text color="$gray11" textAlign="center">
          Please enable camera access in settings to take a photo.
        </Text>
        <Button onPress={requestPermission} backgroundColor="$blue10" color="white">
          Allow Access
        </Button>
        <Button onPress={onCancel} backgroundColor="$red10" color="white">
          Close
        </Button>
      </YStack>
    )
  }

  if (previewUri) {
    return (
      <YStack flex={1}>
        <View style={styles.imageContainer}></View>
        <YStack
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          padding="$4"
          backgroundColor="$background"
          space="$2"
        >
          <Button onPress={confirmPicture} backgroundColor="$green10" color="white">
            Use Photo
          </Button>
          <Button onPress={() => setPreviewUri(null)} backgroundColor="$red10" color="white">
            Retake
          </Button>
        </YStack>
      </YStack>
    )
  }

  return (
    <YStack flex={1}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        ratio="16:9"
        autofocus="on"
        mode="picture"
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
            <Text>Initializing camera...</Text>
          </YStack>
        )}
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
          color="white"
          disabled={!isCameraReady}
        >
          Take Photo
        </Button>
        <Button onPress={onCancel} backgroundColor="$red10" color="white">
          Cancel
        </Button>
      </YStack>
    </YStack>
  )
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  previewImage: {
    flex: 1,
  },
})
