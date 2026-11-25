(() => {
    "use strict";

    const CONTENT_URL = "content/site.json";

    function getValue(object, path) {
        return path
            .split(".")
            .reduce(
                (value, key) =>
                    value && value[key] !== undefined
                        ? value[key]
                        : undefined,
                object
            );
    }

    function applyContent(content) {
        document.querySelectorAll("[data-content]").forEach(
            (element) => {
                const value = getValue(
                    content,
                    element.dataset.content
                );

                if (typeof value === "string") {
                    element.textContent = value;
                }
            }
        );

        document.querySelectorAll("[data-image]").forEach(
            (image) => {
                const value = getValue(
                    content,
                    image.dataset.image
                );

                if (typeof value === "string" && value) {
                    image.src = value;
                }
            }
        );

        document.querySelectorAll("[data-email]").forEach(
            (link) => {
                const email = getValue(
                    content,
                    link.dataset.email
                );

                if (typeof email === "string" && email) {
                    link.textContent = email;
                    link.href = `mailto:${email}`;
                }
            }
        );

        const root = document.documentElement;
        const theme = content.theme || {};

        if (theme.background) {
            root.style.setProperty(
                "--background",
                theme.background
            );
        }

        if (theme.foreground) {
            root.style.setProperty(
                "--foreground",
                theme.foreground
            );
        }

        if (theme.muted) {
            root.style.setProperty(
                "--muted",
                theme.muted
            );
        }

        if (theme.accent) {
            root.style.setProperty(
                "--accent",
                theme.accent
            );
        }

        if (theme.surface) {
            root.style.setProperty(
                "--surface",
                theme.surface
            );
        }

        window.siteContent = content;

        document.dispatchEvent(
            new CustomEvent("site:content-ready", {
                detail: content
            })
        );
    }

    async function loadContent() {
        try {
            const response = await fetch(
                `${CONTENT_URL}?v=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Content request failed: ${response.status}`
                );
            }

            const content = await response.json();

            applyContent(content);
        } catch (error) {
            console.error(
                "Não foi possível carregar o conteúdo:",
                error
            );

            document.dispatchEvent(
                new CustomEvent("site:content-ready", {
                    detail: null
                })
            );
        }
    }

    loadContent();
})();