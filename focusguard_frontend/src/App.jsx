import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Streaks from './pages/Streaks';
import Squads from './pages/Squads';
import Navbar from './components/common/Navbar';
import Subjects from './pages/Subjects';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  return <div><Navbar />{children}</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {[
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/reports', element: <Reports /> },
          { path: '/settings', element: <Settings /> },
          { path: '/subjects', element: <Subjects /> },
          { path: '/streaks', element: <Streaks /> },
          { path: '/squads', element: <Squads /> },
        ].map(({ path, element }) => (
          <Route key={path} path={path} element={
            <ProtectedRoute><Layout>{element}</Layout></ProtectedRoute>
          } />
        ))}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
