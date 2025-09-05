import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TopicView from './pages/TopicView'
import Insights from './pages/Insights'
import Profile from './pages/Profile'
import Landing from './pages/Landing'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          <div className="min-h-screen bg-bg">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/app" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="topic/:topicId" element={<TopicView />} />
                <Route path="insights" element={<Insights />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(210, 36%, 100%)',
                  color: 'hsl(210, 20%, 20%)',
                  border: '1px solid hsl(210, 36%, 90%)',
                  borderRadius: '8px',
                },
              }}
            />
          </div>
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  )
}

export default App