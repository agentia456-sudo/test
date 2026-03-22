// ==================== contact.js ====================

document.addEventListener('DOMContentLoaded', () => {
    // نظام الثيم
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const html = document.documentElement;

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        html.classList.add('dark');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                if (themeIcon) {
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                }
            } else {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                if (themeIcon) {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                }
            }
        });
    }

    // بيانات الأساتذة
    const professorsData = [
        // Computer Science - سطر أول (3 أساتذة)
        { 
            name: 'hanaa datoussaid', 
            initials: 'HD', 
            department: 'cs', 
            title: 'Professor', 
            specialization: 'Computer Science', 
            email: 'datoussaid.hanaa@gmail.com', 
            office: 'Office CS1, Computer Science Department', 
            bgColor: 'bg-blue-100', 
            darkBg: 'dark:bg-blue-900/30', 
            textColor: 'text-blue-600', 
            darkText: 'dark:text-blue-400' 
        },
        { 
            name: 'Sarrah Didi', 
            initials: 'SD', 
            department: 'cs', 
            title: 'Professor', 
            specialization: 'Computer Science', 
            email: 'sarrah.didi@student.univ-temouchent.edu.dz', 
            office: 'Office CS2, Computer Science Department', 
            bgColor: 'bg-purple-100', 
            darkBg: 'dark:bg-purple-900/30', 
            textColor: 'text-purple-600', 
            darkText: 'dark:text-purple-400' 
        },
        { 
            name: 'Setti Boulenouar', 
            initials: 'SB', 
            department: 'cs', 
            title: 'Professor', 
            specialization: 'Computer Science', 
            email: 'setti.boulenouar@student.univ-temouchent.edu.dz', 
            office: 'Office CS3, Computer Science Department', 
            bgColor: 'bg-indigo-100', 
            darkBg: 'dark:bg-indigo-900/30', 
            textColor: 'text-indigo-600', 
            darkText: 'dark:text-indigo-400' 
        },
        
        // Computer Science - سطر ثاني (3 أساتذة)
        { 
            name: 'Amine Messaoudi', 
            initials: 'AM', 
            department: 'cs', 
            title: 'Professor', 
            specialization: 'Computer Science', 
            email: 'amine.messaoudi@univ-temouchent.edu.dz', 
            office: 'Office CS4, Computer Science Department', 
            bgColor: 'bg-green-100', 
            darkBg: 'dark:bg-green-900/30', 
            textColor: 'text-green-600', 
            darkText: 'dark:text-green-400' 
        },
        { 
            name: 'Abdelmoncef Bennouar', 
            initials: 'AB', 
            department: 'cs', 
            title: 'Professor', 
            specialization: 'Computer Science', 
            email: 'abdelmoncef.bennouar@gmail.com', 
            office: 'Office CS5, Computer Science Department', 
            bgColor: 'bg-amber-100', 
            darkBg: 'dark:bg-amber-900/30', 
            textColor: 'text-amber-600', 
            darkText: 'dark:text-amber-400' 
        },
        { 
            name: 'Karim Hadji', 
            initials: 'KH', 
            department: 'cs', 
            title: 'Professor', 
            specialization: 'Computer Science', 
            email: 'k.hadji@univ-temouchent.dz', 
            office: 'Office CS6, Computer Science Department', 
            bgColor: 'bg-teal-100', 
            darkBg: 'dark:bg-teal-900/30', 
            textColor: 'text-teal-600', 
            darkText: 'dark:text-teal-400' 
        },
        
        // Firdaws - Chinese Language (سطر كامل)
        { 
            name: 'Firdaws Benmecheri', 
            initials: 'FB', 
            department: 'chinese', 
            title: 'Professor', 
            specialization: 'Chinese Language & Culture', 
            email: 'Firdawsbenmecheri@gmail.com', 
            office: 'Office CH1, Chinese Language Department', 
            bgColor: 'bg-red-100', 
            darkBg: 'dark:bg-red-900/30', 
            textColor: 'text-red-600', 
            darkText: 'dark:text-red-400' 
        },
        { 
            name: 'Li Wei', 
            initials: 'LW', 
            department: 'chinese', 
            title: 'Associate Professor', 
            specialization: 'Chinese Literature', 
            email: 'li.wei@univ-temouchent.dz', 
            office: 'Office CH2, Chinese Language Department', 
            bgColor: 'bg-rose-100', 
            darkBg: 'dark:bg-rose-900/30', 
            textColor: 'text-rose-600', 
            darkText: 'dark:text-rose-400' 
        },
        { 
            name: 'Chen Yu', 
            initials: 'CY', 
            department: 'chinese', 
            title: 'Professor', 
            specialization: 'Chinese Linguistics', 
            email: 'chen.yu@univ-temouchent.dz', 
            office: 'Office CH3, Chinese Language Department', 
            bgColor: 'bg-fuchsia-100', 
            darkBg: 'dark:bg-fuchsia-900/30', 
            textColor: 'text-fuchsia-600', 
            darkText: 'dark:text-fuchsia-400' 
        },

        // Mathematics (سطر كامل)
        { name: 'Mohamed Khelif', initials: 'MK', department: 'math', title: 'Head of Department', specialization: 'Mathematics', email: 'm.khelif@univ-temouchent.dz', office: 'Office M1, Math Department', bgColor: 'bg-emerald-100', darkBg: 'dark:bg-emerald-900/30', textColor: 'text-emerald-600', darkText: 'dark:text-emerald-400' },
        { name: 'Samira Bensaid', initials: 'SB', department: 'math', title: 'Lecturer', specialization: 'Mathematics', email: 's.bensaid@univ-temouchent.dz', office: 'Office M2, Math Department', bgColor: 'bg-amber-100', darkBg: 'dark:bg-amber-900/30', textColor: 'text-amber-600', darkText: 'dark:text-amber-400' },
        { name: 'Rachid Djemai', initials: 'RD', department: 'math', title: 'Professor', specialization: 'Algebra', email: 'r.djemai@univ-temouchent.dz', office: 'Office M3, Math Department', bgColor: 'bg-yellow-100', darkBg: 'dark:bg-yellow-900/30', textColor: 'text-yellow-600', darkText: 'dark:text-yellow-400' },

        // Physics (سطر كامل)
        { name: 'Karim Mansouri', initials: 'KM', department: 'physics', title: 'Professor', specialization: 'Physics', email: 'k.mansouri@univ-temouchent.dz', office: 'Office P1, Physics Department', bgColor: 'bg-rose-100', darkBg: 'dark:bg-rose-900/30', textColor: 'text-rose-600', darkText: 'dark:text-rose-400' },
        { name: 'Leila Hamidi', initials: 'LH', department: 'physics', title: 'Associate Professor', specialization: 'Physics', email: 'l.hamidi@univ-temouchent.dz', office: 'Office P2, Physics Department', bgColor: 'bg-pink-100', darkBg: 'dark:bg-pink-900/30', textColor: 'text-pink-600', darkText: 'dark:text-pink-400' },
        { name: 'Ammar Ziani', initials: 'AZ', department: 'physics', title: 'Professor', specialization: 'Quantum Physics', email: 'a.ziani@univ-temouchent.dz', office: 'Office P3, Physics Department', bgColor: 'bg-fuchsia-100', darkBg: 'dark:bg-fuchsia-900/30', textColor: 'text-fuchsia-600', darkText: 'dark:text-fuchsia-400' },

        // Chemistry (سطر كامل)
        { name: 'Rachid Amrani', initials: 'RA', department: 'chemistry', title: 'Professor', specialization: 'Chemistry', email: 'r.amrani@univ-temouchent.dz', office: 'Office C1, Chemistry Department', bgColor: 'bg-orange-100', darkBg: 'dark:bg-orange-900/30', textColor: 'text-orange-600', darkText: 'dark:text-orange-400' },
        { name: 'Houria Boukharouba', initials: 'HB', department: 'chemistry', title: 'Associate Professor', specialization: 'Organic Chemistry', email: 'h.boukharouba@univ-temouchent.dz', office: 'Office C2, Chemistry Department', bgColor: 'bg-amber-100', darkBg: 'dark:bg-amber-900/30', textColor: 'text-amber-600', darkText: 'dark:text-amber-400' },
        { name: 'Mokhtar Brahimi', initials: 'MB', department: 'chemistry', title: 'Professor', specialization: 'Inorganic Chemistry', email: 'm.brahimi@univ-temouchent.dz', office: 'Office C3, Chemistry Department', bgColor: 'bg-yellow-100', darkBg: 'dark:bg-yellow-900/30', textColor: 'text-yellow-600', darkText: 'dark:text-yellow-400' },

        // Biology (سطر كامل)
        { name: 'Nadia Bekkouche', initials: 'NB', department: 'biology', title: 'Associate Professor', specialization: 'Biology', email: 'n.bekkouche@univ-temouchent.dz', office: 'Office B1, Biology Department', bgColor: 'bg-green-100', darkBg: 'dark:bg-green-900/30', textColor: 'text-green-600', darkText: 'dark:text-green-400' },
        { name: 'Fouzia Khelifi', initials: 'FK', department: 'biology', title: 'Professor', specialization: 'Genetics', email: 'f.khelifi@univ-temouchent.dz', office: 'Office B2, Biology Department', bgColor: 'bg-emerald-100', darkBg: 'dark:bg-emerald-900/30', textColor: 'text-emerald-600', darkText: 'dark:text-emerald-400' },
        { name: 'Hamid Gacem', initials: 'HG', department: 'biology', title: 'Professor', specialization: 'Microbiology', email: 'h.gacem@univ-temouchent.dz', office: 'Office B3, Biology Department', bgColor: 'bg-teal-100', darkBg: 'dark:bg-teal-900/30', textColor: 'text-teal-600', darkText: 'dark:text-teal-400' },

        // Engineering (سطر كامل)
        { name: 'Ali Meziane', initials: 'AM', department: 'engineering', title: 'Professor', specialization: 'Engineering', email: 'a.meziane@univ-temouchent.dz', office: 'Office E1, Engineering Department', bgColor: 'bg-yellow-100', darkBg: 'dark:bg-yellow-900/30', textColor: 'text-yellow-600', darkText: 'dark:text-yellow-400' },
        { name: 'Mourad Belkacem', initials: 'MB', department: 'engineering', title: 'Associate Professor', specialization: 'Civil Engineering', email: 'm.belkacem@univ-temouchent.dz', office: 'Office E2, Engineering Department', bgColor: 'bg-amber-100', darkBg: 'dark:bg-amber-900/30', textColor: 'text-amber-600', darkText: 'dark:text-amber-400' },
        { name: 'Fatima Bouzid', initials: 'FB', department: 'engineering', title: 'Professor', specialization: 'Mechanical Engineering', email: 'f.bouzid@univ-temouchent.dz', office: 'Office E3, Engineering Department', bgColor: 'bg-orange-100', darkBg: 'dark:bg-orange-900/30', textColor: 'text-orange-600', darkText: 'dark:text-orange-400' },

        // Literature (سطر كامل)
        { name: 'Samir Boudiaf', initials: 'SB', department: 'literature', title: 'Professor', specialization: 'Literature', email: 's.boudiaf@univ-temouchent.dz', office: 'Office L1, Literature Department', bgColor: 'bg-gray-100', darkBg: 'dark:bg-gray-800', textColor: 'text-gray-600', darkText: 'dark:text-gray-300' },
        { name: 'Fatima Zohra', initials: 'FZ', department: 'literature', title: 'Associate Professor', specialization: 'English Literature', email: 'f.zohra@univ-temouchent.dz', office: 'Office L2, Literature Department', bgColor: 'bg-zinc-100', darkBg: 'dark:bg-zinc-800', textColor: 'text-zinc-600', darkText: 'dark:text-zinc-300' },
        { name: 'Mohamed Seghir', initials: 'MS', department: 'literature', title: 'Professor', specialization: 'Arabic Literature', email: 'm.seghir@univ-temouchent.dz', office: 'Office L3, Literature Department', bgColor: 'bg-stone-100', darkBg: 'dark:bg-stone-800', textColor: 'text-stone-600', darkText: 'dark:text-stone-300' },
    ];

    // عناوين الأقسام
    const sectionTitlesMap = {
        cs: 'Computer Science',
        chinese: 'Chinese Language',
        math: 'Mathematics',
        physics: 'Physics',
        chemistry: 'Chemistry',
        biology: 'Biology',
        engineering: 'Engineering',
        literature: 'Literature',
        history: 'History',
        philosophy: 'Philosophy',
    };

    const container = document.getElementById('professorsContainer');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');
    
    let currentFilter = 'all';
    let currentSearch = '';

    // عناصر النافذة المنبثقة
    const emailPopup = document.getElementById('emailPopup');
    const closePopup = document.getElementById('closePopup');
    const toEmail = document.getElementById('toEmail');
    const professorName = document.getElementById('professorName');
    const subject = document.getElementById('subject');
    const message = document.getElementById('message');
    const emailForm = document.getElementById('emailForm');

    // إغلاق النافذة
    closePopup.addEventListener('click', () => {
        emailPopup.classList.remove('active');
    });

    emailPopup.addEventListener('click', (e) => {
        if (e.target === emailPopup) {
            emailPopup.classList.remove('active');
        }
    });

    // فتح نافذة البريد
    window.openEmailPopup = function(email, name) {
        toEmail.value = email;
        professorName.value = name;
        subject.value = '';
        message.value = '';
        emailPopup.classList.add('active');
    };

    // إرسال الإيميل
    emailForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const to = toEmail.value;
        const subjectText = subject.value;
        const messageText = message.value;
        const professor = professorName.value;
        
        const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(`Dear ${professor},\n\n${messageText}\n\nBest regards,\n[Your Name]`)}`;
        
        window.location.href = mailtoLink;
        emailPopup.classList.remove('active');
    });

    // دالة عرض الأساتذة
    function renderProfessors() {
        let filteredProfessors = professorsData.filter(prof => {
            const matchesFilter = currentFilter === 'all' || prof.department === currentFilter;
            const matchesSearch = prof.name.toLowerCase().includes(currentSearch.toLowerCase()) || 
                                 prof.specialization.toLowerCase().includes(currentSearch.toLowerCase());
            return matchesFilter && matchesSearch;
        });

        if (currentFilter === 'all') {
            const groupedByDepartment = {};
            filteredProfessors.forEach(prof => {
                if (!groupedByDepartment[prof.department]) {
                    groupedByDepartment[prof.department] = [];
                }
                groupedByDepartment[prof.department].push(prof);
            });

            let html = '';
            for (const [dept, professors] of Object.entries(groupedByDepartment)) {
                if (professors.length > 0) {
                    html += `<div class="section-title">${sectionTitlesMap[dept] || dept}</div>`;
                    html += `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">`;
                    professors.forEach(prof => {
                        html += createProfessorCard(prof);
                    });
                    html += `</div>`;
                }
            }
            container.innerHTML = html;
        } else {
            let html = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;
            filteredProfessors.forEach(prof => {
                html += createProfessorCard(prof);
            });
            html += `</div>`;
            container.innerHTML = html;
        }

        document.querySelectorAll('.hover-email').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = e.target.closest('.professor-card');
                const email = card.querySelector('.truncate').textContent;
                const name = card.querySelector('h3').textContent;
                openEmailPopup(email, name);
            });
        });
    }

    // دالة إنشاء بطاقة أستاذ
    function createProfessorCard(prof) {
        return `
            <div class="professor-card group" data-department="${prof.department}" data-name="${prof.name}">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-16 h-16 rounded-full ${prof.bgColor} ${prof.darkBg} flex items-center justify-center ${prof.textColor} ${prof.darkText} text-2xl font-bold border-2 border-white dark:border-slate-700 shadow-md">
                        ${prof.initials}
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">${prof.name}</h3>
                        <p class="text-sm ${prof.textColor} ${prof.darkText} font-medium">${prof.title}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">${prof.specialization}</p>
                    </div>
                </div>
                <div class="space-y-2 text-sm">
                    <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <i class="fa-regular fa-envelope w-4 text-slate-400"></i>
                        <span class="truncate">${prof.email}</span>
                    </div>
                    <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <i class="fa-regular fa-building w-4 text-slate-400"></i>
                        <span>${prof.office}</span>
                    </div>
                </div>
                <div class="hover-email">
                    <i class="fa-regular fa-paper-plane mr-2"></i> Send Email →
                </div>
            </div>
        `;
    }

    // أزرار التصفية
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderProfessors();
        });
    });

    // البحث
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderProfessors();
    });

    // التمرير
    const scrollContainer = document.getElementById('filtersScroll');
    const leftScrollBtn = document.getElementById('leftScroll');
    const rightScrollBtn = document.getElementById('rightScroll');

    if (leftScrollBtn && rightScrollBtn && scrollContainer) {
        const scrollAmount = 300;

        leftScrollBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });

        rightScrollBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

        scrollContainer.addEventListener('scroll', () => {
            const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
            
            if (scrollContainer.scrollLeft >= maxScroll - 10) {
                rightScrollBtn.style.opacity = '0.5';
            } else {
                rightScrollBtn.style.opacity = '';
            }
            
            if (scrollContainer.scrollLeft <= 10) {
                leftScrollBtn.style.opacity = '0.5';
            } else {
                leftScrollBtn.style.opacity = '';
            }
        });
    }

    // التهيئة الأولية
    renderProfessors();
});