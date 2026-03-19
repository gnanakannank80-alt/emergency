/**
 * Helper App - Main Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- State & Initialization ---
    const STATE = {
        isAuthenticated: localStorage.getItem('helper_auth') === 'true',
        contacts: JSON.parse(localStorage.getItem('helper_contacts')) || [],
        profile: JSON.parse(localStorage.getItem('helper_profile')) || { name: '', blood: '', phone: '' },
        location: { lat: null, lng: null },
        theme: localStorage.getItem('helper_theme') || 'light'
    };

    // DOM Elements
    const splashScreen = document.getElementById('splash-screen');
    const authView = document.getElementById('auth-view');
    const mainApp = document.getElementById('main-app');
    const toastContainer = document.getElementById('toast-container');
    
    // Init App
    setTimeout(() => {
        splashScreen.classList.add('splash-hide');
        setTimeout(() => {
            splashScreen.style.display = 'none';
            if (STATE.isAuthenticated) {
                showMainApp();
            } else {
                authView.classList.remove('hidden');
            }
        }, 500);
    }, 1500);

    // Apply Theme
    const htmlEl = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    if (STATE.theme === 'dark') {
        htmlEl.classList.add('dark');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            htmlEl.classList.add('dark');
            STATE.theme = 'dark';
        } else {
            htmlEl.classList.remove('dark');
            STATE.theme = 'light';
        }
        localStorage.setItem('helper_theme', STATE.theme);
    });

    // --- Toast System ---
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const icon = type === 'success' ? 'fa-check-circle text-green-500' :
                     type === 'error' ? 'fa-circle-xmark text-red-500' :
                     'fa-circle-info text-blue-500';
        
        toast.className = `toast-enter w-full bg-surface dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-lg rounded-xl p-4 flex items-center gap-3`;
        toast.innerHTML = `
            <i class="fa-solid ${icon} text-xl flex-shrink-0"></i>
            <p class="text-sm font-medium">${message}</p>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.replace('toast-enter', 'toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // --- Authentication ---
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const mobile = document.getElementById('mobile-input').value;
        const otp = document.getElementById('otp-input').value;

        if (otp === '238756' && mobile.length >= 10) {
            localStorage.setItem('helper_auth', 'true');
            STATE.isAuthenticated = true;
            authView.classList.add('hidden');
            showToast('Login Successful!', 'success');
            showMainApp();
        } else {
            showToast('Invalid OTP or Mobile Number', 'error');
        }
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('helper_auth');
        STATE.isAuthenticated = false;
        mainApp.classList.add('hidden');
        authView.classList.remove('hidden');
        document.getElementById('mobile-input').value = '';
        document.getElementById('otp-input').value = '';
        showToast('Logged out');
    });

    // --- Navigation Logic ---
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    function switchView(targetId) {
        // Hide all views globally inside main
        views.forEach(v => {
            if(v.id.startsWith('view-')) v.classList.add('hidden');
        });
        
        // Show target
        document.getElementById(targetId).classList.remove('hidden');
        
        // Update nav styling
        navBtns.forEach(btn => {
            if (btn.dataset.target === targetId) {
                btn.classList.add('active', 'text-primary');
                btn.classList.remove('text-slate-400', 'dark:text-slate-500');
            } else {
                btn.classList.remove('active', 'text-primary');
                btn.classList.add('text-slate-400', 'dark:text-slate-500');
            }
        });

        // Trigger view-specific logic
        if (targetId === 'view-map') {
            initMap();
        }
    }

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchView(btn.dataset.target);
        });
    });

    function showMainApp() {
        mainApp.classList.remove('hidden');
        loadProfile();
        renderContacts();
        updateLocation(); // Attempt to get location on boot
        switchView('view-home'); // Default view
    }

    // --- Location Handling ---
    const locationText = document.getElementById('location-text');
    const btnOpenMaps = document.getElementById('btn-open-maps');
    const btnRefreshLoc = document.getElementById('btn-refresh-location');

    function updateLocation() {
        locationText.textContent = "Locating...";
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    STATE.location = { lat, lng };
                    
                    locationText.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    locationText.classList.add('text-green-600', 'dark:text-green-400');
                    
                    // Enable Maps button
                    btnOpenMaps.href = `https://www.google.com/maps?q=${lat},${lng}`;
                    btnOpenMaps.classList.remove('pointer-events-none', 'opacity-50');
                    btnOpenMaps.classList.add('text-primary');
                    
                    // Update map marker if map exists
                    if (map && marker) {
                        const newLatLng = new L.LatLng(lat, lng);
                        marker.setLatLng(newLatLng);
                        map.panTo(newLatLng);
                    }
                },
                (error) => {
                    locationText.textContent = "Location Disabled/Error";
                    locationText.classList.remove('text-green-600', 'dark:text-green-400');
                    locationText.classList.add('text-red-500');
                    showToast('Could not fetch location. Ensure GPS is ON.', 'error');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            locationText.textContent = "Geolocation unsupported";
        }
    }

    btnRefreshLoc.addEventListener('click', updateLocation);

    // --- SOS Logic ---
    const btnSos = document.getElementById('btn-sos');
    const sosOverlay = document.getElementById('sos-countdown-overlay');
    const btnCancelSos = document.getElementById('btn-cancel-sos');
    const countdownNumber = document.getElementById('countdown-number');
    const countdownCircle = document.getElementById('countdown-circle');
    
    let sosTimer = null;
    let countdownVal = 3;

    btnSos.addEventListener('click', () => {
        if (STATE.contacts.length === 0) {
            showToast('Please add emergency contacts first!', 'error');
            switchView('view-contacts');
            return;
        }

        sosOverlay.classList.remove('hidden');
        countdownVal = 3;
        countdownNumber.textContent = countdownVal;
        countdownCircle.style.strokeDashoffset = "0";

        // Animate circle
        countdownCircle.style.transition = "none";
        setTimeout(() => {
            countdownCircle.style.transition = "stroke-dashoffset 3s linear";
            countdownCircle.style.strokeDashoffset = "779";
        }, 50);

        sosTimer = setInterval(() => {
            countdownVal--;
            if (countdownVal > 0) {
                countdownNumber.textContent = countdownVal;
            } else {
                clearInterval(sosTimer);
                executeSOS();
            }
        }, 1000);
    });

    btnCancelSos.addEventListener('click', () => {
        clearInterval(sosTimer);
        sosOverlay.classList.add('hidden');
        showToast('SOS Cancelled');
    });

    function executeSOS() {
        sosOverlay.classList.add('hidden');
        
        // Get top 3 contacts
        const top3 = STATE.contacts.slice(0, 3);
        const phones = top3.map(c => c.phone).join(','); // Some OS support comma-separated list
        
        let locString = STATE.location.lat ? 
            `https://www.google.com/maps?q=${STATE.location.lat},${STATE.location.lng}` : 
            "Unknown Location";
        
        const userName = STATE.profile.name || "A user";
        const message = encodeURIComponent(`URGENT: ${userName} is in danger! Here is my live location: ${locString}`);
        
        showToast('SOS Fired! Opening messaging app...', 'error');
        
        // Try opening SMS intent. (On web, this is the best we can do)
        // iOS uses &body=, Android often uses ?body= . `?` acts as safer fallback usually.
        window.location.href = `sms:${phones}?body=${message}`;
    }

    // --- Contacts Logic ---
    const contactsList = document.getElementById('contacts-list');
    const addContactForm = document.getElementById('add-contact-form');
    const contactCount = document.getElementById('contact-count');

    function renderContacts() {
        contactsList.innerHTML = '';
        contactCount.textContent = `${STATE.contacts.length}/5`;

        if (STATE.contacts.length === 0) {
            contactsList.innerHTML = `<div class="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 text-slate-500 text-sm">No contacts added yet.</div>`;
            return;
        }

        STATE.contacts.forEach((contact, index) => {
            const isTop3 = index < 3;
            const badge = isTop3 ? `<span class="text-[10px] uppercase font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded ml-2">SOS Target</span>` : '';
            
            const div = document.createElement('div');
            div.className = `flex justify-between items-center p-3 bg-surface dark:bg-surface-dark rounded-xl border ${isTop3 ? 'border-amber-200 dark:border-amber-900/50' : 'border-slate-100 dark:border-slate-800'} shadow-sm`;
            div.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                        ${contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="font-medium text-sm flex items-center">${contact.name} ${badge}</p>
                        <p class="text-xs text-slate-500">${contact.phone}</p>
                    </div>
                </div>
                <button class="btn-delete-contact w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" data-index="${index}">
                    <i class="fa-solid fa-trash-can text-sm"></i>
                </button>
            `;
            contactsList.appendChild(div);
        });

        // Attach delete handlers
        document.querySelectorAll('.btn-delete-contact').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index);
                STATE.contacts.splice(idx, 1);
                localStorage.setItem('helper_contacts', JSON.stringify(STATE.contacts));
                renderContacts();
                showToast('Contact deleted');
            });
        });
    }

    addContactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('contact-name');
        const phoneInput = document.getElementById('contact-phone');

        if (STATE.contacts.length >= 5) {
            showToast('Maximum 5 contacts allowed.', 'error');
            return;
        }

        STATE.contacts.push({ name: nameInput.value, phone: phoneInput.value });
        localStorage.setItem('helper_contacts', JSON.stringify(STATE.contacts));
        
        nameInput.value = '';
        phoneInput.value = '';
        renderContacts();
        showToast('Contact added!', 'success');
    });

    // --- Settings / Profile Logic ---
    const profileForm = document.getElementById('profile-form');
    const profileName = document.getElementById('profile-name');
    const profileBlood = document.getElementById('profile-blood');
    const profilePhone = document.getElementById('profile-phone');

    function loadProfile() {
        profileName.value = STATE.profile.name || '';
        profileBlood.value = STATE.profile.blood || '';
        profilePhone.value = STATE.profile.phone || '';
    }

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        STATE.profile = {
            name: profileName.value,
            blood: profileBlood.value,
            phone: profilePhone.value
        };
        localStorage.setItem('helper_profile', JSON.stringify(STATE.profile));
        showToast('Profile saved successfully', 'success');
    });

    // --- Map Logic (Leaflet JS) ---
    let map = null;
    let marker = null;
    let mapInitialized = false;

    function initMap() {
        if (mapInitialized) {
            map.invalidateSize(); // Fix tile loading issue when unhiding div
            return;
        }

        const container = document.getElementById('map-container');
        
        // Default pos (center of USA somewhat)
        let defaultLat = STATE.location.lat || 39.82;
        let defaultLng = STATE.location.lng || -98.57;

        container.innerHTML = `<div id="map" class="w-full h-full z-0"></div>`;
        
        map = L.map('map').setView([defaultLat, defaultLng], STATE.location.lat ? 15 : 4);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Custom icon matching theme
        const sosIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color:#ef4444; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        marker = L.marker([defaultLat, defaultLng], {icon: sosIcon}).addTo(map);

        mapInitialized = true;

        document.getElementById('btn-recenter-map').addEventListener('click', () => {
            if (STATE.location.lat) {
                map.setView([STATE.location.lat, STATE.location.lng], 16);
                showToast('Recentered to your location');
            } else {
                updateLocation();
                showToast('Fetching location...', 'info');
            }
        });
    }

});
