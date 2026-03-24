// =====================================
// 🔐 UNIMATE LOGIN - VERSION CORRIGÉE
// =====================================

document.addEventListener('DOMContentLoaded', () => {

    // =====================================
    // 1️⃣ CONFIGURATION SUPABASE
    // =====================================
    const SUPABASE_URL = 'https://mxemardtyidrhfsnxvad.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14ZW1hcmR0eWlkcmhmc254dmFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NzkwMzQsImV4cCI6MjA4ODQ1NTAzNH0.u1eFWdodluIqZQ-_Cr5IzSNMNUE1H4GQU-oDYT4Z1oo';
    
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('✅ Supabase initialisé');

    // =====================================
    // 2️⃣ GESTION DU THÈME (clair/sombre)
    // =====================================
    const html = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
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

    // =====================================
    // 3️⃣ AFFICHER/MASQUER LE MOT DE PASSE
    // =====================================
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            const icon = togglePassword.querySelector('i');
            if (icon) {
                icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
            }
        });
    }

    // =====================================
    // 4️⃣ FONCTION D'AFFICHAGE D'ERREUR
    // =====================================
    const showError = (message) => {
        const errorEl = document.getElementById('loginError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
            console.error('❌', message);
            
            // Auto-cacher après 5 secondes
            setTimeout(() => {
                errorEl.classList.add('hidden');
            }, 5000);
        }
    };

    // =====================================
    // 5️⃣ VÉRIFIER SI DÉJÀ CONNECTÉ
    // =====================================
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            const studentId = localStorage.getItem('student_id');
            if (studentId) {
                console.log('✅ Déjà connecté, redirection...');
                window.location.href = 'assistant.html';
            }
        }
    });

    // =====================================
    // 6️⃣ FONCTION PRINCIPALE DE LOGIN
    // =====================================
    const form = document.getElementById('loginForm');
    const submitBtn = form?.querySelector('button[type="submit"]');

    if (!form) {
        console.error('❌ Formulaire non trouvé !');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Récupérer les valeurs
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Cacher l'erreur précédente
        const errorEl = document.getElementById('loginError');
        if (errorEl) errorEl.classList.add('hidden');

        // ===== VALIDATION =====
        if (!email || !password) {
            showError('❌ Veuillez remplir tous les champs');
            return;
        }

        // Vérifier le domaine email
        if (!email.endsWith('@student.univ-temouchent.edu.dz')) {
            showError('❌ Utilisez votre email universitaire (@student.univ-temouchent.edu.dz)');
            return;
        }

        // Désactiver le bouton
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Connexion...';
        }

        try {
            console.log('=== 🔐 TENTATIVE DE CONNEXION ===');
            console.log('Email:', email);

            // ===== ÉTAPE 1: AUTHENTIFICATION SUPABASE =====
            const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (authError) {
                console.error('Erreur Auth:', authError);
                showError('❌ Email ou mot de passe incorrect');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'LOG IN';
                }
                return;
            }

            if (!authData.user) {
                showError('❌ Aucun utilisateur trouvé');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'LOG IN';
                }
                return;
            }

            console.log('✅ Authentification réussie - User ID:', authData.user.id);

            // ===== ÉTAPE 2: RÉCUPÉRATION DES INFOS ÉTUDIANT =====
            const { data: student, error: studentError } = await supabaseClient
                .from('student')
                .select('*')
                .eq('email', email)
                .single();

            if (studentError) {
                console.error('Erreur récupération étudiant:', studentError);
                
                if (studentError.code === 'PGRST116') {
                    showError(`❌ Aucun profil étudiant trouvé pour ${email}. Contactez l'administration.`);
                } else {
                    showError(`❌ Erreur base de données: ${studentError.message}`);
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'LOG IN';
                }
                return;
            }

            if (!student) {
                showError('❌ Profil étudiant introuvable');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'LOG IN';
                }
                return;
            }

            console.log('📚 Étudiant trouvé:', {
                student_id: student.student_id,
                name: `${student.first_name} ${student.last_name}`,
                email: student.email,
                level: student.level,
                specialty: student.specialty
            });

            // ===== ÉTAPE 3: STOCKAGE DANS LOCALSTORAGE =====
            const studentData = {
                student_id: student.student_id,
                last_name: student.last_name,
                first_name: student.first_name,
                first_name_ar: student.first_name_ar || '',
                last_name_ar: student.last_name_ar || '',
                email: student.email,
                level: student.level,
                field: student.field,
                specialty: student.specialty,
                group: student.group,
                birth_date: student.birth_date,
                birth_place: student.birth_place,
                birth_place_ar: student.birth_place_ar,
                supabase_user_id: authData.user.id,
                login_time: new Date().toISOString()
            };
            
            // Stocker chaque champ
            Object.entries(studentData).forEach(([key, value]) => {
                if (value) localStorage.setItem(key, value);
            });
            
            console.log('✅ Données stockées avec succès');

            // Message de succès (optionnel)
            const displayName = student.first_name_ar || student.first_name;
            showError = () => {}; // Temporairement désactiver
            console.log(`✅ Bienvenue ${displayName} !`);

            // ===== ÉTAPE 4: REDIRECTION =====
            setTimeout(() => {
                window.location.href = 'assistant.html';
            }, 500);

        } catch (err) {
            console.error('💥 Erreur fatale:', err);
            showError('❌ Erreur technique: ' + err.message);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'LOG IN';
            }
        }
    });
});
