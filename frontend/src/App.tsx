import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/common/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { SharePage } from './pages/SharePage';
import { ReceivePage } from './pages/ReceivePage';
import { FilesPage } from './pages/FilesPage';
import { HistoryPage } from './pages/HistoryPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/share" element={<SharePage />} />
        <Route path="/receive" element={<ReceivePage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
