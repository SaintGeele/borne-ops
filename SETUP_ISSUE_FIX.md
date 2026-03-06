# Run these commands to fix the setup:

1. Create directory:
   mkdir -p ~/.config/last30days

2. Create the env file:
   cat > $HOME/.config/last30days/.env << 'EOF'
# last30days-skill environment variables
OPENAI_API_KEY=sk-your-key-here
BRAVE_API_KEY=your-brave-key-here
EOF

3. Set permissions:
   chmod 600 $HOME/.config/last30days/.env

# After adding your keys, test:
python3 ~/.openclaw/workspace/skills/last30days/scripts/last30days.py "SAP appeal strategies"