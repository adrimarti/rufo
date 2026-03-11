// DOM Elements
const radarStatus = document.getElementById('radar-status');
const friendsList = document.getElementById('friends-list');
const trackingSystem = document.getElementById('tracking-system');
const trackingName = document.getElementById('tracking-target-name');
const trackingDist = document.getElementById('tracking-distance');
const radarTargetIndicator = document.getElementById('radar-target-indicator');
const indicatorDistValue = document.getElementById('indicator-dist-value');
const toggleFriendsBtn = document.getElementById('toggle-friends-btn');
const closeFriendsBtn = document.getElementById('close-friends-btn');
const friendsListContainer = document.getElementById('friends-list-container');
const radarTargetLabel = document.getElementById('radar-target-label');
const targetNameVal = document.getElementById('target-name-val');

// Modal Elements
const locatorNameInput = document.getElementById('locator-name-input');
const locatorStatusInput = document.getElementById('locator-status-input');
const saveNameBtn = document.getElementById('save-name-btn');

// State
let supabaseClient = null;
let currentDeviceId = null;
let currentLat = null;
let currentLng = null;
let locationInterval = null;
let trackingId = null;
let currentUserName = null;
let currentUserStatus = null;
let onSelfClickCallback = null;

const funnyStatusMessages = [
  "Buscando kebabs",
  "Nivel de alcohol: Crítico",
  "Avistado cerca de un Red Light",
  "Perdido en los canales",
  "Huyendo de la policía",
  "Intentando hablar holandés",
  "En busca de la despedida perfecta",
  "Especímen altamente peligroso",
  "Probando 'hierbas' locales",
  "Buscando a la novia (es broma)"
];

export function initTracker(supabase, deviceId, onSelfClick = null) {
  supabaseClient = supabase;
  currentDeviceId = deviceId;
  onSelfClickCallback = onSelfClick;

  // Setup UI event listeners
  if (toggleFriendsBtn) {
    toggleFriendsBtn.addEventListener('click', () => {
      friendsListContainer.classList.remove('hidden');
      updateFriendsUI(); // Refresh list when opening
    });
  }

  if (closeFriendsBtn) {
    closeFriendsBtn.addEventListener('click', () => {
      friendsListContainer.classList.add('hidden');
    });
  }
}

export function startLocationTracking(userName, status = null) {
  currentUserName = userName;
  currentUserStatus = status;
  radarStatus.textContent = 'Buscando satélites...';
  if (!navigator.geolocation) return;

  updateMyLocation();
  if (!locationInterval) {
    locationInterval = setInterval(() => {
      updateMyLocation();
    }, 30000);
  }
}

function updateMyLocation() {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      currentLat = position.coords.latitude;
      currentLng = position.coords.longitude;
      
      await supabaseClient
        .from('user_locations')
        .upsert({ 
          device_id: currentDeviceId, 
          user_name: currentUserName, 
          status: currentUserStatus,
          lat: currentLat, 
          lng: currentLng, 
          last_updated: new Date().toISOString() 
        }, { onConflict: 'device_id' });
        
      updateFriendsUI();
    },
    (err) => {
      radarStatus.textContent = `Error GPS: ${err.message}`;
    },
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
  );
}

