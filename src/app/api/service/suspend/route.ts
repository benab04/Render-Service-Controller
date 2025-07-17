import { NextResponse } from "next/server";
import { suspendService } from "../../../lib/render-api";

export async function POST() {
    try {
        const data = await suspendService();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to suspend service" },
            { status: 500 }
        );
    }
}
