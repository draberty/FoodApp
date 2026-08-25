// settingsManager.js

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

document.addEventListener("DOMContentLoaded", () => {
    const modal = getSettingsModal();
    const closeBtn = document.getElementById("CloseSettingsBtn");
    const exportBtn = document.getElementById("ExportBtn");
    const importInput = document.getElementById("ImportInput");

    closeBtn?.addEventListener("click", closeSettings);

    modal?.addEventListener("click", (e) => {
        if (e.target === modal) closeSettings();
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
            const jsonFileName = `food-prep-backup-${dateStr}.json`;
            
            // Create a JSON File instance
            const jsonFile = new File([jsonString], jsonFileName, { type: "application/json" });

            // 1. Try Native Web Share API (Mobile/Supported Platforms)
            if (navigator.canShare && navigator.canShare({ files: [jsonFile] })) {
                try {
                    await navigator.share({
                        files: [jsonFile],
                        title: "Food Prep Backup",
                        text: "Here is your Food Prep database backup JSON file.",
                    });
                    return; // Exit after successful share
                } catch (shareErr) {
                    // Ignore user cancellation (dismissing share sheet)
                    if (shareErr.name === "AbortError") return;
                    console.warn("Native share sheet failed, falling back to direct download:", shareErr);
                }
            }

            // 2. Direct File Download Fallback (Desktop / Unsupported Browsers)
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

    // Data Import (Reads both .json and .txt seamlessly)
    importInput?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                // JSON.parse converts the text back into an object regardless of .txt or .json extension
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
                alert("Failed to import backup file. Ensure it is a valid backup file.");
            } finally {
                e.target.value = "";
            }
        };

        reader.readAsText(file);
    });
});