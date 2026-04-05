# Ralph Loops - Quick Start Guide

## What Is This?

Ralph Loops let OpenClaw run dozens of tasks back-to-back without babysitting.
- Set it up at 9 PM
- Check results at 9 AM

## Files

```
ralph-loops/
├── ralph.sh              # Main loop script
├── tasks.md              # Your task list (copy from templates/)
├── output/               # Where results go
├── scripts/
│   └── validator.sh      # Quality checker
└── templates/
    ├── tasks-template.md     # Blank template
    ├── tasks-leads.md        # Lead enrichment
    └── tasks-content.md      # Content creation
```

## Quick Start

### 1. Choose Your Template
```bash
# For lead research
cp templates/tasks-leads.md tasks.md

# For content creation  
cp templates/tasks-content.md tasks.md

# For custom tasks
cp templates/tasks-template.md tasks.md
```

### 2. Customize Tasks
Edit `tasks.md` with your actual tasks. Use format:
```
[NOT DONE] Task description -> output/filename.md
```

### 3. Run
```bash
chmod +x ralph.sh
./ralph.sh
```

### 4. Check Results
```bash
ls output/
cat tasks.md  # See final status
```

## Configuration

Set environment variables:
```bash
MAX_LOOPS=50 ./ralph.sh          # Custom loop count
WORKSPACE=./my-project ./ralph.sh # Custom workspace
```

## Integration with Agents

Use Ralph Loops with our agents:
- **Lead Research**: Use with Insight agent
- **Content Creation**: Use with Mercury agent  
- **Competitive Analysis**: Use with Ivy agent

## Guardrails

1. **MAX_LOOPS**: Prevents runaway (default: 50)
2. **Validation**: Check output quality before marking DONE
3. **Logging**: All runs logged to output/ralph-log.txt

## Use Cases

| Use Case | Template | Agent |
|----------|----------|-------|
| Lead enrichment | tasks-leads.md | Insight |
| Content batch | tasks-content.md | Mercury |
| Research | tasks-template.md | Ivy |
| Competitor analysis | tasks-template.md | Ivy |