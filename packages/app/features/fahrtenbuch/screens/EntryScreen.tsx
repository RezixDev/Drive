import React, { useState, useEffect } from 'react'
import { View, Image } from 'react-native'
import { YStack, XStack, Button, Text, Input } from 'tamagui'
import { useRouter } from 'solito/router'
import { PhotoCapture } from '../components/PhotoCapture'

import { LocationPicker } from '../components/LocationPicker'
import { saveFahrtenbuchEntry } from '../api/database'
import type { FahrtenbuchEntry, Location } from '../types'

type EntryFormData = {
  timestamp: string
  mileage: string
  location: Location | null
  photoUri: string | null
  purpose: string
}

export function EntryScreen() {
  const router = useRouter()
  const [showCamera, setShowCamera] = useState(false)
  const [entry, setEntry] = useState<EntryFormData>({
    timestamp: new Date().toISOString(),
    mileage: '',
    location: null,
    photoUri: null,
    purpose: '',
  })

  const handlePhotoCapture = (photoUri: string) => {
    setEntry((prev) => ({ ...prev, photoUri }))
    setShowCamera(false)
  }

  const handleLocationSelect = (location: Location) => {
    setEntry((prev) => ({ ...prev, location }))
  }

  const handleSave = async () => {
    if (!entry.mileage || !entry.location || !entry.photoUri || !entry.purpose) {
      // Show error message
      return
    }

    try {
      // Convert EntryFormData to FahrtenbuchEntry
      const entryToSave: Omit<FahrtenbuchEntry, 'id'> = {
        timestamp: entry.timestamp,
        mileage: entry.mileage,
        location: entry.location,
        photoUri: entry.photoUri,
        purpose: entry.purpose,
      }

      await saveFahrtenbuchEntry(entryToSave)
      router.push('/history')
    } catch (error) {
      console.error('Failed to save entry:', error)
      // Show error message
    }
  }
  if (showCamera) {
    return <PhotoCapture onCapture={handlePhotoCapture} onCancel={() => setShowCamera(false)} />
  }
  return (
    <YStack padding="$4" space="$4">
      <Text fontSize="$6" fontWeight="bold">
        Neue Fahrt erfassen
      </Text>

      <YStack space="$2">
        <Text>Kilometerstand</Text>
        <XStack space="$2">
          <Input
            flex={1}
            keyboardType="numeric"
            value={entry.mileage}
            onChangeText={(text) => setEntry((prev) => ({ ...prev, mileage: text }))}
            placeholder="Aktueller Kilometerstand"
          />
          <Button onPress={() => setShowCamera(true)} />
        </XStack>
      </YStack>

      <YStack space="$2">
        <Text>Standort</Text>
        <LocationPicker onLocationSelect={handleLocationSelect} currentLocation={entry.location} />
      </YStack>

      <YStack space="$2">
        <Text>Zweck der Fahrt</Text>
        <Input
          value={entry.purpose}
          onChangeText={(text) => setEntry((prev) => ({ ...prev, purpose: text }))}
          placeholder="z.B. Kundenbesuch, Materialtransport"
        />
      </YStack>

      {entry.photoUri && (
        <YStack space="$2">
          <Text>Foto des Kilometerstands</Text>
          <Image
            source={{ uri: entry.photoUri }}
            style={{ width: '100%', height: 200, borderRadius: 8 }}
          />
        </YStack>
      )}

      <Button
        backgroundColor="$blue10"
        color="white"
        onPress={handleSave}
        disabled={!entry.mileage || !entry.location || !entry.photoUri || !entry.purpose}
      >
        Eintrag speichern
      </Button>
    </YStack>
  )
}
