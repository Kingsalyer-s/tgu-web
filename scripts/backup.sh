#!/bin/sh
# SQLite 定时备份脚本
# 用 sqlite3 .backup 命令做在线一致性备份，避免锁问题
set -e

BACKUP_DIR="/backups"
DB_FILE="/data/data.db"
KEEP_DAYS=7

if [ ! -f "$DB_FILE" ]; then
    echo "[$(date +'%F %T')] ERROR: DB file not found: $DB_FILE"
    exit 1
fi

mkdir -p "$BACKUP_DIR"
TS=$(date +'%Y%m%d-%H%M')
OUT="$BACKUP_DIR/backup-$TS.db"

echo "[$(date +'%F %T')] Backup start → $OUT"
sqlite3 "$DB_FILE" ".backup '$OUT'"
gzip -9 "$OUT"
echo "[$(date +'%F %T')] Backup done: $OUT.gz"

# 清理超过 KEEP_DAYS 天的备份
find "$BACKUP_DIR" -name 'backup-*.db.gz' -mtime +$KEEP_DAYS -delete
echo "[$(date +'%F %T')] Cleaned old backups (> $KEEP_DAYS days)"
