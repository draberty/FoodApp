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

    // Data Export (Mobile Native File Share vs Desktop Direct Download)
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

            const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

            // 1. Mobile Native Share Sheet (Shares actual file payload)
            if (isMobile && navigator.share) {
                const file = new File([jsonString], fileName, { type: "application/json" });

                try {
                    await navigator.share({
                        files: [file],
                        title: "Food Prep Backup",
                    });
                    return;
                } catch (shareErr) {
                    if (shareErr.name === "AbortError") return;
                    console.warn("Mobile share sheet failed or was dismissed, falling back to direct download:", shareErr);
                }
            }

            // 2. Desktop Direct File Download
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
            console.error("Export failed:", err);
            alert("Failed to export data.");
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