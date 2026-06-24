import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BotConfigurationEditor from '@/components/BotConfigurationEditor';
import { useBotConfiguration, type BusinessProfile, type AIBot } from '@/hooks/use-bot-configuration';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { DEFAULT_BOT_TEMPLATE } from '@/supabase/functions/shared/bot-template';

/**
 * Example page for managing AI Bot configuration
 * Shows how to integrate BotConfigurationEditor with the backend
 */
export function BotSettingsPage() {
  const { botId } = useParams<{ botId: string }>();
  const [bot, setBot] = useState<AIBot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getBotById, saveBotProfile, loading: apiLoading } = useBotConfiguration();

  // Load bot configuration on mount
  useEffect(() => {
    async function loadBot() {
      if (!botId) return;
      try {
        setLoading(true);
        setError(null);
        const botData = await getBotById(botId);
        setBot(botData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load bot';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadBot();
  }, [botId, getBotById]);

  const handleSave = async (profile: BusinessProfile) => {
    if (!botId || !bot) throw new Error('Bot ID is required');
    
    try {
      const updatedBot = await saveBotProfile(botId, bot.name, profile);
      setBot(updatedBot);
      console.log('Bot configuration saved:', updatedBot);
    } catch (err) {
      console.error('Failed to save bot configuration:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bot configuration...</p>
        </div>
      </div>
    );
  }

  if (error || !bot) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Bot not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bots
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Configure Bot: {bot.name}</h1>
          <p className="text-gray-600 mt-2">
            Customize your bot's personality, guidelines, and business information
          </p>
        </div>

        <BotConfigurationEditor
          initialProfile={bot.business_profile || DEFAULT_BOT_TEMPLATE}
          onSave={handleSave}
          isLoading={apiLoading}
        />

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tip</h3>
          <p className="text-sm text-blue-800">
            Your bot configuration is now much more detailed! These settings will shape how your AI bot responds to customers across all conversations. Make sure to test your bot after making changes to ensure it behaves as expected.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Example page for creating a new bot
 */
export function CreateBotPage() {
  const { createBot } = useBotConfiguration();
  const [botName, setBotName] = useState('');
  const [template, setTemplate] = useState<BusinessProfile>(DEFAULT_BOT_TEMPLATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!botName.trim()) {
      setError('Bot name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newBot = await createBot(botName, template);
      // Redirect to the bot settings page
      window.location.href = `/bots/${newBot.id}/settings`;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create bot';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Bot</h1>
          <p className="text-gray-600 mt-2">
            Set up a new AI bot with detailed business configuration
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bot Name
              </label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="e.g., Glowmart Customer Service"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleCreate}
              disabled={loading || !botName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create Bot'}
            </Button>
          </div>
        </div>

        <BotConfigurationEditor
          initialProfile={template}
          onSave={async (profile) => {
            setTemplate(profile);
          }}
          isLoading={false}
        />
      </div>
    </div>
  );
}

/**
 * Example: Displaying bot templates for users to choose from
 */
export function BotTemplateShowcase() {
  const templates = [
    {
      name: 'Customer Service',
      description: 'Professional customer support bot',
      icon: '🎯',
      template: DEFAULT_BOT_TEMPLATE,
    },
    {
      name: 'Sales Assistant',
      description: 'Product sales and inquiry bot',
      icon: '💼',
      template: {
        ...DEFAULT_BOT_TEMPLATE,
        business_role: 'You are a sales assistant. Help customers discover products and answer their questions.',
      },
    },
    {
      name: 'Support Specialist',
      description: 'Technical support and troubleshooting',
      icon: '🔧',
      template: {
        ...DEFAULT_BOT_TEMPLATE,
        business_role: 'You are a technical support specialist. Help customers troubleshoot issues.',
      },
    },
    {
      name: 'Appointment Scheduler',
      description: 'Booking and scheduling assistant',
      icon: '📅',
      template: {
        ...DEFAULT_BOT_TEMPLATE,
        business_role: 'You are an appointment scheduling assistant. Help customers book services and appointments.',
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((template) => (
        <div
          key={template.name}
          className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="text-3xl mb-2">{template.icon}</div>
          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
          <p className="text-sm text-gray-600 mb-4">{template.description}</p>
          <Button className="w-full" variant="outline">
            Use Template
          </Button>
        </div>
      ))}
    </div>
  );
}

export default BotSettingsPage;
