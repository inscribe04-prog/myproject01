// public/js/utils.js
window.utils = {
    // Shared logic for email and generic empty checks
    validateAuthInput: function(val, type) {
        if (/\s/.test(val)) return "Field cannot contain spaces.";
        if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Invalid email format.";
        return null; // null means valid
    },

    // Strict Password Policy
    validatePassword: function(pass) {
        if (/\s/.test(pass)) return "Password cannot contain spaces.";
        if (pass.length < 8) return "Password must be at least 8 characters.";
        
        // Requires Upper, Lower, Number, and Special Char
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/;
        if (!regex.test(pass)) return "Password needs Uppercase, Lowercase, Number, and Special Characters.";
        
        return null; // Valid
    },

    showError: function(msgElementId, message, isError = true) {
        const el = document.getElementById(msgElementId);
        if (!el) return;
        el.textContent = message || '';
        el.style.display = message ? 'block' : 'none';
        el.className = isError ? 'alert alert-danger' : 'alert alert-success';
    }
};