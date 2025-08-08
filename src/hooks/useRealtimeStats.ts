import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface StatsData {
  totalSignups: number;
  expectedMRR: number;
  averageSubscription: number;
  expectedARR: number;
}

export const useRealtimeStats = () => {
  const [stats, setStats] = useState<StatsData>({
    totalSignups: 0,
    expectedMRR: 0,
    averageSubscription: 0,
    expectedARR: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Efficient function to calculate stats from aggregated data
  const calculateStats = (count: number, totalAmount: number): StatsData => {
    const expectedMRR = totalAmount;
    const averageSubscription = count > 0 ? expectedMRR / count : 0;
    const expectedARR = expectedMRR * 12;

    return {
      totalSignups: count,
      expectedMRR,
      averageSubscription,
      expectedARR
    };
  };

  // Load initial stats with a single aggregated query
  const loadStats = async () => {
    try {
      setError(null);
      
      // Use Supabase's aggregate functions for maximum efficiency
      const { data, error } = await supabase
        .from('pledges')
        .select('count, sum')
        .eq('count', '*')
        .eq('sum', 'monthly_amount')
        .single();

      if (error) {
        // Fallback to regular query if aggregate doesn't work
        const { data: pledges, error: fallbackError } = await supabase
          .from('pledges')
          .select('monthly_amount');

        if (fallbackError) {
          throw fallbackError;
        }

        const count = pledges?.length || 0;
        const totalAmount = pledges?.reduce((sum, pledge) => sum + pledge.monthly_amount, 0) || 0;
        
        setStats(calculateStats(count, totalAmount));
      } else {
        // Use aggregated data if available
        const count = data?.count || 0;
        const totalAmount = data?.sum || 0;
        setStats(calculateStats(count, totalAmount));
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load statistics');
      
      // Set default stats on error
      setStats({
        totalSignups: 0,
        expectedMRR: 0,
        averageSubscription: 0,
        expectedARR: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    // Load initial data
    loadStats();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('pledges-stats')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'pledges'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          // For maximum efficiency, we could calculate the delta
          // but for simplicity and accuracy, we'll reload stats
          loadStats();
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { stats, loading, error, refetch: loadStats };
};