import type { Track, Playlist, Genre } from '@/types'

export const TRACKS: Track[] = [
  { id: '1', title: 'Midnight Bloom', artist: 'Luna Echo', album: 'Nightfall', duration: 214, durationFormatted: '3:34', coverUrl: 'https://picsum.photos/seed/t1/400/400', isLiked: true },
  { id: '2', title: 'Neon Haze', artist: 'Drift & Pulse', album: 'Chrome Sessions', duration: 187, durationFormatted: '3:07', coverUrl: 'https://picsum.photos/seed/t2/400/400' },
  { id: '3', title: 'Solar Drift', artist: 'Korvax', album: 'Orbital', duration: 253, durationFormatted: '4:13', coverUrl: 'https://picsum.photos/seed/t3/400/400', isLiked: true },
  { id: '4', title: 'Glass Skies', artist: 'Aether', album: 'Weightless', duration: 198, durationFormatted: '3:18', coverUrl: 'https://picsum.photos/seed/t4/400/400' },
  { id: '5', title: 'Deep Signal', artist: 'Synthwave Collective', album: 'Frequencies', duration: 301, durationFormatted: '5:01', coverUrl: 'https://picsum.photos/seed/t5/400/400' },
  { id: '6', title: 'Echo Chamber', artist: 'Luna Echo', album: 'Reverb', duration: 222, durationFormatted: '3:42', coverUrl: 'https://picsum.photos/seed/t6/400/400', isLiked: true },
  { id: '7', title: 'Pulse Wave', artist: 'Drift & Pulse', album: 'Chrome Sessions', duration: 176, durationFormatted: '2:56', coverUrl: 'https://picsum.photos/seed/t7/400/400' },
  { id: '8', title: 'Arctic Lullaby', artist: 'Korvax', album: 'Northern Lights', duration: 264, durationFormatted: '4:24', coverUrl: 'https://picsum.photos/seed/t8/400/400' },
  { id: '9', title: 'Velvet Noise', artist: 'Aether', album: 'Weightless', duration: 193, durationFormatted: '3:13', coverUrl: 'https://picsum.photos/seed/t9/400/400', isLiked: true },
  { id: '10', title: 'Cascade', artist: 'Synthwave Collective', album: 'Frequencies', duration: 238, durationFormatted: '3:58', coverUrl: 'https://picsum.photos/seed/t10/400/400' },
  { id: '11', title: 'Starfield', artist: 'Luna Echo', album: 'Nightfall', duration: 209, durationFormatted: '3:29', coverUrl: 'https://picsum.photos/seed/t11/400/400' },
  { id: '12', title: 'Static Dreams', artist: 'Drift & Pulse', album: 'Transmission', duration: 281, durationFormatted: '4:41', coverUrl: 'https://picsum.photos/seed/t12/400/400', isLiked: true },
]

export const PLAYLISTS: Playlist[] = [
  { id: '1', name: 'Nightfall Vibes', description: 'Late night electronic essentials', coverUrl: 'https://picsum.photos/seed/p1/400/400', trackCount: 24, owner: 'Barztify' },
  { id: '2', name: 'Focus Mode', description: 'Deep concentration music', coverUrl: 'https://picsum.photos/seed/p2/400/400', trackCount: 18, owner: 'Barztify' },
  { id: '3', name: 'Synthwave Journey', description: 'Retro futuristic sounds', coverUrl: 'https://picsum.photos/seed/p3/400/400', trackCount: 32, owner: 'Barztify' },
  { id: '4', name: 'Morning Ritual', description: 'Start your day right', coverUrl: 'https://picsum.photos/seed/p4/400/400', trackCount: 16, owner: 'Barztify' },
  { id: '5', name: 'Chill Horizon', description: 'Ambient downtempo beats', coverUrl: 'https://picsum.photos/seed/p5/400/400', trackCount: 28, owner: 'Barztify' },
  { id: '6', name: 'Orbital Sessions', description: 'Space-inspired electronica', coverUrl: 'https://picsum.photos/seed/p6/400/400', trackCount: 21, owner: 'Barztify' },
  { id: '7', name: 'Neon City', description: 'Urban electronic pulse', coverUrl: 'https://picsum.photos/seed/p7/400/400', trackCount: 15, owner: 'Barztify' },
  { id: '8', name: 'Deep Signal', description: 'Submerged in frequency', coverUrl: 'https://picsum.photos/seed/p8/400/400', trackCount: 20, owner: 'Barztify' },
]

export const GENRES: Genre[] = [
  { id: '1', name: 'Electronic', color: '#7c3aed', gradient: 'from-violet-600 to-purple-900' },
  { id: '2', name: 'Ambient', color: '#0ea5e9', gradient: 'from-sky-500 to-blue-900' },
  { id: '3', name: 'Synthwave', color: '#ec4899', gradient: 'from-pink-500 to-rose-900' },
  { id: '4', name: 'Lo-Fi', color: '#f59e0b', gradient: 'from-amber-500 to-orange-900' },
  { id: '5', name: 'Cinematic', color: '#10b981', gradient: 'from-emerald-500 to-teal-900' },
  { id: '6', name: 'Techno', color: '#ef4444', gradient: 'from-red-500 to-rose-900' },
]

export const HOME_CHIPS = ['All', 'Music', 'Podcasts', 'Playlists', 'Artists']
