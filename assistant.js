// assistant.js

// ==================== بدء التشغيل بعد تحميل الصفحة بالكامل ====================
document.addEventListener('DOMContentLoaded', () => {

    // ==================== نظام الثيم (Dark/Light Mode) ====================
    const themeToggle = document.getElementById('theme-toggle'); // زر تبديل الثيم
    const themeIcon = document.getElementById('theme-icon'); // أيقونة الثيم
    const html = document.documentElement; // عنصر <html>

    // دالة تهيئة الثيم بناءً على التخزين المحلي أو تفضيلات النظام
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme'); // جلب الثيم المحفوظ
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; // هل يفضل النظام الوضع الداكن؟

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            html.classList.add('dark'); // إضافة كلاس 'dark' إلى عنصر html
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon'); // إزالة أيقونة القمر
                themeIcon.classList.add('fa-sun'); // إضافة أيقونة الشمس
            }
        } else {
            html.classList.remove('dark'); // إزالة كلاس 'dark'
            if (themeIcon) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }
    };
    initTheme(); // تنفيذ التهيئة

    // إضافة حدث النقر لزر تبديل الثيم
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (html.classList.contains('dark')) {
                html.classList.remove('dark'); // إزالة الوضع الداكن
                localStorage.setItem('theme', 'light'); // حفظ الوضع الفاتح
                if (themeIcon) {
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                }
            } else {
                html.classList.add('dark'); // تفعيل الوضع الداكن
                localStorage.setItem('theme', 'dark'); // حفظ الوضع الداكن
                if (themeIcon) {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                }
            }
        });
    }

    // ==================== العودة للصفحة الرئيسية ====================
    const backToHomeBtn = document.getElementById('nav-back-home');
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', (e) => {
            e.preventDefault(); // منع السلوك الافتراضي للرابط
            window.location.href = 'main.html#/'; // التوجيه إلى الصفحة الرئيسية
        });
    }

    // ==================== إظهار/إخفاء الجهة اليسرى (القائمة الجانبية) ====================
    const leftPanel = document.getElementById('assistantLeftPanel');
    const rightPanel = document.getElementById('rightPanel');
    const toggleBtn = document.getElementById('toggleLeftBtn');
    const toggleIcon = document.getElementById('toggleIcon');
    const messagesContainer = document.getElementById('messagesContainer');
    const body = document.body;

    // تحديد الحاوية الداخلية لحقل الإدخال (الـ div الذي يتحكم بالهوامش)
    const inputField = document.querySelector('#inputContainer > div');
    let panelOpen = true; // حالة اللوحة اليسرى (مفتوحة افتراضياً)

    if (toggleBtn && leftPanel && rightPanel) {
        toggleBtn.addEventListener('click', () => {
            panelOpen = !panelOpen; // عكس الحالة
            if (panelOpen) {
                // إظهار اللوحة اليسرى
                leftPanel.classList.remove('left-panel-closed'); // إزالة كلاس الإخفاء
                leftPanel.style.display = 'flex'; // إعادة العرض كـ flex
                leftPanel.style.width = '250px'; // إعادة العرض
                rightPanel.classList.remove('right-panel-full'); // إزالة كلاس الامتداد الكامل

                // إزالة كلاس الإخفاء من body (للتنسيقات الخاصة)
                body.classList.remove('left-panel-hidden');

                // إعادة الهوامش الافتراضية للرسائل
                if (messagesContainer) {
                    messagesContainer.style.paddingLeft = '';
                    messagesContainer.style.paddingRight = '';
                }

                // إعادة الهوامش الافتراضية لحقل الإدخال
                if (inputField) {
                    inputField.style.marginLeft = '';
                    inputField.style.marginRight = '';
                    inputField.style.width = '';
                    inputField.style.maxWidth = '';
                }

                // تحديث أيقونة زر التبديل
                if (toggleIcon) {
                    toggleIcon.classList.remove('fa-angles-right');
                    toggleIcon.classList.add('fa-angles-left');
                }
            } else {
                // إخفاء اللوحة اليسرى
                leftPanel.classList.add('left-panel-closed'); // إضافة كلاس الإخفاء
                leftPanel.style.display = 'none'; // إخفاء العنصر
                leftPanel.style.width = '0'; // جعل العرض صفر
                rightPanel.classList.add('right-panel-full'); // جعل اللوحة اليمنى بعرض كامل

                // إضافة كلاس الإخفاء إلى body
                body.classList.add('left-panel-hidden');

                // CSS سيتولى الباقي، لكن نضمن إزالة أي تنسيقات مضبوطة يدوياً
                if (messagesContainer) {
                    messagesContainer.style.paddingLeft = '';
                    messagesContainer.style.paddingRight = '';
                }

                if (inputField) {
                    inputField.style.marginLeft = '';
                    inputField.style.marginRight = '';
                    inputField.style.width = '';
                    inputField.style.maxWidth = '';
                }

                // تحديث أيقونة زر التبديل
                if (toggleIcon) {
                    toggleIcon.classList.remove('fa-angles-left');
                    toggleIcon.classList.add('fa-angles-right');
                }
            }
        });
    }

    // ==================== نظام إدارة المحادثات (Sessions Management) ====================

    const STORAGE_KEY = 'unimate_chat_sessions'; // مفتاح تخزين المحادثات
    const CURRENT_SESSION_KEY = 'unimate_current_session'; // مفتاح تخزين الجلسة الحالية
    const PINNED_KEY = 'pinned_sessions'; // مفتاح تخزين المحادثات المثبتة

    let chatSessions = []; // مصفوفة لتخزين كل المحادثات
    let pinnedSessions = []; // مصفوفة لتخزين معرفات المحادثات المثبتة
    let currentSessionId = null; // معرف الجلسة الحالية
    let hasMessages = false; // متغير لتتبع وجود رسائل في الجلسة الحالية

    const chatArea = document.getElementById('chatMessagesArea');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    const sessionsContainer = document.getElementById('chatSessionsList');
    const chatTitleSpan = document.getElementById('chatTitleSpan');
    const newChatBtn = document.getElementById('newChatBtn');
    const inputContainer = document.getElementById('inputContainer');
    const greetingContainer = document.getElementById('greetingContainer');

    // ===== إغلاق جميع القوائم المنبثقة (Popovers) =====
    const closeAllPopovers = () => {
        document.querySelectorAll('.session-popover').forEach(p => p.remove()); // إزالة كل عناصر popover
    };

    // ===== عرض إشعار (Notification) =====
    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-5 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50 animate-fade-in'; // تنسيقات الإشعار
        notification.textContent = message; // نص الإشعار
        document.body.appendChild(notification); // إضافة الإشعار للصفحة

        setTimeout(() => {
            notification.classList.add('animate-fade-out'); // إضافة كلاس حركة الإخفاء
            setTimeout(() => notification.remove(), 300); // إزالة العنصر بعد انتهاء الحركة
        }, 2000); // الوقت قبل بدء الإخفاء (2 ثانية)
    };

    // ===== حفظ المحادثات المثبتة =====
    const savePinnedSessions = () => {
        localStorage.setItem(PINNED_KEY, JSON.stringify(pinnedSessions)); // تحويل المصفوفة لنص وحفظها
    };

    // ===== تثبيت/إلغاء تثبيت محادثة =====
    const togglePinSession = (sessionId) => {
        const session = chatSessions.find(s => s.id === sessionId); // البحث عن الجلسة
        if (!session) return; // إذا لم توجد، نخرج

        const index = pinnedSessions.indexOf(sessionId); // البحث عن المعرف في المثبتات
        if (index === -1) {
            pinnedSessions.unshift(sessionId); // إضافة المعرف إلى بداية المصفوفة
            showNotification(`"${session.title}" pinned`); // إظهار إشعار بالتثبيت
        } else {
            pinnedSessions.splice(index, 1); // إزالة المعرف من المصفوفة
            showNotification(`"${session.title}" unpinned`); // إظهار إشعار بإلغاء التثبيت
        }

        savePinnedSessions(); // حفظ التغييرات
        renderSessionsList(); // إعادة عرض القائمة
    };

    // ===== عرض قائمة المحادثات مع النقاط الثلاث =====
    const renderSessionsList = () => {
        if (!sessionsContainer) return; // التأكد من وجود الحاوية

        if (chatSessions.length === 0) {
            sessionsContainer.innerHTML = '<div class="text-slate-400 dark:text-slate-600 text-sm italic px-3 py-2">No chats yet</div>'; // رسالة إذا كانت القائمة فارغة
            return;
        }

        // تقسيم المحادثات إلى مثبتة وغير مثبتة
        const pinned = chatSessions.filter(s => pinnedSessions.includes(s.id));
        const unpinned = chatSessions.filter(s => !pinnedSessions.includes(s.id));

        let html = ''; // متغير لبناء نص HTML

        // عرض المحادثات المثبتة
        if (pinned.length > 0) {
            html += `<div class="date-header text-amber-600 dark:text-amber-400"><i class="fa-solid fa-bookmark mr-1"></i> Pinned</div>`;
            pinned.forEach(session => {
                const isActive = session.id === currentSessionId; // التحقق إذا كانت هذه هي الجلسة النشطة
                html += `
                    <div class="session-wrapper" data-session-id="${session.id}">
                        <div class="session-item ${isActive ? 'active' : ''}">
                            <span class="session-title flex items-center gap-1">
                                <i class="fa-solid fa-bookmark text-amber-500 text-[10px]"></i>
                                ${session.title}
                            </span>
                            <button class="session-menu-btn">
                                <i class="fa-solid fa-ellipsis-vertical"></i> <!-- أيقونة النقاط الثلاث -->
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        // عرض المحادثات غير المثبتة (الأحدث)
        if (unpinned.length > 0) {
            html += `<div class="date-header">Recent</div>`;
            unpinned.forEach(session => {
                const isActive = session.id === currentSessionId;
                html += `
                    <div class="session-wrapper" data-session-id="${session.id}">
                        <div class="session-item ${isActive ? 'active' : ''}">
                            <span class="session-title">${session.title}</span>
                            <button class="session-menu-btn">
                                <i class="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        sessionsContainer.innerHTML = html; // إدراج HTML النهائي في الحاوية

        // ===== إضافة مستمعي الأحداث لكل جلسة =====
        document.querySelectorAll('.session-wrapper').forEach(wrapper => {
            const sessionId = wrapper.dataset.sessionId;

            // حدث النقر على الجلسة نفسها (لتبديل المحادثة)
            wrapper.querySelector('.session-item').addEventListener('click', (e) => {
                if (e.target.closest('.session-menu-btn')) return; // إذا كان النقر على زر القائمة، لا تفعل شيء
                switchToSession(sessionId); // التبديل إلى الجلسة المحددة
            });

            // حدث النقر على زر القائمة (النقاط الثلاث)
            const menuBtn = wrapper.querySelector('.session-menu-btn');
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // منع انتشار الحدث للعناصر الأب
                closeAllPopovers(); // إغلاق أي قوائم مفتوحة أخرى

                const session = chatSessions.find(s => s.id === sessionId); // الحصول على بيانات الجلسة
                const isPinned = pinnedSessions.includes(sessionId); // هل الجلسة مثبتة؟

                // إنشاء عنصر القائمة المنبثقة
                const popover = document.createElement('div');
                popover.className = 'session-popover';
                popover.innerHTML = `
                    <div class="menu-item" data-action="rename"><i class="fa-regular fa-pen-to-square"></i> Rename</div>
                    <div class="menu-item" data-action="pin">
                        <i class="fa-regular fa-bookmark"></i>
                        ${isPinned ? 'Unpin' : 'Pin'}
                    </div>
                    <div class="menu-item delete" data-action="delete"><i class="fa-regular fa-trash-can"></i> Delete</div>
                `;

                // تحديد موقع القائمة بناءً على موقع زر القائمة
                const rect = menuBtn.getBoundingClientRect();
                popover.style.top = `${rect.bottom + 5}px`; // أسفل الزر مباشرة + 5px
                popover.style.left = `${rect.left - 130}px`; // إلى اليسار بمقدار 130px (عرض القائمة)

                document.body.appendChild(popover); // إضافة القائمة للصفحة

                // إضافة مستمعي الأحداث لعناصر القائمة
                popover.querySelectorAll('.menu-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const action = item.dataset.action;

                        if (action === 'delete') {
                            // حذف المحادثة
                            if (confirm('Are you sure you want to delete this chat?')) {
                                chatSessions = chatSessions.filter(s => s.id !== sessionId); // إزالة من المصفوفة
                                pinnedSessions = pinnedSessions.filter(id => id !== sessionId); // إزالة من المثبتات
                                savePinnedSessions();

                                if (currentSessionId === sessionId) { // إذا كانت المحذوفة هي الحالية
                                    if (chatSessions.length > 0) {
                                        currentSessionId = chatSessions[0].id; // التبديل لأول محادثة
                                    } else {
                                        createNewSession(); // إنشاء محادثة جديدة إذا كانت القائمة فارغة
                                        popover.remove();
                                        return;
                                    }
                                }
                                saveSessions(); // حفظ التغييرات
                                renderSessionsList(); // إعادة عرض القائمة
                                loadSessionMessages(); // تحميل رسائل الجلسة الجديدة
                            }
                        } else if (action === 'rename') {
                            // إعادة تسمية المحادثة
                            const newTitle = prompt('Enter new name:', session.title);
                            if (newTitle && newTitle.trim()) {
                                session.title = newTitle.trim(); // تحديث العنوان
                                if (currentSessionId === sessionId) {
                                    chatTitleSpan.textContent = session.title; // تحديث العنوان في الشريط
                                }
                                saveSessions(); // حفظ التغييرات
                                renderSessionsList(); // إعادة عرض القائمة
                            }
                        } else if (action === 'pin') {
                            // تثبيت/إلغاء تثبيت المحادثة
                            togglePinSession(sessionId);
                        }

                        popover.remove(); // إزالة القائمة بعد النقر
                    });
                });

                // إغلاق القائمة عند النقر خارجها
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

    // ===== ضبط موضع حقل الإدخال (في الوسط أو الأسفل) بناءً على وجود رسائل =====
    const adjustInputPosition = () => {
        if (!inputContainer) return;
        if (hasMessages) {
            inputContainer.classList.remove('input-center'); // إزالة كلاس التوسيط
            inputContainer.classList.add('input-bottom'); // إضافة كلاس الأسفل
            body.classList.remove('has-no-messages'); // إزالة كلاس عدم وجود رسائل
        } else {
            inputContainer.classList.remove('input-bottom');
            inputContainer.classList.add('input-center'); // إضافة كلاس التوسيط
            body.classList.add('has-no-messages'); // إضافة كلاس عدم وجود رسائل
        }
    };

    // ===== تحميل المحادثات من التخزين المحلي =====
    const loadSessions = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                chatSessions = JSON.parse(saved); // تحويل النص إلى مصفوفة
            } else {
                chatSessions = [];
            }

            const savedPinned = localStorage.getItem(PINNED_KEY);
            if (savedPinned) {
                pinnedSessions = JSON.parse(savedPinned);
            } else {
                pinnedSessions = [];
            }

            const currentId = localStorage.getItem(CURRENT_SESSION_KEY);
            if (currentId && chatSessions.some(s => s.id === currentId)) {
                currentSessionId = currentId; // تعيين الجلسة الحالية إذا كانت موجودة
            } else if (chatSessions.length > 0) {
                currentSessionId = chatSessions[0].id; // تعيين أول جلسة كحالية
            } else {
                createNewSession(); // إنشاء جلسة جديدة إذا لم يكن هناك أي جلسات
            }

            renderSessionsList(); // عرض القائمة
            loadSessionMessages(); // تحميل رسائل الجلسة الحالية
        } catch (e) {
            console.error('Error loading sessions:', e);
            chatSessions = [];
            createNewSession();
        }
    };

    // ===== إنشاء جلسة محادثة جديدة =====
    const createNewSession = () => {
        const newSession = {
            id: Date.now().toString(), // إنشاء معرف فريد باستخدام الوقت الحالي
            title: 'New conversation', // عنوان افتراضي
            messages: [], // مصفوفة رسائل فارغة
            createdAt: new Date().toISOString() // وقت الإنشاء
        };

        chatSessions.unshift(newSession); // إضافة الجلسة الجديدة في بداية المصفوفة
        currentSessionId = newSession.id; // جعلها الجلسة الحالية

        saveSessions(); // حفظ التغييرات
        renderSessionsList(); // إعادة عرض القائمة
        clearChatArea(); // مسح منطقة الرسائل
        showGreeting(); // إظهار رسالة الترحيب

        if (chatTitleSpan) {
            chatTitleSpan.textContent = 'New conversation'; // تحديث عنوان الشريط
        }

        hasMessages = false; // لا توجد رسائل بعد
        adjustInputPosition(); // ضبط موضع حقل الإدخال (سيكون في الوسط)
    };

    // ===== حفظ جميع المحادثات في التخزين المحلي =====
    const saveSessions = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chatSessions)); // حفظ المحادثات
        if (currentSessionId) {
            localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId); // حفظ الجلسة الحالية
        }
    };

    // ===== التبديل إلى جلسة محادثة محددة =====
    const switchToSession = (sessionId) => {
        const session = chatSessions.find(s => s.id === sessionId);
        if (!session) return;

        currentSessionId = sessionId; // تحديث الجلسة الحالية
        saveSessions(); // حفظ التغييرات
        renderSessionsList(); // إعادة عرض القائمة (لتحديد النشط)
        loadSessionMessages(); // تحميل رسائل الجلسة

        if (chatTitleSpan) {
            chatTitleSpan.textContent = session.title; // تحديث العنوان في الشريط
        }

        hasMessages = session.messages.length > 0; // تحديث حالة وجود رسائل
        adjustInputPosition(); // ضبط موضع حقل الإدخال
    };

    // ===== تحميل وعرض رسائل الجلسة الحالية =====
    const loadSessionMessages = () => {
        clearChatArea(); // مسح منطقة الرسائل أولاً

        const session = chatSessions.find(s => s.id === currentSessionId);
        if (!session) return;

        if (session.messages.length === 0) {
            showGreeting(); // إظهار الترحيب إذا كانت الجلسة فارغة
            hasMessages = false;
        } else {
            if (greetingContainer) {
                greetingContainer.style.display = 'none'; // إخفاء الترحيب
            }

            // عرض كل الرسائل
            session.messages.forEach(msg => {
                displayMessage(msg.text, msg.isUser);
            });
            hasMessages = true;
        }
        adjustInputPosition(); // ضبط موضع حقل الإدخال
    };

    // ===== إظهار رسالة الترحيب =====
    const showGreeting = () => {
        if (!messagesContainer) return;
        if (greetingContainer) {
            greetingContainer.style.display = 'flex'; // إظهار حاوية الترحيب
        }
    };

    // ===== مسح منطقة عرض الرسائل =====
    const clearChatArea = () => {
        if (!messagesContainer) return;
        const messages = messagesContainer.querySelectorAll('.message-bubble');
        messages.forEach(msg => msg.remove()); // إزالة كل فقاعات الرسائل
        if (greetingContainer) {
            greetingContainer.style.display = 'flex'; // إعادة إظهار الترحيب
        }
    };

    // ===== عرض رسالة واحدة في منطقة المحادثة =====
    const displayMessage = (text, isUser = true) => {
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message-bubble fade-in' : 'message-bubble assistant fade-in'; // تحديد الكلاس بناءً على المرسل
        messageDiv.textContent = text; // تعيين النص

        // إدراج الرسالة قبل حاوية الترحيب إذا كانت موجودة ومرئية
        if (greetingContainer && greetingContainer.style.display !== 'none') {
            messagesContainer.insertBefore(messageDiv, greetingContainer);
        } else {
            messagesContainer.appendChild(messageDiv);
        }

        // التمرير لأسفل لمشاهدة أحدث رسالة
        if (chatArea) {
            chatArea.scrollTop = chatArea.scrollHeight;
        }
    };

    // ===== إضافة رسالة جديدة إلى الجلسة الحالية =====
    const addMessageToCurrentSession = (text) => {
        const session = chatSessions.find(s => s.id === currentSessionId);
        if (!session) return;

        // إضافة رسالة المستخدم
        session.messages.push({
            text: text,
            isUser: true,
            timestamp: new Date().toISOString()
        });

        // إذا كانت هذه هي أول رسالة، تحديث عنوان المحادثة
        if (session.messages.length === 1) {
            session.title = text.length > 30 ? text.substring(0, 30) + '...' : text;
            if (chatTitleSpan) {
                chatTitleSpan.textContent = session.title;
            }
        }

        saveSessions(); // حفظ التغييرات
        renderSessionsList(); // إعادة عرض القائمة (لتحديث العنوان)

        if (greetingContainer) {
            greetingContainer.style.display = 'none'; // إخفاء الترحيب
        }

        displayMessage(text, true); // عرض رسالة المستخدم

        if (!hasMessages) {
            hasMessages = true; // تحديث حالة وجود رسائل
            adjustInputPosition(); // ضبط موضع حقل الإدخال (سينتقل للأسفل)
        }

        // محاكاة رد المساعد بعد تأخير قصير
        setTimeout(() => {
            const reply = "I'm here to help! (Demo response)";
            session.messages.push({
                text: reply,
                isUser: false,
                timestamp: new Date().toISOString()
            });
            displayMessage(reply, false); // عرض رد المساعد
            saveSessions(); // حفظ التغييرات
        }, 500);
    };

    // ===== العودة إلى محادثة جديدة (مسح الحالية وإنشاء واحدة جديدة) =====
    const resetToNewChat = () => {
        createNewSession();
        if (chatInput) {
            chatInput.value = ''; // مسح حقل الإدخال
            if (sendBtn) sendBtn.disabled = true; // تعطيل زر الإرسال
        }
    };

    // ===== إضافة مستمعي الأحداث للأزرار الرئيسية =====
    if (newChatBtn) {
        newChatBtn.addEventListener('click', resetToNewChat); // زر محادثة جديدة
    }

    if (chatInput && sendBtn) {
        // تمكين/تعطيل زر الإرسال بناءً على وجود نص في الحقل
        chatInput.addEventListener('input', () => {
            sendBtn.disabled = chatInput.value.trim() === '';
        });

        // إرسال الرسالة عند النقر على الزر
        sendBtn.addEventListener('click', () => {
            const msg = chatInput.value.trim();
            if (msg === '') return;
            addMessageToCurrentSession(msg);
            chatInput.value = ''; // مسح الحقل
            sendBtn.disabled = true; // تعطيل الزر
        });

        // إرسال الرسالة عند الضغط على Enter
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !sendBtn.disabled) {
                e.preventDefault(); // منع إرسال النموذج الافتراضي
                sendBtn.click();
            }
        });
    }

    // ===== النافذة المنبثقة للملف الشخصي =====
    const profileBtn = document.getElementById('profileButton');
    const popover = document.getElementById('profilePopover');

    if (profileBtn && popover) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            popover.classList.toggle('hidden'); // إظهار/إخفاء النافذة

            if (!popover.classList.contains('hidden')) {
                // تعديل موقع النافذة إذا لزم الأمر (لمنع خروجها عن الشاشة)
                const btnRect = profileBtn.getBoundingClientRect();
                const popoverRect = popover.getBoundingClientRect();
                const leftPanelRect = leftPanel.getBoundingClientRect();

                if (btnRect.left + popoverRect.width > leftPanelRect.right) {
                    popover.style.left = 'auto';
                    popover.style.right = '10px';
                    const arrow = popover.querySelector('.absolute');
                    if (arrow) {
                        arrow.style.left = 'auto';
                        arrow.style.right = '20px';
                    }
                }

                if (btnRect.top - popoverRect.height < 0) {
                    popover.style.bottom = 'auto';
                    popover.style.top = '100%';
                    popover.style.marginTop = '10px';
                    const arrow = popover.querySelector('.absolute');
                    if (arrow) {
                        arrow.style.bottom = 'auto';
                        arrow.style.top = '-8px';
                        arrow.style.transform = 'rotate(-135deg)';
                    }
                }
            }
        });

        // إغلاق النافذة عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !popover.contains(e.target)) {
                popover.classList.add('hidden');
            }
        });
    }

    // ===== زر تسجيل الخروج =====
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = 'main.html#/'; // التوجيه للصفحة الرئيسية
        });
    }

    // ===== ضبط محاذاة الرسائل مع حقل الإدخال عند تغيير حجم النافذة =====
    const adjustMessagesAlignment = () => {
        if (!messagesContainer || !inputField) return;

        // التأكد من أن الرسائل وحقل الإدخال لهما نفس الهوامش (CSS يتولى ذلك)
        if (panelOpen) {
            // الوضع الطبيعي - الهوامش محددة في CSS
            messagesContainer.style.paddingLeft = '';
            messagesContainer.style.paddingRight = '';
            inputField.style.marginLeft = '';
            inputField.style.marginRight = '';
        } else {
            // اللوحة اليسرى مخفية - CSS سيتولى الأمر
            messagesContainer.style.paddingLeft = '';
            messagesContainer.style.paddingRight = '';
            inputField.style.marginLeft = '';
            inputField.style.marginRight = '';
        }
    };

    // استدعاء الدالة عند تغيير حجم النافذة
    window.addEventListener('resize', adjustMessagesAlignment);

    // ===== التهيئة النهائية للتطبيق =====
    loadSessions(); // تحميل المحادثات

    // التأكد من أن اللوحة اليسرى مفتوحة بشكل صحيح عند التحميل
    if (leftPanel) {
        leftPanel.classList.remove('left-panel-closed');
        leftPanel.style.display = 'flex';
        leftPanel.style.width = '250px';
    }
    if (rightPanel) rightPanel.classList.remove('right-panel-full');
    if (toggleIcon) {
        toggleIcon.classList.remove('fa-angles-right');
        toggleIcon.classList.add('fa-angles-left');
    }

    // تأخير بسيط للتأكد من تحميل كل شيء ثم تحديث موضع الإدخال
    setTimeout(() => {
        const session = chatSessions.find(s => s.id === currentSessionId);
        hasMessages = session ? session.messages.length > 0 : false;
        adjustInputPosition();
        adjustMessagesAlignment();
    }, 100);

    // إعادة ضبط المحاذاة عند تغيير حجم النافذة
    window.addEventListener('resize', () => {
        adjustInputPosition();
        adjustMessagesAlignment();
    });
});