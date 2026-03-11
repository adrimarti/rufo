import { supabase } from './supabase.js'
import { initPokedex } from './src/pokedex.js'
import { initTracker, startLocationTracking, updateFriendsUI } from './src/tracker.js'

// Modals
const nameModal = document.getElementById('locator-name-modal');
const nameInput = document.getElementById('locator-name-input');
const saveNameBtn = document.getElementById('save-name-btn');

// Nav & Views
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');

// State
let userName = localStorage.getItem('putedex_user_name') || '';
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
  initTracker(supabase, deviceId);

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
  
  if (userName) startLocationTracking(userName);
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

saveNameBtn.addEventListener('click', () => {
  const val = nameInput.value.trim();
  if (val) {
    userName = val;
    localStorage.setItem('putedex_user_name', userName);
    nameModal.classList.add('hidden');
    startLocationTracking(userName);
  }
});

initApp();
