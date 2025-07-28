import './LandingPage.css';
import Footer from '../components/Footer';
import Header from '../components/Header';

function LandingPage() {
  return (
    <div className="app page-root">
      <Header />
      <main className="main-content">
        <div className="hero-section">
          <h1>Welcome to NextStep</h1>
          <p>Your comprehensive job application management system. Track applications, organize your job search, and analyze your progress all in one place.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;