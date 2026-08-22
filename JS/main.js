// sw register
if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("./sw.js")
			.then((registration) => {
				console.log("ServiceWorker registered with scope:", registration.scope);
			})
			.catch((error) => {
				console.error("ServiceWorker registration failed:", error);
			});
	});
}

let currentSelectedMeals = "";
let currentView = null;

// Element references
const $ = (id) => document.getElementById(id);
const MenuView = $("MenuView"),
	MealView = $("MealView"),
	InvView = $("InventoryView"),
	BackBtn = $("BackBtn"),
	AddBtn = $("NewItemButton"),
	InvBtn = $("NavInvBtn"),
	MealCatContainer = $("MealCatContainer"),
	InvContainer = $("InvContainer");

// Views Array
const views = [MenuView, MealView, InvView];

// Universal View Toggle
const showView = (targetView) => {
	views.forEach((v) => (v.hidden = v !== targetView));
	currentView = targetView;
	BackBtn.hidden = targetView === MenuView;
};

showView(MenuView);

// Description Lookup Object
const descriptions = {
	Morning: "A list of your favorite morning meals!",
	Afternoon: "A list of your favorite afternoon meals!",
	Snacky: "A list of your favorite snacks!",
	Dessert: "A list of your favorite desserts!",
};

// Event Listeners
document.querySelectorAll(".Action").forEach((btn) => {
	btn.addEventListener("click", (e) => {
		const cat = e.currentTarget.dataset.categories.trim();
		currentSelectedMeals = cat;

		$("MealCatTitle").textContent = `${cat} Meals`;
		$("MealCatDescription").textContent =
			descriptions[cat] || "Description Not Found";

		showView(MealView);
		renderMeals(cat);
	});
});

// Action Bar handlers
BackBtn.addEventListener("click", () => showView(MenuView));
AddBtn.addEventListener("click", () => addBtnAction(currentView));
InvBtn.addEventListener("click", () => {
	showView(InvView);
	renderInv();
});

// Container Delegation (Edit / Delete / Sides)
MealCatContainer.addEventListener("click", async (e) => {
	const card = e.target.closest("article");
	if (!card) return;

	const mealId = Number(card.dataset.mealId);
	const target = e.target;

	if (target.classList.contains("editBtn")) {
		openEditMealModal(mealId);
	} else if (target.classList.contains("choose-sides-btn")) {
		console.log("Choose sides for meal ID:", mealId);
	} else if (target.classList.contains("deleteBtn")) {
		const mealName =
			card.querySelector(".meal-title")?.textContent || "this meal";
		if (!mealId) return console.error("Invalid meal ID:", card.dataset.mealId);

		if (confirm(`Are you sure you want to delete "${mealName}"?`)) {
			try {
				await db.meals.delete(mealId);
				await renderMeals(currentSelectedMeals);
			} catch (err) {
				console.error("Failed to delete meal from Dexie:", err);
			}
		}
	}
});

// Click listener for quantity buttons
InvView.addEventListener("click", async (e) => {
	const card = e.target.closest("article");
	if (!card) return;

	const invId = Number(card.dataset.invId);
	const target = e.target;

	const stepInput = card.querySelector(".stepInput");
	const stepVal = stepInput ? parseFloat(stepInput.value) : 1;

	const unitInput = card.querySelector(".unitInput");
	const unitVal = unitInput ? unitInput.value : "";

	if (target.classList.contains("decreaseQty")) {
		await calculateInv(invId, "decrease", stepVal, unitVal);
	} else if (target.classList.contains("increaseQty")) {
		await calculateInv(invId, "increase", stepVal, unitVal);
	}
});

// Change listener to save unit field edits automatically
InvView.addEventListener("change", async (e) => {
	if (e.target.classList.contains("unitInput")) {
		const card = e.target.closest("article");
		if (!card) return;

		const invId = Number(card.dataset.invId);
		const newUnit = e.target.value.trim();

		try {
			await db.inventory.update(invId, { unit: newUnit });
		} catch (error) {
			console.error("Error updating unit:", error);
		}
	}
});

function addBtnAction(view) {
	switch (view) {
		case InvView:
			addIngredientModal();
			break;
		case MealView:
			openAddMealModal(currentSelectedMeals);
			break;
		case MenuView:
			// Option A: Prompt them or default to opening a blank meal modal
			openAddMealModal("");
			break;
	}
}
