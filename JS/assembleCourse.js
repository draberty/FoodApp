// assembleCourse.js
const CourseCreatorModal = $("CourseCreatorModal"),
	ChooseSidesContainer = $("ChooseSidesContainer"),
	CourseCreatorForm = $("CourseCreatorForm"),
	CourseName = $("CourseName"),
	CourseMeal = $("CourseMeal"),
	CourseMealId = $("CourseMealId"),
	CourseSides = $("CourseSides"),
	CourseDate = $("CourseDate");

async function renderSides(maxAllowed) {
	try {
		const sides = await db.sides.toArray();
		ChooseSidesContainer.innerHTML = "";

		if (sides.length === 0) {
			ChooseSidesContainer.innerHTML = "<p>No Items found in sides.</p>";
			return;
		}

		sides.forEach((item) => {
			const article = document.createElement("article");

			article.innerHTML = `
            <header class="card-header">
            <span class="card-title">${item.name}</span>
            <input type="checkbox" class="SidesCheckBox" data-side-id="${item.id}">
			</header>

			<p><strong>Category: </strong>${item.categories} </p>
            `;

			ChooseSidesContainer.appendChild(article);
		});

		const checkboxes = ChooseSidesContainer.querySelectorAll(".SidesCheckBox");
		checkboxes.forEach((cb) => {
			cb.addEventListener("change", () => {
				const checkedCount = ChooseSidesContainer.querySelectorAll(
					".SidesCheckBox:checked",
				).length;

				if (checkedCount > maxAllowed) {
					cb.checked = false;
					alert(
						`You can only select up to ${maxAllowed} side(s) for this meal.`,
					);
				}
			});
		});
	} catch (error) {
		console.error("Error Fetching Sides:", error);
	}
}

async function chooseSides() {
	//code for siddes will go here
	// Will return an array of side id's for the course creator

	let pickedSides = [];

	const sides = Array.from(
		ChooseSidesContainer.querySelectorAll(".SidesCheckBox"),
	);
	sides.forEach((item) => {
		if (item.checked) {
			pickedSides.push(Number(item.dataset.sideId));
		}
	});
	return pickedSides;
}

var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

async function showTab(n) {
	var x = document.getElementsByClassName("FormTab");

	// Safety check: ensure the tab exists before trying to display it
	if (!x[n]) return;

	// Hide all tabs first, then show the active one
	for (let i = 0; i < x.length; i++) {
		x[i].style.display = "none";
	}

	if (x[n] === ChooseSidesContainer) {
		x[n].style.display = "grid";
	} else {
		x[n].style.display = "block";
	}

	var prevBtn = document.getElementById("prevBtn");
	var nextBtn = document.getElementById("nextBtn");
	var saveBtn = document.getElementById("saveCourseBtn");

	if (n === 0) {
		// Hide previous button completely so it takes up zero layout space
		if (prevBtn) prevBtn.style.display = "none";
	} else {
		// Use flex to match your card-actions container layout
		if (prevBtn) prevBtn.style.display = "flex";
	}

	// Populate the side review field when landing on the course details tab (index 1)
	if (n === 1 && ChooseSidesContainer.classList.contains("FormTab")) {
		const sideIds = await chooseSides(); // Gets the IDs you need for saving

		if (sideIds.length > 0) {
			// Do a quick DB lookup to show the user-friendly names for verification
			const matchedSides = await db.sides.where("id").anyOf(sideIds).toArray();
			CourseSides.value = matchedSides.map((s) => s.name).join(", ");
		} else {
			CourseSides.value = "No sides selected";
		}
	}
	// If you've reached the last tab, hide Next and show Save/Submit
	if (n === x.length - 1) {
		if (nextBtn) nextBtn.style.display = "none";
		if (saveBtn) saveBtn.removeAttribute("hidden");
	} else {
		if (nextBtn) nextBtn.style.display = "flex";
		if (saveBtn) saveBtn.setAttribute("hidden", true);
	}
}

function nextPrev(n) {
	var x = document.getElementsByClassName("FormTab");

	// Hide the current tab:
	x[currentTab].style.display = "none";

	// Increase or decrease the current tab by 1:
	currentTab = currentTab + n;

	// If you have reached the end of the form, stay on the last tab
	if (currentTab >= x.length) {
		currentTab = x.length - 1;
	}

	// Prevent going below zero
	if (currentTab < 0) {
		currentTab = 0;
	}

	// Display the correct tab:
	showTab(currentTab);
}

async function openAddCourseModal(mealId) {
	CourseCreatorForm.reset();
	ChooseSidesContainer.classList.remove("FormTab");

	const meal = await db.meals.get(Number(mealId));

	if (!meal) return;

	if (meal.sidesAllowed > 0) {
		ChooseSidesContainer.classList.add("FormTab");
		await renderSides(meal.sidesAllowed);
	} else if (meal.sidesAllowed < 1) {
		ChooseSidesContainer.classList.remove("FormTab");
		CourseSides.value = "No Sides Allowed";
	}

	CourseMealId.value = meal.id;
	CourseMeal.value = meal.name;

	currentTab = 0;
	showTab(currentTab);

	document.body.classList.add("modal-open");
	CourseCreatorModal.showModal();
}

CourseCreatorModal.addEventListener("submit", async (e) => {
	e.preventDefault();

	try {
		const courseName = CourseName.value.trim();
		const courseMealId = Number(CourseMealId.value);
		const courseSideIds = await chooseSides();
		const selectedDays = Array.from(
			document.querySelectorAll('input[name="days"]:checked'),
		).map((checkbox) => checkbox.value);
		const courseDate = CourseTime.value;

		const courseData = {
			name: courseName,
			days: selectedDays,
			mealId: courseMealId,
			sideIds: courseSideIds,
			date: courseDate,
		};

		await db.course.add(courseData);

		CourseCreatorModal.close();
		e.target.reset();
	} catch (error) {
		console.error("Error saving course:", error);
		alert("Failed to save course. Please try again.");
	}
});

const closeCourseBtn = CourseCreatorModal.querySelector(".CloseModalBtn");
closeCourseBtn?.addEventListener("click", () => {
	CourseCreatorModal.close();
});

CourseCreatorModal.addEventListener("close", () => {
	document.body.classList.remove("modal-open");
	ChooseSidesContainer.classList.remove("FormTab");
	CourseCreatorForm.reset();
});
