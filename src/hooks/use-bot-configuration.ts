import { useCallback, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSupabase } from '@/integrations/supabase/use-supabase';

export interface BusinessProfile {
  business_name: string;
  business_role: string;
  personality: string[];
  customer_interactions: string[];
  answering_guidelines: string[];
  not_available_response: string;
  appointments_info: string;
  products_info: string;
  pricing_info: string;
  communication_style: string[];
  escalation_guidelines: string[];
  business_details: string;
}

export interface AIBot {
  id: string;
  user_id: string;
  name: string;
  prompt: string;
  business_profile?: BusinessProfile;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useBotConfiguration() {
  const { user } = useAuth();
  const { client } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBotById = useCallback(
    async (botId: string): Promise<AIBot | null> => {
      if (!client) return null;
      try {
        setLoading(true);
        setError(null);
        const { data, error: err } = await client
          .from('ai_bots')
          .select('*')
          .eq('id', botId)
          .eq('user_id', user?.id)
          .single();

        if (err) throw err;
        return data as AIBot;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch bot';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, user?.id]
  );

  const listBots = useCallback(
    async (): Promise<AIBot[]> => {
      if (!client || !user?.id) return [];
      try {
        setLoading(true);
        setError(null);
        const { data, error: err } = await client
          .from('ai_bots')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (err) throw err;
        return (data || []) as AIBot[];
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch bots';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, user?.id]
  );

  const saveBotProfile = useCallback(
    async (botId: string, name: string, businessProfile: BusinessProfile): Promise<AIBot> => {
      if (!client || !user?.id) throw new Error('Not authenticated');
      try {
        setLoading(true);
        setError(null);

        // Build a readable prompt from the business profile for backward compatibility
        const prompt = buildPromptFromProfile(businessProfile);

        const { data, error: err } = await client
          .from('ai_bots')
          .update({
            name,
            business_profile: businessProfile,
            prompt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', botId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (err) throw err;
        return data as AIBot;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save bot profile';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, user?.id]
  );

  const createBot = useCallback(
    async (name: string, businessProfile: BusinessProfile): Promise<AIBot> => {
      if (!client || !user?.id) throw new Error('Not authenticated');
      try {
        setLoading(true);
        setError(null);

        const prompt = buildPromptFromProfile(businessProfile);

        const { data, error: err } = await client
          .from('ai_bots')
          .insert({
            user_id: user.id,
            name,
            business_profile: businessProfile,
            prompt,
            is_active: false,
          })
          .select()
          .single();

        if (err) throw err;
        return data as AIBot;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create bot';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, user?.id]
  );

  const deleteBot = useCallback(
    async (botId: string): Promise<void> => {
      if (!client || !user?.id) throw new Error('Not authenticated');
      try {
        setLoading(true);
        setError(null);

        const { error: err } = await client
          .from('ai_bots')
          .delete()
          .eq('id', botId)
          .eq('user_id', user.id);

        if (err) throw err;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete bot';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, user?.id]
  );

  const toggleBotActive = useCallback(
    async (botId: string, isActive: boolean): Promise<AIBot> => {
      if (!client || !user?.id) throw new Error('Not authenticated');
      try {
        setLoading(true);
        setError(null);

        const { data, error: err } = await client
          .from('ai_bots')
          .update({
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', botId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (err) throw err;
        return data as AIBot;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to toggle bot';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, user?.id]
  );

  return {
    loading,
    error,
    getBotById,
    listBots,
    saveBotProfile,
    createBot,
    deleteBot,
    toggleBotActive,
  };
}

/**
 * Helper function to build a readable prompt from a business profile
 * This maintains backward compatibility with the simple prompt field
 */
function buildPromptFromProfile(profile: BusinessProfile): string {
  const sections: string[] = [];

  if (profile.business_role) {
    sections.push(profile.business_role);
  }

  if (profile.personality && profile.personality.length > 0) {
    sections.push('\nPERSONALITY');
    sections.push(profile.personality.map((p) => `• ${p}`).join('\n'));
  }

  if (profile.customer_interactions && profile.customer_interactions.length > 0) {
    sections.push('\nCUSTOMER INTERACTIONS');
    sections.push(profile.customer_interactions.map((ci) => `• ${ci}`).join('\n'));
  }

  if (profile.answering_guidelines && profile.answering_guidelines.length > 0) {
    sections.push('\nANSWERING QUESTIONS');
    sections.push(profile.answering_guidelines.map((ag) => `• ${ag}`).join('\n'));
  }

  if (profile.not_available_response) {
    sections.push('\nWHEN INFORMATION IS NOT AVAILABLE');
    sections.push(`If you do not have enough information to answer a question, respond with:\n"${profile.not_available_response}"\n`);
    sections.push('Do not guess, assume, or make up information.');
  }

  if (profile.appointments_info) {
    sections.push('\nAPPOINTMENTS AND BOOKINGS');
    sections.push(profile.appointments_info);
  }

  if (profile.products_info) {
    sections.push('\nPRODUCTS AND SERVICES');
    sections.push(profile.products_info);
  }

  if (profile.pricing_info) {
    sections.push('\nPRICING');
    sections.push(profile.pricing_info);
  }

  if (profile.communication_style && profile.communication_style.length > 0) {
    sections.push('\nCOMMUNICATION STYLE');
    sections.push(profile.communication_style.map((cs) => `• ${cs}`).join('\n'));
  }

  if (profile.escalation_guidelines && profile.escalation_guidelines.length > 0) {
    sections.push('\nESCALATION');
    sections.push(profile.escalation_guidelines.map((eg) => `• ${eg}`).join('\n'));
  }

  if (profile.business_details) {
    sections.push('\nBUSINESS DETAILS');
    sections.push(`Business Name: ${profile.business_name}`);
    sections.push(profile.business_details);
  }

  return sections.join('\n');
}
