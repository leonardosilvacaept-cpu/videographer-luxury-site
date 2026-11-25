(() => {
    "use strict";
    if (
    "scrollRestoration" in history
) {
    history.scrollRestoration =
        "manual";
}

    const section = document.querySelector(".scroll-film");
    const canvas = document.querySelector("#hero-sequence");
    const context = canvas
        ? canvas.getContext("2d", {
              alpha: false,
              desynchronized: true
          })
        : null;

    const fallingFrame =
        document.querySelector("#falling-frame");

    const loader =
        document.querySelector("#sequence-loader");

    const loaderProgress =
        document.querySelector(
            "#sequence-loader-progress"
        );

    const loaderText =
        document.querySelector(
            "#sequence-loader-text"
        );
        const siteLoader =
    document.querySelector(
        "#site-loader"
    );

const siteLoaderSymbol =
    document.querySelector(
        "#site-loader-symbol"
    );

const siteLoaderLabel =
    document.querySelector(
        "#site-loader-label"
    );

const siteLoaderProgress =
    document.querySelector(
        "#site-loader-progress"
    );

const siteLoaderPercentage =
    document.querySelector(
        "#site-loader-percentage"
    );

document.body.classList.add(
    "site-loading"
);
        const landingFrame =
    document.querySelector(
        "#transition-landing"
    );
    const transitionSection =
    document.querySelector(
        ".transition-section"
    );

const transitionVideo =
    document.querySelector(
        "#transition-background-video"
    );

    let settings = null;
    let frames = [];
    let loadedFrames = 0;
   let currentFrame = -1;
let displayedFrame = 0;
let targetFrame = 0;
let rafId = null;
let sequenceAnimationId = null;
let failedFrames = 0;

    function clamp(value, minimum = 0, maximum = 1) {
        return Math.min(
            maximum,
            Math.max(minimum, value)
        );
    }

    function range(value, start, end) {
        return clamp(
            (value - start) /
            (end - start)
        );
    }

    function easeOutCubic(value) {
        return 1 - Math.pow(1 - value, 3);
    }

    function easeInCubic(value) {
        return value * value * value;
    }
    

    function framePath(index) {
        const number = String(
            index + settings.firstFrame
        ).padStart(
            settings.digits,
            "0"
        );

        return (
            `${settings.frameFolder}/` +
            `${settings.framePrefix}` +
            `${number}.` +
            `${settings.frameExtension}`
        );
    }

    function loadFrame(index) {
        if (frames[index]) {
            return Promise.resolve(true);
        }

        return new Promise((resolve) => {
            const image = new Image();

            image.decoding = "async";
            image.src = framePath(index);

            image.onload = () => {
                frames[index] = image;
                loadedFrames += 1;
                const sitePercentage =
    Math.round(
        (
            loadedFrames /
            settings.frameCount
        ) *
        100
    );

updateSiteLoader(
    loadedFrames + failedFrames
);

                const percentage = Math.round(
                    (loadedFrames /
                        settings.frameCount) *
                        100
                );

                if (loaderProgress) {
                    loaderProgress.style.width =
                        `${percentage}%`;
                }

                if (loaderText) {
                    loaderText.textContent =
                        `Loading ${percentage}%`;
                }

                if (index === 0) {
                    resizeCanvas();
                    drawFrame(0);
                    section.classList.add("is-ready");
                }

                const processedFrames =
    loadedFrames +
    failedFrames;

if (
    processedFrames ===
    settings.frameCount
) {
    if (loader) {
        loader.style.opacity = "0";
    }

    updateSiteLoader(
        settings.frameCount
    );

    if (siteLoaderLabel) {
        siteLoaderLabel.textContent =
            "Press play";
    }

    if (siteLoader) {
        siteLoader.classList.add(
            "is-ready-to-play"
        );
    }

    /*
    O Play fica visível por um instante,
    antes de a experiência começar.
    */

    window.setTimeout(
        () => {
            if (siteLoader) {
                siteLoader.classList.add(
                    "is-complete"
                );
            }

            document.body.classList.remove(
                "site-loading"
            );
        },
        1400
    );
}

                resolve(true);
            };

            image.onerror = () => {
                console.warn(
                    "Frame não encontrado:",
                    image.src
                );
                failedFrames += 1;

const processedFrames =
    loadedFrames +
    failedFrames;

updateSiteLoader(
    processedFrames
);

if (
    processedFrames ===
    settings.frameCount
) {
    if (siteLoaderLabel) {
        siteLoaderLabel.textContent =
            "Press play";
    }

    if (siteLoader) {
        siteLoader.classList.add(
            "is-ready-to-play"
        );
    }

    window.setTimeout(
        () => {
            if (siteLoader) {
                siteLoader.classList.add(
                    "is-complete"
                );
            }

            document.body.classList.remove(
                "site-loading"
            );
        },
        1400
    );
}

                resolve(false);
            };
        });
    }
    function updateSiteLoader(
    processedFrames
) {
    if (
        !settings ||
        !siteLoader
    ) {
        return;
    }

    const percentage =
        Math.min(
            100,
            Math.max(
                0,
                Math.round(
                    (
                        processedFrames /
                        settings.frameCount
                    ) *
                    100
                )
            )
        );

    const fillOffset =
        100 - percentage;

    siteLoader.style.setProperty(
        "--loader-progress",
        String(percentage)
    );

    siteLoader.style.setProperty(
        "--loader-fill-offset",
        `${fillOffset}%`
    );

    if (siteLoaderProgress) {
        siteLoaderProgress.style.width =
            `${percentage}%`;
    }

    if (siteLoaderPercentage) {
        siteLoaderPercentage.textContent =
            `${percentage}%`;
    }
}

    function preloadFrames() {
        const priorities = [
            0,
            1,
            2,
            10,
            20,
            30,
            45,
            60,
            75,
            90,
            105,
            settings.frameCount - 1
        ].filter(
            (index) =>
                index >= 0 &&
                index < settings.frameCount
        );

        Promise.all(
            priorities.map(loadFrame)
        ).then(() => {
            let index = 0;

            function nextBatch() {
                const batch = [];

                while (
                    batch.length < 8 &&
                    index < settings.frameCount
                ) {
                    if (
                        !priorities.includes(index)
                    ) {
                        batch.push(
                            loadFrame(index)
                        );
                    }

                    index += 1;
                }

                if (!batch.length) {
                    return;
                }

                Promise.all(batch).then(() => {
                    window.setTimeout(
                        nextBatch,
                        20
                    );
                });
            }

            nextBatch();
        });
    }

    function resizeCanvas() {
        if (!canvas || !context) {
            return;
        }

        const rect =
            canvas.getBoundingClientRect();

        const ratio = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        canvas.width = Math.round(
            rect.width * ratio
        );

        canvas.height = Math.round(
            rect.height * ratio
        );

        if (currentFrame >= 0) {
            drawFrame(currentFrame, true);
        }
    }
    const mobile =
    window.matchMedia(
        "(max-width: 700px)"
    ).matches;

const maximumRatio =
    mobile
        ? 1.5
        : 2;

const ratio =
    Math.min(
        window.devicePixelRatio || 1,
        maximumRatio
    );

    function nearestLoadedFrame(target) {
        if (frames[target]) {
            return target;
        }

        for (
            let distance = 1;
            distance < settings.frameCount;
            distance += 1
        ) {
            if (
                target - distance >= 0 &&
                frames[target - distance]
            ) {
                return target - distance;
            }

            if (
                target + distance <
                    settings.frameCount &&
                frames[target + distance]
            ) {
                return target + distance;
            }
        }

        return 0;
    }

    function drawFrame(target, force = false) {
        if (
            !force &&
            target === currentFrame
        ) {
            return;
        }

        const index =
            nearestLoadedFrame(target);

        const image = frames[index];

        if (!image) {
            return;
        }

        const scale = Math.max(
            canvas.width / image.naturalWidth,
            canvas.height / image.naturalHeight
        );

        const width =
            image.naturalWidth * scale;

        const height =
            image.naturalHeight * scale;

        const x =
            (canvas.width - width) / 2;

        const y =
            (canvas.height - height) / 2;

        context.fillStyle = "#050505";

        context.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        context.drawImage(
            image,
            x,
            y,
            width,
            height
        );

        currentFrame = target;
    }

    function getProgress() {
        const rect =
            section.getBoundingClientRect();

        const distance =
            section.offsetHeight -
            window.innerHeight;

        if (distance <= 0) {
            return 0;
        }

        return clamp(
            -rect.top / distance
        );
    }

    function animateFallingFrame(progress) {
        if (!fallingFrame) {
            return;
        }

        const entrance =
            easeOutCubic(
                range(
                    progress,
                    0.62,
                    0.78
                )
            );

        const orbit =
            range(
                progress,
                0.78,
                0.91
            );

        const fall =
            easeInCubic(
                range(
                    progress,
                    0.91,
                    1
                )
            );

        const viewportWidth =
            window.innerWidth;

        const viewportHeight =
            window.innerHeight;

        const startX =
            -viewportWidth * 0.45;

        const centerX =
            viewportWidth * 0.57;

        const orbitX =
            centerX +
            Math.sin(
                orbit * Math.PI
            ) *
            viewportWidth *
            0.12;

        const x =
            startX +
            (orbitX - startX) *
            entrance;

        const orbitY =
            Math.sin(
                orbit * Math.PI * 2
            ) *
            viewportHeight *
            0.08;

        const y =
            orbitY +
            fall *
            viewportHeight *
            1.2;

        const rotation =
            -18 +
            entrance * 28 +
            orbit * 260 +
            fall * 65;

        const scale =
            0.72 +
            entrance * 0.28 -
            fall * 0.08;

        const opacity =
            clamp(
                entrance * 1.35 -
                fall * 0.15
            );

        fallingFrame.style.opacity =
            opacity.toFixed(3);

        fallingFrame.style.transform =
            `translate3d(${x.toFixed(2)}px, ` +
            `calc(-50% + ${y.toFixed(2)}px), 0) ` +
            `rotate(${rotation.toFixed(2)}deg) ` +
            `scale(${scale.toFixed(3)})`;

        const shine =
            fallingFrame.querySelector(
                ".falling-frame__shine"
            );

        if (shine) {
            shine.style.transform =
                `translateX(${(
                    -80 +
                    orbit * 190
                ).toFixed(2)}%)`;
        }
    }
    function updateTransitionVideoSection() {
    if (
        !transitionSection ||
        !transitionVideo
    ) {
        return;
    }

    const rect =
        transitionSection.getBoundingClientRect();

    const viewportHeight =
        window.innerHeight;

    const visible =
        rect.top < viewportHeight &&
        rect.bottom > 0;

    if (visible) {
        if (transitionVideo.paused) {
            transitionVideo
                .play()
                .catch(() => {
                    /*
                    A reprodução automática pode ser
                    bloqueada em algumas configurações.
                    */
                });
        }
    } else if (!transitionVideo.paused) {
        transitionVideo.pause();
    }

    const progress =
        clamp(
            (
                viewportHeight -
                rect.top
            ) /
            (
                viewportHeight +
                rect.height
            )
        );

    const videoY =
        (progress - 0.5) * -120;

    const lightProgress =
        range(
            progress,
            0.18,
            0.78
        );

    const lightX =
        -40 +
        lightProgress * 165;

    const lightOpacity =
        Math.sin(
            lightProgress * Math.PI
        ) * 0.72;

    const numberX =
        -8 +
        progress * 13;

    transitionSection.style.setProperty(
        "--transition-video-y",
        `${videoY.toFixed(2)}px`
    );

    transitionSection.style.setProperty(
        "--transition-light-x",
        `${lightX.toFixed(2)}%`
    );

    transitionSection.style.setProperty(
        "--transition-light-opacity",
        lightOpacity.toFixed(3)
    );

    transitionSection.style.setProperty(
        "--transition-number-x",
        `${numberX.toFixed(2)}%`
    );
}

    function update() {
    rafId = null;

    const progress =
        getProgress();

    targetFrame = Math.min(
        settings.frameCount - 1,
        Math.round(
            progress *
            (settings.frameCount - 1)
        )
    );

    animateFallingFrame(progress);
    animateLandingFrame();
    updateTransitionVideoSection();
}
    function animateLandingFrame() {
    if (!landingFrame) {
        return;
    }

    const transitionSection =
        document.querySelector(
            ".transition-section"
        );

    if (!transitionSection) {
        return;
    }

    const rect =
        transitionSection.getBoundingClientRect();

    const viewportHeight =
        window.innerHeight;

    const progress =
        clamp(
            (
                viewportHeight -
                rect.top
            ) /
            (
                viewportHeight +
                transitionSection.offsetHeight *
                0.42
            )
        );

    const entrance =
        easeOutCubic(
            range(
                progress,
                0,
                0.38
            )
        );

    const settle =
        easeOutCubic(
            range(
                progress,
                0.38,
                0.72
            )
        );

    const y =
        -180 +
        entrance * 220 -
        settle * 40;

    const rotation =
        28 -
        entrance * 38 +
        settle * 10;

    const scale =
        0.82 +
        entrance * 0.22 -
        settle * 0.04;

    const opacity =
        clamp(
            entrance * 1.4
        );

    landingFrame.style.opacity =
        opacity.toFixed(3);

    landingFrame.style.transform =
        `translate3d(0, ${y.toFixed(2)}px, 0) ` +
        `rotate(${rotation.toFixed(2)}deg) ` +
        `scale(${scale.toFixed(3)})`;

    const landingLight =
        landingFrame.querySelector(
            ".transition-section__landing-light"
        );

    if (landingLight) {
        const lightProgress =
            range(
                progress,
                0.24,
                0.62
            );

        landingLight.style.opacity =
            Math.sin(
                lightProgress *
                Math.PI
            ).toFixed(3);

        landingLight.style.transform =
            `translateX(${(
                -90 +
                lightProgress * 190
            ).toFixed(2)}%)`;
    }
}
function animateSequence() {
    const difference =
        targetFrame - displayedFrame;

    if (Math.abs(difference) > 0.01) {
        displayedFrame +=
            difference * 0.19;

        drawFrame(
            Math.round(displayedFrame)
        );
    }

    sequenceAnimationId =
        window.requestAnimationFrame(
            animateSequence
        );
}

    function requestUpdate() {
        if (rafId !== null) {
            return;
        }

        rafId =
            window.requestAnimationFrame(
                update
            );
    }

    function start(content) {
        if (!section || !canvas || !context) {
            return;
        }

        const hero =
            content && content.hero
                ? content.hero
                : {};

        settings = {
            frameFolder:
                hero.frameFolder ||
                "assets/frames",
            framePrefix:
                hero.framePrefix ||
                "frame-",
            frameExtension:
                hero.frameExtension ||
                "webp",
            frameCount:
    Number.isFinite(
        Number(hero.frameCount)
    )
        ? Number(hero.frameCount)
        : 120,
           firstFrame:
    Number.isFinite(
        Number(hero.firstFrame)
    )
        ? Number(hero.firstFrame)
        : 0,
            digits:
    Number.isFinite(
        Number(hero.digits)
    )
        ? Number(hero.digits)
        : 5
        };

        frames =
            new Array(
                settings.frameCount
            );

        loadFrame(0);
        preloadFrames();
        if (sequenceAnimationId === null) {
    animateSequence();
}

        window.addEventListener(
            "scroll",
            requestUpdate,
            {
                passive: true
            }
        );

        window.addEventListener(
            "resize",
            () => {
                resizeCanvas();
                requestUpdate();
            }
        );

        update();
    }

    document.addEventListener(
        "site:content-ready",
        (event) => {
            start(event.detail);
        },
        {
            once: true
        }
    );

    document.querySelector(
        "#current-year"
    ).textContent =
        new Date().getFullYear();
        /* =========================================================
   SISTEMA GLOBAL DE REVELAÇÃO
   ========================================================= */

function setupCinematicReveals() {
    const revealElements =
        Array.from(
            document.querySelectorAll(
                ".cinematic-reveal"
            )
        );

    if (!revealElements.length) {
        return;
    }

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    if (reducedMotion) {
        revealElements.forEach(
            (element) => {
                element.classList.add(
                    "is-visible"
                );
            }
        );

        return;
    }

    revealElements.forEach(
        (element) => {
            const distance =
                Number(
                    element.dataset
                        .revealDistance
                );

            const delay =
                Number(
                    element.dataset
                        .revealDelay
                );

            if (
                Number.isFinite(distance)
            ) {
                element.style.setProperty(
                    "--reveal-y",
                    `${distance}px`
                );
            }

            if (
                Number.isFinite(delay)
            ) {
                element.style.setProperty(
                    "--reveal-delay",
                    `${delay}ms`
                );
            }
        }
    );

    const observer =
        new IntersectionObserver(
            (entries) => {
                entries.forEach(
                    (entry) => {
                        if (
                            entry.isIntersecting
                        ) {
                            entry.target
                                .classList.add(
                                    "is-visible"
                                );

                            observer.unobserve(
                                entry.target
                            );
                        }
                    }
                );
            },
            {
                threshold: 0.16,
                rootMargin:
                    "0px 0px -8% 0px"
            }
        );

    revealElements.forEach(
        (element) => {
            observer.observe(element);
        }
    );
}

/* =========================================================
   PARALAXE SUBTIL DAS FOTOGRAFIAS
   ========================================================= */

function updateCinematicImageParallax() {
    const images =
        document.querySelectorAll(
            ".project-card, .about-section__image"
        );

    const viewportHeight =
        window.innerHeight;

    images.forEach((container) => {
        const rect =
            container.getBoundingClientRect();

        if (
            rect.bottom < 0 ||
            rect.top > viewportHeight
        ) {
            return;
        }

        const center =
            rect.top +
            rect.height / 2;

        const normalized =
            (
                center -
                viewportHeight / 2
            ) /
            viewportHeight;

        const movement =
            normalized * -34;

        container.style.setProperty(
            "--cinematic-image-y",
            `${movement.toFixed(2)}px`
        );
    });
}

let cinematicRafId = null;

function requestCinematicUpdate() {
    if (
        cinematicRafId !== null
    ) {
        return;
    }

    cinematicRafId =
        window.requestAnimationFrame(
            () => {
                cinematicRafId = null;
                updateCinematicImageParallax();
            }
        );
}

setupCinematicReveals();
updateCinematicImageParallax();

window.addEventListener(
    "scroll",
    requestCinematicUpdate,
    {
        passive: true
    }
);

window.addEventListener(
    "resize",
    requestCinematicUpdate
);
/* =========================================================
   VÍDEOS DOS PROJETOS
   ========================================================= */

function setupProjectVideos() {
    const cards = Array.from(
        document.querySelectorAll(
            ".project-card"
        )
    );

    cards.forEach((card) => {
        const video =
            card.querySelector(
                ".project-card__video"
            );

        const timecode =
            card.querySelector(
                ".project-card__timecode span:first-child"
            );

        if (!video) {
            return;
        }

        function playVideo() {
            cards.forEach(
                (otherCard) => {
                    if (
                        otherCard === card
                    ) {
                        return;
                    }

                    const otherVideo =
                        otherCard.querySelector(
                            ".project-card__video"
                        );

                    if (otherVideo) {
                        otherVideo.pause();
                    }

                    otherCard.classList.remove(
                        "is-playing"
                    );
                }
            );

            video
                .play()
                .then(() => {
                    card.classList.add(
                        "is-playing"
                    );
                })
                .catch(() => {
                    card.classList.remove(
                        "is-playing"
                    );
                });
        }

        function pauseVideo() {
            video.pause();

            card.classList.remove(
                "is-playing"
            );
        }

        card.addEventListener(
            "mouseenter",
            playVideo
        );

        card.addEventListener(
            "mouseleave",
            pauseVideo
        );

        card.addEventListener(
            "focusin",
            playVideo
        );

        card.addEventListener(
            "focusout",
            pauseVideo
        );

        video.addEventListener(
            "timeupdate",
            () => {
                if (!timecode) {
                    return;
                }

                const seconds =
                    Math.floor(
                        video.currentTime
                    );

                const minutes =
                    Math.floor(
                        seconds / 60
                    );

                const remaining =
                    seconds % 60;

                timecode.textContent =
                    `00:${String(minutes).padStart(
                        2,
                        "0"
                    )}:${String(remaining).padStart(
                        2,
                        "0"
                    )}`;
            }
        );
    });
}
/* =========================================================
   SHOWREEL FULLSCREEN
   ========================================================= */

function setupShowreel() {
    const previewSection =
        document.querySelector(
            ".showreel-section"
        );

    const previewVideo =
        document.querySelector(
            "#showreel-preview-video"
        );

    const openButton =
        document.querySelector(
            "#showreel-open"
        );

    const viewer =
        document.querySelector(
            "#showreel-viewer"
        );

    const fullVideo =
        document.querySelector(
            "#showreel-full-video"
        );

    const closeButton =
        document.querySelector(
            "#showreel-close"
        );

    const soundButton =
        document.querySelector(
            "#showreel-sound"
        );

    const centerControl =
        document.querySelector(
            "#showreel-center-control"
        );

    const centerIcon =
        document.querySelector(
            "#showreel-center-icon"
        );

    const seek =
        document.querySelector(
            "#showreel-seek"
        );

    const currentTime =
        document.querySelector(
            "#showreel-current-time"
        );

    const duration =
        document.querySelector(
            "#showreel-duration"
        );

    if (
        !previewSection ||
        !previewVideo ||
        !viewer ||
        !fullVideo
    ) {
        return;
    }

    function formatTime(value) {
        if (!Number.isFinite(value)) {
            return "00:00";
        }

        const minutes =
            Math.floor(value / 60);

        const seconds =
            Math.floor(value % 60);

        return (
            String(minutes).padStart(
                2,
                "0"
            ) +
            ":" +
            String(seconds).padStart(
                2,
                "0"
            )
        );
    }

    function openViewer() {
        viewer.classList.add(
            "is-open"
        );

        viewer.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "showreel-opened"
        );

        previewVideo.pause();

        fullVideo.currentTime = 0;
        fullVideo.muted = false;

        fullVideo
            .play()
            .catch(() => {
                fullVideo.muted = true;

                fullVideo.play();
            });

        updateSoundLabel();
        updatePlayIcon();
    }

    function closeViewer() {
        fullVideo.pause();

        viewer.classList.remove(
            "is-open"
        );

        viewer.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "showreel-opened"
        );
    }

    function togglePlayback() {
        if (fullVideo.paused) {
            fullVideo.play();
        } else {
            fullVideo.pause();
        }

        updatePlayIcon();
    }

    function toggleSound() {
        fullVideo.muted =
            !fullVideo.muted;

        updateSoundLabel();
    }

    function updatePlayIcon() {
        if (!centerIcon) {
            return;
        }

        centerIcon.textContent =
            fullVideo.paused
                ? "▶"
                : "❚❚";
    }

    function updateSoundLabel() {
        if (!soundButton) {
            return;
        }

        const muted =
            fullVideo.muted;

        soundButton.textContent =
            muted
                ? "Som desligado"
                : "Som ligado";

        soundButton.setAttribute(
            "aria-pressed",
            String(!muted)
        );
    }

    function updateTimeline() {
        if (
            seek &&
            fullVideo.duration
        ) {
            seek.value =
                String(
                    (
                        fullVideo.currentTime /
                        fullVideo.duration
                    ) *
                    100
                );
        }

        if (currentTime) {
            currentTime.textContent =
                formatTime(
                    fullVideo.currentTime
                );
        }
    }

    openButton?.addEventListener(
        "click",
        openViewer
    );

    closeButton?.addEventListener(
        "click",
        closeViewer
    );

    centerControl?.addEventListener(
        "click",
        togglePlayback
    );

    fullVideo.addEventListener(
        "click",
        togglePlayback
    );

    soundButton?.addEventListener(
        "click",
        toggleSound
    );

    seek?.addEventListener(
        "input",
        () => {
            if (
                !fullVideo.duration
            ) {
                return;
            }

            fullVideo.currentTime =
                (
                    Number(seek.value) /
                    100
                ) *
                fullVideo.duration;
        }
    );

    fullVideo.addEventListener(
        "loadedmetadata",
        () => {
            if (duration) {
                duration.textContent =
                    formatTime(
                        fullVideo.duration
                    );
            }
        }
    );

    fullVideo.addEventListener(
        "timeupdate",
        updateTimeline
    );

    fullVideo.addEventListener(
        "play",
        updatePlayIcon
    );

    fullVideo.addEventListener(
        "pause",
        updatePlayIcon
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                !viewer.classList.contains(
                    "is-open"
                )
            ) {
                return;
            }

            if (event.key === "Escape") {
                closeViewer();
            }

            if (
                event.key === " "
            ) {
                event.preventDefault();
                togglePlayback();
            }
        }
    );

    const observer =
        new IntersectionObserver(
            (entries) => {
                entries.forEach(
                    (entry) => {
                        if (
                            entry.isIntersecting
                        ) {
                            previewVideo
                                .play()
                                .catch(() => {});
                        } else {
                            previewVideo.pause();
                        }
                    }
                );
            },
            {
                threshold: 0.35
            }
        );

    observer.observe(
        previewSection
    );
}

