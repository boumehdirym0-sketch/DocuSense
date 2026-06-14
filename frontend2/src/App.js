import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './responsive.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Quiz from './pages/Quiz'
import Landing from './pages/Landing'
import EndUser from './pages/EndUser'
import Admin from './pages/Admin'

const Private = ({ children }) => {
  const token = sessionStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

const AdminOnly = ({ children }) => {
  const token = sessionStorage.getItem('token')
  const role = sessionStorage.getItem('role')
  return token && role === 'admin' ? children : <Navigate to="/login" replace />
}

const AutoRedirect = () => {
  const token = sessionStorage.getItem('token')
  const role = sessionStorage.getItem('role')
  if (token) return <Navigate to={role === 'admin' ? '/admin' : role === 'enduser' ? '/enduser' : '/dashboard'} replace />
  return <Landing />
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AutoRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
        <Route path="/quiz" element={<Private><Quiz /></Private>} />
        <Route path="/enduser" element={<Private><EndUser /></Private>} />
        <Route path="/admin" element={<AdminOnly><Admin /></AdminOnly>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App