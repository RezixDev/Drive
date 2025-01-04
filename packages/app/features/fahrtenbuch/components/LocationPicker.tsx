import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import * as Location from 'expo-location'
import { YStack, Button, Text, Input, Spinner } from 'tamagui'

interface LocationPickerProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void
  currentLocation: {
    latitude: number
    longitude: number
    address: string
  } | null
}

export function LocationPicker({ onLocationSelect, currentLocation }: LocationPickerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualAddress, setManualAddress] = useState('')

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      return status === 'granted'
    } catch (error) {
      console.error('Error requesting location permission:', error)
      return false
    }
  }

  const getCurrentLocation = async () => {
    setLoading(true)
    setError(null)

    try {
      const hasPermission = await requestLocationPermission()
      if (!hasPermission) {
        setError('Keine Berechtigung für Standortzugriff')
        return
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      const geocodeResult = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })

      if (geocodeResult && geocodeResult[0]) {
        const address = formatAddress(geocodeResult[0])
        onLocationSelect({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address,
        })
      }
    } catch (error) {
      console.error('Error getting location:', error)
      setError('Fehler beim Abrufen des Standorts')
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (geocodeResult: Location.LocationGeocodedAddress) => {
    const components = [
      geocodeResult.street,
      geocodeResult.streetNumber,
      geocodeResult.postalCode,
      geocodeResult.city,
    ].filter(Boolean)
    return components.join(', ')
  }

  const handleManualAddressSubmit = () => {
    if (manualAddress.trim()) {
      onLocationSelect({
        latitude: 0, // You might want to geocode the address to get actual coordinates
        longitude: 0,
        address: manualAddress.trim(),
      })
    }
  }

  return (
    <YStack space="$2">
      {currentLocation ? (
        <YStack backgroundColor="$gray5" padding="$3" borderRadius="$2" space="$2">
          <Text fontWeight="bold">Aktueller Standort:</Text>
          <Text>{currentLocation.address}</Text>
          <Button onPress={getCurrentLocation} variant="outlined">
            Aktualisieren
          </Button>
        </YStack>
      ) : (
        <Button onPress={getCurrentLocation} disabled={loading}>
          Standort ermitteln
        </Button>
      )}

      {error && <Text color="$red10">{error}</Text>}

      <Text>oder Adresse manuell eingeben:</Text>
      <YStack space="$2">
        <Input
          value={manualAddress}
          onChangeText={setManualAddress}
          placeholder="Straße, Hausnummer, PLZ, Stadt"
        />
        <Button
          onPress={handleManualAddressSubmit}
          disabled={!manualAddress.trim()}
          variant="outlined"
        >
          Adresse übernehmen
        </Button>
      </YStack>
    </YStack>
  )
}
