import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Sparkles } from 'lucide-react';
import { supabase, type Pledge } from './lib/supabase';
import AnimatedBackground from './components/AnimatedBackground';
import RoundBadge from './components/RoundBadge';
import StatsCard from './components/StatsCard';
import SignupForm from './components/SignupForm';
import ResultsCard from './components/ResultsCard';
import './styles/arc-design-system.css';
import { playSuccessSound } from './utils/sound';

function App() {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('12');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [triggerBadgeSpin, setTriggerBadgeSpin] = useState(false);

  // Load pledges from Supabase on mount
  useEffect(() => {
    loadPledges();
  }, []);

  const loadPledges = async () => {
    try {
      const { data, error } = await supabase
        .from('pledges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading pledges:', error);
        return;
      }

      setPledges(data || []);
    } catch (error) {
      console.error('Error loading pledges:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !monthlyAmount || parseFloat(monthlyAmount) <= 0 || hasSubmitted) return;

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('pledges')
        .insert([
          {
            name: name.trim(),
            monthly_amount: parseFloat(monthlyAmount)
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error submitting pledge:', error);
        alert('There was an error submitting your pledge. Please try again.');
        return;
      }

      // Add the new pledge to the beginning of the list
      setPledges(prev => [data, ...prev]);
      
      setName('');
      setMonthlyAmount('12');
      setShowSuccess(true);
      setShowSuccessAnimation(true);
      setHasSubmitted(true);
      
      // Trigger badge spin animation with slight delay for smoother start
      setTimeout(() => {
        setTriggerBadgeSpin(true);
      }, 50);
      
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
    } catch (error) {
      console.error('Error submitting pledge:', error);
      alert('There was an error submitting your pledge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSignups = pledges.length;
  const expectedMRR = pledges.reduce((sum, pledge) => sum + pledge.monthly_amount, 0);
  const averageSubscription = totalSignups > 0 ? expectedMRR / totalSignups : 0;
  const expectedARR = expectedMRR * 12;

  if (loading) {
    return (
      <div className="arc-app">
        <AnimatedBackground />
        <div className="arc-container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '50vh',
            color: 'var(--arc-text-secondary)'
          }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

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
          <ResultsCard pledges={pledges} />
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

        {/* Footer */}
        <footer className="arc-footer">
          <p>This is an independent community project, not affiliated with The Browser Company.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;