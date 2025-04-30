// Mock data for Smart Bus application

// Get bus status based on user role
export const getBusStatus = (userRole: string | null) => {
  switch (userRole) {
    case 'parent':
      return {
        statusText: 'Bus En Route',
        statusDescription: 'Your child\'s school bus is currently on the way to the pickup location.',
        statusColor: '#22C55E', // Success color
        eta: 'Estimated arrival in 7 minutes',
      };
    case 'driver':
      return {
        statusText: 'Route Active',
        statusDescription: 'You are currently on Route #103. Next stop: University Gate.',
        statusColor: '#22C55E', // Success color
        eta: 'Estimated arrival at next stop in 5 minutes',
      };
    case 'admin':
      return {
        statusText: 'All Buses Active',
        statusDescription: '12 buses currently on routes. No reported incidents.',
        statusColor: '#22C55E', // Success color
      };
    case 'student':
      return {
        statusText: 'Bus Approaching',
        statusDescription: 'Your bus is approaching the pickup location.',
        statusColor: '#F97316', // Warning color
        eta: 'Estimated arrival in 3 minutes',
      };
    default:
      return null;
  }
};

// Get students for parent dashboard
export const getStudents = () => {
  return [
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
};

// Get upcoming trips based on user role
export const getUpcomingTrips = (userRole: string | null) => {
  const baseTrips = [
    {
      type: 'pickup',
      date: 'Monday, Oct 14',
      time: '07:30 AM',
    },
    {
      type: 'dropoff',
      date: 'Monday, Oct 14',
      time: '03:30 PM',
    },
  ];

  // Add more trips for specific roles
  if (userRole === 'driver') {
    baseTrips.push(
      {
        type: 'pickup',
        date: 'Tuesday, Oct 15',
        time: '07:30 AM',
      },
      {
        type: 'dropoff',
        date: 'Tuesday, Oct 15',
        time: '03:30 PM',
      }
    );
  }

  return baseTrips;
};

// Get bus location
export const getBusLocation = (busIndex: number = 0) => {
  const busLocations = [
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

  return busLocations[busIndex] || busLocations[0];
};

// Get bus routes for map
export const getBusRoutes = () => {
  return [
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
};

// Get bus stops for map
export const getBusStops = () => {
  return [
    {
      id: 1,
      name: 'University Gate',
      latitude: 35.6894,
      longitude: -0.6326,
    },
    {
      id: 2,
      name: 'Science Faculty',
      latitude: 35.7003,
      longitude: -0.6525,
    },
    {
      id: 3,
      name: 'Central Station',
      latitude: 35.6775,
      longitude: -0.6411,
    },
  ];
};

// Get notifications based on user role
export const getNotifications = (userRole: string | null) => {
  const baseNotifications = [
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

  // Add role-specific notifications
  switch (userRole) {
    case 'parent':
      baseNotifications.push({
        type: 'success',
        title: 'Child Boarded',
        message: 'Samir has boarded the bus and is on the way to school.',
        time: '45 minutes ago',
        read: true,
      });
      break;
    case 'driver':
      baseNotifications.push({
        type: 'alert',
        title: 'Route Change',
        message: 'Your afternoon route has been modified due to road construction.',
        time: '1 day ago',
        read: false,
      });
      break;
    case 'admin':
      baseNotifications.push({
        type: 'alert',
        title: 'Incident Reported',
        message: 'Driver of Bus #B17 reported a mechanical issue. Maintenance team dispatched.',
        time: '1 hour ago',
        read: false,
      });
      break;
    case 'student':
      baseNotifications.push({
        type: 'info',
        title: 'Trip Reminder',
        message: 'Don\'t forget your field trip tomorrow. Bus will depart at 8:00 AM sharp.',
        time: '3 hours ago',
        read: true,
      });
      break;
  }

  return baseNotifications;
};