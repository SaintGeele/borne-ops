# AI Co-pilot MVP Specification

## Product
**Name:** Borne AI Co-pilot (working title)
**Pitch:** "Your startup wingman: builds LLCs, drafts pitches, and finds customers while you sleep."

## Target Audience
Solo founders, solopreneurs, side-hustlers ages 25-45 launching their first business

## MVP Features (Phase 1)

### 1. Chat Interface
- Clean, modern chat UI
- Message history
- Typing indicators
- Quick action buttons

### 2. Business Idea Validator
- Ask questions about user's idea
- Market size estimation
- Competition analysis
- Feasibility score

### 3. LLC Formation Guide
- Step-by-step Wyoming LLC guide
- Document checklist
- EIN application help
- Operating agreement template

### 4. Pitch Deck Generator
- Problem statement
- Solution
- Market size
- Business model
- Team (if applicable)
- Ask

### 5. Marketing Copy Templates
- Cold email templates
- Cold call scripts
- Social media bios
- Service descriptions

## Tech Stack
- **Frontend:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **LLM:** OpenRouter (gpt-4o-mini for cost)
- **State:** React useState + Context
- **Deployment:** Vercel (free tier)

## Pages
1. `/` - Landing page with CTA
2. `/app` - Main chat interface
3. `/app/idea` - Idea validation
4. `/app/llc` - LLC guide
5. `/app/pitch` - Pitch generator
6. `/app/marketing` - Copy templates

## Prompt Structure

### System Prompt
"You are a startup co-pilot helping first-time entrepreneurs. You're practical, action-oriented, and give specific steps rather than theory."

### Feature Prompts
- idea-validation: "Ask questions about their business idea..."
- llc-guide: "Provide step-by-step Wyoming LLC formation..."
- pitch-deck: "Generate a pitch deck outline with..."
- marketing: "Create [type] copy for [business]..."

## Success Metrics
- User signups (Day 1 goal: 10)
- Messages per session (target: 5+)
- Feature usage distribution

## Timeline
- Day 1: Project setup + chat UI
- Day 2: LLM integration
- Day 3: Feature prompts
- Day 4: Styling + polish
- Day 5: Deploy + test

## Next Action
Create Next.js project and set up basic chat UI