// public/js/form.js
// ─────────────────────────────────────────────
// All JavaScript for form.htm lives here.
// Linked in form.htm as:
//   <script src="/js/form.js"></script>
// Sections:
//   1. Live input listeners (counters, show/hide)
//   2. Submit handler (validation + fetch)
//   3. CRUD table (loadEntries, editRow, deleteRow)
// ─────────────────────────────────────────────

console.log("form.js loaded");

// fetch current user info and show their name
  fetch('/me')
    .then(res => res.json())
    .then(user => {
      document.getElementById('welcomeMsg').textContent =
        'Welcome, ' + user.firstname + '!';
    });
    
// ════════════════════════════════════════════
// SECTION 1 — LIVE INPUT LISTENERS
// These run instantly as the user types/changes
// ════════════════════════════════════════════

// First name character counter
document.getElementById('fnaam').addEventListener('input', function() {
  const len     = this.value.length;
  const counter = document.getElementById('fnameCount');
  counter.textContent = len + ' characters';
  counter.style.color = len < 3 ? 'red' : 'green';
});

// Last name character counter
document.getElementById('lnaam').addEventListener('input', function() {
  const len     = this.value.length;
  const counter = document.getElementById('lnameCount');
  counter.textContent = len + ' characters';
  counter.style.color = len < 3 ? 'red' : 'green';
});

// Password character counter
document.getElementById('pwd01').addEventListener('input', function() {
  const len     = this.value.length;
  const counter = document.getElementById('pwdCount');
  counter.textContent = len + ' characters';
  counter.style.color = len < 8 ? 'red' : 'green';
});

