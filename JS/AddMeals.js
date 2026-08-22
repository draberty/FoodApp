let currentIngredients = [];

const MealModal = document.getElementById("MealFormModal");
const MealForm = document.getElementById("MealForm");
const MealId = document.getElementById("MealIdInput");
const MealFormTitle = document.getElementById("MealFormTitle");

const MealName = document.getElementById("MealName");
const MealCat = document.getElementById("MealCategory");
const MealSubCat = document.getElementById("MealSubCategory");
const SidesAllowed = document.getElementById("SidesAllowed");
const MealIngredients = document.getElementById("MealIngredients");
const addIngredientBtn = document.getElementById("AddIngredientBtn");
const ingredientList = document.getElementById("IngredientList");
const allergenToggle = document.getElementById("allergenToggle");

function renderIngredientChips() {
	ingredientList.innerHTML = currentIngredients
		.map(
			(item, index) => `
    <span class="chip">
      ${item}
      <span class="remove-chip" data-index="${index}">&times;</span>
    </span>
  `,
		)
		.join("");
}

function addIngredients() {
	const value = MealIngredients.value.trim();
	if (value) {
		currentIngredients.push(value);
		MealIngredients.value = "";
		renderIngredientChips();
	}
}

addIngredientBtn.addEventListener("click", addIngredients);

MealIngredients.addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		e.preventDefault();
		addIngredients();
	}
});

ingredientList.addEventListener("click", (e) => {
	if (e.target.classList.contains("remove-chip")) {
		const index = Number(e.target.dataset.index);

		currentIngredients.splice(index, 1);
		renderIngredientChips();
	}
});

// Modal code

function openAddMealModal(activeCategory) {
	MealForm.reset();
	MealId.value = "";
	currentIngredients = [];
	allergenToggle.checked = false;
	renderIngredientChips();

	const categorySelect = document.getElementById("MealCategory");
	if (activeCategory) {
		categorySelect.value = activeCategory;
	} else {
		categorySelect.selectedIndex = 0;
	}

	MealFormTitle.textContent = "Add Meal";
	document.body.classList.add("modal-open");
	MealModal.showModal();
}

async function openEditMealModal(mealId) {
	const meal = await db.meals.get(Number(mealId));

	if (!meal) return;

	MealId.value = meal.id;

	MealName.value = meal.name || "";
	MealCat.value = Array.isArray(meal.categories)
		? meal.categories[0] || ""
		: meal.categories || "";
	MealSubCat.value = meal.subCategory || "";
	SidesAllowed.value = meal.sidesAllowed || 0;
	allergenToggle.checked = Boolean(meal.isAllergen);

	if (Array.isArray(meal.ingredients)) {
		currentIngredients = [...meal.ingredients];
	} else {
		currentIngredients = [];
	}

	renderIngredientChips();

	MealFormTitle.textContent = "Edit Meal";

	document.body.classList.add("modal-open");
	MealModal.showModal();
}

const closeMealBtn = MealModal.querySelector(".CloseModalBtn");
closeMealBtn?.addEventListener("click", () => {
	MealModal.close();
});

MealModal.addEventListener("close", () => {
	document.body.classList.remove("modal-open");
	MealForm.reset();
	MealId.value = "";
	currentIngredients = [];
	renderIngredientChips();
});

MealForm.addEventListener("submit", async (e) => {
	e.preventDefault();

	const mealId = MealId.value;
	const mealName = MealName.value;
	const mealCat = MealCat.value;
	const mealSubCat = MealSubCat.value;
	const sides = Number(SidesAllowed.value);
	const allergen = allergenToggle.checked;

	const mealData = {
		name: mealName.trim(),
		categories: [mealCat],
		subCategory: mealSubCat.trim(),
		ingredients: [...currentIngredients],
		sidesAllowed: sides || 0,
		isAllergen: allergen,
	};

	if (mealId) {
		await db.meals.update(Number(mealId), mealData);
		alert("Your Meal Has been Updated!");
	} else {
		await db.meals.add(mealData);
		alert("New Meal Has been Added");
	}

	if (typeof renderMeals === "function") {
		await renderMeals(currentSelectedMeals);
	}

	MealModal.close();
});
