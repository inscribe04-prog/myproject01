// public/js/form.js
// ─────────────────────────────────────────────
// All JavaScript for form.htm lives here.
// Linked in form.htm as:
//   <script src="/js/form.js"></script>
// Sections:
//   1. Live input listeners (counters, show/hide)
//   2. Submit handler (validation + fetch)
//   3. CRUD table (loadEntries, editRow, deleteRow)
//   4. DOM Construction Refactor (renderTable)
// ─────────────────────────────────────────────

console.log("form.js loaded");

//Global Variable

let allEntries = []; // This holds our master list
let currentPage = 1;
const itemsPerPage = 3;
let isTableVisible = false; // For the toggle feature

// Global reference to the Bootstrap Modal
// This tells JavaScript which database field goes into which Modal Input ID
// This map links: Database Column Name -> Modal Input ID
const fieldMap = {
    'firstname':  'edit_fnaam',
    'lastname':   'edit_lnaam',
    'ankval':     'edit_num01',
    'inpass':     'edit_pwd01',
    'email':      'edit_email01',
    'phone':      'edit_phone01',
    'quantity':   'edit_quantity01',
    'age':        'edit_ageInput',
    'guardian':   'edit_guardianInput',
    'relstatus':  'edit_relStatus',
    'spousename': 'edit_spouseInput'
};

// Initialize the Bootstrap Modal
const myModal = new bootstrap.Modal(document.getElementById('editModal'));



// A simple function to escape HTML characters
function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}



// ════════════════════════════════════════════
// SHARED VALIDATION HELPER
// ════════════════════════════════════════════
function getValidationErrors(d) {
  let err = {};
  if (!d.fn01 || d.fn01.length < 3) err.fn01 = "First Name should be minimum 3 chars";
  if (!d.fn02 || d.fn02.length < 3) err.fn02 = "Last Name should be minimum 3 chars";
  if (isNaN(d.number1 ) || d.number1 < 0 || d.number1.length < 2)             err.number1 = "ASIN value is required and should be a 2-digit number";
  if (d.password01.length < 8)      err.password01 = "Password should be minimum 8 chars";
  if (!d.email01.includes('@'))     err.email = "Invalid email address!";
  if (!/^\d{10,}$/.test(d.phone01))  err.phone = "Phone Number should be 10-digits or more";
  if (isNaN(d.quantity01) || d.quantity01 < 0 || d.quantity01.length < 2)          err.qty = "Quantity must be a number and should be a 2-digit number";
  if (d.age < 0 || d.age > 999)      err.age = "Enter a valid age (0-999)";
  
  // Logic checks
  if (d.age < 18 && !d.guardian)    err.guardian = "Guardian name is required for minors";
  if (d.relstatus === 'married' && !d.spousename) err.spouse = "Spouse name required";
  
  return err;
}



// Fetch current user info and show their name
  fetch('/me')
    .then(res => res.json())
    .then(user => {
      document.getElementById('welcomeMsg').textContent =
        'Welcome, ' + user.firstname + ' ' + user.lastname + '!';
    });



