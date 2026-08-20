import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ResumeBuilder from './pages/ResumeBuilder';
import AIGenerator from './pages/AIGenerator';
import CoverLetter from './pages/CoverLetter';
import Portfolio from './pages/Portfolio';
import SavedDocuments from './pages/SavedDocuments';
import './styles/global.css';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/profile', label: 'Profile', icon: '👤' },
  { path: '/resume-builder', label: 'Resume Builder', icon: '📄' },
  { path: '/ai-generator', label: 'AI Generator', icon: '🤖' },
  { path: '/cover-letter', label: 'Cover Letter', icon: '✉️' },
  { path: '/portfolio', label: 'Portfolio', icon: '🌐' },
  { path: '/saved-documents', label: 'Saved Docs', icon: '💾' },
];

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-layout">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <span className="logo-icon">📄</span>
              <div>
                <div className="logo-title">AI Resume</div>
                <div className="logo-sub">Portfolio Builder</div>
              </div>
            </div>
          </div>
          <nav className="sidebar-nav">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="sidebar-footer-text">College Project v1.0</div>
          </div>
        </aside>

        {/* Main content */}
        <div className="main-wrapper">
          <header className="top-bar">
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
              ☰
            </button>
            <div className="top-bar-title">AI Resume &amp; Portfolio Builder</div>
          </header>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/ai-generator" element={<AIGenerator />} />
              <Route path="/cover-letter" element={<CoverLetter />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/saved-documents" element={<SavedDocuments />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
