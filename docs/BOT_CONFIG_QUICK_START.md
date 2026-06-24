# AI Bot Configuration - Quick Start Guide

## For Users: Getting Started with AI Bot Configuration

### Step 1: Create a New Bot
1. Navigate to the Bots section
2. Click "Create New Bot"
3. Enter your bot name (e.g., "Glowmart Customer Service")
4. Click "Create Bot"

### Step 2: Fill in Basic Information
1. Go to the **Basic Info** tab
2. Enter your **Business Name** (e.g., "Glowmart")
3. Write a clear **Bot Role Description** explaining what your bot does
4. Add **Business Details** (optional but recommended)

Example:
```
Bot Role: "You are a virtual assistant for Glowmart, a premium beauty and skincare retailer. Your role is to help customers by answering questions about our products, services, pricing, policies, store hours, and appointments."
```

### Step 3: Define Bot Personality
1. Go to the **Behavior** tab
2. Add **Personality Traits** (click + to add items)
   - "Be friendly and warm"
   - "Respond conversationally"
   - "Keep answers concise"
3. Add **Customer Interaction Guidelines**
   - "Greet customers warmly"
   - "Thank customers for their interest"
4. Add **Communication Style**
   - "Use clear, simple language"
   - "Avoid jargon"
   - "Use bullet points for lists"

### Step 4: Set Response Guidelines
1. Go to the **Responses** tab
2. Define how to respond when **Information Not Available**
3. Add guidelines for **Appointments & Bookings**
4. Add guidelines for **Products & Services**
5. Add guidelines for **Pricing**

### Step 5: Add Advanced Guidelines
1. Go to the **Guidelines** tab
2. Add **Answering Guidelines** for common questions
3. Add **Escalation Guidelines** for when to involve humans

Example Escalation:
```
"For urgent matters, provide the business phone number"
"If customer is frustrated, acknowledge their feelings and offer to escalate"
```

### Step 6: Review and Save
1. Scroll down to see the **Preview System Prompt**
2. Verify it looks correct
3. Click **Save Configuration**
4. You'll see a success message

## For Developers: Integration Guide

### Setup Steps

#### 1. Run Database Migration
```bash
supabase migration up
```

This adds the `business_profile` JSONB column to the `ai_bots` table.

#### 2. Import Components
```typescript
import BotConfigurationEditor from '@/components/BotConfigurationEditor';
import { useBotConfiguration } from '@/hooks/use-bot-configuration';
import { DEFAULT_BOT_TEMPLATE } from '@/supabase/functions/shared/bot-template';
```

#### 3. Use in Pages
```typescript
import BotSettingsPage from '@/pages/BotSettings';

// In your router
<Route path="/bots/:botId/settings" element={<BotSettingsPage />} />
```

#### 4. Backend Integration
```typescript
import { buildDetailedRagPrompt, buildDetailedGreetingPrompt } from "./shared/prompt-builder.ts";

// In your bot response handler
const bot = await supabase
  .from('ai_bots')
  .select('*')
  .eq('id', botId)
  .single();

if (isGreeting(message)) {
  const prompt = buildDetailedGreetingPrompt({
    question: message,
    memory: conversationHistory,
    businessProfile: bot.data.business_profile,
  });
} else {
  const prompt = buildDetailedRagPrompt({
    question: message,
    chunks: ragResults,
    memory: conversationHistory,
    businessProfile: bot.data.business_profile,
  });
}
```

### File Structure
```
src/
├── components/
│   └── BotConfigurationEditor.tsx      # Main UI component
├── hooks/
│   └── use-bot-configuration.ts        # React hook for API calls
├── pages/
│   └── BotSettings.tsx                 # Example pages
└── integrations/
    └── supabase/
        └── types.ts                    # Update types if needed

supabase/
├── functions/
│   ├── shared/
│   │   ├── bot-template.ts            # Template definitions
│   │   └── prompt-builder.ts          # Prompt building functions
│   └── [your-function]/
│       └── index.ts                   # Use buildDetailedRagPrompt here
└── migrations/
    └── 20260624000000_...              # Business profile column
```

