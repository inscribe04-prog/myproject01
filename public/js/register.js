// public/js/register.js
// ─────────────────────────────────────────────
// All JavaScript for register.htm lives here.
// Linked in register.htm as:
//   <script src="/js/register.js"></script>
// Sections:

console.log("register.js loaded");  


// ════════════════════════════════════════════
// SECTION 2 — SUBMIT HANDLER
// Validates all fields then sends via fetch
// ════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

document.getElementById('regForm').addEventListener('submit', function(e) {
      e.preventDefault();

      // 1. Clear all old error messages
      const regMsg    = document.getElementById('regMsg').textContent = '';

      // 2. Grab all four values
      const firstname = document.getElementById('regFirst').value.trim();
      const lastname  = document.getElementById('regLast').value.trim();
      const email     = document.getElementById('regEmail').value.trim();
      const password  = document.getElementById('regPass').value;

      // 3. Basic validation before sending
      if (!firstname || !lastname || !email || password.length < 8) {
        document.getElementById('regMsg').textContent = 'Please fill all fields correctly';
        return;
      }

      // send to /register route in server.js
      fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ firstname: firstname, lastname: lastname, email: email, password: password })
      })
      .then(res => res.json())
      .then(data => {
        // server sends back { success: true } or { error: '...' }
        if (data.success) {
          window.location.href = '/index.htm'; // redirect to login
        } else {
          document.getElementById('regMsg').textContent = data.error;
        }
      });
    });
});