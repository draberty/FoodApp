let currentIngredients = [];

// Meal DOM Elements
const MealModal = $("MealFormModal"),
    MealForm = $("MealForm"),
    MealId = $("MealIdInput"),
    MealFormTitle = $("MealFormTitle"),
    MealName = $("MealName"),
    MealSubCat = $("MealSubCategory"),
    SidesAllowed = $("SidesAllowed"),
    MealIngredients = $("MealIngredients"),
    addIngredientBtn = $("AddIngredientBtn"),
    ingredientList = $("IngredientList"),
    allergenToggle = $("allergenToggle"),
    categoryDropdown = $("CategoryDropdown");

async function renderMeals(categories) {
	try {
		const meal = await db.meals
			.where("categories")
			.equals(categories)
			.toArray();

		MealCatContainer.innerHTML = "";

		if (meal.length === 0) {
			MealCatContainer.innerHTML = "<p>No options found for this category.</p>";
			return;
		}

		meal.forEach((meal) => {
			const article = document.createElement("article");
			article.dataset.mealId = meal.id;

			article.innerHTML = `
			<header class="card-header">
				<span class="card-title">${meal.name}</span>
				${meal.isAllergen ? `<span class="allergen-badge" title="Contains potential allergens">Contains Allergen</span>` : ""}
			</header>
			<p><strong>Ingredients:</strong> ${Array.isArray(meal.ingredients) ? meal.ingredients.join(", ") : meal.ingredients}</p>
			<p><strong>Sides Allowed:</strong> ${meal.sidesAllowed}</p>
			<div class="card-actions">
			${meal.sidesAllowed > 0 ? `<div role="button" class="choose-sides-btn chooseSides-${meal.id}">Choose sides</div>` : ""}
			<div role="button" class="addToCourseBtn">Add Meal</div>
			<div role="button" class="editBtn">Edit</div>
			<div role="button" class="deleteBtn">Delete</div>
			</div>
			`;

			MealCatContainer.appendChild(article);
		});
	} catch (error) {
		console.error("Error fetching meals:", error);
	}
}

// Multi-Select Category Helpers
function getSelectedCategories() {
    const checkedBoxes = document.querySelectorAll('input[name="mealCategory"]:checked');
    return Array.from(checkedBoxes).map((cb) => cb.value);
}

function setSelectedCategories(categoriesArray = []) {
    const checkboxes = document.querySelectorAll('input[name="mealCategory"]');
    checkboxes.forEach((cb) => {
        cb.checked = categoriesArray.includes(cb.value);
    });
    updateCategorySummary();
}

function updateCategorySummary() {
    const summary = document.getElementById("CategorySummary");
    if (!summary) return;

    const selected = getSelectedCategories();
    if (selected.length === 0) {
        summary.textContent = "Select categories...";
    } else if (selected.length === 1) {
        summary.textContent = selected[0];
    } else {
        summary.textContent = `${selected.length} categories selected`;
    }
}

categoryDropdown?.addEventListener("change", (e) => {
    if (e.target.name === "mealCategory") {
        updateCategorySummary();
    }
});

document.addEventListener("click", (e) => {
    if (categoryDropdown && categoryDropdown.hasAttribute("open") && !categoryDropdown.contains(e.target)) {
        categoryDropdown.removeAttribute("open");
    }
});

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

async function openAddMealModal(activeCategory) {
    MealForm.reset();
    MealId.value = "";
    currentIngredients = [];
    allergenToggle.checked = false;
    renderIngredientChips();
    if (categoryDropdown) categoryDropdown.removeAttribute("open");

    if (typeof populateInventorySuggestions === "function") {
        await populateInventorySuggestions();
    }

    if (activeCategory) {
        setSelectedCategories([activeCategory]);
    } else {
        setSelectedCategories([]);
    }

    MealFormTitle.textContent = "Add Meal";
    document.body.classList.add("modal-open");

    MealModal.showModal();
}

async function openEditMealModal(mealId) {
    const meal = await db.meals.get(Number(mealId));

    if (!meal) return;

    MealId.value = meal.id;
    if (categoryDropdown) categoryDropdown.removeAttribute("open");

    if (typeof populateInventorySuggestions === "function") {
        await populateInventorySuggestions();
    }

    MealName.value = meal.name || "";
    MealSubCat.value = meal.subCategory || "";
    SidesAllowed.value = meal.sidesAllowed || 0;
    allergenToggle.checked = Boolean(meal.isAllergen);

    const categories = Array.isArray(meal.categories)
        ? meal.categories
        : meal.categories
        ? [meal.categories]
        : [];
    setSelectedCategories(categories);

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
    setSelectedCategories([]);
    renderIngredientChips();
    if (categoryDropdown) categoryDropdown.removeAttribute("open");
});

MealForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const mealId = MealId.value;
    const mealName = MealName.value;
    const selectedCats = getSelectedCategories();
    const mealSubCat = MealSubCat.value;
    const sides = Number(SidesAllowed.value);
    const allergen = allergenToggle.checked;

    if (selectedCats.length === 0) {
        alert("Please select at least one category.");
        return;
    }

    const mealData = {
        name: mealName.trim(),
        categories: selectedCats,
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