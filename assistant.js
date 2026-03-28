// ==================== Supabase Init ====================
const { createClient } = supabase;
const supabaseClient = createClient(
    'https://mxemardtyidrhfsnxvad.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14ZW1hcmR0eWlkcmhmc254dmFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NzkwMzQsImV4cCI6MjA4ODQ1NTAzNH0.u1eFWdodluIqZQ-_Cr5IzSNMNUE1H4GQU-oDYT4Z1oo'
);

// ==================== N8N CONFIG ====================
const N8N_WEBHOOK_URL = 'https://n8n-mcda.onrender.com/webhook-test/ia';

// Vérifier session
supabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (!session) {
        window.location.href = 'login.html';
    }
});

// ==================== FONCTIONS N8N ====================
async function sendToN8N(question, studentId) {
    try {
        console.log('📤 Envoi à n8n:', { question, studentId });

        const res = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, student_id: studentId })
        });

        console.log('📥 Status réponse:', res.status);

        const contentType = res.headers.get('content-type') || '';
        console.log('📦 Content-Type:', contentType);

        if (contentType.includes('application/pdf')) {
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            console.log('✅ PDF binaire reçu, blobUrl créée:', blobUrl);
            return { isPDFBlob: true, blobUrl: blobUrl };
        }

        const data = await res.json();
        console.log('📦 Données reçues de n8n:', data);
        return data;

    } catch (err) {
        console.error('❌ Erreur fetch:', err);
        return { error: true, message: 'Connexion échouée' };
    }
}

