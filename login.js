// login.js
document.addEventListener('DOMContentLoaded', () => {

    // ==================== Supabase Init ====================
    const { createClient } = supabase;
    const supabaseClient = createClient(
        'https://mxemardtyidrhfsnxvad.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14ZW1hcmR0eWlkcmhmc254dmFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NzkwMzQsImV4cCI6MjA4ODQ1NTAzNH0.u1eFWdodluIqZQ-_Cr5IzSNMNUE1H4GQU-oDYT4Z1oo'
    );

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

    // ==================== Vérifier si déjà connecté ====================
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            const redirect = localStorage.getItem('redirect_after_login') || 'assistant.html';
            localStorage.removeItem('redirect_after_login');
            window.location.href = redirect;
        }
    });

    // ==================== Afficher erreur ====================
    const showError = (msg) => {
        let errorEl = document.getElementById('loginError');
        if (!errorEl) {
            errorEl = document.createElement('p');
            errorEl.id = 'loginError';
            errorEl.className = 'text-red-500 text-sm text-center mt-2';
            document.getElementById('loginForm').appendChild(errorEl);
        }
        errorEl.textContent = msg;
    };

    // ==================== Login ====================
    const form = document.getElementById('loginForm');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = form.querySelector('input[type="email"]').value.trim();
            const password = document.getElementById('passwordInput').value.trim();

            if (!email || !password) {
                showError('❌ Veuillez remplir tous les champs');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Connexion...';

            try {
                // ===== 1. Login Supabase Auth =====
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) {
                    showError('❌ Email ou mot de passe incorrect');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'LOG IN';
                    return;
                }

                // ===== 2. Récupérer infos étudiant =====
                const { data: student, error: studentError } = await supabaseClient
                    .from('student')
                    .select('student_id, first_name, last_name, first_name_ar, last_name_ar, email')
                    .eq('email', email)
                    .single();

                if (studentError || !student) {
                    showError('❌ Compte étudiant non trouvé');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'LOG IN';
                    return;
                }

                // ===== 3. Stocker dans localStorage =====
                localStorage.setItem('student_id', student.student_id);
                localStorage.setItem('first_name', student.first_name);
                localStorage.setItem('last_name', student.last_name);
                localStorage.setItem('first_name_ar', student.first_name_ar || '');
                localStorage.setItem('last_name_ar', student.last_name_ar || '');
                localStorage.setItem('email', student.email);

                // ===== 4. Rediriger =====
                const redirect = localStorage.getItem('redirect_after_login') || 'assistant.html';
                localStorage.removeItem('redirect_after_login');
                window.location.href = redirect;

            } catch (err) {
                showError('❌ Erreur : ' + err.message);
                submitBtn.disabled = false;
                submitBtn.textContent = 'LOG IN';
            }
        });
    }
});
