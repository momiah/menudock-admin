// /admin (and anything under it) is the admin console; everything else is the site.
export const isAdminPath = (pathname) => pathname === "/admin" || pathname.startsWith("/admin/");
