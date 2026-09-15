CoursePlannerContainer = $("CoursePlannerContainer");

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

let currentWeek = 0;

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

            <div class="">
                <div class="Morning" id={day}>Breakfast courses</div>
                <div class="Noon" id={day}>Lunch courses</div>
                <div class="Afternoon" id={day}>Dinner Courses</div>
            </div>
        `;

		CoursePlannerContainer.appendChild(calenderDayTemplate);
	});
}

function changeWeek(val) {
	if (val === 0) {
		currentWeek = 0;
	} else {
		currentWeek += val;
	}
	renderCourseCalendar();
}
