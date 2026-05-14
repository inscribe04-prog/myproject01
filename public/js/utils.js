// public/js/utils.js
window.utils = {
    validateAuthInput(val, type) {
        if (/\s/.test(val)) return 'Field cannot contain spaces.';
        if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            return 'Invalid email format.';
        }
        return null;
    },

    validatePassword(pass) {
        if (/\s/.test(pass)) return 'Password cannot contain spaces.';
        if (pass.length < 8) return 'Password must be at least 8 characters.';

        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/;
        if (!regex.test(pass)) {
            return 'Password needs uppercase, lowercase, number, and special character.';
        }

        return null;
    },

    showError(msgElementId, message, isError = true) {
        const el = document.getElementById(msgElementId);
        if (!el) return;

        if (message) {
            el.textContent = message;
            el.classList.remove('d-none');
            el.className = isError ? 'alert alert-danger' : 'alert alert-success';
        } else {
            el.textContent = '';
            el.classList.add('d-none');
        }
    }
};

















































// // public/js/utils.js
// window.utils = {
//     // Shared logic for email and generic empty checks
//     validateAuthInput: function(val, type) {
//         if (/\s/.test(val)) return "Field cannot contain spaces.";
//         if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Invalid email format.";
//         return null; // null means valid
//     },

//     // Strict Password Policy
//     validatePassword: function(pass) {
//         if (/\s/.test(pass)) return "Password cannot contain spaces.";
//         if (pass.length < 8) return "Password must be at least 8 characters.";
        
//         // Requires Upper, Lower, Number, and Special Char
//         const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/;
//         if (!regex.test(pass)) return "Password needs Uppercase, Lowercase, Number, and Special Characters.";
        
//         return null; // Valid
//     },


//     showError: function(msgElementId, message, isError = true) {
//         const el = document.getElementById(msgElementId);
//         if (!el) return;
//         if (message) {
//             el.textContent = message;
//             el.classList.remove('d-none');
//             el.className = isError ? 'alert alert-danger' : 'alert alert-success';
//         } else {
//             el.textContent = '';
//             el.classList.add('d-none');
//         }
//     }
// };