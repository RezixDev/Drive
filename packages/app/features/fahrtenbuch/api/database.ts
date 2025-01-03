import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { Alert } from 'react-native'

// Constants
const STORAGE_KEY = '@fahrtenbuch_entries'
const BACKUP_DIRECTORY = `${FileSystem.documentDirectory}backups/`

// Types
export interface Location {
  latitude: number
  longitude: number
  address: string
}

export interface FahrtenbuchEntry {
  id: string
  timestamp: string
  mileage: string
  location: Location
  photoUri: string
  purpose: string
}

// Helper Functions
const ensureBackupDirectory = async () => {
  const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIRECTORY)
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(BACKUP_DIRECTORY, { intermediates: true })
  }
}

// Main Database Functions
export const saveFahrtenbuchEntry = async (entry: Omit<FahrtenbuchEntry, 'id'>): Promise<void> => {
  try {
    // Get existing entries
    const existingEntriesJson = await AsyncStorage.getItem(STORAGE_KEY)
    const existingEntries: FahrtenbuchEntry[] = existingEntriesJson
      ? JSON.parse(existingEntriesJson)
      : []

    // Create new entry with ID
    const newEntry: FahrtenbuchEntry = {
      ...entry,
      id: Date.now().toString(),
    }

    // Save photo to permanent storage
    if (newEntry.photoUri) {
      const newPhotoUri = `${FileSystem.documentDirectory}photos/${newEntry.id}.jpg`
      await FileSystem.copyAsync({
        from: newEntry.photoUri,
        to: newPhotoUri,
      })
      newEntry.photoUri = newPhotoUri
    }

    // Add new entry and save
    const updatedEntries = [...existingEntries, newEntry]
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries))
  } catch (error) {
    console.error('Error saving entry:', error)
    throw new Error('Failed to save entry')
  }
}

export const getFahrtenbuchEntries = async (): Promise<FahrtenbuchEntry[]> => {
  try {
    const entriesJson = await AsyncStorage.getItem(STORAGE_KEY)
    return entriesJson ? JSON.parse(entriesJson) : []
  } catch (error) {
    console.error('Error getting entries:', error)
    throw new Error('Failed to get entries')
  }
}

export const deleteFahrtenbuchEntry = async (id: string): Promise<void> => {
  try {
    const existingEntriesJson = await AsyncStorage.getItem(STORAGE_KEY)
    if (!existingEntriesJson) return

    const existingEntries: FahrtenbuchEntry[] = JSON.parse(existingEntriesJson)
    const entryToDelete = existingEntries.find((entry) => entry.id === id)

    // Delete associated photo if it exists
    if (entryToDelete?.photoUri) {
      await FileSystem.deleteAsync(entryToDelete.photoUri, { idempotent: true })
    }

    const updatedEntries = existingEntries.filter((entry) => entry.id !== id)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries))
  } catch (error) {
    console.error('Error deleting entry:', error)
    throw new Error('Failed to delete entry')
  }
}

export const exportFahrtenbuchData = async (): Promise<string> => {
  try {
    await ensureBackupDirectory()

    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync()
    if (!isSharingAvailable) {
      throw new Error('Sharing is not available on this platform')
    }

    // Get all entries
    const entries = await getFahrtenbuchEntries()

    // Create CSV content
    const csvHeader = 'Datum,Kilometerstand,Standort,Zweck\n'
    const csvRows = entries.map((entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString('de-DE')
      return `${date},${entry.mileage},"${entry.location.address}","${entry.purpose}"`
    })
    const csvContent = csvHeader + csvRows.join('\n')

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0]
    const fileName = `fahrtenbuch_${date}.csv`
    const filePath = BACKUP_DIRECTORY + fileName

    // Write file
    await FileSystem.writeAsStringAsync(filePath, csvContent)

    // Share the file
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/csv',
      dialogTitle: 'Fahrtenbuch exportieren',
      UTI: 'public.comma-separated-values-text',
    })

    return filePath
  } catch (error) {
    console.error('Error exporting data:', error)
    throw new Error('Failed to export data')
  }
}

export const importFahrtenbuchData = async (fileUri: string): Promise<void> => {
  try {
    const content = await FileSystem.readAsStringAsync(fileUri)
    const rows = content.split('\n')

    // Skip header row and parse content
    const entries = rows.slice(1).map((row) => {
      const [dateStr, mileage, address, purpose] = row.split(',').map(
        (str) => str.replace(/^"(.*)"$/, '$1') // Remove surrounding quotes
      )

      return {
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        timestamp: new Date(dateStr).toISOString(),
        mileage,
        location: {
          latitude: 0, // Default values since we don't have this in CSV
          longitude: 0,
          address,
        },
        photoUri: '', // No photo for imported entries
        purpose,
      }
    })

    // Save imported entries
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    Alert.alert('Import erfolgreich', `${entries.length} Einträge wurden importiert.`)
  } catch (error) {
    console.error('Error importing data:', error)
    throw new Error('Failed to import data')
  }
}
