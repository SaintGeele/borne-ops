# Mission Control Deployment Notes

## Supabase Key Rotation — Required Steps

Anytime the Supabase anon key is rotated, update BOTH locations:

1. `/home/saint/.openclaw/.env` → `SUPABASE_ANON_KEY=<new_key>`
2. `/home/saint/.openclaw/workspace/services/mission-control/index.html` → line 700: `const SB_KEY='<new_key>';`

Mission Control is internal only (Tailscale). The RLS policies allow full read access via the anon key — this is intentional and correct for the internal threat model.
