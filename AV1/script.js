const siteName = 'Astra';
document.title = document.title.replace(/Nexa TI/g, siteName);
document.querySelectorAll('.brand span').forEach((brand) => { brand.textContent = siteName.toUpperCase(); });
document.querySelectorAll('[alt], [title]').forEach((element) => {
  if (element.alt) element.alt = element.alt.replace(/Nexa TI/g, siteName);
  if (element.title) element.title = element.title.replace(/Nexa TI/g, siteName);
});
const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
while (textWalker.nextNode()) textWalker.currentNode.nodeValue = textWalker.currentNode.nodeValue.replace(/Nexa TI/g, siteName).replace(/NEXA TI/g, siteName.toUpperCase());

const allowedSpecials = '@#$%&*!?/\\|-_+=.';
const forbiddenSpecials = '¨{}[]´`~^:;<>,”‘';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showMessage(message, type = 'error', element = document.getElementById('form-message')) {
  if (!element) return;
  element.textContent = message;
  element.className = `form-message ${type}`;
}

function validatePassword(password, confirmation = '') {
  if (!password) return 'A senha deve ser preenchida.';
  if (confirmation !== '' && !confirmation) return 'A confirmação de senha deve ser preenchida.';
  if (confirmation !== '' && password !== confirmation) return 'As senhas não conferem.';
  if (password.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
  if (!/[0-9]/.test(password)) return 'A senha precisa de um caractere numérico.';
  if (!/[A-Z]/.test(password)) return 'A senha precisa de uma letra maiúscula.';
  if (!Array.from(password).some((character) => allowedSpecials.includes(character))) return `Use um caractere especial permitido: ${allowedSpecials}`;
  if (Array.from(password).some((character) => forbiddenSpecials.includes(character))) return 'A senha contém um caractere não permitido.';
  return '';
}

function validEmail(value) { return Boolean(value && emailPattern.test(value)); }
function formatDate(date) { return date.toLocaleDateString('pt-BR'); }
function addDays(days) { const date = new Date(); date.setHours(12, 0, 0, 0); date.setDate(date.getDate() + days); return date; }

const homeServiceLink = document.getElementById('service-link');
if (homeServiceLink && localStorage.getItem('nexaLoggedIn') === 'true') homeServiceLink.hidden = false;

const loginForm = document.getElementById('login-form');
if (loginForm) {
  const email = document.getElementById('login-email');
  const password = document.getElementById('login-password');
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validEmail(email.value.trim())) return showMessage('Informe um e-mail válido.');
    if (!password.value) return showMessage('A senha deve ser preenchida.');
    localStorage.setItem('nexaLoggedIn', 'true');
    localStorage.setItem('nexaCustomerEmail', email.value.trim());
    showMessage('Validação realizada com sucesso', 'success');
    setTimeout(() => { window.location.href = 'solicitacoes.html'; }, 450);
  });
  document.getElementById('clear-login').addEventListener('click', () => { loginForm.reset(); email.focus(); showMessage(''); });
}

function bindPasswordPage() {
  const form = document.getElementById('password-form');
  if (!form) return;
  const email = document.getElementById('password-email');
  const password = document.getElementById('new-password');
  const confirmation = document.getElementById('confirm-password');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validEmail(email.value.trim())) return showMessage('Informe um login com e-mail válido.');
    const error = validatePassword(password.value, confirmation.value);
    if (error) return showMessage(error);
    showMessage('Validação realizada com sucesso', 'success');
    setTimeout(() => { window.location.href = 'login.html'; }, 450);
  });
  document.getElementById('clear-password').addEventListener('click', () => { form.reset(); email.focus(); showMessage(''); });
}
bindPasswordPage();

function validCpf(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11 || /^([0-9])\1+$/.test(digits)) return false;
  let sum = 0;
  for (let index = 0; index < 9; index += 1) sum += Number(digits[index]) * (10 - index);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(digits[9])) return false;
  sum = 0;
  for (let index = 0; index < 10; index += 1) sum += Number(digits[index]) * (11 - index);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === Number(digits[10]);
}
function isAdult(value) { const birth = new Date(`${value}T12:00:00`); const today = new Date(); let age = today.getFullYear() - birth.getFullYear(); const beforeBirthday = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate()); if (beforeBirthday) age -= 1; return age >= 18; }

