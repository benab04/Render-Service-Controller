import { NextResponse } from "next/server";
import { resumeService } from "../../../lib/render-api";

export async function POST() {
    try {
        const data = await resumeService();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to resume service" },
            { status: 500 }
        );
    }
}
