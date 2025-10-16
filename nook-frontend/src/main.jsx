 /* SETTING UP A REACT PROJECT
 *
 * STEP 1: Create your React project
 *    - run npm create vite@latest . -- --template vanilla
 *    - When it asks questions, just press Enter for each one
 *
 * STEP 2: Install React 
 *    - run npm install react react-dom @vitejs/plugin-react
 *
 * STEP 3: check config file
 *    - vite.config.js
 *    - Open it and paste this code:
 *
 *      import { defineConfig } from 'vite'
 *      import react from '@vitejs/plugin-react'
 *      export default defineConfig({
 *        plugins: [react()],
 *      })
 *
 */


// Import React library
import React from 'react'
import ReactDOM from 'react-dom/client'

// Import React Router for navigation between pages
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Import your pages
import Home from './screens/Home.jsx'
import OrderPage from './screens/OrderPage.jsx'
import AboutPage from './screens/AboutPage.jsx'
import MenuPage from './screens/MenuPage.jsx'
import ContactPage from './screens/ContactPage.jsx'

// Import CSS styles for the application
import './style.css'

/**
 * Main App Component with Router Setup
 * This sets up the different pages (routes) for the website
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Home page route - shows when user visits "/" */}
        <Route path="/" element={<Home />} />

        {/* Order page route */}
        <Route path="/order" element={<OrderPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
      </Routes>
    </Router>
  );
}


// Create a React root
// This finds the HTML element with id="app" and prepares it for React rendering
const root = ReactDOM.createRoot(document.getElementById('app'))

// Render the App component into the root element
// React.StrictMode is a wrapper that helps catch common bugs during development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)