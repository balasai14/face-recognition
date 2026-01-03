import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import Header from './components/common/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import IndividualRegistration from './components/individual/IndividualRegistration';
import IndividualAuthentication from './components/individual/IndividualAuthentication';
import GroupAuthentication from './components/group/GroupAuthentication';
import AttendanceHistory from './components/group/AttendanceHistory';
import CrowdCounter from './components/crowd/CrowdCounter';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <IndividualAuthentication />
                </ProtectedRoute>
              }
            />
            <Route
              path="/individual/register"
              element={
                <ProtectedRoute>
                  <IndividualRegistration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/individual/authenticate"
              element={
                <ProtectedRoute>
                  <IndividualAuthentication />
                </ProtectedRoute>
              }
            />
            <Route
              path="/group/authenticate"
              element={
                <ProtectedRoute>
                  <GroupAuthentication />
                </ProtectedRoute>
              }
            />
            <Route
              path="/group/history"
              element={
                <ProtectedRoute>
                  <AttendanceHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crowd/count"
              element={
                <ProtectedRoute>
                  <CrowdCounter />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
