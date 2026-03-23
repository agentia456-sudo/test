// main.js
document.addEventListener('DOMContentLoaded', () => {

    // ==================== Thème ====================
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const html = document.documentElement;

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        html.classList.add('dark');
        if (themeIcon) { themeIcon.classList.remove('fa-moon'); themeIcon.classList.add('fa-sun'); }
    }

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

    // ==================== Protection des liens ====================
    function checkAndRedirect(e, page) {
        e.preventDefault();
        const studentId = localStorage.getItem('student_id');
        if (!studentId) {
            localStorage.setItem('redirect_after_login', page);
            window.location.href = 'login.html';
        } else {
            window.location.href = page;
        }
    }

    const btnAssistant = document.getElementById('btnAssistant');
    const btnServices = document.getElementById('btnServices');

    if (btnAssistant) {
        btnAssistant.addEventListener('click', (e) => checkAndRedirect(e, 'assistant.html'));
    }

    if (btnServices) {
        btnServices.addEventListener('click', (e) => checkAndRedirect(e, 'services.html'));
    }
});
