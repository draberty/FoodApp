// settingsManager.js

// --- STORAGE KEYS ---
const STORAGE_KEYS = {
    THEME_MODE: "app_theme_mode",
    ACCENT_COLOR: "app_color_scheme",
};

// --- MODAL CONTROLS ---
const getSettingsModal = () => document.getElementById("SettingsModal");

function showSettings() {
    const modal = getSettingsModal();
    if (!modal) {
        console.error("Error: #SettingsModal element was not found in the DOM.");
        return;
    }

    // Sync UI values right before opening
    const savedMode = localStorage.getItem(STORAGE_KEYS.THEME_MODE) || "auto";
    const savedColor = localStorage.getItem(STORAGE_KEYS.ACCENT_COLOR) || "indigo";

    const modeSelect = document.getElementById("ThemeModeSelect");
    const colorSelect = document.getElementById("AccentColorSelect");

    if (modeSelect) modeSelect.value = savedMode;
    if (colorSelect) colorSelect.value = savedColor;

    modal.showModal();
    document.body.classList.add("modal-open");
}

function closeSettings() {
    const modal = getSettingsModal();
    if (modal) {
        modal.close();
        document.body.classList.remove("modal-open");
    }
}

function applyTheme(themeMode, accentColor) {
    const mode = themeMode ?? (localStorage.getItem(STORAGE_KEYS.THEME_MODE) || "auto");
    const color = accentColor ?? (localStorage.getItem(STORAGE_KEYS.ACCENT_COLOR) || "indigo");

    const root = document.documentElement;

    // 1. Resolve light/dark mode
    let resolvedTheme = mode;
    if (mode === "auto") {
        resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    // 2. Set DOM attributes
    root.setAttribute("data-theme", resolvedTheme);
    root.setAttribute("data-color", color);

    const shade = resolvedTheme === "dark" ? "650" : "400";
    const hoverShade = resolvedTheme === "dark" ? "600" : "600";

    // 4. Dynamically rebind Pico primary variables
    root.style.setProperty("--pico-primary", `var(--pico-color-${color}-${shade})`);
    root.style.setProperty("--pico-primary-background", `var(--pico-color-${color}-${shade})`);
    root.style.setProperty("--pico-primary-border", `var(--pico-color-${color}-${shade})`);
    root.style.setProperty("--pico-primary-hover", `var(--pico-color-${color}-${hoverShade})`);
    root.style.setProperty("--pico-primary-hover-background", `var(--pico-color-${color}-${hoverShade})`);
    root.style.setProperty("--pico-primary-focus", `var(--pico-color-${color}-${shade})`);
}

// Apply saved theme settings immediately on script execution to prevent flashing
applyTheme();

// --- EVENT BINDINGS ---
document.addEventListener("DOMContentLoaded", () => {
    // Re-apply saved theme once DOM is loaded
    applyTheme();

    const modal = getSettingsModal();
    const settingsBtn = document.getElementById("SettingsBtn");
    const closeBtn = document.getElementById("CloseSettingsBtn");
    const exportBtn = document.getElementById("ExportBtn");
    const importInput = document.getElementById("ImportInput");
    const modeSelect = document.getElementById("ThemeModeSelect");
    const colorSelect = document.getElementById("AccentColorSelect");

    // Modal Listeners
    settingsBtn?.addEventListener("click", showSettings);
    closeBtn?.addEventListener("click", closeSettings);

    modal?.addEventListener("click", (e) => {
        if (e.target === modal) closeSettings();
    });

    // Theme Mode Switcher
    modeSelect?.addEventListener("change", (e) => {
        const mode = e.target.value;
        const currentColor = localStorage.getItem(STORAGE_KEYS.ACCENT_COLOR) || "indigo";
        localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
        applyTheme(mode, currentColor);
    });

    // Accent Color Switcher
    colorSelect?.addEventListener("change", (e) => {
        const color = e.target.value;
        const currentMode = localStorage.getItem(STORAGE_KEYS.THEME_MODE) || "auto";
        localStorage.setItem(STORAGE_KEYS.ACCENT_COLOR, color);
        applyTheme(currentMode, color);
    });

    // Dynamic listener for System Theme changes when set to "auto"
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        const savedMode = localStorage.getItem(STORAGE_KEYS.THEME_MODE) || "auto";
        if (savedMode === "auto") {
            applyTheme();
        }
    });

    // --- DATA EXPORT ---
    exportBtn?.addEventListener("click", async () => {
        try {
            const meals = await db.meals.toArray();
            const inventory = await db.inventory.toArray();
            const sides = await db.sides.toArray();
            const course = await db.course.toArray();

            const backupData = {
                version: 1,
                exportedAt: new Date().toISOString(),
                meals,
                inventory,
                sides,
                course,
            };

            const dateStr = new Date().toISOString().split("T")[0];
            const jsonString = JSON.stringify(backupData, null, 2);
            const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

            if (isMobile && navigator.share) {
                const txtFileName = `food-prep-backup-${dateStr}.txt`;
                const txtFile = new File([jsonString], txtFileName, {
                    type: "text/plain",
                });

                if (navigator.canShare && navigator.canShare({ files: [txtFile] })) {
                    try {
                        await navigator.share({
                            files: [txtFile],
                            title: "Food Prep Backup",
                            text: "Here is your Food Prep database backup.",
                        });
                        return;
                    } catch (shareErr) {
                        if (shareErr.name === "AbortError") return;
                        console.warn(
                            "Mobile share sheet failed, falling back to direct download:",
                            shareErr,
                        );
                    }
                }
            }

            const jsonFileName = `food-prep-backup-${dateStr}.json`;
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = jsonFileName;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
            console.error("Export failed:", err);
            alert("Failed to export data.");
        }
    });

    // --- DATA IMPORT ---
    importInput?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);

                if (!data.meals || !data.inventory || !data.sides || !data.course) {
                    throw new Error(
                        "Invalid backup structure: missing required database tables.",
                    );
                }

                if (
                    confirm(
                        "Importing will overwrite existing database records. Continue?",
                    )
                ) {
                    await db.transaction(
                        "rw",
                        [db.meals, db.inventory, db.sides, db.course],
                        async () => {
                            await db.meals.clear();
                            await db.inventory.clear();
                            await db.sides.clear();
                            await db.course.clear();

                            if (data.meals.length) await db.meals.bulkPut(data.meals);
                            if (data.inventory.length)
                                await db.inventory.bulkPut(data.inventory);
                            if (data.sides.length) await db.sides.bulkPut(data.sides);
                            if (data.course.length) await db.course.bulkPut(data.course);
                        },
                    );

                    alert("Data imported successfully!");
                    closeSettings();
                    location.reload();
                }
            } catch (err) {
                console.error("Import failed:", err);
                alert(
                    "Failed to import backup file. Ensure it is a valid backup file (.json or .txt).",
                );
            } finally {
                e.target.value = "";
            }
        };

        reader.readAsText(file);
    });
});