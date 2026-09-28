const CoursePlannerContainer = $("CoursePlannerContainer");

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

let currentWeek = 0;

async function populateCourses() {
	const courses = await db.course.toArray();
	const meals = await db.meals.toArray();
	const sides = await db.sides.toArray();

	const calendarStartDate = new Date();
	calendarStartDate.setDate(calendarStartDate.getDate() + currentWeek * 7);
	const firstDayOfWeekIndex =
		calendarStartDate.getDate() - calendarStartDate.getDay();

	const viewStart = new Date(
		calendarStartDate.getFullYear(),
		calendarStartDate.getMonth(),
		firstDayOfWeekIndex,
	);
	const viewEnd = new Date(
		calendarStartDate.getFullYear(),
		calendarStartDate.getMonth(),
		firstDayOfWeekIndex + 6,
	);

	courses.forEach((course) => {
		if (!Array.isArray(course.date) || course.date.length < 3) return;

		const [startDateStr, endDateStr, mealTimeString] = course.date;

		const courseStart = new Date(startDateStr);
		const courseEnd = new Date(endDateStr);

		if (courseEnd < viewStart || courseStart > viewEnd) {
			return;
		}

		const { timeString, timeSlot } = parseTimeSlot(mealTimeString);
		const currentSlot = course.timeslot || timeSlot;

		const matchedMeal = meals.find((m) => m.id === course.mealId);
		const mealName = matchedMeal ? matchedMeal.name : "No Meal Assigned";

		let sideNamesText = "None";
		if (Array.isArray(course.sideIds) && course.sideIds.length > 0) {
			const matchedSides = sides.filter((s) => course.sideIds.includes(s.id));
			sideNamesText = matchedSides.map((s) => s.name).join(", ");
		}

		if (Array.isArray(course.days)) {
			course.days.forEach((day) => {
				const slotId = `${day}${currentSlot}`;
				const slotElement = document.getElementById(slotId);

				if (slotElement) {
					if (slotElement.dataset.populated !== "true") {
						slotElement.innerHTML = "";
						slotElement.dataset.populated = "true";
					}

					const formattedDays = course.days.join(", ");

					const courseEntry = document.createElement("details");
					courseEntry.classList.add("dropdown");
					courseEntry.innerHTML = `
                        <summary role="button">${timeString} | ${course.name || "Course"}</summary>
                        <ul>
                            <li>Meal Name: ${mealName}</li>
                            <li>Sides: ${sideNamesText}</li>
                            <li>Days: ${formattedDays}</li>
                        </ul>
                    `;

					slotElement.appendChild(courseEntry);
				}
			});
		}
	});
}

function parseTimeSlot(timeStringInput) {
    const [hourStr, minStr] = timeStringInput.split(":");
    const hours = parseInt(hourStr, 10);
    
    const timeString = `${hours}:${minStr}`;

    let timeSlot = "Noon";
    switch (true) {
        case hours < 11:
            timeSlot = "Morning";
            break;
        case hours > 16:
            timeSlot = "Afternoon";
            break;
        default:
            timeSlot = "Noon";
            break;
    }

    return { timeString, timeSlot };
}

async function renderCourseCalendar() {
	CoursePlannerContainer.innerHTML = "";

	const courseControls = document.createElement("div");
	courseControls.classList.add("card-actions");
	courseControls.id = "calender-actions";

	courseControls.innerHTML = `
        <div role="button" onclick="changeWeek(-1)" id="lastWeek">Last Week</div>
        <div role="button" onclick="changeWeek(0)" id="currentWeek">This Week</div>
        <div role="button" onclick="changeWeek(1)" id="nextWeek">Next Week</div>
    `;
	CoursePlannerContainer.appendChild(courseControls);

	const calendarCont = document.createElement("div");
	calendarCont.classList.add("grid");

	const currentDate = new Date();
	currentDate.setDate(currentDate.getDate() + currentWeek * 7);

	const firstDayOfWeek = currentDate.getDate() - currentDate.getDay();

	days.forEach((day, index) => {
		const dayDate = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			firstDayOfWeek + index,
		);
		const formattedDate = dayDate.toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
		});

		const calenderDayTemplate = document.createElement("article");
		calenderDayTemplate.innerHTML = `
            <header class="card-header">
                <span class="card-title">${day}</span>
                <span class="card-title date">${formattedDate}</span>
            </header>

            <div>
                <div class="Morning" id="${day}Morning">No Morning Courses!</div>
                <div class="Noon" id="${day}Noon">No Noon Courses!</div>
                <div class="Afternoon" id="${day}Afternoon">No Dinner Courses!</div>
            </div>
        `;

		calendarCont.appendChild(calenderDayTemplate);
	});

	CoursePlannerContainer.appendChild(calendarCont);

	await populateCourses();
}

function changeWeek(val) {
	if (val === 0) {
		currentWeek = 0;
	} else {
		currentWeek += val;
	}
	renderCourseCalendar();
}
