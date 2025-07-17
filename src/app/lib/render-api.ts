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
    const startDate = new Date('2025-06-01T00:00:00Z');
    const today = new Date();
    const allLogs = [];

    // Get the first day of the current month
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let currentDate = new Date(startDate);

    while (currentDate <= today) {
        // Calculate the end of the current month or today, whichever is earlier
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
        const endDate = endOfMonth > today ? today : endOfMonth;

        // Format dates for API call
        const startTime = currentDate.toISOString();
        const endTime = endDate.toISOString();

        try {
            const monthlyLogs = await fetchWithAuth(
                `/services/${process.env.RENDER_SERVICE_ID}/events?startTime=${startTime}&endTime=${endTime}&limit=100`
            );

            // Add the monthly logs to the combined array
            if (monthlyLogs && Array.isArray(monthlyLogs)) {
                allLogs.push(...monthlyLogs);
            }
        } catch (error) {
            console.error(`Failed to fetch logs for ${currentDate.toISOString().slice(0, 7)}:`, error);
            // Continue with other months even if one fails
        }

        // Move to the first day of the next month
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    return allLogs;
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