window.downloadThisPDF = function(pdfUrl) {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'certificat.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

function createPDFViewerHTML(pdfUrl) {
    return `
        <div class="pdf-toolbar">
            <div class="pdf-toolbar-title">
                <i class="fa-solid fa-file-pdf"></i>
                <span>Certificat de scolarité</span>
            </div>
            <div class="pdf-toolbar-actions">
                <button onclick="downloadThisPDF('${pdfUrl}')" class="pdf-btn download-btn">
                    <i class="fa-solid fa-download"></i> <span>Télécharger</span>
                </button>
                <button onclick="window.open('${pdfUrl}', '_blank')" class="pdf-btn open-btn">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> <span>Nouvel onglet</span>
                </button>
                <button onclick="this.closest('.pdf-viewer-container').remove()" class="pdf-btn close-btn">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>
        <iframe src="${pdfUrl}#toolbar=0&navpanes=0&page=1" class="pdf-iframe"></iframe>
    `;
}

// ==================== بدء التشغيل بعد تحميل الصفحة ====================
document.addEventListener('DOMContentLoaded', () => {

    const firstName = localStorage.getItem('first_name') || 'Student';
    const lastName = localStorage.getItem('last_name') || '';
    const studentEmail = localStorage.getItem('email') || '';

    const profileNameEl = document.querySelector('#profileButton .text-sm.font-medium');
    const profileGreetEl = document.querySelector('#profilePopover .text-sm.font-medium');
    const profileEmailEl = document.querySelector('#profilePopover .text-xs');

    if (profileNameEl) profileNameEl.textContent = `${firstName} ${lastName}`;
    if (profileGreetEl) profileGreetEl.textContent = `hello, ${firstName}`;
    if (profileEmailEl) profileEmailEl.textContent = studentEmail;

    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const html = document.documentElement;

    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            html.classList.add('dark');
            if (themeIcon) { themeIcon.classList.remove('fa-moon'); themeIcon.classList.add('fa-sun'); }
        } else {
            html.classList.remove('dark');
            if (themeIcon) { themeIcon.classList.remove('fa-sun'); themeIcon.classList.add('fa-moon'); }
        }
    };
    initTheme();

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                if (themeIcon) { themeIcon.classList.remove('fa-sun'); themeIcon.classList.add('fa-moon'); }
            } else {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                if (themeIcon) { themeIcon.classList.remove('fa-moon'); themeIcon.classList.add('fa-sun'); }
            }
        });
    }

    const backToHomeBtn = document.getElementById('nav-back-home');
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }

    const leftPanel = document.getElementById('assistantLeftPanel');
    const rightPanel = document.getElementById('rightPanel');
    const toggleBtn = document.getElementById('toggleLeftBtn');
    const toggleIcon = document.getElementById('toggleIcon');
    const messagesContainer = document.getElementById('messagesContainer');
    const body = document.body;
    const inputField = document.querySelector('#inputContainer > div');
    let panelOpen = true;

    if (toggleBtn && leftPanel && rightPanel) {
        toggleBtn.addEventListener('click', () => {
            panelOpen = !panelOpen;
            if (panelOpen) {
                leftPanel.classList.remove('left-panel-closed');
                leftPanel.style.display = 'flex';
                leftPanel.style.width = '250px';
                rightPanel.classList.remove('right-panel-full');
                body.classList.remove('left-panel-hidden');
                if (messagesContainer) { messagesContainer.style.paddingLeft = ''; messagesContainer.style.paddingRight = ''; }
                if (inputField) { inputField.style.marginLeft = ''; inputField.style.marginRight = ''; inputField.style.width = ''; inputField.style.maxWidth = ''; }
                if (toggleIcon) { toggleIcon.classList.remove('fa-angles-right'); toggleIcon.classList.add('fa-angles-left'); }
            } else {
                leftPanel.classList.add('left-panel-closed');
                leftPanel.style.display = 'none';
                leftPanel.style.width = '0';
                rightPanel.classList.add('right-panel-full');
                body.classList.add('left-panel-hidden');
                if (messagesContainer) { messagesContainer.style.paddingLeft = ''; messagesContainer.style.paddingRight = ''; }
                if (inputField) { inputField.style.marginLeft = ''; inputField.style.marginRight = ''; inputField.style.width = ''; inputField.style.maxWidth = ''; }
                if (toggleIcon) { toggleIcon.classList.remove('fa-angles-left'); toggleIcon.classList.add('fa-angles-right'); }
            }
        });
    }

    const STORAGE_KEY = 'unimate_chat_sessions';
    const CURRENT_SESSION_KEY = 'unimate_current_session';
    const PINNED_KEY = 'pinned_sessions';

    let chatSessions = [];
    let pinnedSessions = [];
    let currentSessionId = null;
    let hasMessages = false;

    const chatArea = document.getElementById('chatMessagesArea');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    const sessionsContainer = document.getElementById('chatSessionsList');
    const chatTitleSpan = document.getElementById('chatTitleSpan');
    const newChatBtn = document.getElementById('newChatBtn');
    const inputContainer = document.getElementById('inputContainer');
    const greetingContainer = document.getElementById('greetingContainer');

    const closeAllPopovers = () => {
        document.querySelectorAll('.session-popover').forEach(p => p.remove());
    };

    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-5 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50 animate-fade-in';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('animate-fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    };

    const savePinnedSessions = () => {
        localStorage.setItem(PINNED_KEY, JSON.stringify(pinnedSessions));
    };

    const togglePinSession = (sessionId) => {
        const session = chatSessions.find(s => s.id === sessionId);
        if (!session) return;
        const index = pinnedSessions.indexOf(sessionId);
        if (index === -1) {
            pinnedSessions.unshift(sessionId);
            showNotification(`"${session.title}" pinned`);
        } else {
            pinnedSessions.splice(index, 1);
            showNotification(`"${session.title}" unpinned`);
        }
        savePinnedSessions();
        renderSessionsList();
    };

    const renderSessionsList = () => {
        if (!sessionsContainer) return;
        if (chatSessions.length === 0) {
            sessionsContainer.innerHTML = '<div class="text-slate-400 dark:text-slate-600 text-sm italic px-3 py-2">No chats yet</div>';
            return;
        }

        const pinned = chatSessions.filter(s => pinnedSessions.includes(s.id));
        const unpinned = chatSessions.filter(s => !pinnedSessions.includes(s.id));
        let html = '';

        if (pinned.length > 0) {
            html += `<div class="date-header text-amber-600 dark:text-amber-400"><i class="fa-solid fa-bookmark mr-1"></i> Pinned</div>`;
            pinned.forEach(session => {
                const isActive = session.id === currentSessionId;
                html += `<div class="session-wrapper" data-session-id="${session.id}"><div class="session-item ${isActive ? 'active' : ''}"><span class="session-title flex items-center gap-1"><i class="fa-solid fa-bookmark text-amber-500 text-[10px]"></i>${session.title}</span><button class="session-menu-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button></div></div>`;
            });
        }

        if (unpinned.length > 0) {
            html += `<div class="date-header">Recent</div>`;
            unpinned.forEach(session => {
                const isActive = session.id === currentSessionId;
                html += `<div class="session-wrapper" data-session-id="${session.id}"><div class="session-item ${isActive ? 'active' : ''}"><span class="session-title">${session.title}</span><button class="session-menu-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button></div></div>`;
            });
        }

        sessionsContainer.innerHTML = html;

        document.querySelectorAll('.session-wrapper').forEach(wrapper => {
            const sessionId = wrapper.dataset.sessionId;
            wrapper.querySelector('.session-item').addEventListener('click', (e) => {
                if (e.target.closest('.session-menu-btn')) return;
                switchToSession(sessionId);
            });

            const menuBtn = wrapper.querySelector('.session-menu-btn');
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllPopovers();
                const session = chatSessions.find(s => s.id === sessionId);
                const isPinned = pinnedSessions.includes(sessionId);
                const popover = document.createElement('div');
                popover.className = 'session-popover';
                popover.innerHTML = `
                    <div class="menu-item" data-action="rename"><i class="fa-regular fa-pen-to-square"></i> Rename</div>
                    <div class="menu-item" data-action="pin"><i class="fa-regular fa-bookmark"></i>${isPinned ? 'Unpin' : 'Pin'}</div>
                    <div class="menu-item delete" data-action="delete"><i class="fa-regular fa-trash-can"></i> Delete</div>
                `;
                const rect = menuBtn.getBoundingClientRect();
                popover.style.top = `${rect.bottom + 5}px`;
                popover.style.left = `${rect.left - 130}px`;
                document.body.appendChild(popover);

                popover.querySelectorAll('.menu-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const action = item.dataset.action;
                        if (action === 'delete') {
                            if (confirm('Are you sure you want to delete this chat?')) {
                                chatSessions = chatSessions.filter(s => s.id !== sessionId);
                                pinnedSessions = pinnedSessions.filter(id => id !== sessionId);
                                savePinnedSessions();
                                if (currentSessionId === sessionId) {
                                    if (chatSessions.length > 0) { currentSessionId = chatSessions[0].id; }
                                    else { createNewSession(); popover.remove(); return; }
                                }
                                saveSessions(); renderSessionsList(); loadSessionMessages();
                            }
                        } else if (action === 'rename') {
                            const newTitle = prompt('Enter new name:', session.title);
                            if (newTitle && newTitle.trim()) {
                                session.title = newTitle.trim();
                                if (currentSessionId === sessionId && chatTitleSpan) chatTitleSpan.textContent = session.title;
                                saveSessions(); renderSessionsList();
                            }
                        } else if (action === 'pin') {
                            togglePinSession(sessionId);
                        }
                        popover.remove();
                    });
                });

                setTimeout(() => {
                    document.addEventListener('click', function closeMenu(e) {
                        if (!popover.contains(e.target) && !menuBtn.contains(e.target)) {
                            popover.remove();
                            document.removeEventListener('click', closeMenu);
                        }
                    });
                }, 0);
            });
        });
    };

    const adjustInputPosition = () => {
        if (!inputContainer) return;
        if (hasMessages) {
            inputContainer.classList.remove('input-center');
            inputContainer.classList.add('input-bottom');
            body.classList.remove('has-no-messages');
        } else {
            inputContainer.classList.remove('input-bottom');
            inputContainer.classList.add('input-center');
            body.classList.add('has-no-messages');
        }
    };

    const loadSessions = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            chatSessions = saved ? JSON.parse(saved) : [];
            const savedPinned = localStorage.getItem(PINNED_KEY);
            pinnedSessions = savedPinned ? JSON.parse(savedPinned) : [];
            const currentId = localStorage.getItem(CURRENT_SESSION_KEY);
            if (currentId && chatSessions.some(s => s.id === currentId)) {
                currentSessionId = currentId;
            } else if (chatSessions.length > 0) {
                currentSessionId = chatSessions[0].id;
            } else {
                createNewSession();
            }
            renderSessionsList();
            loadSessionMessages();
        } catch (e) {
            console.error('Error loading sessions:', e);
            chatSessions = [];
            createNewSession();
        }
    };

    const createNewSession = () => {
        const newSession = {
            id: Date.now().toString(),
            title: 'New conversation',
            messages: [],
            createdAt: new Date().toISOString()
        };
        chatSessions.unshift(newSession);
        currentSessionId = newSession.id;
        saveSessions();
        renderSessionsList();
        clearChatArea();
        showGreeting();
        if (chatTitleSpan) chatTitleSpan.textContent = 'New conversation';
        hasMessages = false;
        adjustInputPosition();
    };

    const saveSessions = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chatSessions));
        if (currentSessionId) localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId);
    };

    const switchToSession = (sessionId) => {
        const session = chatSessions.find(s => s.id === sessionId);
        if (!session) return;
        currentSessionId = sessionId;
        saveSessions();
        renderSessionsList();
        loadSessionMessages();
        if (chatTitleSpan) chatTitleSpan.textContent = session.title;
        hasMessages = session.messages.length > 0;
        adjustInputPosition();
    };

    const loadSessionMessages = () => {
        clearChatArea();
        const session = chatSessions.find(s => s.id === currentSessionId);
        if (!session) return;
        if (session.messages.length === 0) {
            showGreeting();
            hasMessages = false;
        } else {
            if (greetingContainer) greetingContainer.style.display = 'none';
            session.messages.forEach(msg => {
                if (msg.isPDF && msg.pdfUrl) {
                    const msgDiv = document.createElement('div');
                    msgDiv.className = 'message-bubble assistant fade-in';
                    msgDiv.innerHTML = `<p>${msg.text}</p>`;
                    messagesContainer.appendChild(msgDiv);

                    const pdfDiv = document.createElement('div');
                    pdfDiv.className = 'pdf-viewer-container';
                    pdfDiv.innerHTML = createPDFViewerHTML(msg.pdfUrl);
                    messagesContainer.appendChild(pdfDiv);
                } else {
                    displayMessage(msg.text, msg.isUser);
                }
            });
            hasMessages = true;
        }
        adjustInputPosition();
    };

    const showGreeting = () => {
        if (!messagesContainer) return;
        if (greetingContainer) greetingContainer.style.display = 'flex';
    };

    const clearChatArea = () => {
        if (!messagesContainer) return;
        messagesContainer.querySelectorAll('.message-bubble').forEach(msg => msg.remove());
        messagesContainer.querySelectorAll('.pdf-viewer-container').forEach(pdf => pdf.remove());
        if (greetingContainer) greetingContainer.style.display = 'flex';
    };

    const displayMessage = (text, isUser = true) => {
        if (!messagesContainer) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message-bubble fade-in' : 'message-bubble assistant fade-in';
        messageDiv.textContent = text;
        if (greetingContainer && greetingContainer.style.display !== 'none') {
            messagesContainer.insertBefore(messageDiv, greetingContainer);
        } else {
            messagesContainer.appendChild(messageDiv);
        }
        if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
    };

    // ==================== ENVOYER MESSAGE À N8N ====================
    const addMessageToCurrentSession = async (text) => {
        const session = chatSessions.find(s => s.id === currentSessionId);
        if (!session) return;

        session.messages.push({ text: text, isUser: true, timestamp: new Date().toISOString() });

        if (session.messages.length === 1) {
            session.title = text.length > 30 ? text.substring(0, 30) + '...' : text;
            if (chatTitleSpan) chatTitleSpan.textContent = session.title;
        }

        saveSessions();
        renderSessionsList();

        if (greetingContainer) greetingContainer.style.display = 'none';
        displayMessage(text, true);

        if (!hasMessages) { hasMessages = true; adjustInputPosition(); }

        const studentId = localStorage.getItem('student_id');

        if (!studentId) {
            const reply = "❌ Session expirée";
            session.messages.push({ text: reply, isUser: false, timestamp: new Date().toISOString() });
            displayMessage(reply, false);
            saveSessions();
            return;
        }

        try {
            const response = await sendToN8N(text, studentId);

            let reply = '';
            let isPDF = false;
            let pdfUrl = null;

            if (response && response.isPDFBlob) {
                isPDF = true;
                pdfUrl = response.blobUrl;
                reply = '✅ Votre certificat de scolarité est prêt';
            } else if (response && response.URL) {
                isPDF = true;
                pdfUrl = response.URL;
                reply = response.message || '✅ Votre certificat de scolarité est prêt';
            } else if (response && response.pdf_url) {
                isPDF = true;
                pdfUrl = response.pdf_url;
                reply = response.message || '✅ Votre certificat est prêt';
            } else if (response && response.url) {
                isPDF = true;
                pdfUrl = response.url;
                reply = response.message || '✅ Votre certificat est prêt';
            } else if (response && response.type === 'pdf') {
                isPDF = true;
                pdfUrl = response.pdf_url;
                reply = response.message || 'Votre document est prêt';
            } else if (response && response.type === 'text') {
                reply = response.message || response.response;
            } else if (response && response.output) {
                reply = response.output;
            } else if (response && response.message) {
                reply = response.message;
            } else if (response && response.error) {
                reply = '❌ ' + response.message;
            } else if (typeof response === 'string') {
                reply = response;
            } else {
                reply = "Désolé, je n'ai pas pu traiter votre demande.";
            }

            session.messages.push({
                text: reply,
                isUser: false,
                isPDF: isPDF,
                pdfUrl: pdfUrl,
                timestamp: new Date().toISOString()
            });

            if (isPDF && pdfUrl) {
                const msgDiv = document.createElement('div');
                msgDiv.className = 'message-bubble assistant fade-in';
                msgDiv.innerHTML = `<p>${reply}</p>`;
                messagesContainer.appendChild(msgDiv);

                const pdfDiv = document.createElement('div');
                pdfDiv.className = 'pdf-viewer-container';
                pdfDiv.innerHTML = createPDFViewerHTML(pdfUrl);
                messagesContainer.appendChild(pdfDiv);
                if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
            } else {
                displayMessage(reply, false);
            }

            // Recharger les demandes si c'est un certificat
            if (reply.includes('certificat') || reply.includes('récupérer')) {
                const panelDemandes = document.getElementById('panel-demandes');
                if (panelDemandes && !panelDemandes.classList.contains('hidden')) {
                    loadDemandes();
                }
            }

            saveSessions();

        } catch (error) {
            console.error('Erreur:', error);
            const errorReply = '❌ Erreur de connexion. Veuillez réessayer.';
            session.messages.push({ text: errorReply, isUser: false, timestamp: new Date().toISOString() });
            displayMessage(errorReply, false);
            saveSessions();
        }
    };

    const resetToNewChat = () => {
        createNewSession();
        if (chatInput) { chatInput.value = ''; if (sendBtn) sendBtn.disabled = true; }
    };

    if (newChatBtn) newChatBtn.addEventListener('click', resetToNewChat);

    if (chatInput && sendBtn) {
        chatInput.addEventListener('input', () => { sendBtn.disabled = chatInput.value.trim() === ''; });
        sendBtn.addEventListener('click', () => {
            const msg = chatInput.value.trim();
            if (msg === '') return;
            addMessageToCurrentSession(msg);
            chatInput.value = '';
            sendBtn.disabled = true;
        });
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !sendBtn.disabled) { e.preventDefault(); sendBtn.click(); }
        });
    }

    const profileBtn = document.getElementById('profileButton');
    const popover = document.getElementById('profilePopover');

    if (profileBtn && popover) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            popover.classList.toggle('hidden');
            if (!popover.classList.contains('hidden')) {
                const btnRect = profileBtn.getBoundingClientRect();
                const popoverRect = popover.getBoundingClientRect();
                const leftPanelRect = leftPanel.getBoundingClientRect();
                if (btnRect.left + popoverRect.width > leftPanelRect.right) {
                    popover.style.left = 'auto'; popover.style.right = '10px';
                    const arrow = popover.querySelector('.absolute');
                    if (arrow) { arrow.style.left = 'auto'; arrow.style.right = '20px'; }
                }
                if (btnRect.top - popoverRect.height < 0) {
                    popover.style.bottom = 'auto'; popover.style.top = '100%'; popover.style.marginTop = '10px';
                    const arrow = popover.querySelector('.absolute');
                    if (arrow) { arrow.style.bottom = 'auto'; arrow.style.top = '-8px'; arrow.style.transform = 'rotate(-135deg)'; }
                }
            }
        });
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !popover.contains(e.target)) popover.classList.add('hidden');
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            localStorage.removeItem('student_id');
            localStorage.removeItem('first_name');
            localStorage.removeItem('last_name');
            localStorage.removeItem('first_name_ar');
            localStorage.removeItem('last_name_ar');
            localStorage.removeItem('email');
            window.location.href = 'login.html';
        });
    }

    const adjustMessagesAlignment = () => {
        if (!messagesContainer || !inputField) return;
        messagesContainer.style.paddingLeft = '';
        messagesContainer.style.paddingRight = '';
        if (inputField) { inputField.style.marginLeft = ''; inputField.style.marginRight = ''; }
    };

    window.addEventListener('resize', adjustMessagesAlignment);

    loadSessions();
    if (leftPanel) { leftPanel.classList.remove('left-panel-closed'); leftPanel.style.display = 'flex'; leftPanel.style.width = '250px'; }
    if (rightPanel) rightPanel.classList.remove('right-panel-full');
    if (toggleIcon) { toggleIcon.classList.remove('fa-angles-right'); toggleIcon.classList.add('fa-angles-left'); }

    setTimeout(() => {
        const session = chatSessions.find(s => s.id === currentSessionId);
        hasMessages = session ? session.messages.length > 0 : false;
        adjustInputPosition();
        adjustMessagesAlignment();
    }, 100);

    window.addEventListener('resize', () => { adjustInputPosition(); adjustMessagesAlignment(); });
});

