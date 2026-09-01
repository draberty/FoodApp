// Service Worker Registration
if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		const isLivePreview =
			window.parent !== window ||
			window.location.port === "3000" ||
			window.location.pathname.includes("___vscode_livepreview");

		if (isLivePreview) {
			console.log(
				"[Service Worker] Registration bypassed (VS Code Live Preview detected)",
			);

			navigator.serviceWorker.getRegistrations().then((registrations) => {
				for (const registration of registrations) {
					registration.unregister();
				}
			});
			return;
		}

		navigator.serviceWorker
			.register("../sw.js")
			.then((registration) => {
				console.log(
					"[Service Worker] Registered with scope:",
					registration.scope,
				);
			})
			.catch((error) => {
				console.error("[Service Worker] Registration failed:", error);
			});
	});
}

// Global App State
let currentSelectedMeals = "";
let currentView = null;

// Element References
const MenuView = $("MenuView"),
	MealView = $("MealView"),
	InvView = $("InventoryView"),
	CourseView = $("CoursePlannerView"),
	BackBtn = $("BackBtn"),
	AddBtn = $("NavNewItemBtn"),
	InvBtn = $("NavInvBtn"),
	CourseBtn = $("NavCourseBtn"),
	MealCatContainer = $("MealCatContainer"),
	InvContainer = $("InvContainer"),
	SettingsBtn = $("SettingsBtn");

const views = [
	{ id: "MenuView", el: MenuView },
	{ id: "MealView", el: MealView },
	{ id: "InventoryView", el: InvView },
	{ id: "CoursePlannerView", el: CourseView },
];

const showView = (targetView, pushState = true) => {
	views.forEach((v, index) => {
		if (!v.el) {
			console.error(
				`Error: View Is Returning error: "${v.id}" (at views[${index}]) is NULL/UNDEFINED!`,
			);
			return;
		}

		v.el.hidden = v.el !== targetView;
	});

	currentView = targetView;
	if (BackBtn) {
		BackBtn.hidden = targetView === MenuView;
	}

	if (pushState && targetView) {
		const viewId = views.find((v) => v.el === targetView)?.id;
		if (viewId && history.state?.view !== viewId) {
			history.pushState({ view: viewId }, "", `#${viewId}`);
		}
	}
};

history.replaceState({ view: "MenuView" }, "", "#MenuView");
showView(MenuView, false);

const descriptions = {
	Morning: "A list of your favorite morning meals!",
	Afternoon: "A list of your favorite afternoon meals!",
	Snacky: "A list of your favorite snacks!",
	Dessert: "A list of your favorite desserts!",
};

// History Navigation Listener
window.addEventListener("popstate", (event) => {
	const openModals = document.querySelectorAll("dialog[open]");
	if (openModals.length > 0) {
		openModals.forEach((modal) => modal.close());
		return;
	}

	if (event.state && event.state.view) {
		const matchedView = views.find((v) => v.id === event.state.view)?.el;
		if (matchedView) {
			showView(matchedView, false);
		}
	} else {
		showView(MenuView, false);
	}
});

// App Event Listeners
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

BackBtn.addEventListener("click", () => history.back());

AddBtn.addEventListener("click", () => addBtnAction(currentView));

InvBtn.addEventListener("click", () => {
	showView(InvView);
	renderInv();
});

CourseBtn.addEventListener("click", () => showView(CourseView));
SettingsBtn.addEventListener("click", () => showSettings());

MealCatContainer.addEventListener("click", async (e) => {
	const card = e.target.closest("article");
	if (!card) return;

	const mealId = Number(card.dataset.mealId);
	const target = e.target;

	if (target.classList.contains("addToCourseBtn")) {
		openAddCourseModal(mealId);
	} else if (target.classList.contains("editBtn")) {
		openEditMealModal(mealId);
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
		default:
			openAddMealModal("");
			break;
	}
}