/* =========================================================
   MENU FULLSCREEN
   ========================================================= */

function setupFullscreenMenu() {
    const button =
        document.querySelector(
            "#menu-button"
        );

    const menu =
        document.querySelector(
            "#fullscreen-menu"
        );

    const video =
        document.querySelector(
            "#fullscreen-menu-video"
        );

    const number =
        document.querySelector(
            ".fullscreen-menu__number"
        );

    const progress =
        document.querySelector(
            "#fullscreen-menu-progress"
        );

    const links = Array.from(
        document.querySelectorAll(
            ".fullscreen-menu__link"
        )
    );

    if (!button || !menu) {
        return;
    }

    function openMenu() {
        menu.classList.add("is-open");
        button.classList.add("is-active");

        button.setAttribute(
            "aria-expanded",
            "true"
        );

        button.setAttribute(
            "aria-label",
            "Fechar menu"
        );

        menu.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "menu-open"
        );

        if (progress) {
            progress.style.width = "100%";
        }

        if (video) {
            video.currentTime = 0;

            video
                .play()
                .catch(() => {});
        }
    }

    function closeMenu() {
        menu.classList.remove("is-open");
        button.classList.remove("is-active");

        button.setAttribute(
            "aria-expanded",
            "false"
        );

        button.setAttribute(
            "aria-label",
            "Abrir menu"
        );

        menu.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "menu-open"
        );

        if (progress) {
            progress.style.width = "0%";
        }

        if (video) {
            video.pause();
        }
    }

    function toggleMenu() {
        if (
            menu.classList.contains(
                "is-open"
            )
        ) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    button.addEventListener(
        "click",
        toggleMenu
    );

    links.forEach((link) => {
        link.addEventListener(
            "mouseenter",
            () => {
                const index =
                    link.dataset.menuIndex ||
                    "00";

                if (number) {
                    number.textContent =
                        index;

                    const numericIndex =
                        Number(index);

                    number.style.setProperty(
                        "--menu-number-x",
                        `${
                            6 -
                            numericIndex * 1.2
                        }%`
                    );
                }
            }
        );

        link.addEventListener(
            "click",
            closeMenu
        );
    });

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Escape" &&
                menu.classList.contains(
                    "is-open"
                )
            ) {
                closeMenu();
            }
        }
    );
}
/* =========================================================
   CURSOR CINEMATOGRÁFICO
   ========================================================= */

