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
        const res = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, student_id: studentId })
        });
        return await res.json();
    } catch (err) {
        return { error: true, message: 'Connexion échouée' };
    }
}

// Fonction pour télécharger le PDF
window.downloadThisPDF = function(pdfUrl) {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'certificat.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// ==================== بدء التشغيل بعد تحميل الصفحة ====================
document.addEventListener('DOMContentLoaded', () => {

    // ==================== Afficher nom étudiant ====================
    const firstName = localStorage.getItem('first_name') || 'Student';
    const lastName = localStorage.getItem('last_name') || '';
    const studentEmail = localStorage.getItem('email') || '';

    const profileNameEl = document.querySelector('#profileButton .text-sm.font-medium');
    const profileGreetEl = document.querySelector('#profilePopover .text-sm.font-medium');
    const profileEmailEl = document.querySelector('#profilePopover .text-xs');

    if (profileNameEl) profileNameEl.textContent = `${firstName} ${lastName}`;
    if (profileGreetEl) profileGreetEl.textContent = `hello, ${firstName}`;
    if (profileEmailEl) profileEmailEl.textContent = studentEmail;

    // ==================== نظام الثيم ====================
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

    // ==================== العودة للصفحة الرئيسية ====================
    const backToHomeBtn = document.getElementById('nav-back-home');
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }

    // ==================== إظهار/إخفاء الجهة اليسرى ====================
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

    // ==================== نظام إدارة المحادثات ====================
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
                    // Afficher message texte
                    const msgDiv = document.createElement('div');
                    msgDiv.className = 'message-bubble assistant fade-in';
                    msgDiv.innerHTML = `<p>${msg.text}</p>`;
                    messagesContainer.appendChild(msgDiv);
                    
                    // Afficher PDF
                    const pdfDiv = document.createElement('div');
                    pdfDiv.className = 'pdf-viewer-container';
                    pdfDiv.innerHTML = `
                        <div class="pdf-toolbar">
                            <button onclick="downloadThisPDF('${msg.pdfUrl}')" class="pdf-btn"><i class="fa-solid fa-download"></i> Télécharger</button>
                            <button onclick="this.closest('.pdf-viewer-container').remove()" class="pdf-btn close-btn"><i class="fa-solid fa-times"></i> Fermer</button>
                        </div>
                        <iframe src="${msg.pdfUrl}" class="pdf-iframe"></iframe>
                    `;
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
        
        // Ajouter message utilisateur
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
            
            // Traiter la réponse selon son type
            let reply = '';
            let isPDF = false;
            let pdfUrl = null;
            
            // Cas 1: Réponse avec type PDF
            if (response.type === 'pdf') {
                isPDF = true;
                pdfUrl = response.pdf_url;
                reply = response.message || 'Votre document est prêt';
            }
            // Cas 2: Réponse avec type texte
            else if (response.type === 'text') {
                reply = response.message || response.response;
            }
            // Cas 3: Réponse contient pdf_url directement
            else if (response.pdf_url) {
                isPDF = true;
                pdfUrl = response.pdf_url;
                reply = response.message || 'Votre document est prêt';
            }
            // Cas 4: Réponse contient url
            else if (response.url) {
                isPDF = true;
                pdfUrl = response.url;
                reply = response.message || 'Votre document est prêt';
            }
            // Cas 5: Erreur
            else if (response.error) {
                reply = '❌ ' + response.message;
            }
            // Cas 6: Réponse string
            else if (typeof response === 'string') {
                reply = response;
            }
            // Cas 7: Réponse avec message
            else if (response.message) {
                reply = response.message;
            }
            // Cas 8: Réponse de l'Agent IA
            else if (response.output) {
                reply = response.output;
            }
            // Cas 9: Par défaut
            else {
                reply = 'Désolé, je n\'ai pas pu traiter votre demande.';
            }
            
            // Sauvegarder dans la session
            session.messages.push({ 
                text: reply, 
                isUser: false, 
                isPDF: isPDF,
                pdfUrl: pdfUrl,
                timestamp: new Date().toISOString() 
            });
            
            // Afficher dans le chat
            if (isPDF && pdfUrl) {
                // Afficher le message texte
                const msgDiv = document.createElement('div');
                msgDiv.className = 'message-bubble assistant fade-in';
                msgDiv.innerHTML = `<p>${reply}</p>`;
                messagesContainer.appendChild(msgDiv);
                
                // Afficher le PDF viewer
                const pdfDiv = document.createElement('div');
                pdfDiv.className = 'pdf-viewer-container';
                pdfDiv.innerHTML = `
                    <div class="pdf-toolbar">
                        <button onclick="downloadThisPDF('${pdfUrl}')" class="pdf-btn">
                            <i class="fa-solid fa-download"></i> Télécharger
                        </button>
                        <button onclick="this.closest('.pdf-viewer-container').remove()" class="pdf-btn close-btn">
                            <i class="fa-solid fa-times"></i> Fermer
                        </button>
                    </div>
                    <iframe src="${pdfUrl}" class="pdf-iframe"></iframe>
                `;
                messagesContainer.appendChild(pdfDiv);
                chatArea.scrollTop = chatArea.scrollHeight;
            } else {
                // Afficher le texte normalement
                displayMessage(reply, false);
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

    // ===== Profile Popover =====
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

    // ===== Logout =====
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

    // ===== Alignment =====
    const adjustMessagesAlignment = () => {
        if (!messagesContainer || !inputField) return;
        messagesContainer.style.paddingLeft = '';
        messagesContainer.style.paddingRight = '';
        if (inputField) { inputField.style.marginLeft = ''; inputField.style.marginRight = ''; }
    };

    window.addEventListener('resize', adjustMessagesAlignment);

    // ===== Init =====
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
