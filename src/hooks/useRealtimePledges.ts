import { useState, useEffect } from 'react';
import { supabase, type Pledge } from '../lib/supabase';

export const useRealtimePledges = () => {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load pledges with optimized query
  const loadPledges = async () => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('pledges')
        .select('id, name, monthly_amount, created_at')
        .order('created_at', { ascending: false })
        .limit(50); // Limit for performance, show recent pledges

      if (error) {
        throw error;
      }

      setPledges(data || []);
    } catch (err) {
      console.error('Error loading pledges:', err);
      setError('Failed to load pledges');
      setPledges([]);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription for pledges list
  useEffect(() => {
    // Load initial data
    loadPledges();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('pledges-list')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pledges'
        },
        (payload) => {
          console.log('New pledge received:', payload);
          
          // Add new pledge to the beginning of the list
          const newPledge = payload.new as Pledge;
          setPledges(prev => [newPledge, ...prev.slice(0, 49)]); // Keep only 50 most recent
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pledges'
        },
        (payload) => {
          console.log('Pledge updated:', payload);
          
          // Update existing pledge
          const updatedPledge = payload.new as Pledge;
          setPledges(prev => 
            prev.map(pledge => 
              pledge.id === updatedPledge.id ? updatedPledge : pledge
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'pledges'
        },
        (payload) => {
          console.log('Pledge deleted:', payload);
          
          // Remove deleted pledge
          const deletedPledge = payload.old as Pledge;
          setPledges(prev => 
            prev.filter(pledge => pledge.id !== deletedPledge.id)
          );
        }
      )
      .subscribe((status) => {
        console.log('Pledges real-time subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { pledges, loading, error, refetch: loadPledges };
};