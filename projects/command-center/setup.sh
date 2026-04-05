#!/bin/bash
# Command Center Setup Script

set -e

echo "🛠️  Setting up Command Center..."

# 1. Create Next.js project
echo "📦 Initializing Next.js..."
npx create-next-app@latest command-center \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git \
  --yes

cd command-center

# 2. Install dependencies
echo "📚 Installing dependencies..."
npm install @supabase/supabase-js @supabase/ssr
npm install stripe @google/youtube axios
npm install date-fns recharts lucide-react
npm install @anthropic-ai/sdk

# 3. Copy middleware
echo "🔒 Setting up middleware..."
cp ../src/middleware.ts ./src/

# 4. Setup env
echo "⚙️  Setting up environment..."
cp ../.env.example .env.local

# 5. Supabase setup reminder
echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create Supabase project: https://supabase.com"
echo "2. Run schema: cp supabase/schema.sql . && run in SQL Editor"
echo "3. Fill in .env.local with your API keys"
echo "4. npm run dev"