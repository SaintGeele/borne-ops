#!/bin/bash

# === RALPH VALIDATOR ===
# Checks output files after each loop and validates quality
# Updates tasks.md status based on validation results

OUTPUT_DIR="output"
MIN_WORDS=100

echo "=== Ralph Validator ==="

# Get all NOT DONE tasks
not_done=$(grep "\[NOT DONE\]" tasks.md | sed 's/.*-> //' | tr -d ' ')

for task_file in $not_done; do
    echo "Checking: $task_file"
    
    if [ ! -f "$OUTPUT_DIR/$task_file" ]; then
        echo "  ❌ File doesn't exist"
        continue
    fi
    
    # Check word count
    word_count=$(wc -w < "$OUTPUT_DIR/$task_file")
    if [ "$word_count" -lt "$MIN_WORDS" ]; then
        echo "  ⚠️  Too short ($word_count words, need $MIN_WORDS)"
        continue
    fi
    
    # Check for placeholders
    if grep -qi "TODO\|TBD\|placeholder\|fill in" "$OUTPUT_DIR/$task_file"; then
        echo "  ⚠️  Contains placeholders"
        continue
    fi
    
    echo "  ✅ Validated ($word_count words)"
done

echo "=== Validation Complete ==="