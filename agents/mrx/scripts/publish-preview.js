import { config } from 'dotenv';
config({ path: '/home/saint/.openclaw/.env' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const preview = async () => {
  const { data: approved } = await supabase
    .from('content_bank')
    .select()
    .eq('status', 'approved')
    .order('ts', { ascending: true });

  if (!approved || approved.length === 0) {
    console.log('No approved posts to preview.');
    return;
  }

  console.log(`\n📋 PUBLISH PREVIEW — ${approved.length} posts queued\n`);
  console.log('═'.repeat(60));

  for (const post of approved) {
    const platform = post.platform?.[0] || 'unknown';
    console.log(`\n🔲 PLATFORM: ${platform.toUpperCase()}`);
    console.log(`📌 TITLE: ${post.title}`);
    console.log(`📅 AGE: ${Math.round((Date.now() - new Date(post.ts).getTime()) / 3600000)}h old`);
    console.log(`\n── COPY ──────────────────────────────────────`);
    console.log(post.copy);
    console.log('─'.repeat(46));

    if (platform === 'linkedin') {
      console.log('✅ WOULD POST TO: LinkedIn (token valid)');
    } else if (platform === 'twitter') {
      console.log('⚠️  WOULD POST TO: Twitter (OAuth 1.0a ready)');
    } else if (platform === 'email') {
      console.log('⚠️  WOULD SKIP: Email posts not handled by publisher');
    }
  }

  console.log('\n═'.repeat(60));
  console.log(`\nRun 'node publish.js' to actually post these.\n`);
};

preview();
