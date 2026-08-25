const InvModal = document.getElementById("InvFormModal");
const IngredientForm = document.getElementById("IngredientForm");
const IngredientName = document.getElementById("IngredientName");
const IngredientQty = document.getElementById("IngredientQty");
const IngredientUnit = document.getElementById("IngredientUnit");
const IngredientStep = document.getElementById("IngredientStep");

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
                <input type="text" class="unitInput" value="${unitVal}" placeholder="e.g. lbs, Bags, etc..." onfocus="this.select()" />
            </div>

            <div>
                <label>Step:</label>
                <input type="number" class="stepInput" value="${stepVal}" step="any" min="0.01" onfocus="this.select()" />
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

		let newQty =
			action === "increase" ? currentQty + amount : currentQty - amount;
		newQty = Math.max(0, newQty);
		newQty = Number(newQty.toFixed(2));

		// Update quantity, step, and unit in Dexie
		await db.inventory.update(invId, {
			qty: newQty,
			step: amount,
			unit: unitVal.trim(),
		});

		await renderInv();
	} catch (error) {
		console.error("Error updating inventory quantity:", error);
	}
}

// Modal Code

function addIngredientModal() {
	IngredientForm.reset();
	document.body.classList.add("modal-open");
	InvModal.showModal();
}

const closeIngredientBtn = InvModal.querySelector(".CloseModalBtn");
closeIngredientBtn?.addEventListener("click", () => {
	InvModal.close();
});

InvModal.addEventListener("close", () => {
	document.body.classList.remove("modal-open");
	IngredientForm.reset();
});

InvModal.addEventListener("submit", async (e) => {
	e.preventDefault();

	const invName = IngredientName.value;
	const invQty = Number(IngredientQty.value);
	const invUnit = IngredientUnit.value;
	const invStep = parseFloat(IngredientStep.value);

	const invData = {
		name: invName.trim(),
		qty: invQty || 1,
		unit: invUnit.trim(),
		step: invStep || 1,
	};

	try {
		await db.inventory.add(invData);
	} catch (error) {
		console.error("Error adding ingredient:", error);
	}

	if (typeof renderInv === "function") {
		await renderInv();
	}

	InvModal.close();
});


async function populateInventorySuggestions() {
    const dataList = document.getElementById("inventoryList");
    if (!dataList) return;

    try {
        const inventoryItems = await db.inventory.toArray();
        dataList.innerHTML = inventoryItems
            .map(item => `<option value="${item.name}">${item.qty ? `(${item.qty} ${item.unit || ''})` : ''}</option>`)
            .join("");
    } catch (err) {
        console.error("Failed to fetch inventory suggestions:", err);
    }
}