export async function updateFriendsUI() {
  if (currentLat === null) return;
  
  const now = new Date();
  radarStatus.textContent = `SYNC: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, ' ')}`;
  
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseClient
    .from('user_locations')
    .select('*')
    .gte('last_updated', sixHoursAgo);
    
  if (error || !data) return;

  friendsList.innerHTML = '';
  
  const radarDisk = document.querySelector('.radar-disk');
  const existingBlips = radarDisk.querySelectorAll('.radar-blip');
  existingBlips.forEach(b => b.remove());
  
  const friends = data.map(f => {
    if (f.user_name === currentUserName) return { ...f, distance: 0, isMe: true };
    const dist = calculateDistanceMeters(currentLat, currentLng, f.lat, f.lng);
    return { ...f, distance: dist, isMe: false };
  }).sort((a, b) => a.distance - b.distance);

  friends.forEach((f, idx) => {
    const el = document.createElement('div');
    const isTracking = trackingId === f.device_id;
    const isClosest = !f.isMe && idx === (friends[0].isMe ? 1 : 0);
    el.className = `friend-card ${f.isMe ? 'self' : ''} ${isTracking ? 'tracking' : ''} ${isClosest ? 'closest' : ''}`;
    
    let distStr = f.isMe ? 'USTED' : (f.distance < 1000 ? `${Math.round(f.distance)}m` : `${(f.distance/1000).toFixed(1)}km`);
    
    const msAgo = Date.now() - new Date(f.last_updated).getTime();
    const minsAgo = Math.floor(msAgo / 60000);
    const timeStr = minsAgo < 1 ? 'LIVE' : `HACE ${minsAgo}M`;
    
    const statusIdx = f.device_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % funnyStatusMessages.length;
    const funnyStatus = f.isMe ? (currentUserStatus || "AUTORRASTREO ACTIVADO") : (f.status || funnyStatusMessages[statusIdx]);

    el.innerHTML = `
      <div class="friend-avatar">${f.user_name.charAt(0).toUpperCase()}</div>
      <div class="friend-main">
        <div class="friend-header">
          <span class="friend-name">${f.user_name}</span>
          <span class="friend-status-pill ${minsAgo < 5 ? 'online' : 'away'}">${timeStr}</span>
        </div>
        <div class="friend-funny-status">"${funnyStatus}"</div>
        <div class="friend-meta">
          <span class="friend-dist-chip">${f.isMe ? '' : 'DISTANCIA: '} ${distStr}</span>
        </div>
      </div>
      ${!f.isMe ? `<button class="btn-follow">${isTracking ? 'DETENER' : 'SEGUIR'}</button>` : ''}
    `;
    
    if (!f.isMe) {
        const followBtn = el.querySelector('.btn-follow');
        followBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTracking(f);
        });
        el.addEventListener('click', () => toggleTracking(f));
    } else {
        el.addEventListener('click', () => {
          if (onSelfClickCallback) onSelfClickCallback();
        });
    }
    
    friendsList.appendChild(el);

    if (!f.isMe) {
      const blip = document.createElement('div');
      blip.className = 'radar-blip';
      const angle = calculateBearing(currentLat, currentLng, f.lat, f.lng);
      const maxVisualDist = 2000; // 2km range
      const radiusPercent = Math.min(45, (f.distance / maxVisualDist) * 45);
      
      const x = 50 + radiusPercent * Math.sin(angle * Math.PI / 180);
      const y = 50 - radiusPercent * Math.cos(angle * Math.PI / 180);
      
      blip.style.left = `${x}%`;
      blip.style.top = `${y}%`;
      blip.textContent = f.user_name.charAt(0).toUpperCase();
      blip.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleTracking(f);
      });
      radarDisk.appendChild(blip);
      
      if (isTracking) {
          updateTrackingUI(f, angle);
          radarTargetLabel.classList.remove('hidden');
          targetNameVal.textContent = f.user_name.toUpperCase();
      }
    }
  });
  
  if (!trackingId) {
    radarTargetLabel.classList.add('hidden');
  }
  
  if (trackingId && !friends.some(f => f.device_id === trackingId)) {
      stopTracking();
  }
}

function toggleTracking(friend) {
    if (trackingId === friend.device_id) {
        stopTracking();
    } else {
        trackingId = friend.device_id;
        radarTargetIndicator.classList.remove('hidden');
        radarTargetLabel.classList.remove('hidden');
        targetNameVal.textContent = friend.user_name.toUpperCase();
        friendsListContainer.classList.add('hidden'); // Auto-close on selection
        updateFriendsUI();
    }
}

function stopTracking() {
    trackingId = null;
    radarTargetIndicator.classList.add('hidden');
    radarTargetLabel.classList.add('hidden');
    updateFriendsUI();
}

function updateTrackingUI(friend, bearing) {
    const distStr = friend.distance < 1000 ? Math.round(friend.distance) : (friend.distance/1000).toFixed(1) + 'k';
    indicatorDistValue.textContent = distStr;
    radarTargetIndicator.style.transform = `rotate(${bearing}deg)`;
}
export async function updateProfile(newName, newStatus) {
    currentUserName = newName;
    currentUserStatus = newStatus;
    await updateMyLocation();
}

function calculateBearing(lat1, lon1, lat2, lon2) {
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) -
            Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  
  let theta = Math.atan2(y, x);
  return (theta * 180 / Math.PI + 360) % 360;
}

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371e3; 
  const phi1 = lat1 * Math.PI/180;
  const phi2 = lat2 * Math.PI/180;
  const deltaPhi = (lat2-lat1) * Math.PI/180;
  const deltaLambda = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
