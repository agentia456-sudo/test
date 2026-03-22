// main.js
document.addEventListener('DOMContentLoaded', () => {

    // ==================== نظام الثيم ====================
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

    // ==================== Protection des liens ====================
    const protectedLinks = document.querySelectorAll('a[href="assistant.html"], a[href="services.html"]');

    protectedLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const studentId = localStorage.getItem('student_id');

            if (!studentId) {
                window.location.href = 'login.html';
            } else {
                window.location.href = link.getAttribute('href');
            }
        });
    });
});
