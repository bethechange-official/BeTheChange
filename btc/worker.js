export default {
  async fetch(request, env) {
    const assets = env.ASSETS ?? env.__STATIC_CONTENT;
    if (assets) {
      return assets.fetch(request);
    }
    return new Response("Not found", { status: 404 });
  },
};