function setupCinematicCursor() {
    const cursor =
        document.querySelector(
            "#cinematic-cursor"
        );

    const cursorLabel =
        document.querySelector(
            "#cinematic-cursor-label"
        );

    const glow =
        document.querySelector(
            "#cinematic-cursor-glow"
        );

    const finePointer =
        window.matchMedia(
            "(pointer: fine)"
        ).matches;

    if (
        !cursor ||
        !glow ||
        !finePointer
    ) {
        return;
    }

    let mouseX = -100;
    let mouseY = -100;

    let cursorX = -100;
    let cursorY = -100;

    let glowX = -100;
    let glowY = -100;

    const colorCompare =
    document.querySelector(
        ".color-compare"
    );

if (colorCompare) {
    colorCompare.addEventListener(
        "mouseenter",
        () => {
            activateCursor("Drag");
        }
    );

    colorCompare.addEventListener(
        "mouseleave",
        deactivateCursor
    );
    const soundToggle =
    document.querySelector(
        ".sound-toggle"
    );

if (soundToggle) {
    soundToggle.addEventListener(
        "mouseenter",
        () => {
            activateCursor("Listen");
        }
    );

    soundToggle.addEventListener(
        "mouseleave",
        deactivateCursor
    );
    document.querySelectorAll(
    ".selected-frame"
).forEach((frame) => {
    frame.addEventListener(
        "mouseenter",
        () => {
            activateCursor("Frame");
        }
    );

    frame.addEventListener(
        "mouseleave",
        deactivateCursor
    );
});
}
}

    function animateCursor() {
        cursorX +=
            (mouseX - cursorX) * 0.28;

        cursorY +=
            (mouseY - cursorY) * 0.28;

        glowX +=
            (mouseX - glowX) * 0.09;

        glowY +=
            (mouseY - glowY) * 0.09;

        cursor.style.setProperty(
            "--cursor-x",
            `${cursorX.toFixed(2)}px`
        );

        cursor.style.setProperty(
            "--cursor-y",
            `${cursorY.toFixed(2)}px`
        );

        glow.style.setProperty(
            "--cursor-glow-x",
            `${glowX.toFixed(2)}px`
        );

        glow.style.setProperty(
            "--cursor-glow-y",
            `${glowY.toFixed(2)}px`
        );

        window.requestAnimationFrame(
            animateCursor
        );
    }

    function activateCursor(label) {
        cursor.classList.add(
            "is-active"
        );

        if (cursorLabel) {
            cursorLabel.textContent =
                label;
        }
    }

    function deactivateCursor() {
        cursor.classList.remove(
            "is-active"
        );

        if (cursorLabel) {
            cursorLabel.textContent = "";
        }
    }

    document.addEventListener(
        "mousemove",
        (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;

            cursor.classList.add(
                "is-visible"
            );

            glow.classList.add(
                "is-visible"
            );
        }
    );

    document.addEventListener(
        "mouseleave",
        () => {
            cursor.classList.remove(
                "is-visible"
            );

            glow.classList.remove(
                "is-visible"
            );
        }
    );

    document.querySelectorAll(
        ".project-card"
    ).forEach((element) => {
        element.addEventListener(
            "mouseenter",
            () => {
                activateCursor("View");
            }
        );

        element.addEventListener(
            "mouseleave",
            deactivateCursor
        );
    });

    document.querySelectorAll(
        ".showreel-open, " +
        ".showreel-viewer__video"
    ).forEach((element) => {
        element.addEventListener(
            "mouseenter",
            () => {
                activateCursor("Play");
            }
        );

        element.addEventListener(
            "mouseleave",
            deactivateCursor
        );
    });

    document.querySelectorAll(
        ".fullscreen-menu__link, " +
        ".contact-link"
    ).forEach((element) => {
        element.addEventListener(
            "mouseenter",
            () => {
                activateCursor("Open");
            }
        );

        element.addEventListener(
            "mouseleave",
            deactivateCursor
        );
    });

    animateCursor();
}
/* =========================================================
   PEDIDO DE PROJETO
   ========================================================= */

