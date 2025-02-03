// "http://localhost:3000/api/v1/telemetry/logs"

// src/index.ts
import { MonitoringConfig } from "./config";
import { MonitoringMiddleware } from "./middleware";

export function initMonitoring(config: MonitoringConfig): MonitoringMiddleware {
  return new MonitoringMiddleware(config);
}

export default initMonitoring;
