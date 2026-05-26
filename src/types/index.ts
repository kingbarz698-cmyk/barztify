export interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  durationFormatted: string
  coverUrl: string
  audioUrl?: string
  isLiked?: boolean
  isExplicit?: boolean
}

export interface Playlist {
  id: string
  name: string
  description?: string
  coverUrl: string
  trackCount: number
  totalDuration?: string
  owner?: string
  tracks?: Track[]
}

export interface Artist {
  id: string
  name: string
  imageUrl: string
  monthlyListeners?: number
  isFollowing?: boolean
  genres?: string[]
}

export interface Album {
  id: string
  title: string
  artist: string
  coverUrl: string
  year: number
  trackCount: number
  tracks?: Track[]
}

export interface User {
  id: string
  name: string
  email: string
  username?: string
  avatarUrl?: string
  isPremium: boolean
}

export type RepeatMode = 'off' | 'one' | 'all'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'playlist_created' | 'track_liked' | 'track_added' | 'login' | 'password_reset' | 'system'
  isRead: boolean
  createdAt: string
}

export interface Genre {
  id: string
  name: string
  color: string
  gradient: string
}

export interface SearchResults {
  tracks: Track[]
  albums: Album[]
  artists: Artist[]
  playlists: Playlist[]
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
