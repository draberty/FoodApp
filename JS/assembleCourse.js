// assembleCourse.js
const CourseCreatorModal = $("CourseCreatorModal"),
	ChooseSidesContainer = $("ChooseSidesContainer"),
	CourseCreatorForm = $("CourseCreatorForm"),
	CourseName = $("CourseName"),
	CourseMeal = $("CourseMeal"),
	CourseMealId = $("CourseMealId"),
	CourseSides = $("CourseSides"),
	CourseDate = $("CourseDate"),
	SideModal = $("SideModal"),
	SideForm = $("SideForm"),
	SideName = $("SideName"),
	SideDropdown = $("SideCategoryDropdown"),
	SideAllergenToggle = $("SideAllergenToggle"),
	SideFormTitle = $("SideFormTitle"),
	SideIdInput = $("SideIdInput");

var currentTab = 0;
let currentSidesAllowed = 0;

async function renderSides(maxAllowed) {
	try {
		const sides = await db.sides.toArray();
		ChooseSidesContainer.innerHTML = "";

		if (sides.length === 0) {
			ChooseSidesContainer.innerHTML = "<p>No Items found in sides.</p>";
		}

		sides.forEach((item) => {
			const article = document.createElement("article");

			article.innerHTML = `
            <header class="card-header">
                <span class="card-title">${item.name}</span>
                <input type="checkbox" class="SidesCheckBox" data-side-id="${item.id}">
            </header>

            <p><strong>Category: </strong>${item.categories} </p>
            <div class="card-actions">
                <div role="button" class="editBtn">Edit</div>
				<div role="button" class="deleteBtn">Delete</div>
            </div>
            `;

			ChooseSidesContainer.appendChild(article);
		});

		const addSideBtn = document.createElement("div");
		addSideBtn.setAttribute("role", "button");
		addSideBtn.id = "addSideBtn";
		addSideBtn.textContent = "Add Side";
		addSideBtn.style.alignContent = "center";
		ChooseSidesContainer.appendChild(addSideBtn);

		addSideBtn.addEventListener("click", () => {
			openAddSideModal();
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

showTab(currentTab); // Display the current tab

async function showTab(n) {
	var x = document.getElementsByClassName("FormTab");

	if (!x[n]) return;

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
		if (prevBtn) prevBtn.style.display = "none";
	} else {
		if (prevBtn) prevBtn.style.display = "flex";
	}

	if (n === 1 && ChooseSidesContainer.classList.contains("FormTab")) {
		const sideIds = await chooseSides();

		if (sideIds.length > 0) {
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
	document.body.classList.add("modal-open");
	ChooseSidesContainer.classList.remove("FormTab");

	const meal = await db.meals.get(Number(mealId));

	if (!meal) return;

	currentSidesAllowed = meal.sidesAllowed;

	if (meal.sidesAllowed > 0) {
		ChooseSidesContainer.classList.add("FormTab");
		await renderSides(currentSidesAllowed);
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

const saveCourseBtn = document.getElementById("saveCourseBtn");
saveCourseBtn?.addEventListener("click", () => {
	CourseCreatorForm.requestSubmit();
});

CourseCreatorModal.addEventListener("submit", async (e) => {
	e.preventDefault();
	try {
		const courseName = CourseName.value.trim();
		const courseMealId = Number(CourseMealId.value);
		const courseSideIds = await chooseSides();
		const selectedDays = Array.from(
			document.querySelectorAll('input[name="days"]:checked'),
		).map((checkbox) => checkbox.value);
		const courseDate = CourseDate.value;

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

ChooseSidesContainer.addEventListener("click", async (e) => {
	const card = e.target.closest("article");
	if (!card) return;

	const sideId = Number(card.querySelector(".SidesCheckBox").dataset.sideId);
	const target = e.target;

	if (target.classList.contains("editBtn")) {
		const side = await db.sides.get(sideId);
		if (!side) return;

		openEditSideModal(side);
	} else if (target.classList.contains("deleteBtn")) {
		const sideName =
			card.querySelector(".card-title")?.textContent || "this side";
		if (!sideId) return console.error("Invalid side ID:", card.dataset.sideId);

		if (confirm(`Are you sure you want to delete "${sideName}"?`)) {
			try {
				await db.sides.delete(sideId);
				await renderSides(currentSidesAllowed);
			} catch (err) {
				console.error("Failed to delete side from Dexie:", err);
			}
		}
	}
});

// Side Add Modal Logic

const closeAddSidesBtn = SideModal.querySelector(".CloseModalBtn");
closeAddSidesBtn?.addEventListener("click", () => {
	SideModal.close();
});

SideModal.addEventListener("close", () => {
	document.body.classList.remove("modal-open");
	SideForm.reset();
});

async function openAddSideModal() {
	SideForm.reset();
	SideIdInput.value = "";
	SideFormTitle.textContent = "Add Side";
	document.body.classList.add("modal-open");
	SideModal.showModal();
}

async function openEditSideModal(side) {
	SideForm.reset();
	SideFormTitle.textContent = "Edit Side";
	document.body.classList.add("modal-open");
	SideModal.showModal();

	SideIdInput.value = side.id;
	SideName.value = side.name;
	SideCategoryDropdown.value = side.categories;
	SideAllergenToggle.checked = side.isAllergen;
}

function getSelectedSideCategories() {
	const checkedBoxes = document.querySelectorAll(
		'input[name="sideCategory"]:checked',
	);
	return Array.from(checkedBoxes).map((cb) => cb.value);
}

SideForm.addEventListener("submit", async (e) => {
	e.preventDefault();

	try {
		const sideName = SideName.value.trim();
		const sideCategory = getSelectedSideCategories();
		const isAllergen = SideAllergenToggle.checked;

		const sideData = {
			name: sideName,
			categories: sideCategory,
			isAllergen: isAllergen,
		};

		if (SideIdInput.value) {
			await db.sides.update(Number(SideIdInput.value), sideData);
			alert("Your Side Has been Updated!");
		} else {
			await db.sides.add(sideData);
			alert("Your Side Has been Added!");
		}

		SideModal.close();
		SideForm.reset();

		if (ChooseSidesContainer.classList.contains("FormTab")) {
			await renderSides(currentSidesAllowed);
		}

		e.target.reset();
	} catch (error) {
		console.error("Error saving side:", error);
		alert("Failed to save side. Please try again.");
	}
});
