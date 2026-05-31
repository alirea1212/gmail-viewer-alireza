export default defineConfig({
  plugins: [react(), tailwindcss()],

  base: "/gmail-viewer-alireza/",

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
