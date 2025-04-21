import { defineConfig } from "vitepress";

export default defineConfig({
    title: "PGTrinity",
    description: "Cache, queue and realtime communication using only PostgreSQL",
    head: [["link", { rel: "stylesheet", href: "/theme/custom.css" }]],
    themeConfig: {
        nav: [
            { text: "Home", link: "/" },
            { text: "GitHub", link: "https://github.com/ditadi/pgtrinity" },
        ],
    },
});
