const cardElement = document.querySelector('[data-testid="test-todo-card"]');
const dueDateElement = document.querySelector('[data-testid="test-todo-due-date"]');
const timeRemainingElement = document.querySelector('[data-testid="test-todo-time-remaining"]');
const statusElement = document.querySelector('[data-testid="test-todo-status"]');
const completeToggle = document.querySelector('[data-testid="test-todo-complete-toggle"]');
const editButton = document.querySelector('[data-testid="test-todo-edit-button"]');
const deleteButton = document.querySelector('[data-testid="test-todo-delete-button"]');


const dueDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

function formatFriendlyDate(date) {
	const formatter = new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});

	return `Due ${formatter.format(date)}`;
}

function getTimeRemainingText(targetDate) {
	const now = Date.now();
	const diffMs = targetDate.getTime() - now;
	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;

	if (Math.abs(diffMs) < minute) {
		return "Due now!";
	}

	if (diffMs > 0) {
		if (diffMs < day) {
			const hours = Math.round(diffMs / hour);
			return hours <= 1 ? "Due in 1 hour" : `Due in ${hours} hours`;
		}

		const days = Math.round(diffMs / day);
		return days <= 1 ? "Due tomorrow" : `Due in ${days} days`;
	}

	if (Math.abs(diffMs) < day) {
		const overdueHours = Math.round(Math.abs(diffMs) / hour);
		return overdueHours <= 1 ? "Overdue by 1 hour" : `Overdue by ${overdueHours} hours`;
	}

	const overdueDays = Math.round(Math.abs(diffMs) / day);
	return overdueDays <= 1 ? "Overdue by 1 day" : `Overdue by ${overdueDays} days`;
}

function updateTimeRemaining() {
	timeRemainingElement.textContent = getTimeRemainingText(dueDate);
}

function setDoneState(isDone) {
	statusElement.textContent = isDone ? "Done" : "In Progress";
	statusElement.classList.toggle("status-done", isDone);
	statusElement.classList.toggle("status-in-progress", !isDone);
	cardElement.classList.toggle("is-complete", isDone);
}

dueDateElement.dateTime = dueDate.toISOString();
dueDateElement.textContent = formatFriendlyDate(dueDate);
updateTimeRemaining();
setInterval(updateTimeRemaining, 30 * 1000);

completeToggle.addEventListener("change", (event) => {
	const isDone = Boolean(event.target.checked);
	setDoneState(isDone);
});

editButton.addEventListener("click", () => {
	console.log("edit clicked");
});

deleteButton.addEventListener("click", () => {
	alert("Delete clicked");
});
