type UserRole = 'parent' | 'driver' | 'admin' | 'student' | null;

type BusStatus = {
  statusText: string;
  statusDescription: string;
  statusColor: string;
  eta?: string;
} | null;

type Trip = {
  type: 'pickup' | 'dropoff';
  date: string;
  time: string;
};

type BusLocation = {
  id: number;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  status: string;
  statusText: string;
  eta: string;
  currentLocation: string;
  routeProgress: number;
};

type Notification = {
  type: 'info' | 'success' | 'alert' | 'location';
  title: string;
  message: string;
  time: string;
  read: boolean;
};

// Constants
const SUCCESS_COLOR = '#22C55E';
const WARNING_COLOR = '#F97316';

// 1. Get Bus Status
export const getBusStatus = (userRole: UserRole): BusStatus => {
  const statuses: Record<Exclude<UserRole, null>, BusStatus> = {
    parent: {
      statusText: 'Bus En Route',
      statusDescription: 'Your child\'s school bus is currently on the way to the pickup location.',
      statusColor: SUCCESS_COLOR,
      eta: 'Estimated arrival in 7 minutes',
    },
    driver: {
      statusText: 'Route Active',
      statusDescription: 'You are currently on Route #103. Next stop: University Gate.',
      statusColor: SUCCESS_COLOR,
      eta: 'Estimated arrival at next stop in 5 minutes',
    },
    admin: {
      statusText: 'All Buses Active',
      statusDescription: '12 buses currently on routes. No reported incidents.',
      statusColor: SUCCESS_COLOR,
    },
    student: {
      statusText: 'Bus Approaching',
      statusDescription: 'Your bus is approaching the pickup location.',
      statusColor: WARNING_COLOR,
      eta: 'Estimated arrival in 3 minutes',
    },
  };

  return userRole ? statuses[userRole] || null : null;
};

// 2. Get Students (For parent)
export const getStudents = () => [
  {
    name: 'Samir',
    grade: 'Grade 9',
    avatar: 'https://images.pexels.com/photos/16646765/pexels-photo-16646765.jpeg',
  },
  {
    name: 'Yasmine',
    grade: 'Grade 7',
    avatar: 'https://images.pexels.com/photos/16608793/pexels-photo-16608793.jpeg',
  },
];

// 3. Get Upcoming Trips
export const getUpcomingTrips = (userRole: UserRole): Trip[] => {
  const baseTrips: Trip[] = [
    { type: 'pickup', date: 'Monday, Oct 14', time: '07:30 AM' },
    { type: 'dropoff', date: 'Monday, Oct 14', time: '03:30 PM' },
  ];

  if (userRole === 'driver') {
    baseTrips.push(
      { type: 'pickup', date: 'Tuesday, Oct 15', time: '07:30 AM' },
      { type: 'dropoff', date: 'Tuesday, Oct 15', time: '03:30 PM' }
    );
  }

  return baseTrips;
};

// 4. Get Bus Location
export const getBusLocation = (busIndex: number = 0): BusLocation => {
  const busLocations: BusLocation[] = [
    {
      id: 42,
      latitude: 35.6894,
      longitude: -0.6326,
      heading: 90,
      speed: 35,
      status: 'en-route',
      statusText: 'En route to next stop',
      eta: '7 minutes',
      currentLocation: 'University Road',
      routeProgress: 45,
    },
    {
      id: 17,
      latitude: 35.7003,
      longitude: -0.6525,
      heading: 180,
      speed: 25,
      status: 'stopped',
      statusText: 'Stopped at pickup point',
      eta: '12 minutes',
      currentLocation: 'Science Faculty',
      routeProgress: 65,
    },
    {
      id: 103,
      latitude: 35.6775,
      longitude: -0.6411,
      heading: 270,
      speed: 0,
      status: 'delayed',
      statusText: 'Delayed due to traffic',
      eta: '15 minutes',
      currentLocation: 'Central Station',
      routeProgress: 30,
    },
  ];

  return busLocations[busIndex] ?? busLocations[0];
};

// 5. Get Bus Routes
export const getBusRoutes = () => [
  {
    id: 1,
    name: 'Route #103',
    coordinates: [
      { latitude: 35.6894, longitude: -0.6326 },
      { latitude: 35.6950, longitude: -0.6400 },
      { latitude: 35.7003, longitude: -0.6525 },
    ],
    color: '#1E40AF',
  },
];

// 6. Get Bus Stops
export const getBusStops = () => [
  { id: 1, name: 'University Gate', latitude: 35.6894, longitude: -0.6326 },
  { id: 2, name: 'Science Faculty', latitude: 35.7003, longitude: -0.6525 },
  { id: 3, name: 'Central Station', latitude: 35.6775, longitude: -0.6411 },
];

// 7. Get Notifications
export const getNotifications = (userRole: UserRole): Notification[] => {
  const notifications: Notification[] = [
    {
      type: 'info',
      title: 'Schedule Update',
      message: 'Bus schedule has been updated for next week due to exams.',
      time: '2 hours ago',
      read: true,
    },
    {
      type: 'location',
      title: 'Bus Arriving Soon',
      message: 'Bus #B42 will arrive at your stop in approximately 5 minutes.',
      time: '10 minutes ago',
      read: false,
    },
  ];

  const roleBasedNotifications: Record<Exclude<UserRole, null>, Notification> = {
    parent: {
      type: 'success',
      title: 'Child Boarded',
      message: 'Samir has boarded the bus and is on the way to school.',
      time: '45 minutes ago',
      read: true,
    },
    driver: {
      type: 'alert',
      title: 'Route Change',
      message: 'Your afternoon route has been modified due to road construction.',
      time: '1 day ago',
      read: false,
    },
    admin: {
      type: 'alert',
      title: 'Incident Reported',
      message: 'Driver of Bus #B17 reported a mechanical issue. Maintenance team dispatched.',
      time: '1 hour ago',
      read: false,
    },
    student: {
      type: 'info',
      title: 'Trip Reminder',
      message: 'Don\'t forget your field trip tomorrow. Bus will depart at 8:00 AM sharp.',
      time: '3 hours ago',
      read: true,
    },
  };

  if (userRole && roleBasedNotifications[userRole]) {
    notifications.push(roleBasedNotifications[userRole]);
  }

  return notifications;
};