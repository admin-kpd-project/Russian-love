import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import 'react-datepicker/dist/react-datepicker.css'
import './styles/index.css'
import './styles/datepicker.css'

// Main entry point for web app

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
