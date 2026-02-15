
// --- DATA & STATE ---

const DEFAULT_USERS = [
    {
        id: '1',
        username: 'Admin',
        email: '1111@mail.com',
        password: '1111',
        designation: 'Super Admin',
        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        role: 'admin',
        phone: '01500000000',
        balance: 0
    },
    {
        id: '2',
        username: 'Customer User',
        email: '2222@gmail.com',
        password: '2222',
        designation: 'Customer',
        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer',
        role: 'user',
        phone: '01700000000',
        milkLiter: 2,
        milkPrice: 80,
        balance: 0
    }
];

let users = JSON.parse(localStorage.getItem('farm_users')) || DEFAULT_USERS;
let transactions = JSON.parse(localStorage.getItem('farm_tx')) || [];
let orders = JSON.parse(localStorage.getItem('farm_orders')) || [];
let requests = JSON.parse(localStorage.getItem('farm_req')) || [];
let currentUser = null;
let activeTab = 'ড্যাশবোর্ড';
let generatedCaptcha = '';
let uploadedPhotos = [];

// --- INITIALIZATION ---

function init() {
    generateCaptcha();
    setupEventListeners();
    checkAutoLogin();
}

function checkAutoLogin() {
    const saved = localStorage.getItem('logged_user_id');
    if (saved) {
        const user = users.find(u => u.id === saved);
        if (user) loginSuccess(user);
    }
}

// --- CORE FUNCTIONS ---

function saveData() {
    localStorage.setItem('farm_users', JSON.stringify(users));
    localStorage.setItem('farm_tx', JSON.stringify(transactions));
    localStorage.setItem('farm_orders', JSON.stringify(orders));
    localStorage.setItem('farm_req', JSON.stringify(requests));
}

function setupEventListeners() {
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('sale-form').addEventListener('submit', handleSaleConfirm);
    document.getElementById('customer-form').addEventListener('submit', handleAddCustomer);
}

function handleLogin(e) {
    e.preventDefault();
    const id = document.getElementById('login-identifier').value;
    const pass = document.getElementById('login-password').value;
    const captcha = document.getElementById('captcha-input').value;

    if (captcha !== generatedCaptcha) {
        alert('ক্যাপচা ভুল হয়েছে!');
        generateCaptcha();
        return;
    }

    const user = users.find(u => (u.email === id || u.username === id) && u.password === pass);
    if (user) {
        loginSuccess(user);
    } else {
        alert('ইউজারনেম বা পাসওয়ার্ড ভুল!');
        generateCaptcha();
    }
}

function loginSuccess(user) {
    currentUser = user;
    localStorage.setItem('logged_user_id', user.id);
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
    
    // UI Update
    document.getElementById('user-name').innerText = user.username;
    document.getElementById('user-role').innerText = user.role === 'admin' ? user.designation : 'Registered Customer';
    document.getElementById('user-photo').src = user.photo;
    document.getElementById('view-title').innerText = user.role === 'admin' ? 'অ্যাডমিন প্যানেল' : 'কাস্টমার প্যানেল';

    renderSidebar();
    showWelcomeModal(user);
    setActiveTab('ড্যাশবোর্ড');
}

function logout() {
    localStorage.removeItem('logged_user_id');
    location.reload();
}

function renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    const items = currentUser.role === 'admin' ? 
        ['ড্যাশবোর্ড', 'ইউজার', 'কাস্টমার', 'AI Photo'] : 
        ['ড্যাশবোর্ড', 'AI Photo', 'সেটিংস'];
    
    nav.innerHTML = items.map(item => `
        <button onclick="setActiveTab('${item}')" class="sidebar-btn flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all font-bold text-[13px] ${activeTab === item ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}">
            <span class="w-5 h-5 flex items-center justify-center shrink-0">
                ${getIcon(item)}
            </span>
            <span>${item}</span>
        </button>
    `).join('');
}

function setActiveTab(tab) {
    activeTab = tab;
    renderSidebar();
    renderMainContent();
}

