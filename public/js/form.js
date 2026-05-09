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



// ════════════════════════════════════════════
// SHARED VALIDATION HELPER
// ════════════════════════════════════════════
function getValidationErrors(d) {
  let err = {};
  if (!d.fn01 || d.fn01.length < 3) err.fn01 = "First name min 3 chars";
  if (!d.fn02 || d.fn02.length < 3) err.fn02 = "Last name min 3 chars";
  if (isNaN(d.number1 ) || d.number1 < 0 || d.number1.length < 2)             err.number1 = "ASIN value is required and should be a 2-digit number";
  if (d.password01.length < 8)      err.password01 = "Password min 8 chars";
  if (!d.email01.includes('@'))     err.email = "Invalid email";
  if (!/^\d{10}$/.test(d.phone01))  err.phone = "10 digit phone required";
  if (isNaN(d.quantity01) || d.quantity01 < 0 || d.quantity01.length < 2)          err.qty = "Quantity must be a number";
  if (d.age < 0 || d.age > 199)      err.age = "Enter valid age (0-199)";
  
  // Logic checks
  if (d.age < 18 && !d.guardian)    err.guardian = "Guardian name required for minors";
  if (d.relstatus === 'married' && !d.spousename) err.spouse = "Spouse name required";
  
  return err;
}



// fetch current user info and show their name
  fetch('/me')
    .then(res => res.json())
    .then(user => {
      document.getElementById('welcomeMsg').textContent =
        'Welcome, ' + user.firstname + '!';
    });



document.getElementById('showTableBtn').addEventListener('click', loadEntries);

// ════════════════════════════════════════════
// SECTION 1 — LIVE INPUT LISTENERS
// These run instantly as the user types/changes
// ════════════════════════════════════════════

// First name character counter
document.getElementById('fnaam').addEventListener('input', function() {
  const len     = this.value.length;
  const counter = document.getElementById('fnameCount');
  const error   = document.getElementById('firstErr'); // Added this
  counter.textContent = len + ' character' + (len > 1 ? 's' : '') + ' entered';
  counter.style.color = len < 3  ? 'red' : 'green';

  // Clear the error message as soon as they type 3 characters
  if (len >= 3) {
      error.textContent = ''; 
  }

});

// Last name character counter
document.getElementById('lnaam').addEventListener('input', function() {
  const len     = this.value.length;
  const counter = document.getElementById('lnameCount');
  const error   = document.getElementById('lastErr'); // Added this

  counter.textContent = len + ' character' + (len > 1 ? 's' : '') + ' entered';
  counter.style.color = len < 3 ? 'red' : 'green';

  // Clear the error message as soon as they type 3 characters
  if (len >= 3) {
      error.textContent = ''; 
  }

});



// ASIN character counter
document.getElementById('num01').addEventListener('input', function() {
  const len     = this.value.length;
  const counter = document.getElementById('numCount');
  const error   = document.getElementById('numErr'); // Added this

  counter.textContent = len + ' digit' + (len > 1 ? 's' : '') + ' entered';
  counter.style.color = len <= 2 ? 'green' : 'red';
  // Clear the error message as soon as they type 2 characters
  if (len >= 2) {
      error.textContent = ''; 
  }

  // Optionally, you could also prevent them from typing more than 2 characters:
  if (len > 2) {
      this.value = this.value.slice(0, 2);
  }
}); 

//Quantity character counter
document.getElementById('quantity01').addEventListener('input', function() {
  const len     = this.value.length;
  const counter = document.getElementById('quantityCount');
  const error   = document.getElementById('quantityErr'); // Added this

  counter.textContent = len + ' digit' + (len > 1 ? 's' : '') + ' entered';
  counter.style.color = len <= 2 ? 'green' : 'red';

  // Clear the error message as soon as they type 2 characters
  if (len >= 2) {
      error.textContent = ''; 
  }

  // Optionally, you could also prevent them from typing more than 2 characters:
  if (len > 2) {
      this.value = this.value.slice(0, 2);
  }
}); 



