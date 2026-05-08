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

document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
    //   const email    = document.getElementById('loginEmail').value.trim();
    //   const password = document.getElementById('loginPass').value;

      // 1. Clear all old error messages
      const loginMsg = document.getElementById('loginMsg').textContent = '';
    
      // 2. Grab all four values
      const email    = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPass').value;

      // 3. Basic validation before sending
      if (email === '' || password.length === 0) {
        document.getElementById('loginMsg').textContent = 'Please fill the login credentials';
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
          document.getElementById('loginMsg').textContent = data.error;
        }
      });
    });
});