import type { WebSocket } from "ws";
import type { ModelInfo, TokenUsage, WorkerClass } from "./protocol.js";

export interface ConnectedWorker {
  workerId: string;
  ws: WebSocket;
  userId: string;
  workerClass: WorkerClass;
  model: ModelInfo | null;
  connectedAt: number;
  lastHeartbeat: number;
}

export interface PendingJob {
  jobId: string;
  workerId: string;
  requesterId: string | null;
  onToken: (token: string) => void;
  onDone: (usage: TokenUsage) => void;
  onError: (message: string) => void;
}

/** Process-local registry of live worker connections and in-flight jobs. */
class Registry {
  private workers = new Map<string, ConnectedWorker>();
  private jobs = new Map<string, PendingJob>();

  addWorker(worker: ConnectedWorker): void {
    this.workers.set(worker.workerId, worker);
  }

  removeWorker(workerId: string): void {
    this.workers.delete(workerId);
    // Fail any jobs still bound to this worker.
    for (const [jobId, job] of this.jobs) {
      if (job.workerId === workerId) {
        job.onError("Worker disconnected");
        this.jobs.delete(jobId);
      }
    }
  }

  getWorker(workerId: string): ConnectedWorker | undefined {
    return this.workers.get(workerId);
  }

  touch(workerId: string): void {
    const w = this.workers.get(workerId);
    if (w) w.lastHeartbeat = Date.now();
  }

  all(): ConnectedWorker[] {
    return [...this.workers.values()];
  }

  onlineForUser(userId: string): ConnectedWorker[] {
    return this.all().filter((w) => w.userId === userId);
  }

  counts(): { total: number; native: number; browser: number } {
    const all = this.all();
    return {
      total: all.length,
      native: all.filter((w) => w.workerClass === "native").length,
      browser: all.filter((w) => w.workerClass === "browser").length,
    };
  }

  addJob(job: PendingJob): void {
    this.jobs.set(job.jobId, job);
  }

  getJob(jobId: string): PendingJob | undefined {
    return this.jobs.get(jobId);
  }

  removeJob(jobId: string): void {
    this.jobs.delete(jobId);
  }

  queuedCount(): number {
    return this.jobs.size;
  }
}

export const registry = new Registry();
