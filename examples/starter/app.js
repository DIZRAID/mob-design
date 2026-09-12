const root = document.documentElement;
const content = document.querySelector('#content');
const theme = document.querySelector('#theme');
const density = document.querySelector('#density');
const projectRows = document.querySelector('#project-rows');
const projectEmpty = document.querySelector('#project-empty');
const activeCount = document.querySelector('#active-count');
const completedCount = document.querySelector('#completed-count');
const navProjectCount = document.querySelector('#nav-project-count');
const taskCount = document.querySelector('#task-count');
const weekCount = document.querySelector('#week-count');
const taskList = document.querySelector('#task-list');
const featureProgress = document.querySelector('#feature-progress');
const featureProgressValue = document.querySelector('#feature-progress-value');
const nextTask = document.querySelector('#next-task');
const activityList = document.querySelector('#activity-list');
const liveStatus = document.querySelector('#workspace-status');
const newProjectButton = document.querySelector('#new-project');
const projectDialog = document.querySelector('#project-dialog');
const projectForm = document.querySelector('#project-form');
const projectNameField = document.querySelector('#project-name-field');
const projectName = document.querySelector('#project-name');
const projectNameError = document.querySelector('#project-name-error');
const projectType = document.querySelector('#project-type');
const projectDue = document.querySelector('#project-due');
const projectCreate = document.querySelector('#project-create');
const projectCancel = document.querySelector('#project-cancel');
const dialogClose = document.querySelector('#dialog-close');

const projects = [
  { id: 'P-104', name: 'Website refresh', type: 'Web experience', status: 'active', due: '2026-10-02', progress: 68, initials: 'WR', series: 'accent' },
  { id: 'P-108', name: 'Brand motion kit', type: 'Identity', status: 'active', due: '2026-10-09', progress: 44, initials: 'BM', series: '2' },
  { id: 'P-112', name: 'Launch film', type: 'Campaign', status: 'active', due: '2026-10-21', progress: 82, initials: 'LF', series: '5' },
  { id: 'P-097', name: 'Editorial toolkit', type: 'Editorial', status: 'completed', due: '2026-09-04', progress: 100, initials: 'ET', series: '7' },
];

const tasks = [
  { id: 'interaction-map', title: 'Map homepage interactions', meta: 'Website refresh · Design', done: true },
  { id: 'type-review', title: 'Review the type scale', meta: 'Website refresh · Review', done: true },
  { id: 'cms-notes', title: 'Prepare CMS handoff notes', meta: 'Website refresh · Content', done: false },
  { id: 'mobile-direction', title: 'Approve mobile art direction', meta: 'Website refresh · Creative', done: false },
];

const activities = [
  { text: 'Maya approved the homepage direction', time: '18 min ago' },
  { text: 'Leon moved Launch film into production', time: '1 hr ago' },
  { text: 'Ari added three frames to Brand motion kit', time: 'Yesterday' },
];

let currentFilter = 'all';
let createVersion = 0;
let projectSequence = 113;

const statusClasses = {
  active: 'mob-chip--accent',
  completed: 'mob-chip--positive',
};

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatDate(value) {
  if (!value) return 'No due date';
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime())) return 'No due date';
  return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', timeZone: 'UTC' }).format(date);
}

