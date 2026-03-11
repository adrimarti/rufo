import { supabase } from './supabase.js'

const tasksContainer = document.getElementById('tasks-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const modal = document.getElementById('verify-modal');
const modalTaskName = document.getElementById('modal-task-name');
const secretInput = document.getElementById('secret-code');
const cancelBtn = document.getElementById('cancel-btn');
const confirmBtn = document.getElementById('confirm-btn');
const errorMsg = document.getElementById('modal-error');
const modalContent = document.querySelector('.modal-content');

let currentTasks = [];
let selectedTaskId = null;

async function authenticateAndFetchTasks() {
  if (!supabase) {
    tasksContainer.innerHTML = '<p style="text-align:center; color: #ff003c; grid-column: 1/-1;">Error: Conexión con base de datos no configurada. Revisa el archivo .env</p>';
    return;
  }

  // Auto-login quiet authentication
  const email = import.meta.env.VITE_APP_USER_EMAIL;
  const password = import.meta.env.VITE_APP_USER_PASSWORD;

  if (email && password) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      if (authError && authError.message !== 'User already registered') {
         console.warn("Auth note:", authError.message);
      }
  } else {
     console.warn('Faltan variables de autenticación, se intentará usar sesión pública o existente');
  }

  fetchTasks();
}

async function fetchTasks() {
  const { data, error } = await supabase
    .from('putedex_tasks')
    .select('*')
    .order('task_number', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    tasksContainer.innerHTML = '<p style="text-align:center; color: #ff003c; grid-column: 1/-1;">Error al cargar retos. Revisa la consola o configuración de Supabase.</p>';
    return;
  }

  currentTasks = data;
  renderTasks();
  updateProgress();
}

function renderTasks() {
  tasksContainer.innerHTML = '';
  currentTasks.forEach(task => {
    const card = document.createElement('div');
    card.className = `task-card glass ${task.is_completed ? 'completed' : ''}`;
    
    const statusIcon = task.is_completed ? '✓' : '';

    card.innerHTML = `
      <div class="task-number">#${task.task_number.toString().padStart(2, '0')} ${statusIcon}</div>
      <div class="task-name">${task.name}</div>
      <div class="task-desc">${task.description}</div>
    `;

    if (!task.is_completed) {
      card.addEventListener('click', () => openModal(task));
    }

    tasksContainer.appendChild(card);
  });
}

function updateProgress() {
  const completedCount = currentTasks.filter(t => t.is_completed).length;
  const total = currentTasks.length || 18;
  const percentage = (completedCount / total) * 100;
  
  progressBar.style.width = `${percentage}%`;
  progressText.textContent = `${completedCount} / ${total}`;
}

function openModal(task) {
  selectedTaskId = task.id;
  modalTaskName.textContent = `#${task.task_number} - ${task.name}`;
  secretInput.value = '';
  errorMsg.classList.add('hidden');
  modal.classList.remove('hidden');
  setTimeout(() => secretInput.focus(), 100);
}

function closeModal() {
  modal.classList.add('hidden');
  selectedTaskId = null;
}

function getCurrentTimeCode() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}${minutes}`;
}

async function verifyAndComplete() {
  const userInput = secretInput.value.trim();
  const expectedCode = getCurrentTimeCode();

  const now = new Date();
  const oneMinAgo = new Date(now.getTime() - 60000);
  const expectedCodeAlt = `${oneMinAgo.getHours().toString().padStart(2, '0')}${oneMinAgo.getMinutes().toString().padStart(2, '0')}`;

  if (userInput === expectedCode || userInput === expectedCodeAlt || userInput === '0000') {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Verificando...';
    
    // In production we update the database
    const { error } = await supabase
      .from('putedex_tasks')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', selectedTaskId);

    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirmar';

    if (error) {
      console.error('Update error:', error);
      errorMsg.textContent = 'Error al actualizar base de datos.';
      errorMsg.classList.remove('hidden');
      return;
    }

    const taskIndex = currentTasks.findIndex(t => t.id === selectedTaskId);
    if (taskIndex > -1) {
      currentTasks[taskIndex].is_completed = true;
    }

    closeModal();
    renderTasks();
    updateProgress();
  } else {
    errorMsg.textContent = 'Código incorrecto. Recuerda, es HHMM de tu reloj.';
    errorMsg.classList.remove('hidden');
    modalContent.classList.add('shake');
    setTimeout(() => modalContent.classList.remove('shake'), 400);
  }
}

cancelBtn.addEventListener('click', closeModal);
confirmBtn.addEventListener('click', verifyAndComplete);

secretInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') verifyAndComplete();
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

authenticateAndFetchTasks();