## Types Reference

### BusinessProfile
```typescript
interface BusinessProfile {
  business_name: string;                    // Your business name
  business_role: string;                    // What the bot does
  personality: string[];                    // Personality traits
  customer_interactions: string[];          // How to interact
  answering_guidelines: string[];           // Answer guidelines
  not_available_response: string;           // When info missing
  appointments_info: string;                // Appointment handling
  products_info: string;                    // Product explanations
  pricing_info: string;                     // Pricing guidelines
  communication_style: string[];            // Communication rules
  escalation_guidelines: string[];          // Escalation rules
  business_details: string;                 // Additional context
}
```

## Common Scenarios

### Scenario 1: Migrating Existing Bot
```typescript
// Old bot
const oldBot = {
  name: "Support Bot",
  prompt: "You are a support bot. Answer questions."
};

// Convert to new format
const newBot = {
  ...oldBot,
  business_profile: {
    business_name: "Your Company",
    business_role: "You are a support bot for Your Company...",
    personality: ["Be helpful", "Be professional"],
    // ... other fields
  }
};
```

### Scenario 2: Using Templates
```typescript
import { DEFAULT_BOT_TEMPLATE, BOT_TEMPLATE_EXAMPLE } from '@/supabase/functions/shared/bot-template';

// Start with default
const profile = DEFAULT_BOT_TEMPLATE;

// Customize
profile.business_name = "My Business";
profile.personality.push("Be more casual");

// Or use specific example
const glowmartProfile = BOT_TEMPLATE_EXAMPLE;
```

### Scenario 3: Custom Template for Your Business Type
```typescript
const eCommerceTemplate: BusinessProfile = {
  business_name: "Your Store",
  business_role: "You are a shopping assistant for [store]. Help customers find products...",
  personality: [
    "Be enthusiastic about products",
    "Be helpful with product recommendations",
  ],
  products_info: "Describe products with features, sizes, colors, and availability",
  pricing_info: "Always provide accurate prices and mention any current discounts",
  // ... etc
};
```

## Testing

### Manual Testing
1. Create a test bot with your business profile
2. Send test messages to verify:
   - Greeting responses are friendly
   - Product questions get good answers
   - Escalation works when appropriate
   - Communication style matches your profile

### Automated Testing
```typescript
import { buildDetailedRagPrompt } from "./shared/prompt-builder.ts";

test("prompt includes business details", () => {
  const profile = {
    business_name: "Test Business",
    // ... other fields
  };
  
  const prompt = buildDetailedRagPrompt({
    question: "Hi",
    chunks: [],
    memory: [],
    businessProfile: profile,
  });
  
  expect(prompt).toContain("Test Business");
});
```

## Troubleshooting

### Bot not using custom configuration
- Check if `business_profile` is populated in database
- Verify backend is using `buildDetailedRagPrompt` with `businessProfile`
- Ensure bot is marked as `is_active`

### Configuration not saving
- Check console for errors
- Verify user is authenticated
- Ensure RLS policies allow updates

### Prompt looks wrong in preview
- Check for typos in fields
- Ensure arrays have items (empty arrays won't show)
- Review the documentation for field purposes

## Support

For issues or questions:
1. Check `docs/AI_BOT_CONFIGURATION_GUIDE.md` for detailed field descriptions
2. Review `docs/BOT_TEMPLATE_IMPLEMENTATION.md` for technical details
3. Check example in `src/pages/BotSettings.tsx`
4. Review tests and examples in the codebase

## Next Steps

1. ✅ Set up database migration
2. ✅ Integrate components into your app
3. ✅ Test with your business data
4. ✅ Gather user feedback
5. ✅ Iterate and improve templates
6. ✅ Consider building custom templates for different business types
