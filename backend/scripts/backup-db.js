const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

class DatabaseBackup {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `backup-${timestamp}.sql`);
    
    try {
      // Export critical tables
      const tables = ['properties', 'payments', 'agreements', 'notifications', 'analytics_cache'];
      
      let backupContent = '';
      
      for (const table of tables) {
        const result = await pool.query(`SELECT * FROM ${table}`);
        backupContent += `-- Table: ${table}\n`;
        backupContent += `COPY ${table} FROM stdin;\n`;
        
        for (const row of result.rows) {
          const values = Object.values(row).map(val => 
            val === null ? '\\N' : String(val).replace(/\n/g, '\\n').replace(/\t/g, '\\t')
          ).join('\t');
          backupContent += values + '\n';
        }
        
        backupContent += '\\.\n\n';
      }

      fs.writeFileSync(backupFile, backupContent);
      logger.info(`Database backup created: ${backupFile}`);
      
      // Clean up old backups (keep last 7 days)
      this.cleanupOldBackups();
      
      return backupFile;
    } catch (error) {
      logger.error('Backup creation failed:', error);
      throw error;
    }
  }

  cleanupOldBackups() {
    const files = fs.readdirSync(this.backupDir)
      .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(this.backupDir, file),
        time: fs.statSync(path.join(this.backupDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    // Keep only the last 7 backups
    const backupsToDelete = files.slice(7);
    
    backupsToDelete.forEach(backup => {
      fs.unlinkSync(backup.path);
      logger.info(`Deleted old backup: ${backup.name}`);
    });
  }
}

module.exports = new DatabaseBackup();

// Run backup if script is called directly
if (require.main === module) {
  const backup = new DatabaseBackup();
  backup.createBackup().then(() => {
    console.log('Backup completed successfully');
    process.exit(0);
  }).catch(error => {
    console.error('Backup failed:', error);
    process.exit(1);
  });
}