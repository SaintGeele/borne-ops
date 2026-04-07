# NotebookLM Study Buddy

## What It Does

AI study assistant that transforms notes, papers, and lecture materials into audio learning content, quizzes, and structured study guides. Multi-modal learning through audio, flashcards, and active recall.

## Quick Start

```bash
# Install
clawhub install notebooklm-study-buddy

# Activate
/study --source "lecture-notes.pdf" --mode "audio|flashcards|quiz"
```

## Commands

| Command | Description |
|---------|-------------|
| `/study --source <file> --mode audio` | Convert notes to audio podcast |
| `/study --source <file> --mode flashcards` | Generate flashcard deck |
| `/study --source <file> --mode quiz` | Create practice quiz |
| `/study --schedule --topics <list>` | Create spaced repetition schedule |

## Configuration

- `NOTEBOOKLM_API_KEY` — NotebookLM API key (get from makersuite.google.com)
- `STUDY_OUTPUT_DIR` — where to save generated content
- `AUDIO_VOICE` — voice preference for audio output

## Output

- **Audio mode**: MP3 podcast-style summary of material (15-20 min)
- **Flashcard mode**: Anki-compatible .apkg file with spaced repetition
- **Quiz mode**: Multiple choice and free recall questions with answer key
- **Schedule mode**: Optimized study calendar based on exam date and topic difficulty

## Use Cases

- Converting lecture recordings to audio for commute learning
- Generating flashcards from textbook chapters
- Practice exams before test dates
- Summarizing academic papers for literature reviews
- Audio summaries of meeting notes

## Notes

- Best results with text-based sources (PDF, markdown, txt)
- Audio quality improves with structured notes
- Spaced repetition scheduling based on SM-2 algorithm
- Integrates with Anki for flashcard review
