import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Sparkles } from 'lucide-react';
import AnimatedBackground from './components/AnimatedBackground';
import RoundBadge from './components/RoundBadge';
import StatsCard from './components/StatsCard';
import SignupForm from './components/SignupForm';
import ResultsCard from './components/ResultsCard';
import './styles/arc-design-system.css';
import { playSuccessSound } from './utils/sound';

interface Signup {
  id: string;
  name: string;
  monthlyAmount: number;
  timestamp: number;
}

function App() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [name, setName] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('12');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [triggerBadgeSpin, setTriggerBadgeSpin] = useState(false);

  // Load signups and submission status from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('arc-petition-signups');
    if (saved) {
      setSignups(JSON.parse(saved));
    }
  }, []);

  // Scroll to top on page load/reload
  useEffect(() => {
    // Disable browser's scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Force scroll to top immediately and after a small delay
    window.scrollTo(0, 0);
    
    // Additional scroll to top after DOM is fully rendered
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Save to localStorage whenever signups change
  useEffect(() => {
    localStorage.setItem('arc-petition-signups', JSON.stringify(signups));
  }, [signups]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !monthlyAmount || parseFloat(monthlyAmount) <= 0 || hasSubmitted) return;

    setIsSubmitting(true);
    
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const newSignup: Signup = {
      id: Date.now().toString(),
      name: name.trim(),
      monthlyAmount: parseFloat(monthlyAmount),
      timestamp: Date.now()
    };

    setSignups(prev => [...prev, newSignup]);
    setName('');
    setMonthlyAmount('12');
    setIsSubmitting(false);
    setShowSuccess(true);
    setShowSuccessAnimation(true);
    setHasSubmitted(true);
    
    // Trigger badge spin animation with slight delay for smoother start
    setTimeout(() => {
      setTriggerBadgeSpin(true);
    }, 50);
    
    // Do not persist submission lock to allow resubmits after refresh during testing

    // Subtle success chime
    playSuccessSound();

    // Stop badge spin after 2 seconds (plus the 50ms delay)
    setTimeout(() => {
      setTriggerBadgeSpin(false);
    }, 2050);

    setTimeout(() => {
      setShowSuccess(false);
      setShowSuccessAnimation(false);
    }, 3000);
  };

  const totalSignups = signups.length;
  const expectedMRR = signups.reduce((sum, signup) => sum + signup.monthlyAmount, 0);
  const averageSubscription = totalSignups > 0 ? expectedMRR / totalSignups : 0;
  const expectedARR = expectedMRR * 12;

  return (
    <div className="arc-app">
      <AnimatedBackground />
      <RoundBadge triggerSpin={triggerBadgeSpin} />
      
      <div className="arc-container">
        {/* Hero Section */}
        <header className="arc-hero">
          
          <h1 className="arc-hero__title">
            Keep Arc Alive
          </h1>
          
          <p className="arc-hero__subtitle">
            Let's show The Browser Company that Arc users are willing to pay to save the browser we love.
          </p>
        </header>

        {/* Stats Grid */}
        <section className={`arc-stats-grid ${showSuccessAnimation ? 'arc-stats-grid--success' : ''}`}>
          <StatsCard
            icon={Users}
            label="Pledged Users"
            value={totalSignups.toLocaleString()}
          />
          <StatsCard
            icon={DollarSign}
            label="Price Suggestion"
            value={`$${averageSubscription.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          />
          <StatsCard
            icon={TrendingUp}
            label="Projected MRR"
            value={`$${expectedMRR.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          />
          <StatsCard
            icon={Sparkles}
            label="Projected ARR"
            value={`$${expectedARR.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          />
        </section>

        {/* Main Form or Results */}
        {hasSubmitted ? (
          <ResultsCard signups={signups} />
        ) : (
          <SignupForm
            name={name}
            monthlyAmount={monthlyAmount}
            isSubmitting={isSubmitting}
            showSuccess={showSuccess}
            onNameChange={setName}
            onAmountChange={setMonthlyAmount}
            onSubmit={handleSubmit}
          />
        )}

        {/* Recent Signups removed by request */}

        {/* Footer */}
        <footer className="arc-footer">
          <p>This is an independent community project, not affiliated with The Browser Company.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;