function renderMainContent() {
    const main = document.getElementById('main-content');
    main.innerHTML = '';
    
    // Header for each section
    const sectionHeader = (title, desc, btnHtml = '') => `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in">
            <div><h2 class="text-2xl font-black text-slate-800">${title}</h2><p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">${desc}</p></div>
            ${btnHtml}
        </div>
    `;

    if (activeTab === 'ড্যাশবোর্ড') {
        if (currentUser.role === 'admin') {
            main.innerHTML = sectionHeader('ওভারভিউ', 'পুরো খামারের আজকের হিসাব') + renderAdminStats() + renderRecentActivity();
        } else {
            main.innerHTML = sectionHeader('ড্যাশবোর্ড', 'আপনার দৈনন্দিন তথ্য', `<button onclick="submitCustomerOrder()" class="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">অতিরিক্ত অর্ডার</button>`) + renderCustomerStats() + renderCustomerHistory();
        }
    } else if (activeTab === 'কাস্টমার') {
        main.innerHTML = sectionHeader('কাস্টমার লিস্ট', 'সব রেজিস্টার্ড কাস্টমার', `<button onclick="openModal('customer-modal')" class="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">কাস্টমার যোগ করুন</button>`) + renderCustomerTable();
    } else if (activeTab === 'ইউজার') {
        main.innerHTML = sectionHeader('ম্যানেজমেন্ট', 'অ্যাডমিন এবং ইউজার রিকুয়েস্ট') + renderRequestList();
    } else if (activeTab === 'AI Photo') {
        main.innerHTML = sectionHeader('AI Photo Section', 'অটো পাসপোর্ট এবং জেন্ডার ডিটেকশন সিমুলেশন', `<button onclick="downloadSelectedPhotos()" class="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Download Selected</button>`) + renderPhotoSection();
    } else if (activeTab === 'সেটিংস') {
        main.innerHTML = sectionHeader('সেটিংস', 'প্রোফাইল তথ্য আপডেট করুন') + renderSettingsForm();
    }
}

// --- RENDER HELPERS ---

function renderAdminStats() {
    const totalDue = users.reduce((acc, u) => acc + (u.balance < 0 ? Math.abs(u.balance) : 0), 0);
    const totalAdv = users.reduce((acc, u) => acc + (u.balance > 0 ? u.balance : 0), 0);
    return `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-fade-in">
            ${statCard('মোট কাস্টমার', users.filter(u=>u.role==='user').length, 'indigo')}
            ${statCard('মোট রিকুয়েস্ট', requests.filter(r=>r.status==='pending').length, 'amber')}
            ${statCard('মোট দেনা (বাকি)', '৳ ' + totalDue, 'red')}
            ${statCard('মোট পাওনা (জমা)', '৳ ' + totalAdv, 'emerald', true)}
        </div>
    `;
}

function renderCustomerStats() {
    const bal = currentUser.balance || 0;
    return `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-fade-in">
            ${statCard('নির্ধারিত দুধ', (currentUser.milkLiter || 0) + ' কেজি', 'indigo')}
            ${statCard('প্রতি কেজি দাম', '৳ ' + (currentUser.milkPrice || 80), 'blue')}
            ${statCard(bal < 0 ? 'বর্তমান বাকি' : 'বর্তমান জমা', '৳ ' + Math.abs(bal), bal < 0 ? 'red' : 'emerald')}
            ${statCard('লেনদেন সংখ্যা', transactions.filter(t=>t.userId===currentUser.id).length, 'purple', true)}
        </div>
    `;
}

function statCard(label, val, color, invert = false) {
    return `
        <div class="p-6 rounded-3xl border border-slate-100 shadow-sm transition-all ${invert ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800'}">
            <p class="text-[9px] font-black uppercase tracking-widest ${invert ? 'text-white/60' : 'text-slate-400'}">${label}</p>
            <p class="text-2xl font-black mt-2">${val}</p>
        </div>
    `;
}