// ============================================================
// ==================== ONGLETS CHATS / DEMANDES ====================
// ============================================================

const DEMANDE_LABELS = {
    'certificat_scolarite': 'Certificat scolarité',
    'releve_notes':         'Relevé de notes',
    'attestation':          'Attestation',
    'autre':                'Autre demande'
};

// -- Switch entre les deux onglets --
window.switchTab = function(tab) {
    const btnChats    = document.getElementById('tab-chats');
    const btnDemandes = document.getElementById('tab-demandes');

    const activeClasses   = ['bg-white', 'dark:bg-slate-700', 'text-slate-800', 'dark:text-white', 'shadow-sm'];
    const inactiveClasses = ['text-slate-400', 'dark:text-slate-500'];

    if (tab === 'chats') {
        activeClasses.forEach(c => btnChats.classList.add(c));
        inactiveClasses.forEach(c => { btnChats.classList.remove(c); btnDemandes.classList.add(c); });
        activeClasses.forEach(c => btnDemandes.classList.remove(c));
    } else {
        activeClasses.forEach(c => btnDemandes.classList.add(c));
        inactiveClasses.forEach(c => { btnDemandes.classList.remove(c); btnChats.classList.add(c); });
        activeClasses.forEach(c => btnChats.classList.remove(c));
    }

    const panelChats    = document.getElementById('panel-chats');
    const panelDemandes = document.getElementById('panel-demandes');

    if (tab === 'chats') {
        panelChats.classList.remove('hidden');
        panelChats.classList.add('flex');
        panelDemandes.classList.add('hidden');
        panelDemandes.classList.remove('flex');
    } else {
        panelDemandes.classList.remove('hidden');
        panelDemandes.classList.add('flex');
        panelChats.classList.add('hidden');
        panelChats.classList.remove('flex');
        loadDemandes();
    }
};