const registerForm = document.getElementById('register-form');
if (registerForm) {
  const cpf = document.getElementById('register-cpf');
  cpf.addEventListener('input', () => { const digits = cpf.value.replace(/\D/g, '').slice(0, 11); cpf.value = digits.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'); });
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('register-email').value.trim();
    const name = document.getElementById('register-name').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmation = document.getElementById('register-confirm').value;
    const birth = document.getElementById('register-birth').value;
    const phone = document.getElementById('register-phone').value.trim();
    if (!validEmail(email)) return showMessage('Informe um e-mail válido.');
    const passwordError = validatePassword(password, confirmation);
    if (passwordError) return showMessage(passwordError);
    const words = name.split(/\s+/);
    if (words.length < 2 || words[0].length < 2) return showMessage('Informe nome e sobrenome.');
    if (!/^[A-Za-zÀ-ÿ ]+$/.test(name)) return showMessage('O nome não pode conter caracteres especiais.');
    if (!validCpf(cpf.value)) return showMessage('Informe um CPF válido no formato 000.000.000-00.');
    if (!birth) return showMessage('A data de nascimento deve ser preenchida.');
    if (!isAdult(birth)) return showMessage('O cliente deve ter pelo menos 18 anos.');
    if (phone && !/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/.test(phone.replace(/\s/g, ''))) return showMessage('Informe um telefone nacional válido.');
    localStorage.setItem('nexaLoggedIn', 'true');
    localStorage.setItem('nexaCustomerName', name); localStorage.setItem('nexaCustomerEmail', email);
    showMessage('Validação realizada com sucesso', 'success');
    setTimeout(() => { window.location.href = 'solicitacoes.html'; }, 450);
  });
  document.getElementById('clear-register').addEventListener('click', () => { registerForm.reset(); document.querySelector('input[value="Solteiro(a)"]').checked = true; document.getElementById('register-education').value = '2º grau completo'; document.getElementById('register-email').focus(); showMessage(''); });
  document.getElementById('back-register').addEventListener('click', () => { window.history.back(); });
}

const services = { cloud: { name: 'Diagnóstico de cloud', price: 890, days: 5 }, security: { name: 'Auditoria de segurança', price: 1450, days: 8 }, support: { name: 'Suporte especializado', price: 320, days: 2 }, backup: { name: 'Plano de backup', price: 590, days: 4 } };
const requestTable = document.getElementById('request-table');
if (requestTable) {
  const select = document.getElementById('service-select');
  const price = document.getElementById('service-price');
  const days = document.getElementById('service-days');
  const date = document.getElementById('service-date');
  const message = document.getElementById('request-message');
  const requests = JSON.parse(localStorage.getItem('nexaRequests') || '[]');
  document.getElementById('customer-name').textContent = localStorage.getItem('nexaCustomerName') || 'Marina Duarte';
  document.getElementById('customer-email').textContent = localStorage.getItem('nexaCustomerEmail') || 'marina@empresa.com';
  function updateService() { const service = services[select.value]; price.textContent = service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); days.textContent = `${service.days} dias úteis`; date.textContent = formatDate(addDays(service.days)); }
  function renderRequests() { requestTable.innerHTML = ''; requests.sort((a, b) => { const parseDate = (value) => { const [day, month, year] = value.split('/').map(Number); return new Date(year, month - 1, day); }; return parseDate(a.orderDate) - parseDate(b.orderDate); }).forEach((request, index) => { const row = document.createElement('tr'); row.innerHTML = `<td>${request.orderDate}</td><td>${request.number}</td><td>${request.service}</td><td>${request.status}</td><td>${request.price}</td><td>${request.dueDate}</td><td><button class="delete-request" data-index="${index}" type="button">Excluir</button></td>`; requestTable.appendChild(row); }); document.getElementById('empty-requests').hidden = requests.length > 0; }
  select.addEventListener('change', updateService); requestTable.addEventListener('click', (event) => { if (!event.target.matches('.delete-request')) return; requests.splice(Number(event.target.dataset.index), 1); localStorage.setItem('nexaRequests', JSON.stringify(requests)); renderRequests(); });
  document.getElementById('request-form').addEventListener('submit', (event) => { event.preventDefault(); const service = services[select.value]; requests.push({ orderDate: formatDate(new Date()), number: `NEX-${String(Date.now()).slice(-5)}`, service: service.name, status: 'EM ELABORAÇÃO', price: service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), dueDate: formatDate(addDays(service.days)) }); localStorage.setItem('nexaRequests', JSON.stringify(requests)); renderRequests(); showMessage('Solicitação incluída com sucesso.', 'success', message); });
  updateService(); renderRequests();
}