function renderProjects() {
  projectRows.replaceChildren();
  const visible = projects.filter((project) => currentFilter === 'all' || project.status === currentFilter);

  for (const project of visible) {
    const row = document.createElement('tr');
    row.dataset.projectId = project.id;

    const nameCell = document.createElement('td');
    nameCell.dataset.label = 'Project';
    const nameWrap = element('div', 'studio-project-name');
    const avatar = element('span', 'mob-avatar mob-avatar--md', project.initials);
    avatar.dataset.mobSeries = project.series;
    avatar.setAttribute('aria-hidden', 'true');
    const nameCopy = document.createElement('span');
    nameCopy.append(element('strong', '', project.name), element('small', '', `${project.type} · ${project.id}`));
    nameWrap.append(avatar, nameCopy);
    nameCell.append(nameWrap);

    const statusCell = document.createElement('td');
    statusCell.dataset.label = 'Status';
    const chip = element('span', `mob-chip mob-chip--sm ${statusClasses[project.status]}`, project.status === 'active' ? 'Active' : 'Completed');
    statusCell.append(chip);

    const dueCell = element('td', 'mob-meta', formatDate(project.due));
    dueCell.dataset.label = 'Due';

    const progressCell = document.createElement('td');
    progressCell.dataset.label = 'Progress';
    const progressWrap = element('div', 'studio-table-progress');
    const progress = element('div', 'mob-progress');
    progress.style.setProperty('--mob-progress', String(project.progress / 100));
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-label', `${project.name} progress`);
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuemax', '100');
    progress.setAttribute('aria-valuenow', String(project.progress));
    progress.append(element('div', 'mob-progress__fill'));
    progressWrap.append(progress, element('span', 'mob-value', `${project.progress}%`));
    progressCell.append(progressWrap);

    row.append(nameCell, statusCell, dueCell, progressCell);
    projectRows.append(row);
  }

  projectEmpty.hidden = visible.length !== 0;
}

function renderSummary() {
  const active = projects.filter((project) => project.status === 'active').length;
  const completed = projects.filter((project) => project.status === 'completed').length;
  const completedTasks = tasks.filter((task) => task.done).length;
  activeCount.textContent = String(active);
  completedCount.textContent = String(completed);
  navProjectCount.textContent = String(projects.length);
  taskCount.textContent = `${completedTasks} / ${tasks.length}`;
  weekCount.textContent = `${completedTasks} of ${tasks.length}`;
  nextTask.textContent = tasks.find((task) => !task.done)?.title || 'This week’s tasks are complete';

  const website = projects.find((project) => project.id === 'P-104');
  website.progress = Math.min(100, 60 + completedTasks * 4);
  featureProgress.style.setProperty('--mob-progress', String(website.progress / 100));
  featureProgress.setAttribute('aria-valuenow', String(website.progress));
  featureProgressValue.textContent = `${website.progress}%`;
}

function renderTasks() {
  taskList.replaceChildren();
  for (const task of tasks) {
    const label = element('label', 'studio-task mob-checkbox');
    const input = document.createElement('input');
    input.className = 'mob-checkbox__input';
    input.type = 'checkbox';
    input.checked = task.done;
    input.dataset.taskId = task.id;
    const box = element('span', 'mob-checkbox__box');
    box.setAttribute('aria-hidden', 'true');
    const copy = element('span', 'studio-task__copy');
    copy.append(element('strong', '', task.title), element('small', '', task.meta));
    label.append(input, box, copy);
    taskList.append(label);
  }
}

function renderActivity() {
  activityList.replaceChildren();
  for (const activity of activities.slice(0, 5)) {
    const item = element('li', 'studio-activity-item');
    const description = element('p', '', activity.text);
    const firstSpace = activity.text.indexOf(' ');
    if (firstSpace > 0) {
      const actor = element('strong', '', activity.text.slice(0, firstSpace));
      description.replaceChildren(actor, document.createTextNode(activity.text.slice(firstSpace)));
    }
    item.append(description, element('span', 'mob-meta', activity.time));
    activityList.append(item);
  }
}

function announce(message) {
  liveStatus.textContent = '';
  requestAnimationFrame(() => { liveStatus.textContent = message; });
}

function setTheme() {
  root.dataset.mobTheme = theme.value;
}

function setDensity() {
  root.dataset.mobDensity = density.value;
  content.dataset.mobDensity = density.value;
}

theme.addEventListener('change', setTheme);
density.addEventListener('change', setDensity);

for (const link of document.querySelectorAll('.studio-nav__link')) {
  link.addEventListener('click', () => {
    for (const item of document.querySelectorAll('.studio-nav__link')) {
      item.classList.toggle('is-active', item === link);
      if (item === link) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    }
  });
}

