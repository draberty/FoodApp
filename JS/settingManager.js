// settingsManager.js
//AI has been used here

const getSettingsModal = () => document.getElementById("SettingsModal");

function showSettings() {
    const modal = getSettingsModal();
    if (!modal) {
        console.error("Error: #SettingsModal element was not found in the DOM.");
        return;
    }
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

// Bind modal UI listeners after DOM content loads
document.addEventListener("DOMContentLoaded", () => {
    const modal = getSettingsModal();
    const closeBtn = document.getElementById("CloseSettingsBtn");
    const exportBtn = document.getElementById("ExportBtn");
    const importInput = document.getElementById("ImportInput");

    closeBtn?.addEventListener("click", closeSettings);

    modal?.addEventListener("click", (e) => {
        if (e.target === modal) closeSettings();
    });

    // Data Export (Web Share API for Mobile + Standard Download Fallback for Desktop)
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

            const fileName = `food-prep-backup-${new Date().toISOString().split("T")[0]}.json`;
            const jsonString = JSON.stringify(backupData, null, 2);
            const file = new File([jsonString], fileName, { type: "application/json" });

            // Trigger Mobile Native Share Sheet if Supported
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "Food Prep Backup",
                    text: "Here is your Food Prep database backup file.",
                });
            } else {
                // Desktop / Standard Browser Download Fallback
                const blob = new Blob([jsonString], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            // Ignore user cancellation errors when closing system share sheets
            if (err.name !== "AbortError") {
                console.error("Export failed:", err);
                alert("Failed to export data.");
            }
        }
    });

    // Data Import (JSON -> Dexie Database)
    importInput?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);

                if (!data.meals || !data.inventory || !data.sides || !data.course) {
                    throw new Error("Invalid backup structure: missing required database tables.");
                }

                if (confirm("Importing will overwrite existing database records. Continue?")) {
                    await db.transaction("rw", [db.meals, db.inventory, db.sides, db.course], async () => {
                        await db.meals.clear();
                        await db.inventory.clear();
                        await db.sides.clear();
                        await db.course.clear();

                        if (data.meals.length) await db.meals.bulkAdd(data.meals);
                        if (data.inventory.length) await db.inventory.bulkAdd(data.inventory);
                        if (data.sides.length) await db.sides.bulkAdd(data.sides);
                        if (data.course.length) await db.course.bulkAdd(data.course);
                    });

                    alert("Data imported successfully!");
                    closeSettings();
                    location.reload();
                }
            } catch (err) {
                console.error("Import failed:", err);
                alert("Failed to import backup file. Ensure it is a valid JSON backup.");
            } finally {
                e.target.value = "";
            }
        };

        reader.readAsText(file);
    });
});