-- Enhanced AI bot template with detailed business configuration
-- Adds structured business profile fields for more detailed bot customization

alter table public.ai_bots add column if not exists business_profile jsonb default jsonb_build_object(
  'business_name', '',
  'business_role', '',
  'personality', jsonb_build_array(),
  'customer_interactions', jsonb_build_array(),
  'answering_guidelines', jsonb_build_array(),
  'not_available_response', '',
  'appointments_info', '',
  'products_info', '',
  'pricing_info', '',
  'communication_style', jsonb_build_array(),
  'escalation_guidelines', jsonb_build_array(),
  'business_details', ''
);

-- Add index for faster queries
create index if not exists ai_bots_user_id_active_idx on public.ai_bots(user_id, is_active);

-- Add comment to document the structure
comment on column public.ai_bots.business_profile is 'Structured business profile for detailed bot configuration including personality, guidelines, and business details';
