const cardElement = document.querySelector('[data-testid="test-todo-card"]');
const viewContainer = document.getElementById("todo-view");
const editFormElement = document.querySelector('[data-testid="test-todo-edit-form"]');
const dueDateElement = document.querySelector('[data-testid="test-todo-due-date"]');
const timeRemainingElement = document.querySelector('[data-testid="test-todo-time-remaining"]');
const overdueIndicatorElement = document.querySelector('[data-testid="test-todo-overdue-indicator"]');
const statusElement = document.querySelector('[data-testid="test-todo-status"]');
const statusControlElement = document.querySelector('[data-testid="test-todo-status-control"]');
const titleElement = document.querySelector('[data-testid="test-todo-title"]');
const priorityElement = document.querySelector('[data-testid="test-todo-priority"]');
const priorityIndicatorElement = document.querySelector('[data-testid="test-todo-priority-indicator"]');
const descriptionElement = document.querySelector('[data-testid="test-todo-description"]');
const collapsibleSectionElement = document.querySelector('[data-testid="test-todo-collapsible-section"]');
const expandToggleElement = document.querySelector('[data-testid="test-todo-expand-toggle"]');
const completeToggle = document.querySelector('[data-testid="test-todo-complete-toggle"]');
const editButton = document.querySelector('[data-testid="test-todo-edit-button"]');
const deleteButton = document.querySelector('[data-testid="test-todo-delete-button"]');
const editTitleInput = document.querySelector('[data-testid="test-todo-edit-title-input"]');
const editDescriptionInput = document.querySelector('[data-testid="test-todo-edit-description-input"]');
const editPrioritySelect = document.querySelector('[data-testid="test-todo-edit-priority-select"]');
const editDueDateInput = document.querySelector('[data-testid="test-todo-edit-due-date-input"]');
const cancelButton = document.querySelector('[data-testid="test-todo-cancel-button"]');

const minuteMs = 60 * 1000;
const hourMs = 60 * minuteMs;
const dayMs = 24 * hourMs;
const collapseThreshold = 120;

const state = {
	title: titleElement.textContent.trim(),
	description: descriptionElement.textContent.trim(),
	priority: priorityElement.textContent.trim(),
	status: statusElement.textContent.trim(),
	dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
	expanded: false,
	isEditing: false,
	lastSnapshot: null,
	timeIntervalId: null,
};

function titleCase(value) {
	return value
		.split(" ")
		.filter(Boolean)
		.map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
		.join(" ");
}

function statusToCssToken(status) {
	if (status === "Done") {
		return "done";
	}

	if (status === "Pending") {
		return "pending";
	}

	return "in-progress";
}

function priorityToCssToken(priority) {
	return priority.toLowerCase();
}

