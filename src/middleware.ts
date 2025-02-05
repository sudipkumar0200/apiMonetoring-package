// src/middleware.ts
import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { MonitoringConfig } from "./config";

/**
 * MonitoringMiddleware class.
 *
 * This class captures API request metrics (route, method, responseTime, statusCode)
 * and, after each response, sends a log to the configured SaaS platform.
 */
export class MonitoringMiddleware {
  private config: MonitoringConfig;
  private logQueue: any[] = [];
  private intervalId: NodeJS.Timeout; // Store the interval ID

  constructor(config: MonitoringConfig) {
    this.config = config;
    const interval = config.batchInterval || 5000;
    // Set up periodic flushing of queued logs.
    this.intervalId = setInterval(() => {
      this.flushLogs();
    }, interval);
  }

  /**
   * Express middleware function that captures request metrics.
   */
  public middleware(mockRequest: unknown, mockResponse: Response<any, Record<string, any>>, mockNext: unknown) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const start = Date.now();

      res.on("finish", async () => {
        const duration = Date.now() - start;

        // Prepare log data with the required authentication details
        const logData = {
          apiToken: this.config.apiToken,
          userId: this.config.userId,
          route: req.originalUrl,
          method: req.method,
          responseTime: duration,
          statusCode: res.statusCode,
        };

        this.logQueue.push(logData);
      });

      next();
    };
  }

  /**
   * Flushes queued logs to the SaaS logging endpoint.
   */
  private async flushLogs(): Promise<void> {
    if (this.logQueue.length === 0) return;
    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    try {
      await axios.post(
        this.config.loggingServerUrl,
        { logs: logsToSend },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error sending logs:", error);
      // Optionally, re-queue logs if sending fails.
      this.logQueue = logsToSend.concat(this.logQueue);
    }
  }
  public cleanup() {
    clearInterval(this.intervalId);
  }
}
