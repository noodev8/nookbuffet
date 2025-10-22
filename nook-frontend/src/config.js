// API Configuration
// Change the IP address here to use in different buildings

// CHANGE THIS IP ADDRESS FOR DIFFERENT LOCATIONS:
const SERVER_IP = 'nook.noodev8.com';  // Change to your server's IP address
const SERVER_PORT = '';  // No port needed - nginx handles routing

// API Base URL - automatically built from IP and port
export const API_BASE_URL = `http://${SERVER_IP}${SERVER_PORT ? ':' + SERVER_PORT : ''}`;


