import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from "react"
import ReactDOM from "react-dom/client"
import './index.css'
import App from './App.tsx'
import {GaugeConfigProvider} from "./context/GaugeConfigContext"

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        {/* 2. Wrap App so all children can read the config */}
        <GaugeConfigProvider>
            <App />
        </GaugeConfigProvider>
    </StrictMode>
)
