import React, { useState, useEffect } from 'react'
import { View, FlatList, RefreshControl } from 'react-native'
import { YStack, XStack, Text, Button, Card } from 'tamagui'
import { useRouter } from 'solito/router'
import { Plus, Download } from 'lucide-react'
import { getFahrtenbuchEntries, exportFahrtenbuchData } from '../api/database'
import type { FahrtenbuchEntry } from '../api/database' // Import type from database file

export function HistoryScreen() {
  const router = useRouter()
  const [entries, setEntries] = useState<FahrtenbuchEntry[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const loadEntries = async () => {
    try {
      const data = await getFahrtenbuchEntries()
      setEntries(data)
    } catch (error) {
      console.error('Failed to load entries:', error)
      // Show error message
    }
  }

  useEffect(() => {
    loadEntries()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadEntries()
    setRefreshing(false)
  }

  const handleExport = async () => {
    try {
      await exportFahrtenbuchData()
      // Show success message
    } catch (error) {
      console.error('Failed to export data:', error)
      // Show error message
    }
  }

  const renderEntry = ({ item }: { item: FahrtenbuchEntry }) => (
    <Card marginVertical="$2" padding="$4">
      <YStack space="$2">
        <XStack justifyContent="space-between">
          <Text fontWeight="bold">{new Date(item.timestamp).toLocaleDateString('de-DE')}</Text>
          <Text>{item.mileage} km</Text>
        </XStack>

        <Text color="$gray10">{item.location?.address || 'Kein Standort angegeben'}</Text>

        <Text color="$gray11">{item.purpose}</Text>
      </YStack>
    </Card>
  )

  return (
    <YStack flex={1} padding="$4">
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
        <Text fontSize="$6" fontWeight="bold">
          Fahrtenbuch
        </Text>
        <XStack space="$2">
          <Button
            icon={<Download size={24} color="white" />}
            onPress={handleExport}
            backgroundColor="$gray10"
            color="white"
          />
          <Button
            icon={<Plus size={24} color="white" />}
            onPress={() => router.push('/')}
            backgroundColor="$blue10"
            color="white"
          />
        </XStack>
      </XStack>

      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id} // Changed to use id instead of timestamp
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <YStack alignItems="center" padding="$4">
            <Text color="$gray11">Noch keine Einträge vorhanden</Text>
          </YStack>
        }
      />
    </YStack>
  )
}
