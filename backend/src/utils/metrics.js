class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        byEndpoint: {},
        byStatus: {}
      },
      authentication: {
        successful: 0,
        failed: 0,
        averageTime: 0
      },
      mlServices: {
        individual: { calls: 0, avgTime: 0, errors: 0 },
        group: { calls: 0, avgTime: 0, errors: 0 },
        crowd: { calls: 0, avgTime: 0, errors: 0 }
      },
      database: {
        queries: 0,
        avgQueryTime: 0,
        errors: 0
      }
    };
  }

  recordRequest(endpoint, statusCode) {
    this.metrics.requests.total++;
    
    if (!this.metrics.requests.byEndpoint[endpoint]) {
      this.metrics.requests.byEndpoint[endpoint] = 0;
    }
    this.metrics.requests.byEndpoint[endpoint]++;

    if (!this.metrics.requests.byStatus[statusCode]) {
      this.metrics.requests.byStatus[statusCode] = 0;
    }
    this.metrics.requests.byStatus[statusCode]++;
  }

  recordAuthentication(success, duration) {
    if (success) {
      this.metrics.authentication.successful++;
    } else {
      this.metrics.authentication.failed++;
    }

    const total = this.metrics.authentication.successful + this.metrics.authentication.failed;
    this.metrics.authentication.averageTime = 
      (this.metrics.authentication.averageTime * (total - 1) + duration) / total;
  }

  recordMLServiceCall(service, duration, error = false) {
    const serviceMetrics = this.metrics.mlServices[service];
    if (!serviceMetrics) return;

    serviceMetrics.calls++;
    if (error) {
      serviceMetrics.errors++;
    }

    serviceMetrics.avgTime = 
      (serviceMetrics.avgTime * (serviceMetrics.calls - 1) + duration) / serviceMetrics.calls;
  }

  recordDatabaseQuery(duration, error = false) {
    this.metrics.database.queries++;
    if (error) {
      this.metrics.database.errors++;
    }

    this.metrics.database.avgQueryTime = 
      (this.metrics.database.avgQueryTime * (this.metrics.database.queries - 1) + duration) / 
      this.metrics.database.queries;
  }

  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };
  }

  reset() {
    this.metrics = {
      requests: { total: 0, byEndpoint: {}, byStatus: {} },
      authentication: { successful: 0, failed: 0, averageTime: 0 },
      mlServices: {
        individual: { calls: 0, avgTime: 0, errors: 0 },
        group: { calls: 0, avgTime: 0, errors: 0 },
        crowd: { calls: 0, avgTime: 0, errors: 0 }
      },
      database: { queries: 0, avgQueryTime: 0, errors: 0 }
    };
  }
}

module.exports = new MetricsCollector();
