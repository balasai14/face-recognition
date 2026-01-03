const AttendanceRecord = require('../models/AttendanceRecord');
const CrowdCountRecord = require('../models/CrowdCountRecord');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

class DataRetentionService {
  constructor() {
    this.attendanceRetentionMonths = 12;
    this.auditLogRetentionMonths = 24;
    this.crowdCountRetentionMonths = 12;
  }

  async cleanupOldRecords() {
    try {
      logger.info('Starting data retention cleanup...');

      const results = {
        attendanceRecords: 0,
        crowdCountRecords: 0,
        auditLogs: 0
      };

      // Cleanup attendance records older than 12 months
      const attendanceCutoff = new Date();
      attendanceCutoff.setMonth(attendanceCutoff.getMonth() - this.attendanceRetentionMonths);

      const attendanceResult = await AttendanceRecord.deleteMany({
        timestamp: { $lt: attendanceCutoff }
      });
      results.attendanceRecords = attendanceResult.deletedCount;

      // Cleanup crowd count records older than 12 months
      const crowdCutoff = new Date();
      crowdCutoff.setMonth(crowdCutoff.getMonth() - this.crowdCountRetentionMonths);

      const crowdResult = await CrowdCountRecord.deleteMany({
        timestamp: { $lt: crowdCutoff }
      });
      results.crowdCountRecords = crowdResult.deletedCount;

      // Cleanup audit logs older than 24 months
      const auditCutoff = new Date();
      auditCutoff.setMonth(auditCutoff.getMonth() - this.auditLogRetentionMonths);

      const auditResult = await AuditLog.deleteMany({
        timestamp: { $lt: auditCutoff }
      });
      results.auditLogs = auditResult.deletedCount;

      logger.info('Data retention cleanup completed', results);

      return results;
    } catch (error) {
      logger.error(`Data retention cleanup error: ${error.message}`);
      throw error;
    }
  }

  async archiveOldRecords() {
    try {
      logger.info('Starting data archival...');

      // Archive records older than 6 months but within retention period
      const archiveCutoff = new Date();
      archiveCutoff.setMonth(archiveCutoff.getMonth() - 6);

      const retentionCutoff = new Date();
      retentionCutoff.setMonth(retentionCutoff.getMonth() - this.attendanceRetentionMonths);

      // Find records to archive
      const recordsToArchive = await AttendanceRecord.find({
        timestamp: {
          $gte: retentionCutoff,
          $lt: archiveCutoff
        },
        archived: { $ne: true }
      });

      // Mark as archived (in production, might move to separate collection or storage)
      for (const record of recordsToArchive) {
        record.archived = true;
        await record.save();
      }

      logger.info(`Archived ${recordsToArchive.length} attendance records`);

      return { archived: recordsToArchive.length };
    } catch (error) {
      logger.error(`Data archival error: ${error.message}`);
      throw error;
    }
  }

  async getRetentionStats() {
    try {
      const now = new Date();

      // Count records by age
      const stats = {
        attendanceRecords: {
          total: await AttendanceRecord.countDocuments(),
          last30Days: await AttendanceRecord.countDocuments({
            timestamp: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
          }),
          last6Months: await AttendanceRecord.countDocuments({
            timestamp: { $gte: new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000) }
          }),
          last12Months: await AttendanceRecord.countDocuments({
            timestamp: { $gte: new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000) }
          })
        },
        crowdCountRecords: {
          total: await CrowdCountRecord.countDocuments(),
          last30Days: await CrowdCountRecord.countDocuments({
            timestamp: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
          })
        },
        auditLogs: {
          total: await AuditLog.countDocuments(),
          last30Days: await AuditLog.countDocuments({
            timestamp: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
          })
        }
      };

      return stats;
    } catch (error) {
      logger.error(`Get retention stats error: ${error.message}`);
      throw error;
    }
  }

  scheduleCleanup() {
    // Run cleanup daily at 2 AM
    const schedule = require('node-schedule');

    schedule.scheduleJob('0 2 * * *', async () => {
      logger.info('Running scheduled data retention cleanup');
      try {
        await this.cleanupOldRecords();
      } catch (error) {
        logger.error('Scheduled cleanup failed', error);
      }
    });

    logger.info('Data retention cleanup scheduled (daily at 2 AM)');
  }
}

module.exports = new DataRetentionService();
