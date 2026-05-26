export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  LIBRARY: '/library',
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PLAYLIST: '/playlist/:id',
  SETTINGS: '/settings',
  FAVORITES: '/favorites',
} as const

export type RouteKey = keyof typeof ROUTES
