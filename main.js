import { supabase } from './supabase.js'
import { initPokedex } from './src/pokedex.js'
import { initTracker, startLocationTracking, updateFriendsUI, updateProfile } from './src/tracker.js'

// Modals
const nameModal = document.getElementById('locator-name-modal');
const nameInput = document.getElementById('locator-name-input');
const saveNameBtn = document.getElementById('save-name-btn');

// Profile Modal
const profileEditModal = document.getElementById('profile-edit-modal');
const profileNameInput = document.getElementById('profile-name-input');
const profileStatusInput = document.getElementById('profile-status-input');
const editProfileBtn = document.getElementById('edit-profile-btn');
const saveProfileBtn = document.getElementById('save-profile-btn');
const cancelProfileBtn = document.getElementById('cancel-profile-btn');
const profileErrorMsg = document.createElement('p');
profileErrorMsg.className = 'error-msg hidden';
profileErrorMsg.style.color = 'var(--neon-red)';
profileErrorMsg.style.fontSize = '0.7rem';
profileErrorMsg.textContent = 'EL NOMBRE ES OBLIGATORIO';

// Nav & Views
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');

// State
let userName = localStorage.getItem('putedex_user_name') || '';
let userStatus = localStorage.getItem('putedex_user_status') || '';
let deviceId = localStorage.getItem('putedex_device_id') || crypto.randomUUID();
if (!localStorage.getItem('putedex_device_id')) {
  localStorage.setItem('putedex_device_id', deviceId);
}

// Initialization
async function initApp() {
  if (!supabase) {
    const tasksContainer = document.getElementById('tasks-container');
    if (tasksContainer) {
      tasksContainer.innerHTML = '<p style="text-align:center; color: #ff003c; grid-column: 1/-1;">Error: Conexión con base de datos no configurada.</p>';
    }
    return;
  }

  // Auto-login auth
  const email = import.meta.env.VITE_APP_USER_EMAIL;
  const password = import.meta.env.VITE_APP_USER_PASSWORD;

  if (email && password) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      if (authError) {
         console.warn("Auth note:", authError.message);
      }
  }

  // Initialize Modules
  const pokedexSuccess = await initPokedex(supabase);
  initTracker(supabase, deviceId, openProfileEditor);

  if (!pokedexSuccess) {
    const tasksContainer = document.getElementById('tasks-container');
    if (tasksContainer) {
      tasksContainer.innerHTML = `
        <div class="error-card glass">
          <h3 style="color: var(--neon-red)">Error de Base de Datos</h3>
          <p>Asegúrate de haber ejecutado los scripts SQL.</p>
        </div>`;
    }
  }
  
  setupNavigation();
  if (userName) startLocationTracking(userName, userStatus);
  setupProfileLogic();
}

// ---- NAVIGATION LOGIC ----
function setupNavigation() {
  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));
      
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');

      if (targetId === 'locator-view') {
        if (!userName) {
          nameModal.classList.remove('hidden');
          setTimeout(() => nameInput.focus(), 100);
        } else {
          updateFriendsUI();
        }
      }
    });
  });
}

function openProfileEditor() {
  profileNameInput.value = userName;
  profileStatusInput.value = userStatus;
  profileEditModal.classList.remove('hidden');
  profileErrorMsg.classList.add('hidden');
  if (!profileNameInput.parentElement.contains(profileErrorMsg)) {
    profileNameInput.parentElement.appendChild(profileErrorMsg);
  }
}
 
function setupProfileLogic() {
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', openProfileEditor);
  }

  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async () => {
      const newName = profileNameInput.value.trim();
      const newStatus = profileStatusInput.value.trim();
      
      if (newName) {
        userName = newName;
        userStatus = newStatus;
        localStorage.setItem('putedex_user_name', userName);
        localStorage.setItem('putedex_user_status', userStatus);
        
        await updateProfile(userName, userStatus);
        profileEditModal.classList.add('hidden');
        updateFriendsUI();
      } else {
        profileErrorMsg.classList.remove('hidden');
        profileNameInput.focus();
      }
    });
  }

  if (cancelProfileBtn) {
    cancelProfileBtn.addEventListener('click', () => {
      profileEditModal.classList.add('hidden');
    });
  }
}

saveNameBtn.addEventListener('click', () => {
  const val = nameInput.value.trim();
  if (val) {
    userName = val;
    localStorage.setItem('putedex_user_name', userName);
    nameModal.classList.add('hidden');
    startLocationTracking(userName, userStatus);
  }
});

initApp();
