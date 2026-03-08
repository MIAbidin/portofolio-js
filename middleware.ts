export { default as middleware } from "next-auth/middleware";

export const config = {
  matcher: [
    "/admin/dashboard/:path*", 
    "/admin/projects/:path*", 
    "/admin/experiences/:path*", 
    "/admin/skills/:path*", 
    "/admin/messages/:path*", 
    "/admin/settings/:path*"
  ],
};