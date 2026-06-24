import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Plus, X } from 'lucide-react';

interface BusinessProfile {
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

interface BotConfigurationEditorProps {
  initialProfile?: BusinessProfile;
  onSave: (profile: BusinessProfile) => Promise<void>;
  isLoading?: boolean;
}

const defaultProfile: BusinessProfile = {
  business_name: '',
  business_role: '',
  personality: [],
  customer_interactions: [],
  answering_guidelines: [],
  not_available_response: '',
  appointments_info: '',
  products_info: '',
  pricing_info: '',
  communication_style: [],
  escalation_guidelines: [],
  business_details: '',
};

export function BotConfigurationEditor({
  initialProfile = defaultProfile,
  onSave,
  isLoading = false,
}: BotConfigurationEditorProps) {
  const [profile, setProfile] = useState<BusinessProfile>(initialProfile);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleBasicFieldChange = (field: keyof Omit<BusinessProfile, 'personality' | 'customer_interactions' | 'answering_guidelines' | 'communication_style' | 'escalation_guidelines'>, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayFieldAdd = (field: 'personality' | 'customer_interactions' | 'answering_guidelines' | 'communication_style' | 'escalation_guidelines', value: string) => {
    if (value.trim()) {
      setProfile(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const handleArrayFieldRemove = (field: 'personality' | 'customer_interactions' | 'answering_guidelines' | 'communication_style' | 'escalation_guidelines', index: number) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      setErrorMessage('');
      await onSave(profile);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save configuration');
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  const ArrayFieldEditor = ({
    label,
    field,
    items,
    placeholder,
  }: {
    label: string;
    field: 'personality' | 'customer_interactions' | 'answering_guidelines' | 'communication_style' | 'escalation_guidelines';
    items: string[];
    placeholder: string;
  }) => {
    const [inputValue, setInputValue] = useState('');

    return (
      <div className="space-y-3">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleArrayFieldAdd(field, inputValue);
                setInputValue('');
              }
            }}
          />
          <Button
            onClick={() => {
              handleArrayFieldAdd(field, inputValue);
              setInputValue('');
            }}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-start justify-between gap-2 p-2 bg-gray-50 rounded border border-gray-200"
            >
              <span className="text-sm flex-1">{item}</span>
              <Button
                onClick={() => handleArrayFieldRemove(field, index)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Bot Configuration</CardTitle>
          <CardDescription>
            Customize your AI bot's personality, guidelines, and business information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="behavior">Behavior</TabsTrigger>
              <TabsTrigger value="responses">Responses</TabsTrigger>
              <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={profile.business_name}
                  onChange={(e) => handleBasicFieldChange('business_name', e.target.value)}
                  placeholder="e.g., Glowmart"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_role">Bot Role Description</Label>
                <Textarea
                  id="business_role"
                  value={profile.business_role}
                  onChange={(e) => handleBasicFieldChange('business_role', e.target.value)}
                  placeholder="e.g., You are a virtual assistant for Glowmart. Your role is to help customers by answering questions about the business..."
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Describe what your bot does and how it helps customers
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_details">Additional Business Details</Label>
                <Textarea
                  id="business_details"
                  value={profile.business_details}
                  onChange={(e) => handleBasicFieldChange('business_details', e.target.value)}
                  placeholder="Add any additional context about your business, such as unique selling points, mission statement, or special policies..."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Behavior Tab */}
            <TabsContent value="behavior" className="space-y-6 mt-6">
              <ArrayFieldEditor
                label="Personality Traits"
                field="personality"
                items={profile.personality}
                placeholder="e.g., Be friendly and professional"
              />

              <ArrayFieldEditor
                label="Customer Interaction Guidelines"
                field="customer_interactions"
                items={profile.customer_interactions}
                placeholder="e.g., Greet customers warmly"
              />

              <ArrayFieldEditor
                label="Communication Style"
                field="communication_style"
                items={profile.communication_style}
                placeholder="e.g., Use clear and simple language"
              />
            </TabsContent>

            {/* Responses Tab */}
            <TabsContent value="responses" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="not_available_response">Response When Information Not Available</Label>
                <Textarea
                  id="not_available_response"
                  value={profile.not_available_response}
                  onChange={(e) => handleBasicFieldChange('not_available_response', e.target.value)}
                  placeholder="e.g., I don't have enough information to answer that. Please contact us directly for assistance."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointments_info">Appointments & Bookings</Label>
                <Textarea
                  id="appointments_info"
                  value={profile.appointments_info}
                  onChange={(e) => handleBasicFieldChange('appointments_info', e.target.value)}
                  placeholder="How should the bot handle appointment and booking requests?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="products_info">Products & Services Information</Label>
                <Textarea
                  id="products_info"
                  value={profile.products_info}
                  onChange={(e) => handleBasicFieldChange('products_info', e.target.value)}
                  placeholder="How should the bot explain your products and services?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricing_info">Pricing Information</Label>
                <Textarea
                  id="pricing_info"
                  value={profile.pricing_info}
                  onChange={(e) => handleBasicFieldChange('pricing_info', e.target.value)}
                  placeholder="How should the bot handle pricing questions?"
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Guidelines Tab */}
            <TabsContent value="guidelines" className="space-y-6 mt-6">
              <ArrayFieldEditor
                label="Answering Guidelines"
                field="answering_guidelines"
                items={profile.answering_guidelines}
                placeholder="e.g., Provide accurate information based on business knowledge"
              />

              <ArrayFieldEditor
                label="Escalation Guidelines"
                field="escalation_guidelines"
                items={profile.escalation_guidelines}
                placeholder="e.g., For urgent matters, provide business contact information"
              />
            </TabsContent>
          </Tabs>

          {/* Status Messages */}
          {saveStatus === 'success' && (
            <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              ✓ Configuration saved successfully
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{errorMessage}</div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              onClick={handleSave}
              disabled={isLoading || saveStatus === 'saving'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saveStatus === 'saving' || isLoading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview System Prompt</CardTitle>
          <CardDescription>
            This is how your configuration will be presented to the AI model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-96 overflow-y-auto font-mono text-sm whitespace-pre-wrap">
            {profile.business_role && `${profile.business_role}\n\n`}
            {profile.personality.length > 0 && (
              <>
                PERSONALITY\n
                {profile.personality.map(p => `• ${p}`).join('\n')}\n\n
              </>
            )}
            {profile.customer_interactions.length > 0 && (
              <>
                CUSTOMER INTERACTIONS\n
                {profile.customer_interactions.map(ci => `• ${ci}`).join('\n')}\n\n
              </>
            )}
            {profile.answering_guidelines.length > 0 && (
              <>
                ANSWERING QUESTIONS\n
                {profile.answering_guidelines.map(ag => `• ${ag}`).join('\n')}\n\n
              </>
            )}
            {profile.communication_style.length > 0 && (
              <>
                COMMUNICATION STYLE\n
                {profile.communication_style.map(cs => `• ${cs}`).join('\n')}\n\n
              </>
            )}
            {profile.escalation_guidelines.length > 0 && (
              <>
                ESCALATION\n
                {profile.escalation_guidelines.map(eg => `• ${eg}`).join('\n')}\n
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BotConfigurationEditor;
