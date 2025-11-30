import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Home page (index route)
  index("routes/home.tsx"),

  // Other routes
  route("gallery", "routes/gallery.tsx"),
  route("book", "routes/book.tsx"),

  route("*", "routes/notfound.tsx"),
] satisfies RouteConfig;
