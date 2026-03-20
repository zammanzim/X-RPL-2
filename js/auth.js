// js/auth.js

/**
 * Cek apakah user sudah login
 * Jika belum, redirect ke index.html
 */
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        console.log('User not logged in, redirecting to login...');
        window.location.href = 'index.html';
        return null;
    }

    console.log('User logged in:', user.nickname, 'Role:', user.role);
    return user;
}

/**
 * Cek role user
 * @param {string} requiredRole - Role yang diperlukan ('super_admin', 'class_admin', 'student')
 * @returns {boolean} True jika user punya role yang diperlukan
 */
function checkRole(requiredRole) {
    const user = checkAuth();
    if (!user) return false;

    if (user.role !== requiredRole) {
        console.warn(`User ${user.nickname} (${user.role}) doesn't have required role: ${requiredRole}`);
        return false;
    }

    return true;
}

/**
 * Logout user dan redirect ke login page
 */
function logout() {
    localStorage.removeItem('user');
    console.log('User logged out');
    window.location.href = 'index.html';
}

/**
 * Get current user data
 * @returns {Object|null} User object atau null jika belum login
 */
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
}

/**
 * Update user data di localStorage
 * @param {Object} updatedData - Data user yang diupdate
 */
function updateUserData(updatedData) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const mergedUser = {
        ...currentUser,
        ...updatedData,
        updated_at: new Date().toISOString()
    };

    localStorage.setItem('user', JSON.stringify(mergedUser));
    updateUserInDatabase(mergedUser);
    console.log('User data updated in localStorage');
}

/**
 * Update user data di database (async)
 * @param {Object} userData - Data user yang diupdate
 */
async function updateUserInDatabase(userData) {
    try {
        if (!window.supabase) {
            console.error('Supabase client not available');
            return;
        }

        const { error } = await window.supabase
            .from('users')
            .update({
                full_name: userData.full_name,
                short_name: userData.short_name,
                nickname: userData.nickname,
                avatar_url: userData.avatar_url,
                bio: userData.bio,
                password: userData.password,
                updated_at: new Date().toISOString()
            })
            .eq('id', userData.id);

        if (error) throw error;
        console.log('User data updated in database');
    } catch (error) {
        console.error('Error updating user in database:', error);
    }
}

/**
 * Cek apakah user adalah super_admin
 * @returns {boolean}
 */
function isSuperAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'super_admin';
}

/**
 * Cek apakah user adalah class_admin
 * @returns {boolean}
 */
function isClassAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'class_admin';
}

/**
 * Cek apakah user adalah student
 * @returns {boolean}
 */
function isStudent() {
    const user = getCurrentUser();
    return user && user.role === 'student';
}

/**
 * Cek apakah user memiliki akses ke kelas tertentu
 * @param {number} classId - ID kelas yang dicek
 * @returns {boolean}
 */
function hasAccessToClass(classId) {
    const user = getCurrentUser();
    if (!user) return false;

    if (user.role === 'super_admin') return true;

    if (user.role === 'class_admin' || user.role === 'student') {
        return user.class_id === classId;
    }

    return false;
}

/**
 * Cek apakah user bisa mengelola (edit/hapus) konten di kelas tertentu
 * @param {number} classId - ID kelas
 * @returns {boolean}
 */
function canManageClass(classId) {
    const user = getCurrentUser();
    if (!user) return false;

    if (user.role === 'super_admin') return true;

    if (user.role === 'class_admin') {
        return user.class_id === classId;
    }

    return false;
}

/**
 * Get user's accessible classes
 * @returns {Array} Array of class IDs
 */
function getAccessibleClasses() {
    const user = getCurrentUser();
    if (!user) return [];

    if (user.role === 'super_admin') {
        return [1, 2, 3, 4];
    } else if (user.role === 'class_admin' || user.role === 'student') {
        return user.class_id ? [user.class_id] : [];
    }
    return [];
}

/**
 * Setup auto-check auth untuk semua halaman yang protected
 */
function setupAuthProtection() {
    document.addEventListener('DOMContentLoaded', function () {
        const user = checkAuth();

        if (user) {
            console.log(`👤 ${user.nickname} (${user.role}) - ${user.class_id ? `Kelas ${user.class_id}` : 'All Classes'}`);

            document.body.classList.add(`role-${user.role.replace('_', '-')}`);

            // Show/hide elements berdasarkan role
            const superAdminElements = document.querySelectorAll('.super-admin-only');
            const classAdminElements = document.querySelectorAll('.class-admin-only');
            const studentElements = document.querySelectorAll('.student-only');

            if (user.role === 'super_admin') {
                superAdminElements.forEach(el => el.style.display = 'block');
            } else if (user.role === 'class_admin') {
                classAdminElements.forEach(el => el.style.display = 'block');
            } else if (user.role === 'student') {
                studentElements.forEach(el => el.style.display = 'block');
            }

            // Update user display
            const userDisplayElements = document.querySelectorAll('.user-display-name, .user-nickname');
            userDisplayElements.forEach(el => {
                if (el.classList.contains('user-display-name')) {
                    el.textContent = user.short_name || user.full_name;
                } else if (el.classList.contains('user-nickname')) {
                    el.textContent = `@${user.nickname}`;
                }
            });
        }
    });
}

// Attach ke window object
window.auth = {
    checkAuth,
    checkRole,
    logout,
    getCurrentUser,
    updateUserData,
    isSuperAdmin,
    isClassAdmin,
    isStudent,
    hasAccessToClass,
    canManageClass,
    getAccessibleClasses,
    setupAuthProtection
};