const BASE_URL = 'https://api.render.com/v1';

// Cost calculation constants
const MONTHLY_COST = 7;
const SECONDS_IN_MONTH = 30 * 24 * 60 * 60; // Approximation for 30-day month
const COST_PER_SECOND = MONTHLY_COST / SECONDS_IN_MONTH;

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const headers = {
        'Authorization': `Bearer ${process.env.RENDER_API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
}

export async function getServiceDetails() {
    return fetchWithAuth(`/services/${process.env.RENDER_SERVICE_ID}`);
}

export async function getServiceMetrics(resolutionSeconds = '60') {
    return fetchWithAuth(`/metrics/cpu?resolutionSeconds=${resolutionSeconds}&resource=${process.env.RENDER_SERVICE_ID}`);
}

export async function getServiceEventLogs() {
    return fetchWithAuth(`/services/${process.env.RENDER_SERVICE_ID}/events?startTime=2025-06-01T00:00:00Z&limit=100`);
}

export async function suspendService() {
    return fetchWithAuth(`/services/${process.env.RENDER_SERVICE_ID}/suspend`, {
        method: 'POST',
    });
}

export async function resumeService() {
    return fetchWithAuth(`/services/${process.env.RENDER_SERVICE_ID}/resume`, {
        method: 'POST',
    });
}

function parseTimestamp(ts: string): number {
    return new Date(ts).getTime() / 1000; // Convert to seconds since epoch
}

export function calculateCost(logs: any[]): { totalActiveSeconds: number; totalCost: string } {
    // Sort logs by timestamp
    const events = logs.map(e => ({
        type: e.event.type,
        time: parseTimestamp(e.event.timestamp),
    })).sort((a, b) => a.time - b.time);

    let activePeriods: { start: number; end: number }[] = [];
    let lastResumeTime: number | null = null;

    for (const event of events) {
        if (event.type === 'service_resumed') {
            lastResumeTime = event.time;
        } else if (event.type === 'service_suspended' && lastResumeTime !== null) {
            activePeriods.push({ start: lastResumeTime, end: event.time });
            lastResumeTime = null;
        }
    }

    // If service is currently running (lastResumeTime set and not closed)
    if (lastResumeTime !== null) {
        activePeriods.push({ start: lastResumeTime, end: Date.now() / 1000 });
    }

    // Calculate total active time
    let totalActiveSeconds = 0;
    for (const period of activePeriods) {
        totalActiveSeconds += (period.end - period.start);
    }

    const totalCost = totalActiveSeconds * COST_PER_SECOND;

    return {
        totalActiveSeconds,
        totalCost: totalCost.toFixed(4), // round to 4 decimal places
    };
}

// Helper function to get cost calculation from event logs
export async function calculateServiceCost(): Promise<{ totalActiveSeconds: number; totalCost: string }> {
    try {
        const logs = await getServiceEventLogs();
        return calculateCost(logs);
    } catch (error) {
        console.error('Error calculating service cost:', error);
        throw error;
    }
}

