import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  serverBundles: ({ branch }) => {
    const isApiRoute = branch.some(route => route.id.startsWith("api/"));
    return isApiRoute ? "api" : "default";
  },
} satisfies Config;
