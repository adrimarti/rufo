// Archetype Images Map
const archetypeImages = {
  "Echenica": "enchenica_archetype_png_1773225306991.png",
  "Therian": "therian_archetype_png_1773225322495.png",
  "Barbuda": "barbuda_archetype_png_1773225338994.png"
};
const defaultPlaceholder = "https://placehold.co/100/333333/98cb98?text=SPECIES";

// State
let currentTasks = [];
let selectedTaskId = null;
let supabaseClient = null;

// DOM Elements
const tasksContainer = document.getElementById('tasks-container');
const progressText = document.getElementById('progress-text');
const verifyModal = document.getElementById('verify-modal');
const modalTaskName = document.getElementById('modal-task-name');
const secretInput = document.getElementById('secret-code');
const verifyCancelBtn = document.getElementById('cancel-btn');
const verifyConfirmBtn = document.getElementById('confirm-btn');
const errorMsg = document.getElementById('modal-error');
const verifyModalContent = verifyModal.querySelector('.modal-content');

export async function initPokedex(supabase) {
  supabaseClient = supabase;
  
  // Setup verification event listeners
  verifyCancelBtn.addEventListener('click', closeVerifyModal);
  verifyModal.addEventListener('click', (e) => {
    if (e.target === verifyModal) closeVerifyModal();
  });

  verifyConfirmBtn.addEventListener('click', handleVerification);

  secretInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyConfirmBtn.click();
  });

  return await fetchTasks();
}

async function fetchTasks() {
  const { data, error } = await supabaseClient
    .from('putedex_tasks')
    .select('*')
    .order('task_number', { ascending: true });

  if (error) {
    console.error('Fetch tasks error:', error);
    return false;
  }

  currentTasks = data;
  renderTasks();
  updateProgress();
  return true;
}

function renderTasks() {
  tasksContainer.innerHTML = '';
  
  if (currentTasks.length === 0) {
    tasksContainer.innerHTML = `<p class="empty-state">No hay especies registradas.</p>`;
    return;
  }

  currentTasks.forEach(task => {
    const card = document.createElement('div');
    card.className = `task-card ${task.is_completed ? 'completed' : ''}`;
    
    // Archetype Image logic
    let imgPath = defaultPlaceholder;
    for (const key in archetypeImages) {
      if (task.name.includes(key) || task.description.includes(key)) {
        imgPath = archetypeImages[key];
        break;
      }
    }

    const statusIcon = task.is_completed ? '⭐' : `#${task.task_number}`;

    card.innerHTML = `
      <div class="task-image-thumb">
        <img src="${imgPath}" alt="${task.name}">
      </div>
      <div class="task-info">
        <div class="task-name">${statusIcon} ${task.name}</div>
        <div class="task-desc">${task.description}</div>
      </div>
    `;

    if (!task.is_completed) {
      card.addEventListener('click', () => openVerifyModal(task));
    }

    tasksContainer.appendChild(card);
  });
}

function updateProgress() {
  const completedCount = currentTasks.filter(t => t.is_completed).length;
  const total = currentTasks.length || 18;
  progressText.textContent = `${completedCount} / ${total} CAPTURADAS`;
}

function openVerifyModal(task) {
  selectedTaskId = task.id;
  modalTaskName.textContent = `#${task.task_number} - ${task.name}`;
  secretInput.value = '';
  errorMsg.classList.add('hidden');
  verifyModal.classList.remove('hidden');
  setTimeout(() => secretInput.focus(), 100);
}

function closeVerifyModal() {
  verifyModal.classList.add('hidden');
  selectedTaskId = null;
}

async function handleVerification() {
  const input = secretInput.value.trim();
  const now = new Date();
  const expected1 = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  
  const expected2Date = new Date(now.getTime() - 60000);
  const expected2 = `${expected2Date.getHours().toString().padStart(2, '0')}${expected2Date.getMinutes().toString().padStart(2, '0')}`;

  if (input === expected1 || input === expected2) {
    verifyConfirmBtn.disabled = true;
    
    await supabaseClient.from('putedex_tasks').update({ is_completed: true, completed_at: new Date().toISOString() }).eq('id', selectedTaskId);
    
    const idx = currentTasks.findIndex(t => t.id === selectedTaskId);
    if (idx > -1) currentTasks[idx].is_completed = true;

    closeVerifyModal();
    renderTasks();
    updateProgress();
    
    verifyConfirmBtn.disabled = false;
  } else {
    errorMsg.classList.remove('hidden');
    verifyModalContent.classList.add('shake');
    setTimeout(() => verifyModalContent.classList.remove('shake'), 400);
  }
}