document.getElementById('showTableBtn').addEventListener('click', function() {
  const tableArea = document.getElementById('tableArea');
  isTableVisible = !isTableVisible; // This flips true to false, or false to true

  if (isTableVisible) {
    this.textContent = "Hide Table";
    tableArea.style.display = "block";
    
    // Only fetch if allEntries is empty to save data
    if (allEntries.length === 0) {
        loadEntries();
    } else {
        renderTable(allEntries); // Render existing data
    }
  } else {
    this.textContent = "Show Table of Entries";
    tableArea.style.display = "none";
  }
});

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
document.getElementById('confirmPasswordInput').addEventListener('input', function() {
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
    const confirm    = document.getElementById('confirmPasswordInput').value;

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

    // 4. If there are errors, display them and stop
    if (Object.keys(errors).length > 0) {
        // Option: Show the first error in the msg paragraph
        document.getElementById('msg').textContent = '❌ ' + Object.values(errors)[0];
        document.getElementById('msg').style.color = 'red';
        return;
    }

    const theForm = this;

    // 5. Send data to server
    // C of CRUD = CREATE → POST request to /submit

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

      // 6. Reset Live Input Counters and Error Messages

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
// SECTION 3 — Remaining CRUD TABLE
// ════════════════════════════════════════════
// R of CRUD = READ → GET request to /yentries to load all entries and show in a table


async function loadEntries() {

    const tableArea = document.getElementById('tableArea');
     tableArea.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';

    try {
        // "Await" tells the code: wait for the server to reply before moving on
        const response = await fetch('/yentries');
        
        // If the server returns a status like 404 or 500, throw an error
        if (!response.ok) throw new Error('Failed to fetch entries Server returned an error: ' + response.status);

        const rows = await response.json();
        
        allEntries = rows; 
        renderTable(rows); 
        
    } catch (err) {
        console.error("Fetch Error Critical Error loading entries:", err);
        tableArea.innerHTML = `<div class="alert alert-danger">Failed to load data. Please try again.</div>`;
    }
}



// A helper to make table cells quickly
function createCell(text) {
    const td = document.createElement('td');
    td.textContent = text; // .textContent is the "Pro" way. It auto-sanitizes input!
    return td;
}


// This function takes an array of rows and renders the HTML table
function renderTable(rows) {

  // 1. Calculate Start and End index for the current page
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedRows = rows.slice(start, end);
  const totalPages = Math.ceil(rows.length / itemsPerPage);


  const tableArea = document.getElementById('tableArea');
        tableArea.innerHTML = ''; // Clear previous table

  // 2. Create the table structure
    const table = document.createElement('table');
    table.className = 'table table-striped table-hover align-middle';

    // Add header manually
    table.innerHTML = `
    <thead class="table-light">
        <tr><th>ID</th><th>First Name</th><th>Last Name</th><th>ASIN</th><th>Password</th><th>Email Address</th><th>Phone Number</th><th>Quantity</th><th>Age</th><th>Guardian Information</th><th>Marital Status</th><th>Spouse Information</th></tr>
        </thead>
        <tbody></tbody>`;
    
    const tbody = table.querySelector('tbody');
  
// 3. Loop through the paginated rows and add them to the table body

      paginatedRows.forEach(row => {
        const tr = document.createElement('tr');

          tr.appendChild(createCell(row.id));
          tr.appendChild(createCell(row.firstname));
          tr.appendChild(createCell(row.lastname));
          tr.appendChild(createCell(row.ankval));
          tr.appendChild(createCell(row.inpass));
          tr.appendChild(createCell(row.email));
          tr.appendChild(createCell(row.phone));
          tr.appendChild(createCell(row.quantity));
          tr.appendChild(createCell(row.age));
          tr.appendChild(createCell(row.guardian));
          tr.appendChild(createCell(row.relstatus));
          tr.appendChild(createCell(row.spousename));

          // Actions Cell (Edit/Delete buttons)
        const actionTd = document.createElement('td');
        const editBtn = document.createElement('button');
          editBtn.className = 'btn btn-sm btn-outline-primary me-1';
          editBtn.textContent = 'Edit';

          editBtn.onclick = () => editRow(row.id, row.firstname, row.lastname, row.ankval, row.inpass, row.email, row.phone, row.quantity, row.age, row.guardian, row.relstatus, row.spousename);

        const deleteBtn = document.createElement('button');
          deleteBtn.className = 'btn btn-sm btn-outline-danger';
          deleteBtn.textContent = 'Delete';
          deleteBtn.onclick = () => deleteRow(row.id);

        actionTd.appendChild(editBtn);
        actionTd.appendChild(deleteBtn);
          tr.appendChild(actionTd);
        
    tbody.appendChild(tr);
    });


    tableArea.appendChild(table);

// 3. Add Pagination Controls below the table

      const nav = document.createElement('nav');
        nav.setAttribute('aria-label', 'Page navigation');
        nav.className = 'mt-3';

        const ul = document.createElement('ul');
        ul.className = 'pagination justify-content-center';

// Helper to create page buttons
      const createPageBtn = (label, direction, disabled) => {
      const li = document.createElement('li');
            li.className = `page-item ${disabled ? 'disabled' : ''}`;
            
            const btn = document.createElement('button');
            btn.className = 'page-link';
            btn.textContent = label;
            
// The Professional Way: Use addEventListener instead of onclick
            if (!disabled) {
                btn.addEventListener('click', () => changePage(direction));
            }
            
            li.appendChild(btn);
            return li;
        };

// Add Previous
        ul.appendChild(createPageBtn('Previous', -1, currentPage === 1));

// Add Page Info
      const infoLi = document.createElement('li');
        infoLi.className = 'page-item disabled';
        infoLi.innerHTML = `<span class="page-link">Page ${currentPage} of ${totalPages || 1}</span>`;
        ul.appendChild(infoLi);

        // Add Next
        ul.appendChild(createPageBtn('Next', 1, currentPage >= totalPages));

        nav.appendChild(ul);
        tableArea.appendChild(nav);
      }


// Search functionality
      document.getElementById('searchInput').addEventListener('input', function(e) {
        const searchterm = e.target.value.toLowerCase();
        // Filter the master list
        const filteredcontents = allEntries.filter(row => 
          row.firstname.toLowerCase().includes(searchterm) || 
          row.lastname.toLowerCase().includes(searchterm)
        );
        renderTable(filteredcontents); // Re-draw with subset
      });



// 1. Modal conditional logic (Listen for changes inside the Modal)
document.getElementById('edit_ageInput').addEventListener('input', function() {
    const age = Number(this.value);
    document.getElementById('edit_guardianSection').style.display = (age > 0 && age < 18) ? 'block' : 'none';
});

document.getElementById('edit_relStatus').addEventListener('change', function() {
    document.getElementById('edit_spouseSection').style.display = (this.value === 'married') ? 'block' : 'none';
});


// 2. The Updated editRow
function editRow(id, firstname, lastname, ankval, inpass, email, phone, quantity, age, guardian, relstatus, spousename) {
    const data = { firstname, lastname, ankval, inpass, email, phone, quantity, age, guardian, relstatus, spousename };

    Object.keys(fieldMap).forEach(key => {
        const inputId = fieldMap[key];
        const inputEl = document.getElementById(inputId);
        if (inputEl) inputEl.value = data[key];
    });

    document.getElementById('editId').value = id;

    // Custom Logic
    document.getElementById('edit_guardianSection').style.display = (Number(age) < 18) ? 'block' : 'none';
    document.getElementById('edit_spouseSection').style.display = (relstatus === 'married') ? 'block' : 'none';

    myModal.show();
}

// 3. Save Handler
document.getElementById('saveEditBtn').addEventListener('click', async () => {
    // Grab values from the modal IDs
    const d = {
        id: document.getElementById('editId').value,
        fn01: document.getElementById('edit_fnaam').value,
        fn02: document.getElementById('edit_lnaam').value,
        number1: document.getElementById('edit_num01').value,
        password01: document.getElementById('edit_pwd01').value,
        email01: document.getElementById('edit_email01').value,
        phone01: document.getElementById('edit_phone01').value,
        quantity01: document.getElementById('edit_quantity01').value,
        age: document.getElementById('edit_ageInput').value,
        guardian: document.getElementById('edit_guardianInput').value,
        relstatus: document.getElementById('edit_relStatus').value,
        spousename: document.getElementById('edit_spouseInput').value
    };

    // Validate
    const errors = getValidationErrors(d);
    if (Object.keys(errors).length > 0) {
        alert("Errors:\n" + Object.values(errors).join('\n'));
        return; 
    }

    // Send to Server
    try {
        const res = await fetch('/yupdate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(d)
        });

        if (res.ok) {
            myModal.hide();
            alert("Updated successfully!");
            loadEntries();
        } else {
            alert("Server error, could not update.");
        }
    } catch (err) {
        console.error("Save error:", err);
    }
});

// D of CRUD = DELETE
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

// Pagination
function changePage(direction) {
  currentPage += direction;
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allEntries.filter(row => 
    row.firstname.toLowerCase().includes(searchTerm) || 
    row.lastname.toLowerCase().includes(searchTerm)
  );
  renderTable(filtered);
}