function renderCustomerTable() {
    const customers = users.filter(u => u.role === 'user');
    return `
        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b border-slate-50">
                            <th class="px-8 py-5 text-[10px] font-black uppercase text-slate-400">কাস্টমার</th>
                            <th class="px-8 py-5 text-[10px] font-black uppercase text-slate-400">দুধ (কেজি)</th>
                            <th class="px-8 py-5 text-[10px] font-black uppercase text-slate-400">ব্যালেন্স</th>
                            <th class="px-8 py-5 text-[10px] font-black uppercase text-slate-400">অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers.map(u => `
                            <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td class="px-8 py-5">
                                    <div class="flex items-center gap-3">
                                        <img src="${u.photo}" class="w-9 h-9 rounded-xl border border-slate-100">
                                        <div><p class="text-xs font-black text-slate-800">${u.username}</p><p class="text-[9px] text-slate-400 font-bold">${u.phone}</p></div>
                                    </div>
                                </td>
                                <td class="px-8 py-5 text-xs font-black text-slate-600">${u.milkLiter} কেজি</td>
                                <td class="px-8 py-5 text-xs font-black ${u.balance < 0 ? 'text-red-500' : 'text-green-600'}">৳ ${Math.abs(u.balance || 0)} ${u.balance < 0 ? '(বাকি)' : '(জমা)'}</td>
                                <td class="px-8 py-5">
                                    <button onclick="openSaleModal('${u.id}')" class="px-5 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md hover:bg-indigo-700 transition-all">Sale</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderPhotoSection() {
    return `
        <div class="space-y-8 animate-fade-in">
            <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
                <div class="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-indigo-200">
                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <h4 class="text-lg font-black text-slate-800">ফটো আপলোড করুন</h4>
                <p class="text-xs text-slate-400 font-medium mb-6">AI স্বয়ংক্রিয়ভাবে জেন্ডার সনাক্ত করবে এবং পাসপোর্ট সাইজ প্রিভিউ তৈরি করবে।</p>
                <input type="file" id="ai-file-input" multiple accept="image/*" class="hidden" onchange="handlePhotoUpload(event)">
                <label for="ai-file-input" class="inline-block px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-xl hover:bg-indigo-700">Browse Files</label>
            </div>

            <div id="photo-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <!-- 2x4 grid will be populated here -->
                ${renderEmptyGrid()}
            </div>
        </div>
    `;
}

function renderEmptyGrid() {
    return Array(8).fill(0).map(() => `
        <div class="photo-card opacity-30 border-dashed border-2 border-slate-200 flex items-center justify-center">
            <p class="text-[8px] font-black uppercase text-slate-400">Preview Area</p>
        </div>
    `).join('');
}

// --- LOGIC FUNCTIONS ---

function generateCaptcha() {
    generatedCaptcha = Math.floor(10000 + Math.random() * 90000).toString();
    const display = document.getElementById('captcha-display');
    if (display) display.innerText = generatedCaptcha;
}

function showWelcomeModal(user) {
    const modal = document.getElementById('welcome-modal');
    document.getElementById('welcome-message').innerText = `পোর্টালে স্বাগতম, ${user.username}! আপনার লগইন সফল হয়েছে।`;
    modal.classList.remove('hidden');
}

function hideWelcomeModal() {
    document.getElementById('welcome-modal').classList.add('hidden');
}

function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function openSaleModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('sale-user-id').value = userId;
    document.getElementById('sale-user-label').innerText = `${user.username} - এর জন্য সেল এন্ট্রি`;
    document.getElementById('sale-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('sale-qty').value = user.milkLiter || 0;
    document.getElementById('sale-price').value = user.milkPrice || 80;
    document.getElementById('sale-received').value = 0;
    
    calculateSale();
    openModal('sale-modal');
}

function calculateSale() {
    const qty = parseFloat(document.getElementById('sale-qty').value) || 0;
    const price = parseFloat(document.getElementById('sale-price').value) || 0;
    const received = parseFloat(document.getElementById('sale-received').value) || 0;
    const userId = document.getElementById('sale-user-id').value;
    const user = users.find(u => u.id === userId);
    
    const todayTotal = qty * price;
    const prevBal = user.balance || 0;
    const finalBal = prevBal - todayTotal + received; // Balance = Deposit - Debt

    document.getElementById('sale-total-display').innerText = '৳ ' + todayTotal;
    document.getElementById('sale-prev-display').innerText = '৳ ' + Math.abs(prevBal);
    document.getElementById('prev-balance-type').innerText = prevBal >= 0 ? 'জমা' : 'বাকি';
    
    document.getElementById('sale-final-display').innerText = '৳ ' + Math.abs(finalBal);
    document.getElementById('final-balance-type').innerText = finalBal >= 0 ? 'জমা' : 'বাকি';
    
    const finalEl = document.getElementById('sale-final-display');
    finalEl.classList.remove('text-green-600', 'text-red-500');
    finalEl.classList.add(finalBal >= 0 ? 'text-green-600' : 'text-red-500');
}

function handleSaleConfirm(e) {
    e.preventDefault();
    const userId = document.getElementById('sale-user-id').value;
    const qty = parseFloat(document.getElementById('sale-qty').value);
    const price = parseFloat(document.getElementById('sale-price').value);
    const received = parseFloat(document.getElementById('sale-received').value);
    
    const user = users.find(u => u.id === userId);
    const prevBal = user.balance || 0;
    const total = qty * price;
    const finalBal = prevBal - total + received;

    const tx = {
        id: 'TX-' + Date.now(),
        userId,
        date: document.getElementById('sale-date').value,
        qty,
        price,
        total,
        received,
        prevBalance: prevBal,
        finalBalance: finalBal,
        type: 'sale'
    };

    transactions.push(tx);
    user.balance = finalBal;
    
    saveData();
    closeModal('sale-modal');
    setActiveTab('কাস্টমার');
    alert('লেনদেন সফল হয়েছে!');
}

function handleAddCustomer(e) {
    e.preventDefault();
    const newUser = {
        id: Date.now().toString(),
        username: document.getElementById('cust-user').value,
        email: document.getElementById('cust-email').value,
        password: document.getElementById('cust-pass').value,
        designation: 'Customer',
        photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${document.getElementById('cust-user').value}`,
        role: 'user',
        phone: document.getElementById('cust-phone').value,
        milkLiter: parseFloat(document.getElementById('cust-qty').value),
        milkPrice: parseFloat(document.getElementById('cust-price').value),
        balance: 0
    };

    users.push(newUser);
    saveData();
    closeModal('customer-modal');
    renderMainContent();
    alert('কাস্টমার সফলভাবে তৈরি করা হয়েছে!');
}

function handlePhotoUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.slice(0, 8).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const photo = {
                id: Date.now() + Math.random(),
                src: event.target.result,
                gender: Math.random() > 0.5 ? 'Male' : 'Female',
                selected: false
            };
            uploadedPhotos.push(photo);
            if (uploadedPhotos.length > 8) uploadedPhotos = uploadedPhotos.slice(-8);
            refreshPhotoGrid();
        };
        reader.readAsDataURL(file);
    });
}

function refreshPhotoGrid() {
    const grid = document.getElementById('photo-grid');
    if (!grid) return;

    grid.innerHTML = uploadedPhotos.map((p, idx) => `
        <div class="photo-card group ${p.selected ? 'selected border-indigo-600 border-4' : ''}" onclick="togglePhotoSelect(${idx})">
            <img src="${p.src}" alt="Uploaded">
            <div class="custom-checkbox absolute top-4 right-4 z-20">
                ${p.selected ? '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"/></svg>' : ''}
            </div>
            <div class="photo-overlay-content flex flex-col gap-2">
                <p class="text-[9px] font-black text-white uppercase tracking-widest text-center bg-indigo-600 py-1.5 rounded-lg shadow-lg">Processing...</p>
                <div class="flex gap-2">
                    <button onclick="previewPhoto(event, ${idx})" class="flex-1 py-1.5 bg-white text-slate-800 text-[8px] font-black rounded-lg uppercase">View</button>
                    <button onclick="deletePhoto(event, ${idx})" class="flex-1 py-1.5 bg-red-500 text-white text-[8px] font-black rounded-lg uppercase">Del</button>
                </div>
            </div>
            <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none"></div>
        </div>
    `).join('') + (uploadedPhotos.length < 8 ? renderEmptyGrid().slice(0, 8 - uploadedPhotos.length) : '');
}

function togglePhotoSelect(idx) {
    uploadedPhotos[idx].selected = !uploadedPhotos[idx].selected;
    refreshPhotoGrid();
}

function previewPhoto(e, idx) {
    e.stopPropagation();
    const photo = uploadedPhotos[idx];
    const overlay = document.getElementById('photo-overlay');
    document.getElementById('overlay-img').src = photo.src;
    document.getElementById('overlay-gender').innerText = photo.gender;
    overlay.classList.remove('hidden');
}

function closePhotoOverlay() {
    document.getElementById('photo-overlay').classList.add('hidden');
}

function deletePhoto(e, idx) {
    e.stopPropagation();
    uploadedPhotos.splice(idx, 1);
    refreshPhotoGrid();
}

function downloadSelectedPhotos() {
    const selected = uploadedPhotos.filter(p => p.selected);
    if (!selected.length) {
        alert('অনুগ্রহ করে ফটো সিলেক্ট করুন!');
        return;
    }
    selected.forEach((p, i) => {
        const link = document.createElement('a');
        link.download = `photo-${i+1}.png`;
        link.href = p.src;
        link.click();
    });
}

function submitCustomerOrder() {
    if (confirm('আপনি কি অতিরিক্ত দুধের অর্ডার সাবমিট করতে চান?')) {
        const order = {
            id: 'ORD-' + Date.now(),
            customerId: currentUser.id,
            customerName: currentUser.username,
            item: 'অতিরিক্ত দুধ (Daily Supply)',
            date: new Date().toLocaleString('bn-BD'),
            status: 'pending'
        };
        orders.push(order);
        requests.push({
            id: order.id,
            type: 'order',
            userId: currentUser.id,
            userName: currentUser.username,
            status: 'pending',
            payload: order
        });
        saveData();
        renderMainContent();
        alert('আপনার রিকুয়েস্ট অ্যাডমিন এর কাছে পাঠানো হয়েছে।');
    }
}

// --- UTILS ---

function getIcon(tab) {
    const icons = {
        'ড্যাশবোর্ড': '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
        'ইউজার': '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
        'কাস্টমার': '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
        'AI Photo': '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
        'সেটিংস': '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>'
    };
    return icons[tab] || '';
}

function renderRecentActivity() {
    const list = transactions.slice(-10).reverse();
    return `
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm animate-fade-in">
            <h3 class="text-lg font-black text-slate-800 mb-6">সাম্প্রতিক কার্যক্রম</h3>
            <div class="space-y-4">
                ${list.map(t => {
                    const u = users.find(user => user.id === t.userId);
                    return `
                        <div class="flex items-center gap-5 p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                            <img src="${u ? u.photo : ''}" class="w-10 h-10 rounded-xl">
                            <div class="flex-1">
                                <p class="text-sm font-black text-slate-800">${u ? u.username : 'Unknown'}</p>
                                <p class="text-[10px] text-slate-400 font-bold uppercase">${t.qty} কেজি দুধ (Sale)</p>
                            </div>
                            <div class="text-right">
                                <p class="text-[10px] text-slate-500 font-black mb-1">${t.date}</p>
                                <span class="text-[9px] font-black uppercase text-indigo-600">৳ ${t.total}</span>
                            </div>
                        </div>
                    `;
                }).join('') || '<p class="text-center py-10 opacity-30 text-[10px] font-black uppercase">No Recent Activity</p>'}
            </div>
        </div>
    `;
}

function renderCustomerHistory() {
    const list = transactions.filter(t => t.userId === currentUser.id).slice(-10).reverse();
    return `
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm animate-fade-in">
            <h3 class="text-lg font-black text-slate-800 mb-6">লেনদেন ইতিহাস</h3>
            <div class="space-y-4">
                ${list.map(t => `
                    <div class="flex items-center gap-5 p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                        <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-black text-slate-800">${t.qty} কেজি দুধ ক্রয়</p>
                            <p class="text-[10px] text-slate-400 font-bold uppercase">মূল্য: ৳${t.total} | আদায়: ৳${t.received}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-[10px] text-slate-500 font-black mb-1">${t.date}</p>
                            <span class="text-[9px] font-black uppercase ${t.finalBalance >= 0 ? 'text-green-600' : 'text-red-500'}">
                                ৳ ${Math.abs(t.finalBalance)} ${t.finalBalance >= 0 ? '(জমা)' : '(বাকি)'}
                            </span>
                        </div>
                    </div>
                `).join('') || '<p class="text-center py-10 opacity-30 text-[10px] font-black uppercase">No History Found</p>'}
            </div>
        </div>
    `;
}

function renderRequestList() {
    const pending = requests.filter(r => r.status === 'pending');
    return `
        <div class="space-y-6 animate-fade-in">
            ${pending.map(r => `
                <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div class="flex items-center gap-5">
                        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                            ${r.type === 'order' ? 'OR' : 'PR'}
                        </div>
                        <div>
                            <p class="text-sm font-black text-slate-800">${r.userName}</p>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Type: ${r.type} | Date: ${r.payload.date || 'Today'}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="approveRequest('${r.id}')" class="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">Approve</button>
                        <button onclick="rejectRequest('${r.id}')" class="px-6 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Reject</button>
                    </div>
                </div>
            `).join('') || '<div class="text-center py-20 bg-white rounded-[3rem] border border-slate-50 opacity-20"><p class="text-[10px] font-black uppercase tracking-widest">সব রিকুয়েস্ট প্রসেস করা হয়েছে।</p></div>'}
        </div>
    `;
}

function approveRequest(id) {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    
    if (req.type === 'order') {
        const order = orders.find(o => o.id === req.id);
        if (order) order.status = 'completed';
    } else if (req.type === 'milk_update' || req.type === 'profile_update') {
        const user = users.find(u => u.id === req.userId);
        if (user) Object.assign(user, req.payload);
    }
    
    req.status = 'completed';
    saveData();
    renderMainContent();
    alert('অনুমোদন সফল হয়েছে!');
}

function renderSettingsForm() {
    return `
        <div class="max-w-xl mx-auto bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 animate-fade-in">
            <div class="flex flex-col items-center gap-6 mb-10">
                <img src="${currentUser.photo}" class="w-24 h-24 rounded-[2rem] border-4 border-indigo-50 shadow-xl">
                <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">প্রোফাইল সেটিংস</p>
            </div>
            <form id="settings-form" class="space-y-6" onsubmit="handleSettingsRequest(event)">
                <div class="space-y-1"><label class="text-[10px] font-black text-slate-500 ml-1">ইউজারনেম</label><input type="text" id="set-user" value="${currentUser.username}" class="w-full px-5 py-4 rounded-2xl border border-slate-50 bg-slate-50 font-black text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"></div>
                <div class="space-y-1"><label class="text-[10px] font-black text-slate-500 ml-1">পাসওয়ার্ড</label><input type="password" id="set-pass" value="${currentUser.password}" class="w-full px-5 py-4 rounded-2xl border border-slate-50 bg-slate-50 font-black text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"></div>
                <div class="space-y-1"><label class="text-[10px] font-black text-slate-500 ml-1">দৈনিক দুধ (কেজি)</label><input type="number" id="set-qty" value="${currentUser.milkLiter}" class="w-full px-5 py-4 rounded-2xl border border-slate-50 bg-slate-50 font-black text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"></div>
                <button type="submit" class="w-full py-5 bg-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all mt-4">রিকুয়েস্ট পাঠান</button>
            </form>
        </div>
    `;
}

function handleSettingsRequest(e) {
    e.preventDefault();
    const payload = {
        username: document.getElementById('set-user').value,
        password: document.getElementById('set-pass').value,
        milkLiter: parseFloat(document.getElementById('set-qty').value)
    };
    
    requests.push({
        id: 'REQ-' + Date.now(),
        type: 'profile_update',
        userId: currentUser.id,
        userName: currentUser.username,
        status: 'pending',
        payload
    });
    
    saveData();
    alert('আপনার তথ্য হালনাগাদের রিকুয়েস্ট অ্যাডমিন এর কাছে পাঠানো হয়েছে।');
}

// Start App
init();