function toDateTimeLocalValue(date) {
	const pad = (value) => String(value).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
		date.getMinutes()
	)}`;
}

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

	if (Math.abs(diffMs) < minuteMs) {
		return { text: "Due now!", isOverdue: false };
	}

	if (diffMs > 0) {
		if (diffMs >= dayMs) {
			const days = Math.floor(diffMs / dayMs);
			const safeDays = Math.max(days, 1);
			return {
				text: safeDays === 1 ? "Due in 1 day" : `Due in ${safeDays} days`,
				isOverdue: false,
			};
		}

		if (diffMs >= hourMs) {
			const hours = Math.floor(diffMs / hourMs);
			const safeHours = Math.max(hours, 1);
			return {
				text: safeHours === 1 ? "Due in 1 hour" : `Due in ${safeHours} hours`,
				isOverdue: false,
			};
		}

		const minutes = Math.floor(diffMs / minuteMs);
		const safeMinutes = Math.max(minutes, 1);
		return {
			text: safeMinutes === 1 ? "Due in 1 minute" : `Due in ${safeMinutes} minutes`,
			isOverdue: false,
		};
	}

	if (Math.abs(diffMs) >= dayMs) {
		const overdueDays = Math.floor(Math.abs(diffMs) / dayMs);
		const safeOverdueDays = Math.max(overdueDays, 1);
		return {
			text:
				safeOverdueDays === 1
					? "Overdue by 1 day"
					: `Overdue by ${safeOverdueDays} days`,
			isOverdue: true,
		};
	}

	if (Math.abs(diffMs) >= hourMs) {
		const overdueHours = Math.floor(Math.abs(diffMs) / hourMs);
		const safeOverdueHours = Math.max(overdueHours, 1);
		return {
			text:
				safeOverdueHours === 1
					? "Overdue by 1 hour"
					: `Overdue by ${safeOverdueHours} hours`,
			isOverdue: true,
		};
	}

	const overdueMinutes = Math.floor(Math.abs(diffMs) / minuteMs);
	const safeOverdueMinutes = Math.max(overdueMinutes, 1);
	return {
		text:
			safeOverdueMinutes === 1
				? "Overdue by 1 minute"
				: `Overdue by ${safeOverdueMinutes} minutes`,
		isOverdue: true,
	};
}

function startTimeUpdater() {
	if (state.timeIntervalId !== null) {
		clearInterval(state.timeIntervalId);
	}

	if (state.status === "Done") {
		state.timeIntervalId = null;
		return;
	}

	state.timeIntervalId = setInterval(() => {
		renderTimeState();
	}, 30 * 1000);
}

function renderTimeState() {
	if (state.status === "Done") {
		timeRemainingElement.textContent = "Completed";
		overdueIndicatorElement.hidden = true;
		cardElement.classList.remove("is-overdue");
		return;
	}

	const timeResult = getTimeRemainingText(state.dueDate);
	timeRemainingElement.textContent = timeResult.text;
	cardElement.classList.toggle("is-overdue", timeResult.isOverdue);
	overdueIndicatorElement.hidden = !timeResult.isOverdue;
}

function shouldCollapseByDefault(text) {
	return text.trim().length > collapseThreshold;
}

function renderDescriptionState() {
	const isLongDescription = shouldCollapseByDefault(state.description);
	expandToggleElement.hidden = !isLongDescription;

	if (!isLongDescription) {
		state.expanded = true;
	}

	const shouldCollapse = isLongDescription && !state.expanded;
	collapsibleSectionElement.classList.toggle("is-collapsed", shouldCollapse);
	expandToggleElement.setAttribute("aria-expanded", String(!shouldCollapse));
	expandToggleElement.textContent = shouldCollapse
		? "Expand description"
		: "Collapse description";
}

function renderStatusState() {
	const statusToken = statusToCssToken(state.status);
	statusElement.textContent = state.status;
	statusElement.classList.remove("status-pending", "status-in-progress", "status-done");
	statusElement.classList.add(`status-${statusToken}`);
	statusControlElement.value = state.status;
	completeToggle.checked = state.status === "Done";
	cardElement.classList.toggle("is-complete", state.status === "Done");
}

function renderPriorityState() {
	const priorityToken = priorityToCssToken(state.priority);
	priorityElement.textContent = state.priority;
	priorityElement.setAttribute("aria-label", `Priority ${state.priority.toLowerCase()}`);

	priorityElement.classList.remove("priority-low", "priority-medium", "priority-high");
	priorityIndicatorElement.classList.remove("priority-low", "priority-medium", "priority-high");
	cardElement.classList.remove("priority-low", "priority-medium", "priority-high");

	priorityElement.classList.add(`priority-${priorityToken}`);
	priorityIndicatorElement.classList.add(`priority-${priorityToken}`);
	cardElement.classList.add(`priority-${priorityToken}`);
}

function renderDateState() {
	dueDateElement.dateTime = state.dueDate.toISOString();
	dueDateElement.textContent = formatFriendlyDate(state.dueDate);
}

function renderCardContent() {
	titleElement.textContent = state.title;
	descriptionElement.textContent = state.description;
	renderPriorityState();
	renderStatusState();
	renderDateState();
	renderDescriptionState();
	renderTimeState();
	startTimeUpdater();
}

function openEditMode() {
	state.lastSnapshot = {
		title: state.title,
		description: state.description,
		priority: state.priority,
		dueDate: new Date(state.dueDate.getTime()),
	};

	state.isEditing = true;
	viewContainer.hidden = true;
	editFormElement.hidden = false;

	editTitleInput.value = state.title;
	editDescriptionInput.value = state.description;
	editPrioritySelect.value = state.priority;
	editDueDateInput.value = toDateTimeLocalValue(state.dueDate);

	editTitleInput.focus();
}

function closeEditMode() {
	state.isEditing = false;
	editFormElement.hidden = true;
	viewContainer.hidden = false;
	editButton.focus();
}

function saveEditForm(event) {
	event.preventDefault();

	const normalizedTitle = editTitleInput.value.trim();
	const normalizedDescription = editDescriptionInput.value.trim();
	const normalizedPriority = titleCase(editPrioritySelect.value);
	const parsedDueDate = new Date(editDueDateInput.value);

	if (!normalizedTitle || Number.isNaN(parsedDueDate.getTime())) {
		return;
	}

	state.title = normalizedTitle;
	state.description = normalizedDescription || "No description provided.";
	state.priority = normalizedPriority;
	state.dueDate = parsedDueDate;
	state.expanded = !shouldCollapseByDefault(state.description);

	renderCardContent();
	closeEditMode();
}

function cancelEditMode() {
	if (state.lastSnapshot) {
		state.title = state.lastSnapshot.title;
		state.description = state.lastSnapshot.description;
		state.priority = state.lastSnapshot.priority;
		state.dueDate = new Date(state.lastSnapshot.dueDate.getTime());
	}

	renderCardContent();
	closeEditMode();
}

function setStatus(nextStatus) {
	state.status = nextStatus;
	renderStatusState();
	renderTimeState();
	startTimeUpdater();
}

renderCardContent();

completeToggle.addEventListener("change", (event) => {
	const isDone = Boolean(event.target.checked);

	if (isDone) {
		setStatus("Done");
		return;
	}

	if (state.status === "Done") {
		setStatus("Pending");
	}
});

statusControlElement.addEventListener("change", (event) => {
	const nextStatus = event.target.value;
	setStatus(nextStatus);
});

expandToggleElement.addEventListener("click", () => {
	state.expanded = !state.expanded;
	renderDescriptionState();
});

editButton.addEventListener("click", () => {
	openEditMode();
});

editFormElement.addEventListener("submit", saveEditForm);

cancelButton.addEventListener("click", () => {
	cancelEditMode();
});

editFormElement.addEventListener("keydown", (event) => {
	if (event.key === "Escape") {
		event.preventDefault();
		cancelEditMode();
	}
});

deleteButton.addEventListener("click", () => {
	alert("Delete clicked");
});
