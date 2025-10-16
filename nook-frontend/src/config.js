// API Configuration
// Change the IP address here to use in different buildings

// CHANGE THIS IP ADDRESS FOR DIFFERENT LOCATIONS:
const SERVER_IP = 'localhost';  // Change to your server's IP address
const SERVER_PORT = '3013';

// API Base URL - automatically built from IP and port
export const API_BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}`;

// Examples for different buildings:
// const SERVER_IP = '192.168.1.100';     // Same building/network
// const SERVER_IP = '203.45.67.89';      // Different building (public IP)
// const SERVER_IP = 'nookserver.com';    // Using domain name
