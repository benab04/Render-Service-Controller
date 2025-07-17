import { NextResponse } from "next/server";
import { getServiceMetrics, calculateServiceCost } from "../../../lib/render-api";

export async function GET() {
    try {
        // Fetch both metrics and cost data
        const [metricsData, costData] = await Promise.all([
            getServiceMetrics(),
            calculateServiceCost()
        ]);

        // Convert seconds to hours for display
        const totalHours = (costData.totalActiveSeconds / 3600).toFixed(2);

        // Combine the data
        const response = {
            ...metricsData,
            billing: {
                totalActiveSeconds: costData.totalActiveSeconds,
                totalHours: parseFloat(totalHours),
                totalCost: costData.totalCost
            }
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching service metrics and cost:', error);
        return NextResponse.json(
            { error: "Failed to fetch service metrics and cost data" },
            { status: 500 }
        );
    }
}