function setupProjectRequestForm() {
    const form =
        document.querySelector(
            "#project-form"
        );

    if (!form) {
        return;
    }

    const steps = Array.from(
        form.querySelectorAll(
            "[data-form-step]"
        )
    );

    const nextButtons = Array.from(
        form.querySelectorAll(
            "[data-next-step]"
        )
    );

    const backButtons = Array.from(
        form.querySelectorAll(
            "[data-previous-step]"
        )
    );

    const progress =
        document.querySelector(
            "#project-form-progress"
        );

    const message =
        document.querySelector(
            "#project-message"
        );

    const messageCount =
        document.querySelector(
            "#project-message-count"
        );

    const success =
        document.querySelector(
            "#project-form-success"
        );

    const resetButton =
        document.querySelector(
            "#project-form-reset"
        );

    const submitButton =
        document.querySelector(
            "#project-form-submit"
        );

    const submitLabel =
        submitButton
            ? submitButton.querySelector(
                  "span:first-child"
              )
            : null;

    let currentStep = 1;
    let isSubmitting = false;

    function clearFieldError(field) {
        if (!field) {
            return;
        }

        const container =
            field.closest(
                ".project-form__field"
            );

        if (!container) {
            return;
        }

        container.classList.remove(
            "has-error"
        );

        const error =
            container.querySelector(
                ".project-form__error"
            );

        if (error) {
            error.textContent = "";
        }
    }

    function showFieldError(
        field,
        text
    ) {
        if (!field) {
            return;
        }

        const container =
            field.closest(
                ".project-form__field"
            );

        if (!container) {
            return;
        }

        container.classList.add(
            "has-error"
        );

        const error =
            container.querySelector(
                ".project-form__error"
            );

        if (error) {
            error.textContent = text;
        }

        field.focus({
            preventScroll: true
        });
    }

    function validateStep(stepNumber) {
        if (stepNumber === 1) {
            const name =
                document.querySelector(
                    "#project-name"
                );

            const email =
                document.querySelector(
                    "#project-email"
                );

            let valid = true;

            clearFieldError(name);
            clearFieldError(email);

            if (
                !name ||
                name.value.trim().length < 2
            ) {
                showFieldError(
                    name,
                    "Escreve o teu nome."
                );

                valid = false;
            }

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !email ||
                !emailPattern.test(
                    email.value.trim()
                )
            ) {
                showFieldError(
                    email,
                    "Indica um e-mail válido."
                );

                valid = false;
            }

            return valid;
        }

        if (stepNumber === 2) {
            const selected =
                form.querySelector(
                    'input[name="projectType"]:checked'
                );

            const error =
                document.querySelector(
                    "#project-type-error"
                );

            if (!selected) {
                if (error) {
                    error.textContent =
                        "Escolhe uma opção para continuar.";
                }

                return false;
            }

            if (error) {
                error.textContent = "";
            }

            return true;
        }

        if (stepNumber === 3) {
            const messageField =
                document.querySelector(
                    "#project-message"
                );

            clearFieldError(
                messageField
            );

            if (
                !messageField ||
                messageField.value
                    .trim()
                    .length < 10
            ) {
                showFieldError(
                    messageField,
                    "Conta-nos um pouco mais sobre a ideia."
                );

                return false;
            }

            return true;
        }

        return true;
    }

   function openStep(
    stepNumber,
    shouldScroll = true
) {
    currentStep = stepNumber;

    steps.forEach((step) => {
        const isTarget =
            Number(
                step.dataset.formStep
            ) === stepNumber;

        step.hidden = !isTarget;

        step.classList.toggle(
            "is-active",
            isTarget
        );
    });

    if (success) {
        success.hidden = true;
    }

    if (progress) {
        progress.style.width =
            `${(
                stepNumber / 3
            ) * 100}%`;
    }

    /*
    Só fazemos scroll quando a pessoa muda
    manualmente de passo.
    */

    if (!shouldScroll) {
        return;
    }

    const formTop =
        form.getBoundingClientRect().top +
        window.scrollY -
        120;

    window.scrollTo({
        top: Math.max(0, formTop),
        behavior:
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
                ? "auto"
                : "smooth"
    });
}

    function showFormSuccess() {
        steps.forEach((step) => {
            step.hidden = true;
            step.classList.remove(
                "is-active"
            );
        });

        if (success) {
            success.hidden = false;
        }

        if (progress) {
            progress.style.width =
                "100%";
        }
    }

    function setSubmittingState(
        submitting
    ) {
        isSubmitting = submitting;

        if (submitButton) {
            submitButton.disabled =
                submitting;
        }

        if (submitLabel) {
            submitLabel.textContent =
                submitting
                    ? "A enviar..."
                    : "Enviar a ideia";
        }
    }

    function showSubmissionError(
        text
    ) {
        let errorBox =
            form.querySelector(
                "#project-submit-error"
            );

        if (!errorBox) {
            errorBox =
                document.createElement(
                    "p"
                );

            errorBox.id =
                "project-submit-error";

            errorBox.className =
                "project-form__submit-error";

            const navigation =
                form.querySelector(
                    '[data-form-step="3"] ' +
                    ".project-form__navigation"
                );

            if (navigation) {
                navigation.insertAdjacentElement(
                    "afterend",
                    errorBox
                );
            }
        }

        errorBox.textContent = text;
        errorBox.hidden = false;
    }

    function clearSubmissionError() {
        const errorBox =
            form.querySelector(
                "#project-submit-error"
            );

        if (errorBox) {
            errorBox.textContent = "";
            errorBox.hidden = true;
        }
    }

    nextButtons.forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                if (
                    !validateStep(
                        currentStep
                    )
                ) {
                    return;
                }

                openStep(
                    Number(
                        button.dataset
                            .nextStep
                    )
                );
            }
        );
    });

    backButtons.forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                openStep(
                    Number(
                        button.dataset
                            .previousStep
                    )
                );
            }
        );
    });

    form.querySelectorAll(
        "input, textarea, select"
    ).forEach((field) => {
        field.addEventListener(
            "input",
            () => {
                clearFieldError(field);
                clearSubmissionError();
            }
        );
    });

    form.querySelectorAll(
        'input[name="projectType"]'
    ).forEach((radio) => {
        radio.addEventListener(
            "change",
            () => {
                const error =
                    document.querySelector(
                        "#project-type-error"
                    );

                if (error) {
                    error.textContent = "";
                }

                clearSubmissionError();
            }
        );
    });

    if (message && messageCount) {
        message.addEventListener(
            "input",
            () => {
                messageCount.textContent =
                    `${message.value.length} / 1500`;
            }
        );
    }

    form.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            if (
                isSubmitting ||
                !validateStep(3)
            ) {
                return;
            }

            clearSubmissionError();

            const data =
                new FormData(form);

            const payload = {
                name: String(
                    data.get("name") || ""
                ).trim(),

                email: String(
                    data.get("email") || ""
                ).trim(),

                projectType: String(
                    data.get(
                        "projectType"
                    ) || ""
                ).trim(),

                message: String(
                    data.get("message") || ""
                ).trim(),

                date: String(
                    data.get("date") || ""
                ).trim(),

                budget: String(
                    data.get("budget") || ""
                ).trim(),

                website: String(
                    data.get("website") || ""
                ).trim()
            };

            setSubmittingState(true);

            try {
                const response =
                    await fetch(
                        "/api/project",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );

                let result = null;

                try {
                    result =
                        await response.json();
                } catch {
                    result = null;
                }

                if (
                    !response.ok ||
                    !result ||
                    !result.ok
                ) {
                    throw new Error(
                        result &&
                        result.error
                            ? result.error
                            : "Não foi possível enviar o pedido."
                    );
                }

                showFormSuccess();

                form.reset();

                if (messageCount) {
                    messageCount.textContent =
                        "0 / 1500";
                }
            } catch (error) {
                console.error(
                    "Erro no envio do pedido:",
                    error
                );

                showSubmissionError(
                    error.message ||
                    "Não foi possível enviar. Tenta novamente."
                );
            } finally {
                setSubmittingState(false);
            }
        }
    );

    if (resetButton) {
        resetButton.addEventListener(
            "click",
            () => {
                form.reset();

                clearSubmissionError();

                form.querySelectorAll(
                    ".has-error"
                ).forEach((element) => {
                    element.classList.remove(
                        "has-error"
                    );
                });

                form.querySelectorAll(
                    ".project-form__error, " +
                    ".project-form__group-error"
                ).forEach((element) => {
                    element.textContent = "";
                });

                if (messageCount) {
                    messageCount.textContent =
                        "0 / 1500";
                }

                if (success) {
                    success.hidden = true;
                }

                openStep(1, false);
            }
        );
    }

    openStep(1, false);
}
/* =========================================================
   BEFORE / AFTER COLOR GRADING
   ========================================================= */

