const TRACKING_STORAGE_KEY = 'aeo:tracking-job';

export interface TrackingJob {
  jobId: string;
  brandId: string;
  startedAt: number;
}

export function saveTrackingJob(job: TrackingJob) {
  try {
    localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(job));
  } catch {}
}

export function loadTrackingJob(): TrackingJob | null {
  try {
    const raw = localStorage.getItem(TRACKING_STORAGE_KEY);
    if (!raw) return null;
    const job = JSON.parse(raw) as TrackingJob;
    if (Date.now() - job.startedAt > 10 * 60 * 1000) {
      localStorage.removeItem(TRACKING_STORAGE_KEY);
      return null;
    }
    return job;
  } catch {
    return null;
  }
}

export function clearTrackingJob() {
  try {
    localStorage.removeItem(TRACKING_STORAGE_KEY);
  } catch {}
}
