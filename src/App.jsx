import { useApp } from './context/AppContext.jsx';
import Loader from './components/Loader.jsx';
import Navbar from './components/Navbar.jsx';
import Breadcrumbs from './components/Breadcrumbs.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SubjectSelection from './pages/SubjectSelection.jsx';
import PracticeSelection from './pages/PracticeSelection.jsx';
import QuizPage from './pages/QuizPage.jsx';
import ReviewPage from './pages/ReviewPage.jsx';
import StartQuizModal from './components/StartQuizModal.jsx';
import RevisionTestModal from './components/RevisionTestModal.jsx';

export default function App() {
  const { view, authLoading } = useApp();

  return (
    <>
      <Loader hidden={!authLoading} />
      <Navbar />
      <Breadcrumbs />
      {!authLoading && view === 'home' && <AuthPage />}
      {!authLoading && view === 'dashboard' && <Dashboard />}
      {!authLoading && view === 'subjects' && <SubjectSelection />}
      {!authLoading && view === 'chapters' && <SubjectSelection />}
      {!authLoading && view === 'practice' && <PracticeSelection />}
      {!authLoading && view === 'quiz' && <QuizPage />}
      {!authLoading && view === 'review' && <ReviewPage />}
      <StartQuizModal />
      <RevisionTestModal />
    </>
  );
}
