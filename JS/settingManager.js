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

    // Data Export
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

            const jsonString = JSON.stringify(backupData, null, 2);
            const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

            if (isMobile && navigator.share) {
                // 1. Mobile: Name file with .txt and text/plain MIME type so Web Share accepts it
                const mobileFileName = `food-prep-backup-${new Date().toISOString().split("T")[0]}.txt`;
                const file = new File([jsonString], mobileFileName, { type: "text/plain" });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: "Food Prep Backup",
                        });
                        return;
                    } catch (shareErr) {
                        if (shareErr.name === "AbortError") return;
                        console.warn("Mobile share sheet failed, falling back to direct download:", shareErr);
                    }
                }
            }

            // 2. Desktop Fallback: Standard .json file download
            const desktopFileName = `food-prep-backup-${new Date().toISOString().split("T")[0]}.json`;
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = desktopFileName;
            
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