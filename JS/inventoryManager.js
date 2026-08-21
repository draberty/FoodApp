async function renderInv() {
    try {
        const inv = await db.inventory.toArray();
        InvContainer.innerHTML = "";

        if (inv.length === 0) {
            InvContainer.innerHTML = "<p>No Items found in inventory.</p>";
            return;
        }

        inv.forEach((item) => {
            const article = document.createElement("article");
            article.dataset.invId = item.id;

            const stepVal = item.step || 1;
            const unitVal = item.unit || "";

            article.innerHTML = `
            <header class="card-header">
                <span class="card-title">${item.name}</span>
            </header>

            <p><strong>Amount: </strong> ${item.qty}</p>
            
            <div>
                <label>Unit:</label>
                <input type="text" class="unitInput" value="${unitVal}" placeholder="e.g. lbs, Bags" />
            </div>

            <div>
                <label>Step:</label>
                <input type="number" class="stepInput" value="${stepVal}" step="any" min="0.01" />
            </div>

            <div class="card-actions">
                <div role="button" class="decreaseQty">-</div>
                <div role="button" class="increaseQty">+</div>
            </div>
            `;

            InvContainer.appendChild(article);
        });
    } catch (error) {
        console.error("Error Fetching Inventory:", error);
    }
}

async function calculateInv(invId, action, stepVal = 1, unitVal = "") {
    try {
        const item = await db.inventory.get(invId);
        if (!item) return;

        const amount = parseFloat(stepVal) || 1;
        const currentQty = parseFloat(item.qty) || 0;

        let newQty = action === "increase" ? currentQty + amount : currentQty - amount;
        newQty = Math.max(0, newQty);
        newQty = Number(newQty.toFixed(2));

        // Update quantity, step, and unit in Dexie
        await db.inventory.update(invId, { 
            qty: newQty, 
            step: amount,
            unit: unitVal.trim()
        });

        await renderInv();
    } catch (error) {
        console.error("Error updating inventory quantity:", error);
    }
}