// Password strength indicator
document.getElementById('pwd01').addEventListener('input', function() {
  const pass = this.value;
  const msg  = document.getElementById('strengthMsg');
  const score = [
    pass.length >= 8,
    /[A-Z]/.test(pass),
    /[a-z]/.test(pass),
    /[0-9]/.test(pass),
    /[!@#$%^&*]/.test(pass)
  ].filter(Boolean).length;

  if      (score <= 2) { msg.textContent = 'Weak';   msg.style.color = 'red';    }
  else if (score === 3) { msg.textContent = 'Fair';   msg.style.color = 'orange'; }
  else if (score === 4) { msg.textContent = 'Good';   msg.style.color = 'blue';   }
  else                  { msg.textContent = 'Strong'; msg.style.color = 'green';  }
});

// Confirm password match checker
document.getElementById('confirmInput').addEventListener('input', function() {
  const pass    = document.getElementById('pwd01').value;
  const confirm = this.value;
  const msg     = document.getElementById('matchMsg');
  if      (confirm === '')   { msg.textContent = '';                   }
  else if (pass === confirm) { msg.textContent = '✅ Passwords match'; msg.style.color = 'green'; }
  else                       { msg.textContent = '❌ Does not match';  msg.style.color = 'red';   }
});

// Age input — show/hide guardian section
document.getElementById('ageInput').addEventListener('input', function() {
  const age     = Number(this.value);
  const section = document.getElementById('guardianSection');
  if (age > 0 && age < 18) {
    section.style.display = 'block';
  } else {
    section.style.display = 'none';
    document.getElementById('guardianInput').value = '';
  }
});

// Relationship status — show/hide spouse section
document.getElementById('relStatus').addEventListener('change', function() {
  const spouseSection = document.getElementById('spouseSection');
  if (this.value === 'married') {
    spouseSection.style.display = 'block';
  } else {
    spouseSection.style.display = 'none';
    document.getElementById('spouseInput').value = '';
  }
});


// ════════════════════════════════════════════
// SECTION 2 — SUBMIT HANDLER
// Validates all fields then sends via fetch
// ════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  const myForm = document.getElementById('myForm');

  myForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // 1. Clear all old error messages
    ['firstErr','lastErr','numErr','pwdErr','emailErr',
     'phoneErr','quantityErr','guardianErr','ageErr',
     'relErr','spouseErr'].forEach(id => {
      document.getElementById(id).textContent = '';
    });

    // 2. Grab all values
    const firstname  = document.getElementById('fnaam').value.trim();
    const lastname   = document.getElementById('lnaam').value.trim();
    const num01      = document.getElementById('num01').value.trim();
    const pwd01      = document.getElementById('pwd01').value;
    const email01    = document.getElementById('email01').value.trim();
    const phone01    = document.getElementById('phone01').value.trim();
    const quantity01 = document.getElementById('quantity01').value.trim();
    const age        = document.getElementById('ageInput').value.trim();
    const guardianVal= document.getElementById('guardianInput').value.trim();
    const relStatus  = document.getElementById('relStatus').value;
    const spouse     = document.getElementById('spouseInput').value.trim();
    const pass       = document.getElementById('pwd01').value;
    const confirm    = document.getElementById('confirmInput').value;

    // 3. Validate
    let valid = true;

    if      (firstname === '')       { document.getElementById('firstErr').textContent    = 'Enter first name';              valid = false; }
    else if (firstname.length < 3)   { document.getElementById('firstErr').textContent    = 'Min 3 characters required';     valid = false; }

    if      (lastname === '')        { document.getElementById('lastErr').textContent     = 'Enter last name';               valid = false; }
    else if (lastname.length < 3)    { document.getElementById('lastErr').textContent     = 'Min 3 characters required';     valid = false; }

    if (num01 === '' || isNaN(Number(num01)))              { document.getElementById('numErr').textContent      = 'Enter a valid number';            valid = false; }
    if (pwd01.length < 8)                                  { document.getElementById('pwdErr').textContent      = 'Enter at least 8 characters';     valid = false; }
    if (email01 === '' || !email01.includes('@') || !email01.includes('.')) { document.getElementById('emailErr').textContent = 'Enter a valid email'; valid = false; }
    if (phone01 === '' || !phone01.match(/^\d{10}$/))      { document.getElementById('phoneErr').textContent    = 'Enter a valid 10 digit number';   valid = false; }
    if (quantity01 === '' || isNaN(Number(quantity01)))    { document.getElementById('quantityErr').textContent = 'Enter a valid quantity';          valid = false; }

    if      (age === '' || isNaN(Number(age))) { document.getElementById('ageErr').textContent = 'Enter a valid age';      valid = false; }
    else if (age.length > 2)                   { document.getElementById('ageErr').textContent = 'Age must be 2 digits max'; valid = false; }

    if (document.getElementById('guardianSection').style.display === 'block') {
      if (guardianVal === '') { document.getElementById('guardianErr').textContent = 'Guardian name is required'; valid = false; }
    }

    if (relStatus === '') { document.getElementById('relErr').textContent = 'Select a relationship status'; valid = false; }

    if (document.getElementById('spouseSection').style.display === 'block') {
      if (spouse === '') { document.getElementById('spouseErr').textContent = 'Spouse name is required'; valid = false; }
    }

    if (pass.length < 8)   { document.getElementById('strengthMsg').textContent = 'Password must be at least 8 characters'; valid = false; }
    if (pass !== confirm)  { document.getElementById('matchMsg').textContent    = 'Passwords do not match';                  valid = false; }

    // 4. Stop if any validation failed
    if (!valid) return;

    const theForm = this;

    // 5. Send data to server

    fetch('/subbmmit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        fn01:       firstname,
        fn02:       lastname,
        number1:    num01,
        password01: pwd01,
        email01:    email01,
        phone01:    phone01,
        quantity01: quantity01,
        age:        age,
        guardian:   document.getElementById('guardianSection').style.display === 'block' ? guardianVal : '',
        relstatus:  relStatus,
        spousename: document.getElementById('spouseSection').style.display === 'block' ? spouse : ''
      })
    })
    .then(res => res.text())
    .then(() => {
      document.getElementById('msg').textContent = '✅ Saved successfully!';
      theForm.reset();
      document.getElementById('guardianSection').style.display = 'none';
      document.getElementById('spouseSection').style.display   = 'none';
      setTimeout(() => { document.getElementById('msg').textContent = ''; }, 3000);
      loadEntries();
    })
    .catch(err => {
      document.getElementById('msg').textContent = '❌ Something went wrong!';
      console.error(err);
    });

  }); // closes submit listener
}); // closes DOMContentLoaded


