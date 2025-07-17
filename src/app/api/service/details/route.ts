import { NextResponse } from "next/server";
import { getServiceDetails } from "@/app/lib/render-api";

export async function GET() {
    try {
        const data = await getServiceDetails();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch service details" },
            { status: 500 }
        );
    }
}
