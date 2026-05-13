// public/js/login.js
// ─────────────────────────────────────────────
// All JavaScript for index.htm lives here.
// Linked in index.htm as:
//   <script src="/js/login.js"></script>


console.log("login.js loaded");  



// ════════════════════════════════════════════
// SECTION 2 — SUBMIT HANDLER
// Validates all fields then sends via fetch
// ════════════════════════════════════════════


document.addEventListener('DOMContentLoaded', () => {

const loginEmail = document.getElementById('loginEmail');
const loginMsg = document.getElementById('loginMsg');

loginEmail.addEventListener('input', function() {
    // Only show error if the user has typed enough for an email
    if (this.value.length > 5) {
        const error = utils.validateAuthInput(this.value, 'email');
        if (error) {
            loginMsg.textContent = error;
            loginMsg.classList.remove('d-none');
        } else {
            loginMsg.classList.add('d-none');
        }
    }
});

// Live validation on Email
    loginEmail.addEventListener('blur', function() {
        const err = utils.validateAuthInput(this.value.trim(), 'email');
        if (err) {
            utils.showError('loginMsg', err);
        } else {
            loginMsg.classList.add('d-none'); // Clear if valid
        }
    });

document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
    //   const email    = document.getElementById('loginEmail').value.trim();
    //   const password = document.getElementById('loginPass').value;

      // 1. Clear all old error messages
      const loginMsg = document.getElementById('loginMsg').textContent = '';
    
      // 2. Grab all required values
      const email    = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPass').value;

      // 1. Validate (Login usually doesn't need strict password rules to avoid revealing info)
      const emailErr = utils.validateAuthInput(email, 'email');

      if (!email || !password) {
          utils.showError('loginMsg', 'Please fill in all fields.');
          return;
      }

      if (emailErr) {
          utils.showError('loginMsg', emailErr);
          return;
      }
      
      // send to /login route in server.js

      fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email: email, password: password })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
            // redirect to the protected page after login
            window.location.href = '/form.htm';
        } else {
          //document.getElementById('loginMsg').textContent = data.error;

          const msg = document.getElementById('loginMsg');
                      msg.textContent = data.error;
                      msg.classList.remove('d-none');
        }
      });
    });
});