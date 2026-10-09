export default defineAppConfig({
  pages: ["pages/feed/index", "pages/studio/index"],
  window: {
    navigationStyle: "custom",
    backgroundColor: "#f4f3ed",
    backgroundTextStyle: "dark"
  },
  networkTimeout: {
    request: 120000,
    connectSocket: 20000,
    uploadFile: 60000,
    downloadFile: 60000
  },
  lazyCodeLoading: "requiredComponents",
  sitemapLocation: "sitemap.json"
});
