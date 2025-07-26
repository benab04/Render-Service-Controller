import { NextResponse } from "next/server";
import { resumeService } from "../../../lib/render-api";

export async function POST() {
    try {
        if (process.env.SERVICE_ACCESS_DISABLED === "true") {
            return NextResponse.json(
                { error: "Service access is currently disabled" },
                { status: 403 }
            );
        }
        const data = await resumeService();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to resume service" },
            { status: 500 }
        );
    }
}