function setupColorComparison() {
    const compare =
        document.querySelector(
            "#color-compare"
        );

    const after =
        document.querySelector(
            "#color-compare-after"
        );

    const divider =
        document.querySelector(
            "#color-compare-divider"
        );

    if (
        !compare ||
        !after ||
        !divider
    ) {
        return;
    }

    let position = 50;
    let isDragging = false;
    let compareRafId = null;
    let pendingPosition = position;

    function clampComparison(
        value
    ) {
        return Math.min(
            96,
            Math.max(4, value)
        );
    }

    function renderPosition() {
        compareRafId = null;

        position =
            clampComparison(
                pendingPosition
            );

        compare.style.setProperty(
            "--compare-position",
            `${position}%`
        );

        compare.setAttribute(
            "aria-valuenow",
            String(
                Math.round(position)
            )
        );
    }

    function requestPosition(
        newPosition
    ) {
        pendingPosition =
            newPosition;

        if (
            compareRafId !== null
        ) {
            return;
        }

        compareRafId =
            window.requestAnimationFrame(
                renderPosition
            );
    }

    function positionFromPointer(
        clientX
    ) {
        const rect =
            compare.getBoundingClientRect();

        if (rect.width <= 0) {
            return position;
        }

        return (
            (
                clientX -
                rect.left
            ) /
            rect.width
        ) * 100;
    }

    function updateContainerWidth() {
        const width =
            compare.getBoundingClientRect()
                .width;

        compare.style.setProperty(
            "--compare-container-width",
            `${width}px`
        );
    }

    function startDragging(event) {
        isDragging = true;

        compare.classList.add(
            "is-dragging"
        );

        if (
            event.pointerId !==
            undefined
        ) {
            compare.setPointerCapture(
                event.pointerId
            );
        }

        requestPosition(
            positionFromPointer(
                event.clientX
            )
        );
    }

    function moveDragging(event) {
        if (!isDragging) {
            return;
        }

        requestPosition(
            positionFromPointer(
                event.clientX
            )
        );
    }

    function stopDragging(event) {
        if (!isDragging) {
            return;
        }

        isDragging = false;

        compare.classList.remove(
            "is-dragging"
        );

        if (
            event.pointerId !==
                undefined &&
            compare.hasPointerCapture(
                event.pointerId
            )
        ) {
            compare.releasePointerCapture(
                event.pointerId
            );
        }
    }

    compare.addEventListener(
        "pointerdown",
        startDragging
    );

    compare.addEventListener(
        "pointermove",
        moveDragging
    );

    compare.addEventListener(
        "pointerup",
        stopDragging
    );

    compare.addEventListener(
        "pointercancel",
        stopDragging
    );

    compare.addEventListener(
        "keydown",
        (event) => {
            const step =
                event.shiftKey
                    ? 10
                    : 2;

            if (
                event.key ===
                "ArrowLeft"
            ) {
                event.preventDefault();

                requestPosition(
                    position - step
                );
            }

            if (
                event.key ===
                "ArrowRight"
            ) {
                event.preventDefault();

                requestPosition(
                    position + step
                );
            }

            if (
                event.key === "Home"
            ) {
                event.preventDefault();

                requestPosition(4);
            }

            if (
                event.key === "End"
            ) {
                event.preventDefault();

                requestPosition(96);
            }
        }
    );

    window.addEventListener(
        "resize",
        () => {
            updateContainerWidth();
            requestPosition(position);
        }
    );

    updateContainerWidth();
    requestPosition(50);
}
/* =========================================================
   SOUND ON EXPERIENCE
   ========================================================= */

