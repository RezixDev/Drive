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
