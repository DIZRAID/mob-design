const root = document.documentElement;
const content = document.querySelector('#content');
const theme = document.querySelector('#theme');
const density = document.querySelector('#density');
const form = document.querySelector('#settings');
const nameField = document.querySelector('#name-field');
const nameInput = document.querySelector('#name');
const nameError = document.querySelector('#name-error');
const save = document.querySelector('#save');
const status = document.querySelector('#status');
let requestVersion = 0;

theme.addEventListener('change', () => { root.dataset.mobTheme = theme.value; });
density.addEventListener('change', () => {
  root.dataset.mobDensity = density.value;
  content.dataset.mobDensity = density.value;
});

const statusClasses = {
  error: 'mob-alert--error',
  success: 'mob-alert--success',
};

function showStatus(kind, title, body) {
  const alert = document.createElement('div');
  alert.className = `mob-alert ${statusClasses[kind]}`;
  const icon = document.createElement('span');
  icon.className = 'mob-alert__icon';
  icon.setAttribute('aria-hidden', 'true');
  const heading = document.createElement('strong');
  heading.className = 'mob-alert__title';
  heading.textContent = title;
  const message = document.createElement('p');
  message.className = 'mob-alert__body';
  message.textContent = body;
  alert.append(icon, heading, message);
  status.replaceChildren(alert);
}

function validateName() {
  const valid = nameInput.value.trim().length >= 2;
  nameField.toggleAttribute('data-mob-invalid', !valid);
  nameInput.setAttribute('aria-invalid', String(!valid));
  nameInput.setAttribute('aria-describedby', valid ? 'name-help' : 'name-help name-error');
  nameError.hidden = valid;
  if (!valid) showStatus('error', 'Check the name', 'Enter at least two characters.');
  return valid;
}

nameInput.addEventListener('input', () => {
  if (nameInput.getAttribute('aria-invalid') === 'true') validateName();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (save.disabled) return;
  if (!validateName()) { nameInput.focus(); return; }
  const submittedName = nameInput.value.trim();
  const version = ++requestVersion;
  save.disabled = true;
  save.toggleAttribute('data-mob-loading', true);
  save.setAttribute('aria-busy', 'true');
  await new Promise((resolve) => setTimeout(resolve, 650));
  if (version !== requestVersion) return;
  save.disabled = false;
  save.removeAttribute('data-mob-loading');
  save.removeAttribute('aria-busy');
  if (submittedName.toLowerCase() === 'error') showStatus('error', 'Save failed', 'This is an intentional local demo error. Try another name.');
  else showStatus('success', 'Settings saved', `The “${submittedName}” profile was saved in page memory. No server request was made.`);
});

form.addEventListener('reset', () => {
  requestVersion++;
  save.disabled = false;
  save.removeAttribute('data-mob-loading');
  save.removeAttribute('aria-busy');
  requestAnimationFrame(() => {
    nameField.removeAttribute('data-mob-invalid');
    nameInput.removeAttribute('aria-invalid');
    nameInput.setAttribute('aria-describedby', 'name-help');
    nameError.hidden = true;
    status.innerHTML = '<div class="mob-empty mob-empty--bare"><p class="mob-empty__title">No changes yet</p><p class="mob-empty__sub">The form was restored to its initial values.</p></div>';
  });
});