// -- Charger les demandes depuis Supabase -- ✅ TABLE ET COLONNE CORRIGÉES
async function loadDemandes() {
    const list = document.getElementById('demandesList');
    if (!list) return;

    list.innerHTML = `
        <div class="flex items-center gap-2 px-2 py-3 text-xs text-slate-400 dark:text-slate-500">
            <i class="fa-solid fa-spinner fa-spin"></i> Chargement...
        </div>`;

    try {
        const studentId = localStorage.getItem('student_id');
        if (!studentId) {
            list.innerHTML = `<p class="text-xs text-slate-400 px-2 py-3">Session expirée.</p>`;
            return;
        }

        // ✅ CORRECTION : table = demandes_certificats, colonne = student_id
        const { data: demandes, error } = await supabaseClient
            .from('demandes_certificats')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!demandes || demandes.length === 0) {
            list.innerHTML = `
                <div class="text-center py-6 px-3">
                    <i class="fa-regular fa-folder-open text-2xl text-slate-300 dark:text-slate-600 mb-2"></i>
                    <p class="text-xs text-slate-400 dark:text-slate-500">Aucune demande pour l'instant.</p>
                </div>`;
            return;
        }

        list.innerHTML = demandes.map(d => renderDemandeCard(d)).join('');

    } catch (err) {
        console.error('Erreur chargement demandes:', err);
        list.innerHTML = `<p class="text-xs text-red-400 px-2 py-3">❌ Erreur de chargement.</p>`;
    }
}