function setupSoundExperience() {
    const section =
        document.querySelector(
            "#sound-experience"
        );

    const video =
        document.querySelector(
            "#sound-experience-video"
        );

    const toggle =
        document.querySelector(
            "#sound-toggle"
        );

    const toggleLabel =
        document.querySelector(
            "#sound-toggle-label"
        );

    const toggleStatus =
        document.querySelector(
            "#sound-toggle-status"
        );

    const toggleIcon =
        document.querySelector(
            "#sound-toggle-icon"
        );

    const waveform =
        document.querySelector(
            "#sound-waveform"
        );

    const waveBars =
        waveform
            ? Array.from(
                  waveform.querySelectorAll(
                      "span"
                  )
              )
            : [];

    const currentTime =
        document.querySelector(
            "#sound-current-time"
        );

    const progress =
        document.querySelector(
            "#sound-progress"
        );

    if (
        !section ||
        !video ||
        !toggle
    ) {
        return;
    }

    let audioContext = null;
    let analyser = null;
    let mediaSource = null;
    let frequencyData = null;
    let audioAnimationId = null;
    let sectionRafId = null;
    let soundEnabled = false;

    function formatTime(value) {
        if (!Number.isFinite(value)) {
            return "00:00:00";
        }

        const hours =
            Math.floor(
                value / 3600
            );

        const minutes =
            Math.floor(
                (
                    value % 3600
                ) / 60
            );

        const seconds =
            Math.floor(
                value % 60
            );

        return [
            hours,
            minutes,
            seconds
        ]
            .map((number) =>
                String(number).padStart(
                    2,
                    "0"
                )
            )
            .join(":");
    }

    function updateInterface() {
        section.classList.toggle(
            "is-sound-active",
            soundEnabled
        );

        toggle.setAttribute(
            "aria-pressed",
            String(soundEnabled)
        );

        toggle.setAttribute(
            "aria-label",
            soundEnabled
                ? "Desativar som"
                : "Ativar som"
        );

        if (toggleLabel) {
            toggleLabel.textContent =
                soundEnabled
                    ? "Sound Off"
                    : "Sound On";
        }

        if (toggleStatus) {
            toggleStatus.textContent =
                soundEnabled
                    ? "Sound is playing"
                    : "Press to experience";
        }

        if (toggleIcon) {
            toggleIcon.textContent =
                soundEnabled
                    ? "Ⅱ"
                    : "▶";
        }
    }

    function setupAudioAnalysis() {
        if (
            audioContext &&
            analyser
        ) {
            return true;
        }

        try {
            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContextClass) {
                return false;
            }

            audioContext =
                new AudioContextClass();

            analyser =
                audioContext.createAnalyser();

            analyser.fftSize = 128;
            analyser.smoothingTimeConstant =
                0.82;

            frequencyData =
                new Uint8Array(
                    analyser.frequencyBinCount
                );

            /*
            Um MediaElementSource só pode ser criado
            uma vez para cada elemento de vídeo.
            */

            mediaSource =
                audioContext
                    .createMediaElementSource(
                        video
                    );

            mediaSource.connect(
                analyser
            );

            analyser.connect(
                audioContext.destination
            );

            if (waveform) {
                waveform.classList.add(
                    "has-audio-analysis"
                );
            }

            return true;
        } catch (error) {
            console.warn(
                "A análise de áudio não está disponível:",
                error
            );

            return false;
        }
    }

    function animateWaveform() {
        if (
            !analyser ||
            !frequencyData ||
            !soundEnabled
        ) {
            audioAnimationId = null;
            return;
        }

        analyser.getByteFrequencyData(
            frequencyData
        );

        waveBars.forEach(
            (bar, index) => {
                const frequencyIndex =
                    Math.floor(
                        (
                            index /
                            waveBars.length
                        ) *
                        frequencyData.length
                    );

                const rawValue =
                    frequencyData[
                        frequencyIndex
                    ] || 0;

                const level =
                    Math.max(
                        0.11,
                        rawValue / 255
                    );

                bar.style.setProperty(
                    "--wave-level",
                    level.toFixed(3)
                );

                bar.style.transform =
                    `scaleY(${level.toFixed(
                        3
                    )})`;
            }
        );

        audioAnimationId =
            window.requestAnimationFrame(
                animateWaveform
            );
    }

    function resetWaveform() {
        waveBars.forEach(
            (bar, index) => {
                const base =
                    0.12 +
                    (
                        index % 5
                    ) *
                    0.025;

                bar.style.setProperty(
                    "--wave-level",
                    base.toFixed(3)
                );

                bar.style.transform =
                    `scaleY(${base.toFixed(
                        3
                    )})`;
            }
        );
    }

    async function enableSound() {
        const analysisReady =
            setupAudioAnalysis();

        if (
            analysisReady &&
            audioContext &&
            audioContext.state ===
                "suspended"
        ) {
            await audioContext.resume();
        }

        video.muted = false;
        video.volume = 0;

        try {
            await video.play();
        } catch (error) {
            console.warn(
                "Não foi possível reproduzir o vídeo com som:",
                error
            );

            video.muted = true;
            return;
        }

        soundEnabled = true;
        updateInterface();

        /*
        Entrada gradual do volume para evitar
        um início de áudio agressivo.
        */

        let volume = 0;

        const volumeFade =
            window.setInterval(
                () => {
                    volume += 0.05;

                    video.volume =
                        Math.min(
                            1,
                            volume
                        );

                    if (volume >= 1) {
                        window.clearInterval(
                            volumeFade
                        );
                    }
                },
                35
            );

        if (
            analysisReady &&
            audioAnimationId === null
        ) {
            animateWaveform();
        }
    }

    function disableSound() {
        soundEnabled = false;

        video.muted = true;
        video.volume = 0;

        updateInterface();

        if (
            audioAnimationId !== null
        ) {
            window.cancelAnimationFrame(
                audioAnimationId
            );

            audioAnimationId = null;
        }

        resetWaveform();
    }

    toggle.addEventListener(
        "click",
        async () => {
            if (soundEnabled) {
                disableSound();
            } else {
                await enableSound();
            }
        }
    );

    video.addEventListener(
        "timeupdate",
        () => {
            if (currentTime) {
                currentTime.textContent =
                    formatTime(
                        video.currentTime
                    );
            }

            if (
                progress &&
                video.duration
            ) {
                progress.style.width =
                    `${(
                        video.currentTime /
                        video.duration
                    ) * 100}%`;
            }
        }
    );

    function updateSoundSection() {
        sectionRafId = null;

        const rect =
            section.getBoundingClientRect();

        const viewportHeight =
            window.innerHeight;

        const visible =
            rect.top < viewportHeight &&
            rect.bottom > 0;

        if (visible) {
            if (video.paused) {
                video
                    .play()
                    .catch(() => {});
            }
        } else {
            if (!video.paused) {
                video.pause();
            }

            if (soundEnabled) {
                disableSound();
            }
        }

        const scrollDistance =
            section.offsetHeight -
            viewportHeight;

        const sectionProgress =
            scrollDistance > 0
                ? clamp(
                      -rect.top /
                      scrollDistance
                  )
                : 0;

        const videoY =
            (
                sectionProgress -
                0.5
            ) *
            -100;

        const videoScale =
            1.12 -
            sectionProgress *
            0.06;

        const flareX =
            (
                sectionProgress -
                0.5
            ) *
            -160;

        const flareY =
            Math.sin(
                sectionProgress *
                Math.PI
            ) *
            55;

        const flareOpacity =
            0.08 +
            Math.sin(
                sectionProgress *
                Math.PI
            ) *
            0.2;

        section.style.setProperty(
            "--sound-video-y",
            `${videoY.toFixed(2)}px`
        );

        section.style.setProperty(
            "--sound-video-scale",
            videoScale.toFixed(3)
        );

        section.style.setProperty(
            "--sound-flare-x",
            `${flareX.toFixed(2)}px`
        );

        section.style.setProperty(
            "--sound-flare-y",
            `${flareY.toFixed(2)}px`
        );

        section.style.setProperty(
            "--sound-flare-opacity",
            flareOpacity.toFixed(3)
        );
    }

    function requestSoundSectionUpdate() {
        if (sectionRafId !== null) {
            return;
        }

        sectionRafId =
            window.requestAnimationFrame(
                updateSoundSection
            );
    }

    window.addEventListener(
        "scroll",
        requestSoundSectionUpdate,
        {
            passive: true
        }
    );

    window.addEventListener(
        "resize",
        requestSoundSectionUpdate
    );

    resetWaveform();
    updateInterface();
    updateSoundSection();
}
/* =========================================================
   BEHIND THE FRAME
   ========================================================= */

