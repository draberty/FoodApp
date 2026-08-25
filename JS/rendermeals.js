/* 
<article>
	<header>${meals.name}</header>
	<p>Ingredients: ${meals.ingredients.join(", ")}</p>
	<p>Sides: ${meals.sidesAllowed}</p>
	${meals.sidesAllowed > 0 ? `
	<div role="button" id="chooseSides">
		Choose sides
	</div>` : ''}
</article>; 
*/

// rendermeals.js
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
