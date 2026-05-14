// public/js/register.js
// ─────────────────────────────────────────────
// All JavaScript for register.htm lives here.
// Linked in register.htm as:
//   <script src="/js/register.js"></script>
// Sections:

console.log("register.js loaded");  


// ════════════════════════════════════════════
// SECTION 1 — SUBMIT HANDLER
// Validates all fields then sends via fetch
// ════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    
const regEmail = document.getElementById('regEmail');
const regPass = document.getElementById('regPass');
const regMsg = document.getElementById('regMsg');

regPass.addEventListener('input', function() {
    const error = utils.validatePassword(this.value);
    if (error) {
        regMsg.textContent = error;
        regMsg.classList.remove('d-none');
        regMsg.classList.add('alert-warning');
    } else {
        regMsg.textContent = "Password looks good!";
        regMsg.classList.remove('alert-warning');
        regMsg.classList.add('alert-success');
    }
});

// Live validation on Email
    regEmail.addEventListener('blur', function() {
        const err = utils.validateAuthInput(this.value.trim(), 'email');
        utils.showError('regMsg', err);
    });

    // Live validation on Password
    regPass.addEventListener('blur', function() {
        const err = utils.validatePassword(this.value);
        utils.showError('regMsg', err);
    });


document.getElementById('regForm').addEventListener('submit', function(e) {
      e.preventDefault();

      // 1. Clear all old error messages
      const regMsg    = document.getElementById('regMsg').textContent = '';

      // 2. Grab all required values
      const firstname = document.getElementById('regFirst').value.trim();
      const lastname  = document.getElementById('regLast').value.trim();
      const email     = document.getElementById('regEmail').value.trim();
      const password  = document.getElementById('regPass').value;
      const msg = document.getElementById('regMsg');

      // 1. Validate
      const emailErr = utils.validateAuthInput(email, 'email');
      const passErr  = utils.validatePassword(password);

      // 2. Show Error if needed
      if (emailErr || passErr) {
          utils.showError('regMsg', emailErr || passErr);
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
          // document.getElementById('regMsg').textContent = data.error;
          const msg = document.getElementById('regMsg');
                      msg.textContent = 'Please fill all fields correctly'+ data.error;
                      msg.classList.remove('d-none');
        }
      });
    });
});