function setupBehindFrame() {
    const section =
        document.querySelector(
            ".behind-frame"
        );

    const video =
        document.querySelector(
            "#behind-frame-video"
        );

    const timecode =
        document.querySelector(
            "#behind-frame-timecode"
        );

    const images = section
        ? Array.from(
              section.querySelectorAll(
                  ".behind-frame__media img, " +
                  ".behind-frame__detail-media img"
              )
          )
        : [];

    if (!section) {
        return;
    }

    let rafId = null;

    function formatTime(value) {
        if (!Number.isFinite(value)) {
            return "00:00:00";
        }

        const hours =
            Math.floor(value / 3600);

        const minutes =
            Math.floor(
                (value % 3600) / 60
            );

        const seconds =
            Math.floor(value % 60);

        return [
            hours,
            minutes,
            seconds
        ]
            .map((number) =>
                String(number).padStart(
                    2,
                    "0"
                )
            )
            .join(":");
    }

    function updateBehindFrame() {
        rafId = null;

        const sectionRect =
            section.getBoundingClientRect();

        const viewportHeight =
            window.innerHeight;

        const visible =
            sectionRect.top <
                viewportHeight &&
            sectionRect.bottom > 0;

        if (video) {
            if (
                visible &&
                video.paused
            ) {
                video
                    .play()
                    .catch(() => {});
            }

            if (
                !visible &&
                !video.paused
            ) {
                video.pause();
            }
        }

        images.forEach(
            (image, index) => {
                const container =
                    image.parentElement;

                const rect =
                    container.getBoundingClientRect();

                if (
                    rect.bottom < 0 ||
                    rect.top >
                        viewportHeight
                ) {
                    return;
                }

                const center =
                    rect.top +
                    rect.height / 2;

                const normalized =
                    (
                        center -
                        viewportHeight / 2
                    ) /
                    viewportHeight;

                const direction =
                    index % 2 === 0
                        ? -1
                        : 1;

                const movement =
                    normalized *
                    42 *
                    direction;

                image.style.setProperty(
                    "--behind-image-y",
                    `${movement.toFixed(
                        2
                    )}px`
                );
            }
        );

        if (video) {
            const videoRect =
                video.getBoundingClientRect();

            const center =
                videoRect.top +
                videoRect.height / 2;

            const normalized =
                (
                    center -
                    viewportHeight / 2
                ) /
                viewportHeight;

            const scale =
                1.06 +
                Math.abs(normalized) *
                0.035;

            video.style.setProperty(
                "--behind-video-scale",
                scale.toFixed(3)
            );
        }
    }

    function requestUpdate() {
        if (rafId !== null) {
            return;
        }

        rafId =
            window.requestAnimationFrame(
                updateBehindFrame
            );
    }

    if (video && timecode) {
        video.addEventListener(
            "timeupdate",
            () => {
                timecode.textContent =
                    formatTime(
                        video.currentTime
                    );
            }
        );
    }

    window.addEventListener(
        "scroll",
        requestUpdate,
        {
            passive: true
        }
    );

    window.addEventListener(
        "resize",
        requestUpdate
    );

    updateBehindFrame();
}
/* =========================================================
   PROCESSO CINEMATOGRÁFICO
   ========================================================= */