// -- Générer le HTML d'une carte demande --
function renderDemandeCard(demande) {
    const date  = new Date(demande.created_at).toLocaleDateString('fr-FR');
    const titre = DEMANDE_LABELS[demande.type_demande] || 'Certificat scolarité';
    const badge = renderBadge(demande.statut);

    return `
        <div onclick="afficherDetailDemande('${demande.id}')"
            class="mx-1 p-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800 mb-1">
            <div class="flex items-start justify-between gap-2">
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">${titre}</span>
                ${badge}
            </div>
            <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">${date}</p>
            <p class="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5 truncate">Réf: ${demande.numero || '—'}</p>
        </div>`;
}

// -- Badge coloré selon le statut --
function renderBadge(statut) {
    const config = {
        'en_attente': { label: 'En cours', css: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
        'traite':     { label: 'Récupéré', css: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' }
    };
    const s = config[statut] || { label: statut, css: 'bg-slate-100 text-slate-500' };
    return `<span class="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.css}">${s.label}</span>`;
}

// -- Afficher le détail d'une demande --
async function afficherDetailDemande(id) {
    try {
        // ✅ CORRECTION : table = demandes_certificats
        const { data, error } = await supabaseClient
            .from('demandes_certificats')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return;

        const titre = DEMANDE_LABELS[data.type_demande] || 'Certificat scolarité';
        const chatTitleSpan = document.getElementById('chatTitleSpan');
        if (chatTitleSpan) chatTitleSpan.textContent = titre;

        const messagesContainer = document.getElementById('messagesContainer');
        const greetingContainer = document.getElementById('greetingContainer');
        const chatArea          = document.getElementById('chatMessagesArea');

        if (greetingContainer) greetingContainer.style.display = 'none';

        messagesContainer.querySelectorAll('.message-bubble, .pdf-viewer-container, .demande-detail-msg').forEach(el => el.remove());

        // Message étudiant
        const userMsg = document.createElement('div');
        userMsg.className = 'message-bubble fade-in demande-detail-msg';
        userMsg.textContent = `Demande de ${titre}`;
        messagesContainer.appendChild(userMsg);

        // Statut de la demande
        const statusMsg = document.createElement('div');
        statusMsg.className = 'message-bubble assistant fade-in demande-detail-msg';

        if (data.statut === 'traite') {
            statusMsg.innerHTML = `<span class="text-green-600 dark:text-green-400 font-medium">
                ✅ Votre certificat est prêt. Vous pouvez le récupérer au service de scolarité.
            </span>`;
        } else {
            statusMsg.innerHTML = `<span class="text-slate-400 dark:text-slate-500 italic text-sm">
                <i class="fa-regular fa-clock mr-1"></i>Votre demande est en cours de traitement...
            </span>`;
        }

        messagesContainer.appendChild(statusMsg);

        // Infos supplémentaires
        const infoMsg = document.createElement('div');
        infoMsg.className = 'message-bubble assistant fade-in demande-detail-msg';
        infoMsg.innerHTML = `
            <div class="text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-1">
                <span>📅 Demandé le : ${new Date(data.created_at).toLocaleDateString('fr-FR')}</span>
                <span>🔖 Réf : ${data.numero || '—'}</span>
                ${data.traite_at ? `<span>✅ Traité le : ${new Date(data.traite_at).toLocaleDateString('fr-FR')}</span>` : ''}
            </div>
        `;
        messagesContainer.appendChild(infoMsg);

        if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;

    } catch (err) {
        console.error('Erreur affichage demande:', err);
    }
}
