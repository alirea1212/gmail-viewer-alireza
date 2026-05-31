export default defineConfig({
  plugins: [react(), tailwindcss()],

  base: "/alireza1212/",

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
