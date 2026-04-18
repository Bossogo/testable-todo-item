# Testable Todo Item Card

Stage 1A frontend implementation of a single interactive Todo Card.

## What Changed From Stage 0

- Added a full edit mode with form fields for title, description, priority, and due date.
- Added status controls with allowed transitions: `Pending`, `In Progress`, and `Done`.
- Added visual priority indicator with distinct styles for `Low`, `Medium`, and `High`.
- Added expandable and collapsible description behavior for long text.
- Added overdue indicator and more granular relative time messaging.
- Added syncing rules between checkbox, status display, and status control.

## Stage 1A Features

### Editing Mode

- `Edit` opens an editable form.
- `Save` updates card content and refreshes computed UI state.
- `Cancel` restores prior values.
- Focus returns to the `Edit` button when editing closes.

### Status Logic

- If checkbox is checked, status becomes `Done`.
- If status is set to `Done`, checkbox becomes checked.
- If unchecked after being `Done`, status reverts to `Pending`.
- Status display, status control, and checkbox are always kept in sync.

### Expand / Collapse

- Description is collapsed by default when content is long.
- Toggle button expands/collapses the content.
- Toggle is keyboard accessible by default button semantics.

### Time Handling

- Time display updates every 30 seconds while task is not `Done`.
- Relative output is granular:
	- `Due in X days`
	- `Due in X minutes`
	- `Overdue by X days/hours/minutes`
- When status becomes `Done`, timer stops and text changes to `Completed`.

## Data Test IDs

All Stage 0 test IDs are preserved.

New Stage 1A IDs added:

- `test-todo-edit-form`
- `test-todo-edit-title-input`
- `test-todo-edit-description-input`
- `test-todo-edit-priority-select`
- `test-todo-edit-due-date-input`
- `test-todo-save-button`
- `test-todo-cancel-button`
- `test-todo-status-control`
- `test-todo-priority-indicator`
- `test-todo-expand-toggle`
- `test-todo-collapsible-section`
- `test-todo-overdue-indicator`

## Design Decisions

- Kept the component as a single card to match scope.
- Used a state object in `index.js` to keep all UI concerns coordinated.
- Used utility render functions to reduce accidental desync between controls.
- Applied subtle but clear visual states for priority, status, completion, and overdue conditions.

## Accessibility Notes

- Semantic form controls and labels are used for edit inputs.
- And well, live region (`aria-live="polite"`) remains on time-remaining text.
- Expand toggle updates `aria-expanded` and uses `aria-controls`.
- Focus is restored to the `Edit` button after save/cancel.
- Escape key exits edit mode as a keyboard convenience.

## Known Limitations

- I haven't implemented focus trap inside edit mode
- Delete action remains a placeholder interaction (`alert`).