// ════════════════════════════════════════════
// SECTION 3 — CRUD TABLE
// Load, edit and delete rows from MySQL
// ════════════════════════════════════════════

function loadEntries() {
  fetch('/yentries')
    .then(res => res.json())
    .then(rows => {
      let html  = '<table border="1" cellpadding="6">';
      html += '<tr><th>ID</th><th>First Name</th><th>Last Name</th><th>Numeric</th><th>Password</th><th>Email</th><th>Phone</th><th>Quantity</th><th>Age</th><th>Guardian</th><th>Rel Status</th><th>Spouse</th><th>Edit</th><th>Delete</th></tr>';
      rows.forEach(row => {
        html += `<tr>
          <td>${row.id}</td>
          <td>${row.firstname}</td>
          <td>${row.lastname}</td>
          <td>${row.ankval}</td>
          <td>${row.inpass}</td>
          <td>${row.email}</td>
          <td>${row.phone}</td>
          <td>${row.quantity}</td>
          <td>${row.age}</td>
          <td>${row.guardian}</td>
          <td>${row.relstatus}</td>
          <td>${row.spousename}</td>
          <td><button onclick="editRow(${row.id},'${row.firstname}','${row.lastname}','${row.ankval}','${row.inpass}','${row.email}','${row.phone}','${row.quantity}','${row.age}','${row.guardian}','${row.relstatus}','${row.spousename}')">Edit</button></td>
          <td><button onclick="deleteRow(${row.id})">Delete</button></td>
        </tr>`;
      });
      html += '</table>';
      document.getElementById('tableArea').innerHTML = html;
    });
}

function editRow(id, firstname, lastname, ankval, inpass, email, phone, quantity, age, guardian, relstatus, spousename) {
  const newFirst     = prompt('New first name:', firstname);
  const newLast      = prompt('New last name:', lastname);
  const newNumeric   = prompt('New Numeric entry:', ankval);
  const newPWD       = prompt('New Password Entry:', inpass);
  const newEmail     = prompt('New Email:', email);
  const newPhone     = prompt('New Phone:', phone);
  const newQuantity  = prompt('New Quantity:', quantity);
  const newAge       = prompt('New Age:', age);
  const newGuardian  = prompt('New Guardian Name:', guardian);
  const newRelStatus = prompt('New Relationship Status:', relstatus);
  const newSpouse    = prompt('New Spouse Name:', spousename);

  if ([newFirst, newLast, newNumeric, newPWD, newEmail, newPhone,
       newQuantity, newAge, newGuardian, newRelStatus, newSpouse].includes(null)) return;

  fetch('/yupdate', {
    method: 'POST',
    body: new URLSearchParams({
      id,
      fn01: newFirst, fn02: newLast, number1: newNumeric,
      password01: newPWD, email01: newEmail, phone01: newPhone,
      quantity01: newQuantity, age: newAge, guardian: newGuardian,
      relstatus: newRelStatus, spousename: newSpouse
    })
  })
  .then(res => res.text())
  .then(() => loadEntries());
}

function deleteRow(id) {
  if (!confirm('Are you sure you want to delete this entry?')) return;
  fetch('/ydelete', {
    method: 'POST',
    body: new URLSearchParams({ id })
  })
  .then(res => res.text())
  .then(() => loadEntries());
}

// Load table on page open
loadEntries();
