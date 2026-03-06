# apple-notes

Description: A skill to interact with Apple Notes on macOS via AppleScript/osascript to create, list, and search notes, and optionally sync with external apps.

## Capabilities
- Create a new note in a specified folder or notebook
- List notes in a notebook or folder
- Search notes by keyword
- Update note content (append/prepend)
- Export notes as text

## Requirements
- macOS environment with Apple Notes installed
- Scriptable access to Apple Notes (via AppleScript/osascript)
- Node.js environment in case we expose a CLI wrapper

## Install (conceptual)
- Ensure the workspace is ready for scripts
- No external API keys required

## Usage (conceptual)
- apple-notes create --title "Morning Brief" --body "Weather..."
- apple-notes list --notebook "iCloud" --query "meeting"
- apple-notes search --query "TPS report" --notebook "Work" 

## Notes
- This is a skeleton SKILL for ClawHub/OpenClaw; adapt to your actual macOS automation setup.
