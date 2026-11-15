import { Routes, Route } from 'react-router-dom';
import GlobalLoader from './components/GlobalLoader';
import ProtectedLayout from './components/ProtectedLayout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TestSelectionPage from './pages/TestSelectionPage';
import ChaptersPage from './pages/ChaptersPage';
import QuizSessionPage from './pages/QuizSessionPage';
import PracticeSelectionPage from './pages/PracticeSelectionPage';
import ReviewPage from './pages/ReviewPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

export default function App() {
  return (
    <>
      <GlobalLoader />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/test" element={<TestSelectionPage />} />
          <Route path="/test/:subject" element={<ChaptersPage />} />
          <Route path="/quiz" element={<QuizSessionPage />} />
          <Route path="/practice" element={<PracticeSelectionPage />} />
          <Route path="/practice/session" element={<QuizSessionPage mode="practice" />} />
          <Route path="/review" element={<ReviewPage />} />
        </Route>
      </Routes>
    </>
  );
}