function setupFilmProcess() {
    const section =
        document.querySelector(
            "#process"
        );

    const steps = Array.from(
        document.querySelectorAll(
            "[data-process-step]"
        )
    );

    const visuals = Array.from(
        document.querySelectorAll(
            "[data-process-visual]"
        )
    );

    const counter =
        document.querySelector(
            "#film-process-current"
        );

    const progressBar =
        document.querySelector(
            "#film-process-progress"
        );

    const label =
        document.querySelector(
            "#film-process-label"
        );

    const timecode =
        document.querySelector(
            "#film-process-timecode"
        );

    if (
        !section ||
        !steps.length ||
        !visuals.length
    ) {
        return;
    }

    const processLabels = [
        "Concept",
        "Pre-production",
        "Production",
        "Post-production"
    ];

    let activeIndex = -1;
    let processRafId = null;

    function activateStep(index) {
        if (index === activeIndex) {
            return;
        }

        activeIndex = index;

        steps.forEach(
            (step, stepIndex) => {
                step.classList.toggle(
                    "is-active",
                    stepIndex === index
                );

                step.classList.toggle(
                    "is-previous",
                    stepIndex < index
                );
            }
        );

        visuals.forEach(
            (visual, visualIndex) => {
                visual.classList.toggle(
                    "is-active",
                    visualIndex === index
                );

                visual.classList.toggle(
                    "is-previous",
                    visualIndex < index
                );
            }
        );

        if (counter) {
            counter.textContent =
                String(index + 1).padStart(
                    2,
                    "0"
                );
        }

        if (label) {
            label.textContent =
                processLabels[index];
        }

        if (timecode) {
            timecode.textContent =
                `00:00:${String(
                    index + 1
                ).padStart(2, "0")}`;
        }
    }

    function updateFilmProcess() {
        processRafId = null;

        const rect =
            section.getBoundingClientRect();

        const scrollDistance =
            section.offsetHeight -
            window.innerHeight;

        if (scrollDistance <= 0) {
            return;
        }

        const progress =
            clamp(
                -rect.top /
                scrollDistance
            );

        const stepIndex =
            Math.min(
                steps.length - 1,
                Math.floor(
                    progress *
                    steps.length
                )
            );

        activateStep(stepIndex);

        if (progressBar) {
            progressBar.style.width =
                `${(progress * 100).toFixed(
                    2
                )}%`;
        }

        const localProgress =
            (
                progress *
                steps.length
            ) - stepIndex;

        const activeVisual =
            visuals[stepIndex];

        if (activeVisual) {
            const parallax =
                (
                    localProgress -
                    0.5
                ) *
                -34;

            activeVisual.style.setProperty(
                "--process-image-parallax",
                `${parallax.toFixed(2)}px`
            );
        }
    }

    function requestProcessUpdate() {
        if (processRafId !== null) {
            return;
        }

        processRafId =
            window.requestAnimationFrame(
                updateFilmProcess
            );
    }

    window.addEventListener(
        "scroll",
        requestProcessUpdate,
        {
            passive: true
        }
    );

    window.addEventListener(
        "resize",
        requestProcessUpdate
    );

    activateStep(0);
    updateFilmProcess();
}
/* =========================================================
   SELECTED FRAMES
   ========================================================= */

function setupSelectedFrames() {
    const section =
        document.querySelector(
            "#selected-frames"
        );

    const frames = section
        ? Array.from(
              section.querySelectorAll(
                  ".selected-frame"
              )
          )
        : [];

    if (
        !section ||
        !frames.length
    ) {
        return;
    }

    let selectedFramesRafId =
        null;

    function updateSelectedFrames() {
        selectedFramesRafId =
            null;

        const viewportHeight =
            window.innerHeight;

        frames.forEach(
            (frame, index) => {
                const media =
                    frame.querySelector(
                        ".selected-frame__media"
                    );

                const image =
                    frame.querySelector(
                        ".selected-frame__media img"
                    );

                if (
                    !media ||
                    !image
                ) {
                    return;
                }

                const rect =
                    media.getBoundingClientRect();

                if (
                    rect.bottom < 0 ||
                    rect.top >
                        viewportHeight
                ) {
                    return;
                }

                const center =
                    rect.top +
                    rect.height / 2;

                const normalized =
                    (
                        center -
                        viewportHeight / 2
                    ) /
                    viewportHeight;

                const direction =
                    index % 2 === 0
                        ? -1
                        : 1;

                const movement =
                    normalized *
                    42 *
                    direction;

                image.style.setProperty(
                    "--selected-frame-y",
                    `${movement.toFixed(
                        2
                    )}px`
                );

                const visibleProgress =
                    clamp(
                        1 -
                        Math.abs(
                            normalized
                        ) *
                        1.35
                    );

                const lightX =
                    -45 +
                    visibleProgress *
                    155;

                const lightOpacity =
                    Math.sin(
                        visibleProgress *
                        Math.PI
                    ) *
                    0.7;

                media.style.setProperty(
                    "--selected-light-x",
                    `${lightX.toFixed(
                        2
                    )}%`
                );

                media.style.setProperty(
                    "--selected-light-opacity",
                    lightOpacity.toFixed(
                        3
                    )
                );
            }
        );
    }

    function requestUpdate() {
        if (
            selectedFramesRafId !==
            null
        ) {
            return;
        }

        selectedFramesRafId =
            window.requestAnimationFrame(
                updateSelectedFrames
            );
    }

    window.addEventListener(
        "scroll",
        requestUpdate,
        {
            passive: true
        }
    );

    window.addEventListener(
        "resize",
        requestUpdate
    );

    updateSelectedFrames();
    function restoreInitialPosition() {
    /*
    Se existir uma âncora legítima na URL,
    como #contact ou #showreel, respeitamo-la.
    */

    if (window.location.hash) {
        return;
    }

    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto"
    });
}

window.addEventListener(
    "load",
    restoreInitialPosition,
    {
        once: true
    }
);
}

window.setTimeout(
    () => {
        if (
            siteLoader &&
            !siteLoader.classList.contains(
                "is-complete"
            )
        ) {
            siteLoader.style.setProperty(
                "--loader-fill-offset",
                "0%"
            );

            siteLoader.classList.add(
                "is-ready-to-play"
            );

            if (siteLoaderLabel) {
                siteLoaderLabel.textContent =
                    "Press play";
            }

            window.setTimeout(
                () => {
                    siteLoader.classList.add(
                        "is-complete"
                    );

                    document.body.classList.remove(
                        "site-loading"
                    );
                },
                1100
            );
        }
    },
    15000
);
/* =========================================================
   GESTÃO GLOBAL DOS VÍDEOS
   ========================================================= */

function setupPageVisibilityMedia() {
    const videos = Array.from(
        document.querySelectorAll(
            "video"
        )
    );

    document.addEventListener(
        "visibilitychange",
        () => {
            if (!document.hidden) {
                return;
            }

            videos.forEach((video) => {
                if (!video.paused) {
                    video.dataset.wasPlaying =
                        "true";

                    video.pause();
                } else {
                    video.dataset.wasPlaying =
                        "false";
                }
            });
        }
    );

    window.addEventListener(
        "pagehide",
        () => {
            videos.forEach((video) => {
                video.pause();
            });
        }
    );
}
setupProjectVideos();
setupShowreel();
setupFullscreenMenu();
setupCinematicCursor();
setupProjectRequestForm();
setupColorComparison();
setupSoundExperience();
setupBehindFrame();
setupFilmProcess();
setupSelectedFrames();
setupPageVisibilityMedia();

})();