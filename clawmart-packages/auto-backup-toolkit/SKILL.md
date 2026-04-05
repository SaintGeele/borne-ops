# SKILL.md - Auto-Backup Toolkit

## Description
Automated backup solution for databases and files with S3 and Backblaze B2 support.

## Commands
- "Run backup now"
- "List backup jobs"
- "Check backup status"
- "Restore from backup [timestamp]"

## Configuration
- BACKUP_DESTINATION: s3 or backblaze
- AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (for S3)
- BACKBLAZE_BUCKET, BACKBLAZE_KEY_ID, BACKBLAZE_APP_KEY
- RETENTION_DAYS: 30 (default)

## Execution
1. MySQL/PostgreSQL dump via mysqldump/pg_dump
2. File backup via tar + gzip
3. Docker volume backup via docker run --rm
4. Upload to destination with timestamp
5. Clean old backups exceeding retention

## Presets
- Database: MySQL, PostgreSQL
- Files: /home, /var/www, /opt
- Docker: volume list from docker volume ls