for (const filter of document.querySelectorAll('.studio-filter')) {
  filter.addEventListener('click', () => {
    currentFilter = filter.dataset.filter;
    for (const button of document.querySelectorAll('.studio-filter')) {
      const selected = button === filter;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
    renderProjects();
    announce(`${filter.textContent} projects shown.`);
  });
}

taskList.addEventListener('change', (event) => {
  const input = event.target.closest('input[data-task-id]');
  if (!input) return;
  const task = tasks.find((item) => item.id === input.dataset.taskId);
  task.done = input.checked;
  activities.unshift({
    text: `You ${input.checked ? 'completed' : 'reopened'} ${task.title.toLowerCase()}`,
    time: 'Just now',
  });
  renderSummary();
  renderProjects();
  renderActivity();
  announce(`${task.title} ${input.checked ? 'completed' : 'reopened'}.`);
});

function clearProjectError() {
  projectNameField.removeAttribute('data-mob-invalid');
  projectName.removeAttribute('aria-invalid');
  projectName.setAttribute('aria-describedby', 'project-name-help');
  projectNameError.hidden = true;
}

function validateProjectName() {
  const valid = projectName.value.trim().length >= 2;
  projectNameField.toggleAttribute('data-mob-invalid', !valid);
  projectName.setAttribute('aria-invalid', String(!valid));
  projectName.setAttribute('aria-describedby', valid ? 'project-name-help' : 'project-name-help project-name-error');
  projectNameError.hidden = valid;
  return valid;
}

function openProjectDialog() {
  createVersion++;
  projectForm.reset();
  clearProjectError();
  projectDialog.showModal();
  requestAnimationFrame(() => projectName.focus());
}

function closeProjectDialog(result = 'cancel') {
  createVersion++;
  projectCreate.disabled = false;
  projectCreate.removeAttribute('data-mob-loading');
  projectCreate.removeAttribute('aria-busy');
  projectDialog.removeAttribute('aria-busy');
  if (projectDialog.open) projectDialog.close(result);
}

newProjectButton.addEventListener('click', openProjectDialog);
projectCancel.addEventListener('click', () => closeProjectDialog('cancel'));
dialogClose.addEventListener('click', () => closeProjectDialog('cancel'));

projectDialog.addEventListener('cancel', () => {
  createVersion++;
  projectCreate.disabled = false;
  projectCreate.removeAttribute('data-mob-loading');
  projectCreate.removeAttribute('aria-busy');
  projectDialog.removeAttribute('aria-busy');
});

projectDialog.addEventListener('close', () => {
  clearProjectError();
  newProjectButton.focus();
});

projectName.addEventListener('input', () => {
  if (projectName.getAttribute('aria-invalid') === 'true') validateProjectName();
});

projectForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (projectCreate.disabled) return;
  if (!validateProjectName()) {
    projectName.focus();
    return;
  }

  const snapshot = {
    name: projectName.value.trim(),
    type: projectType.value,
    due: projectDue.value,
  };
  const version = ++createVersion;
  projectCreate.disabled = true;
  projectCreate.toggleAttribute('data-mob-loading', true);
  projectCreate.setAttribute('aria-busy', 'true');
  projectDialog.setAttribute('aria-busy', 'true');

  await new Promise((resolve) => setTimeout(resolve, 450));
  if (version !== createVersion) return;

  const id = `P-${projectSequence++}`;
  const initials = snapshot.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  projects.unshift({
    id,
    name: snapshot.name,
    type: snapshot.type,
    status: 'active',
    due: snapshot.due,
    progress: 0,
    initials,
    series: '3',
  });
  activities.unshift({ text: `You created ${snapshot.name}`, time: 'Just now' });
  currentFilter = 'all';
  for (const filter of document.querySelectorAll('.studio-filter')) {
    const selected = filter.dataset.filter === 'all';
    filter.classList.toggle('is-selected', selected);
    filter.setAttribute('aria-pressed', String(selected));
  }
  renderSummary();
  renderProjects();
  renderActivity();
  closeProjectDialog('created');
  announce(`${snapshot.name} was created in this local demo.`);
});

renderTasks();
renderSummary();
renderProjects();
renderActivity();