// Password character counter
document.getElementById('pwd01').addEventListener('input', function() {
  const len     = this.value.length;
  const counter = document.getElementById('pwdCount');
  counter.textContent = len + ' character' + (len > 1 ? 's' : '') + ' entered';
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

  if      (score <= 2)  { msg.textContent = 'Weak';   msg.style.color = 'red';    }
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
    
  // 1. Clear all error messages using a loop
    document.querySelectorAll('.text-danger').forEach(el => el.textContent = '');



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

    // 3. Validate using the shared helper
    // First, gather the data into an object matching the helper's expectations
    const d = {
        fn01: firstname,
        fn02: lastname,
        number1: num01,
        password01: pwd01,
        email01: email01,
        phone01: phone01,
        quantity01: quantity01,
        age: age,
        guardian: guardianVal,
        relstatus: relStatus,
        spousename: spouse
    };

    const errors = getValidationErrors(d);

    // If there are errors, display them and stop
    if (Object.keys(errors).length > 0) {
        // Option: Show the first error in the msg paragraph
        document.getElementById('msg').textContent = '❌ ' + Object.values(errors)[0];
        document.getElementById('msg').style.color = 'red';
        return;
    }

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

      // reset Live Input Counters and Error Messages

      // Reset the counters and styles
      const resetElements = [
        { count: 'fnameCount', err: 'firstErr' },
        { count: 'lnameCount', err: 'lastErr' },
        { count: 'numCount', err: 'numErr' },
        { count: 'quantityCount', err: 'quantityErr' },
        { count: 'pwdCount', err: 'pwdErr' }
      ];

      resetElements.forEach(item => {
        const counter = document.getElementById(item.count);
        counter.textContent = '0 character' + (item.count === 'numCount' || item.count === 'quantityCount' ? ' digit' : 's entered');
        counter.style.color = 'black'; // Reset to neutral color
      });

      document.getElementById('strengthMsg').textContent = '';
      document.getElementById('matchMsg').textContent = '';

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
// ════════════════════════════════════════════

function loadEntries() {
  fetch('/yentries')
    .then(res => res.json())
    .then(rows => {
      let html = '<div class="table-responsive"><table class="table table-striped table-hover align-middle">';
      html += '<thead class="table-dark"><tr><th>ID</th><th>First Name</th><th>Last Name</th><th>ASIN</th><th>Password</th><th>Email Address</th><th>Phone Number</th><th>Quantity</th><th>Age</th><th>Guardian Information</th><th>Marital Status</th><th>Spouse Information</th><th>Edit</th><th>Delete</th></tr></thead><tbody>';
      
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
          <td><button class="btn btn-sm btn-outline-primary me-1" onclick="editRow(${row.id},'${row.firstname}','${row.lastname}','${row.ankval}','${row.inpass}','${row.email}','${row.phone}','${row.quantity}','${row.age}','${row.guardian}','${row.relstatus}','${row.spousename}')">Edit</button></td>
          <td><button class="btn btn-sm btn-outline-danger" onclick="deleteRow(${row.id})">Delete</button></td>
        </tr>`;
      });
      html += '</tbody></table></div>';
      document.getElementById('tableArea').innerHTML = html;
    });
}

// Outside of loadEntries
async function editRow(id, firstname, lastname, ankval, inpass, email, phone, quantity, age, guardian, relstatus, spousename) {
  
// Changes to enforce the 2-digit rule
  let rawNum = prompt('ASIN (2-digit):', ankval);
  let newNumeric = (rawNum && rawNum.length > 2) ? rawNum.slice(0, 2) : rawNum;

  let rawQty = prompt('Quantity (2-digit):', quantity);
  let newQuantity = (rawQty && rawQty.length > 2) ? rawQty.slice(0, 2) : rawQty;


  let d = {
    id,
    fn01: prompt('First Name:', firstname),
    fn02: prompt('Last Name:', lastname),
    number1: newNumeric,
    password01: prompt('Password:', inpass),
    email01: prompt('Email Address:', email),
    phone01: prompt('Phone Number:', phone),
    quantity01: newQuantity,
    age: prompt('Age (0-199):', age)
  };


  if (Object.values(d).includes(null)) return;

  d.guardian = (Number(d.age) < 18) ? prompt('Guardian Name:', guardian) : '';
  d.relstatus = prompt('Relationship (married/separated/unmarried):', relstatus);
  d.spousename = (d.relstatus === 'married') ? prompt('Spouse Name:', spousename) : '';

  const errors = getValidationErrors(d);
  if (Object.keys(errors).length > 0) {
    alert("Errors:\n" + Object.values(errors).join('\n'));
    return;
  }

  const res = await fetch('/yupdate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(d)
  });

  if (res.ok) {
    loadEntries();
  } else {
    alert("Server error, could not update.");
  }
}

function deleteRow(id) {
  if (!confirm('Are you sure you want to delete this entry?')) return;
  fetch('/ydelete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ id })
  })
  .then(res => res.text())
  .then(() => loadEntries());
}

// Load table on page open
// loadEntries();
