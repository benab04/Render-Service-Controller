export { default } from "next-auth/middleware";

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/api/service/:path*"
    ]
};
