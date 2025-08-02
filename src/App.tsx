import { Routes, Route, useLocation } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Navbar } from './components/Navbar'
import Dashboard from './pages/Dashboard'
import CreateEntry from './pages/CreateEntry'
import AllEntries from './pages/AllEntries'
import SearchResults from './pages/SearchResults'
import Settings from './pages/Settings'
import Tags from './pages/Tags'
import Notebooks from './pages/Notebooks'
import NotebookDetails from './pages/NotebookDetails'
import Login from './pages/Login'
import './App.css'

export default function App(){
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  
  return (
    <div className="min-h-screen">
      {!isLoginPage && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/entries" element={<ProtectedRoute><AllEntries /></ProtectedRoute>} />
        <Route path="/entries/new" element={<ProtectedRoute><CreateEntry /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/tags" element={<ProtectedRoute><Tags /></ProtectedRoute>} />
        <Route path="/notebooks" element={<ProtectedRoute><Notebooks /></ProtectedRoute>} />
        <Route path="/notebooks/:id" element={<ProtectedRoute><NotebookDetails /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}
