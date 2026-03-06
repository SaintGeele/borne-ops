# Daily Memory Template - Notion Integration

## Template Structure for Daily Memory Collection

### Template ID: daily-memory-v1
**Name**: "Daily Memory Entry for {{date}}"
**Database**: 31726a63-e141-802a-84ea-d6bde1693d28 (OpenClaw Memory System)

---

## Block Templates

### 1. Header Block
```notion-block
📅 Daily Memory - {{today}} [Session: {{session_id}}]
Priority: {{priority_level}} | Context: {{context_tags}}
```

### 2. Morning Checkpoint
```notion-block
🌅 **Morning Focus**
- Top 3 tasks: [task_1, task_2, task_3]
- SAP status: {{sap_check}}
- Weather: {{weather_report}}
```

### 3. Academic Progress
```notion-block
📚 **Academic Updates**
- Study blocks completed: {{study_blocks}}
- Assignment status: {{assignments}}
- Technical insight: {{technical_note}}
```

### 4. Evening Reflection
```notion-block
🌙 **Evening Reflection**  
- Wins: {{accomplishments}}
- Blockers: {{challenges}}
- Tomorrow priorities: {{next_actions}}
```

### 5. Technical Integrations
```notion-block
🔧 **OpenClaw Integration Test**
- Memory stored: {{date}}
- This entry permanent in:
  → Notion database
  → Cross-platform accessible
  → Revision history available
```

---

## Usage Commands

### Template Usage
```bash
# Create daily memory entry
node notion-memory.js add "Daily Memory 03-02: [Academic] SAP appeal progress + study system" "daily,academic,priority" "memory" "3"

# Morning checkpoint
node activate-memory.js
```

### Daily Memory Entry Format
**Template variables auto-replace:**
- {{date}} → YYYY-MM-DD
- {{today}} → Monday, March 2nd
- {{session_id}} → agent:main:telegram:direct
- {{priority_level}} → 1-5 scale
- {{context_tags}} → academic, professional, etc.

---

## Daily Memory Schema
```json
{
  "title": "Daily Memory {{date}}",
  "icon": "📅",
  "properties": {
    "Date": "{{today}}",
    "Session": "{{session_id}}",
    "Focus": "{{ focus_area }}",
    "Success": "{{ success_metrics }}",
    "Next": "{{ tomorrow_focus }}"
  }
}
```

---

## Quick Daily Script

Create the following command alias for daily memory entries:

```bash
# Add to ~/.bashrc or ~/.zshrc
function daily-memory() {
  cd ~/.openclaw/workspace
  today=$(date '+%Y-%m-%d')
  node notion-memory.js add "Daily Memory $today: $1" "daily,academic" "memory" "3"
}

# Usage
# daily-memory "SAP appeal progress + work on CSCI 185 assignment"
```