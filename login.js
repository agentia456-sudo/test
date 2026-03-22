// login.js

document.addEventListener('DOMContentLoaded', () => {
    // نظام الثيم
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const html = document.documentElement;

    // تهيئة الثيم
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        html.classList.add('dark');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }

    // تبديل الثيم
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

    // تنسيق تاريخ الميلاد
    const dobInput = document.getElementById('dob');
    if (dobInput) {
        dobInput.addEventListener('input', function(e) {
            let v = e.target.value.replace(/\D/g, '').slice(0, 8);
            if (v.length >= 5) {
                v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
            } else if (v.length >= 3) {
                v = v.slice(0, 2) + '/' + v.slice(2);
            }
            e.target.value = v;
        });
    }

    // معالجة نموذج تسجيل الدخول
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            alert('Logging in: ' + email);
            // هنا يتم التوجيه بعد نجاح تسجيل الدخول
            // window.location.href = 'main.html';
        });
    }
});