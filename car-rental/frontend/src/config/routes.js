// Public Routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CARS: '/cars',
  CAR_DETAIL: '/cars/:id',
  ABOUT: '/about',
  CONTACT: '/contact',
  TERMS: '/terms',
  PRIVACY: '/privacy'
};

// Protected Routes
export const PROTECTED_ROUTES = {
  PROFILE: '/profile',
  BOOKINGS: '/bookings',
  BOOKING_DETAIL: '/bookings/:id',
  FAVORITES: '/favorites',
  PAYMENTS: '/payments',
  PAYMENT_DETAIL: '/payments/:id'
};

// Admin Routes
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  USERS: '/admin/users',
  CARS: '/admin/cars',
  BOOKINGS: '/admin/bookings',
  PAYMENTS: '/admin/payments',
  REPORTS: '/admin/reports',
  SETTINGS: '/admin/settings'
};

// Supplier Routes
export const SUPPLIER_ROUTES = {
  DASHBOARD: '/supplier',
  CARS: '/supplier/cars',
  BOOKINGS: '/supplier/bookings',
  PAYMENTS: '/supplier/payments',
  REPORTS: '/supplier/reports',
  SETTINGS: '/supplier/settings'
};

// Route Groups
export const ROUTE_GROUPS = {
  PUBLIC: Object.values(PUBLIC_ROUTES),
  PROTECTED: Object.values(PROTECTED_ROUTES),
  ADMIN: Object.values(ADMIN_ROUTES),
  SUPPLIER: Object.values(SUPPLIER_ROUTES)
};

// Route Guards
export const ROUTE_GUARDS = {
  AUTH: 'auth',
  GUEST: 'guest',
  ADMIN: 'admin',
  SUPPLIER: 'supplier'
};

// Route Titles
export const ROUTE_TITLES = {
  [PUBLIC_ROUTES.HOME]: 'Home',
  [PUBLIC_ROUTES.LOGIN]: 'Login',
  [PUBLIC_ROUTES.REGISTER]: 'Register',
  [PUBLIC_ROUTES.CARS]: 'Cars',
  [PUBLIC_ROUTES.CAR_DETAIL]: 'Car Details',
  [PUBLIC_ROUTES.ABOUT]: 'About Us',
  [PUBLIC_ROUTES.CONTACT]: 'Contact Us',
  [PUBLIC_ROUTES.TERMS]: 'Terms & Conditions',
  [PUBLIC_ROUTES.PRIVACY]: 'Privacy Policy',
  [PROTECTED_ROUTES.PROFILE]: 'My Profile',
  [PROTECTED_ROUTES.BOOKINGS]: 'My Bookings',
  [PROTECTED_ROUTES.BOOKING_DETAIL]: 'Booking Details',
  [PROTECTED_ROUTES.FAVORITES]: 'My Favorites',
  [PROTECTED_ROUTES.PAYMENTS]: 'My Payments',
  [PROTECTED_ROUTES.PAYMENT_DETAIL]: 'Payment Details',
  [ADMIN_ROUTES.DASHBOARD]: 'Admin Dashboard',
  [ADMIN_ROUTES.USERS]: 'User Management',
  [ADMIN_ROUTES.CARS]: 'Car Management',
  [ADMIN_ROUTES.BOOKINGS]: 'Booking Management',
  [ADMIN_ROUTES.PAYMENTS]: 'Payment Management',
  [ADMIN_ROUTES.REPORTS]: 'Reports',
  [ADMIN_ROUTES.SETTINGS]: 'Settings',
  [SUPPLIER_ROUTES.DASHBOARD]: 'Supplier Dashboard',
  [SUPPLIER_ROUTES.CARS]: 'My Cars',
  [SUPPLIER_ROUTES.BOOKINGS]: 'My Bookings',
  [SUPPLIER_ROUTES.PAYMENTS]: 'My Payments',
  [SUPPLIER_ROUTES.REPORTS]: 'My Reports',
  [SUPPLIER_ROUTES.SETTINGS]: 'My Settings'
}; 