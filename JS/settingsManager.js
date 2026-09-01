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

	const savedMode = localStorage.getItem(STORAGE_KEYS.THEME_MODE) || "auto";
	const savedColor = localStorage.getItem(STORAGE_KEYS.ACCENT_COLOR) || "jade";

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
	const mode =
		themeMode ?? (localStorage.getItem(STORAGE_KEYS.THEME_MODE) || "auto");
	const color =
		accentColor ?? (localStorage.getItem(STORAGE_KEYS.ACCENT_COLOR) || "jade");

	const root = document.documentElement;

	// 1. Resolve light/dark mode
	let resolvedTheme = mode;
	if (mode === "auto") {
		resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}

	root.setAttribute("data-theme", resolvedTheme);
	root.setAttribute("data-color", color);
	root.style.colorScheme = resolvedTheme;

	const isDark = resolvedTheme === "dark";

	const primary = isDark
		? `var(--pico-color-${color}-600)`
		: `var(--pico-color-${color}-100)`;
	const primaryHover = `var(--pico-color-${color}-450)`;
	const primaryActive = `var(--pico-color-${color}-400)`;
	const primaryText = isDark ? "#ffffff" : "#000000";

	// Base interactive primary styles
	root.style.setProperty("--pico-primary", primary);
	root.style.setProperty("--pico-primary-background", primary);
	root.style.setProperty("--pico-primary-border", primary);
	root.style.setProperty("--pico-primary-underline", primary);
	root.style.setProperty("--pico-primary-hover", primaryHover);
	root.style.setProperty("--pico-primary-hover-background", primaryHover);
	root.style.setProperty("--pico-primary-hover-border", primaryHover);
	root.style.setProperty("--pico-primary-active", primaryActive);
	root.style.setProperty("--pico-primary-active-background", primaryActive);
	root.style.setProperty("--pico-primary-focus", primaryHover);
	root.style.setProperty("--pico-primary-inverse", primaryText);

	if (isDark) {
		root.style.setProperty(
			"--pico-background-color",
			`var(--pico-color-${color}-900)`,
		);
		root.style.setProperty(
			"--pico-card-background-color",
			`var(--pico-color-${color}-850)`,
		);
		root.style.setProperty(
			"--pico-card-sectioning-background-color",
			`var(--pico-color-${color}-800)`,
		);
		root.style.setProperty(
			"--pico-form-element-background-color",
			`var(--pico-color-${color}-900)`,
			"important",
		);
		root.style.setProperty(
			"--pico-border-color",
			`var(--pico-color-${color}-800)`,
		);
		root.style.setProperty(
			"--pico-form-element-border-color",
			`var(--pico-color-${color}-800)`,
			"important",
		);
		root.style.setProperty(
			"--pico-muted-border-color",
			`var(--pico-color-${color}-850)`,
		);
		root.style.setProperty(
			"--pico-form-element-selected-background-color",
			`var(--pico-color-${color}-550)`,
		);

		root.style.setProperty(
			"--pico-dropdown-background-color",
			`var(--pico-color-${color}-900)`,
		);
		root.style.setProperty(
			"--pico-dropdown-color",
			`var(--pico-color-${color}-200)`,
		);
		root.style.setProperty(
			"--pico-dropdown-hover-background-color",
			`var(--pico-primary-hover-background)`,
		);
		root.style.setProperty(
			"--pico-dropdown-border-color",
			`var(--pico-color-${color}-800)`,
		);

		root.style.setProperty(
			"--pico-form-element-active-background-color",
			`var(--pico-form-element-background-color)`,
		);
		root.style.setProperty("--pico-icon-color", "#ffffff");
		root.style.setProperty("--pico-color", primaryText);
	} else {
		root.style.setProperty(
			"--pico-background-color",
			`var(--pico-color-${color}-300)`,
		);
		root.style.setProperty(
			"--pico-card-background-color",
			`var(--pico-color-${color}-250)`,
		);
		root.style.setProperty(
			"--pico-card-sectioning-background-color",
			`var(--pico-color-${color}-200)`,
		);
		root.style.setProperty(
			"--pico-form-element-background-color",
			`var(--pico-color-${color}-100)`,
			"important",
		);
		root.style.setProperty(
			"--pico-border-color",
			`var(--pico-color-${color}-400)`,
		);
		root.style.setProperty(
			"--pico-form-element-border-color",
			`var(--pico-color-${color}-600)`,
			"important",
		);
		root.style.setProperty(
			"--pico-muted-border-color",
			`var(--pico-color-${color}-300)`,
		);
		root.style.setProperty(
			"--pico-form-element-selected-background-color",
			`var(--pico-color-${color}-450)`,
		);

		root.style.setProperty(
			"--pico-dropdown-background-color",
			`var(--pico-color-${color}-100)`,
		);
		root.style.setProperty(
			"--pico-dropdown-color",
			`var(--pico-color-${color}-800)`,
		);
		root.style.setProperty(
			"--pico-dropdown-hover-background-color",
			`var(--pico-primary-hover-background)`,
		);
		root.style.setProperty(
			"--pico-dropdown-border-color",
			`var(--pico-color-${color}-400)`,
		);

		root.style.setProperty(
			"--pico-form-element-active-background-color",
			`var(--pico-form-element-background-color)`,
		);
		root.style.setProperty("--pico-icon-color", primaryText);
		root.style.setProperty("--pico-color", primaryText);
	}

	root.style.setProperty("--pico-form-element-active-border-color", primary);
	root.style.setProperty("--pico-form-element-focus-color", primaryHover);
}

applyTheme();

// --- EVENT BINDINGS ---
document.addEventListener("DOMContentLoaded", () => {
	applyTheme();

	const modal = getSettingsModal();
	const settingsBtn = document.getElementById("SettingsBtn");
	const closeBtn = document.getElementById("CloseSettingsBtn");
	const exportBtn = document.getElementById("ExportBtn");
	const importInput = document.getElementById("ImportInput");
	const modeSelect = document.getElementById("ThemeModeSelect");
	const colorSelect = document.getElementById("AccentColorSelect");

	settingsBtn?.addEventListener("click", showSettings);
	closeBtn?.addEventListener("click", closeSettings);

	modal?.addEventListener("click", (e) => {
		if (e.target === modal) closeSettings();
	});

	modeSelect?.addEventListener("change", (e) => {
		const mode = e.target.value;
		const currentColor =
			localStorage.getItem(STORAGE_KEYS.ACCENT_COLOR) || "jade";
		localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
		applyTheme(mode, currentColor);
	});

	colorSelect?.addEventListener("change", (e) => {
		const color = e.target.value;
		const currentMode = localStorage.getItem(STORAGE_KEYS.THEME_MODE) || "auto";
		localStorage.setItem(STORAGE_KEYS.ACCENT_COLOR, color);
		applyTheme(currentMode, color);
	});

	window
		.matchMedia("(prefers-color-scheme: dark)")
		.addEventListener("change", () => {
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
