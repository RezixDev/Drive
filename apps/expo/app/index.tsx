import { EntryScreen } from 'app/features/fahrtenbuch/screens/EntryScreen'
import { Stack } from 'expo-router'

export default function Screen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Home',
        }}
      />
      <EntryScreen />
    </>
  )
}
