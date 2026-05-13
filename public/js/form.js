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


// public/js/form.js
console.log("form.js loaded (Final Stable Version)");

// 1. STATE & API
const state = {
    entries: [],
    currentPage: 1,
    itemsPerPage: 3,
    isTableVisible: false
};


// Expose these to the window so editRow can find them
window.dbToFormMap = {
    firstname: 'fn01', lastname: 'fn02', ankval: 'number1', 
    inpass: 'password01', email: 'email01', phone: 'phone01', 
    quantity: 'quantity01', age: 'age', guardian: 'guardian', 
    relstatus: 'relstatus', spousename: 'spousename'
};

window.formSchema = {
    fn01: { mainId: 'fnaam', editId: 'edit_fnaam' },
    fn02: { mainId: 'lnaam', editId: 'edit_lnaam' },
    number1: { mainId: 'num01', editId: 'edit_num01' },
    password01: { mainId: 'pwd01', editId: 'edit_pwd01' },
    email01: { mainId: 'email01', editId: 'edit_email01' },
    phone01: { mainId: 'phone01', editId: 'edit_phone01' },
    quantity01: { mainId: 'quantity01', editId: 'edit_quantity01' },
    age: { mainId: 'ageInput', editId: 'edit_ageInput' },
    guardian: { mainId: 'guardianInput', editId: 'edit_guardianInput' },
    relstatus: { mainId: 'relStatus', editId: 'edit_relStatus' },
    spousename: { mainId: 'spouseInput', editId: 'edit_spouseInput' }
};

window.tableColumns = [ /* Copy your tableColumns array here */
    { label: 'ID', key: 'id' }, { label: 'First Name', key: 'firstname' },
    { label: 'Last Name', key: 'lastname' }, { label: 'ASIN', key: 'ankval' },
    { label: 'Password', key: 'inpass' }, { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' }, { label: 'Qty', key: 'quantity' },
    { label: 'Age', key: 'age' }, { label: 'Guardian', key: 'guardian' },
    { label: 'Status', key: 'relstatus' }, { label: 'Spouse', key: 'spousename' }
 ];


// --- MODAL INITIALIZATION ---
let myModal; // Global variable to hold the modal instance

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the modal once the DOM is ready
    const modalEl = document.getElementById('editModal');
    if (modalEl) {
        myModal = new bootstrap.Modal(modalEl);
    }
    
    // Initialize the UI after the modal is ready
    UI.init();
});

// 2. CONFIGURATION
const tableColumns = [
    { label: 'ID', key: 'id' }, { label: 'First Name', key: 'firstname' },
    { label: 'Last Name', key: 'lastname' }, { label: 'ASIN', key: 'ankval' },
    { label: 'Password', key: 'inpass' }, { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' }, { label: 'Qty', key: 'quantity' },
    { label: 'Age', key: 'age' }, { label: 'Guardian', key: 'guardian' },
    { label: 'Status', key: 'relstatus' }, { label: 'Spouse', key: 'spousename' }
];

const formSchema = {
    fn01: { mainId: 'fnaam', editId: 'edit_fnaam' },
    fn02: { mainId: 'lnaam', editId: 'edit_lnaam' },
    number1: { mainId: 'num01', editId: 'edit_num01' },
    password01: { mainId: 'pwd01', editId: 'edit_pwd01' },
    email01: { mainId: 'email01', editId: 'edit_email01' },
    phone01: { mainId: 'phone01', editId: 'edit_phone01' },
    quantity01: { mainId: 'quantity01', editId: 'edit_quantity01' },
    age: { mainId: 'ageInput', editId: 'edit_ageInput' },
    guardian: { mainId: 'guardianInput', editId: 'edit_guardianInput' },
    relstatus: { mainId: 'relStatus', editId: 'edit_relStatus' },
    spousename: { mainId: 'spouseInput', editId: 'edit_spouseInput' }
};
// 4. UI CONTROLLER
const UI = {
    
    init() {
        document.getElementById('fnaam').addEventListener('input', this.handleNameInput);
        document.getElementById('lnaam').addEventListener('input', this.handleNameInput);
        document.getElementById('num01').addEventListener('input', this.handleNumberInput);
        document.getElementById('quantity01').addEventListener('input', this.handleNumberInput);
        document.getElementById('pwd01').addEventListener('input', this.handlePasswordInput);
        document.getElementById('confirmPasswordInput').addEventListener('input', this.handlePasswordMatch);
        document.getElementById('ageInput').addEventListener('input', this.handleAgeChange);
        document.getElementById('relStatus').addEventListener('change', this.handleRelStatusChange);
        document.getElementById('showTableBtn').addEventListener('click', this.toggleTable);
        document.getElementById('myForm').addEventListener('submit', this.handleSubmit);
        document.getElementById('saveEditBtn').addEventListener('click', this.handleSaveEdit);
        document.getElementById('searchInput').addEventListener('input', this.handleSearch);
        document.getElementById('edit_relStatus').addEventListener('change', this.handleRelStatusChange);
        document.getElementById('edit_ageInput').addEventListener('input', this.handleAgeChange);
        document.getElementById('exportBtn').addEventListener('click', this.exportToCSV.bind(this));

        // Add listener for Edit Age to prevent negatives

        fetch('/me').then(res => res.json()).then(user => {
            const el = document.getElementById('welcomeMsg');
            if(el) el.textContent = `Welcome, ${user.firstname} ${user.lastname}!`;
        });
    },

//     handleSearch(e) {
//     const term = e.target.value.toLowerCase();
//     const filtered = state.entries.filter(entry => 
//         (entry.firstname || '').toLowerCase().includes(term) || 
//         (entry.lastname || '').toLowerCase().includes(term)
//     );
//     state.currentPage = 1; // Reset to page 1 for search
//     renderTable(filtered);
// },

    async handleSubmit(e) {
        e.preventDefault();
        const msgEl = document.getElementById('msg'); // Reference the element
        
        document.querySelectorAll('.text-danger').forEach(el => el.textContent = '');
        const d = ui.getFormData('main');
        const errors = validators.getErrors(d);
        if (Object.keys(errors).length > 0) {
            document.getElementById('msg').textContent = '❌ ' + Object.values(errors)[0];
            msgEl.classList.add('text-danger');
            return;
        }
        if (await api.create(d)) {
            document.getElementById('msg').textContent = '✅ Saved successfully!';
            msgEl.classList.add('text-success');
            document.getElementById('myForm').reset();
            loadEntries();
        }
    },

    async handleSaveEdit() {
        const id = document.getElementById('editId').value;
        const d = ui.getFormData('edit');
        const errors = validators.getErrors(d);
        if (Object.keys(errors).length > 0) return alert("Errors:\n" + Object.values(errors).join('\n'));
        if (await api.update(id, d)) {
            if (myModal) myModal.hide(); 
            loadEntries();
        }
        window.handleSaveEditUI = handleSaveEdit ();
    },

//     handleNameInput(e) {
//         const isFirst = e.target.id === 'fnaam';
//         const isEdit = e.target.id === 'edit_fnaam' || e.target.id === 'edit_lnaam'; // Handle edit IDs too
//         const len = e.target.value.length;
//         const counterId = isFirst || e.target.id === 'edit_fnaam' ? 'fnameCount' : 'lnameCount';
//         const counter = document.getElementById(counterId);
//         if (counter) {
//         counter.textContent = `${len} character${len !== 1 ? 's' : ''} entered`;
//         // Reset color if empty, red if < 3, green if >= 3
//         if (len === 0) counter.style.color = 'gray';
//         else counter.style.color = len < 3 ? 'red' : 'green';
//     }
// },

//     handleNumberInput(e) {
//         const { value, id } = e.target;
//         if (value < 0) e.target.value = 0;
//         if (value.length > 2) e.target.value = value.slice(0, 2);
//         const counter = document.getElementById(id === 'num01' || id === 'edit_num01' ? 'numCount' : 'quantityCount');
//         const len = e.target.value.length;
//         counter.textContent = `${len} digit${len === 1 ? '' : 's'} entered`;
//         if (len === 0) counter.style.color = 'gray';
//         else counter.style.color = len <= 2 ? 'green' : 'red';
//     },

//     handlePasswordInput(e) {
//         // const pass = document.getElementById('pwd01').value;
//         const pass = e.target.value; // Get value from event
//         updatePasswordStrengthUI(pass);
//         const counter = document.getElementById('pwdCount');
//         counter.textContent = `${pass.length} character${pass.length !== 1 ? 's' : ''} entered`;
//     },

//     handlePasswordMatch() {
//         const pass = document.getElementById('pwd01').value;
//         const confirm = document.getElementById('confirmPasswordInput').value;
//         const msg = document.getElementById('matchMsg');
//         msg.textContent = (pass === confirm) ? '✅ Passwords match' : '❌ Does not match';
//         msg.style.color = (pass === confirm) ? 'green' : 'red';
//     },

//    handleAgeChange(e) {
//     // 1. Prevent negative
//     if (e.target.value < 0) e.target.value = '';

//     const isEdit = e.target.id === 'edit_ageInput';
//     const age = Number(e.target.value);
//     const isMinor = age < 18 && age > 0;

//     // 2. Select Elements based on mode
//     const sectionEl = document.getElementById(isEdit ? 'edit_guardianSection' : 'guardianSection');
//     const inputEl = document.getElementById(isEdit ? 'edit_guardianInput' : 'guardianInput');

//     // 3. Logic: Show if minor, Hide + Clear if not
//     if (sectionEl) {
//         if (isMinor) {
//             sectionEl.classList.remove('hidden');
//         } else {
//             sectionEl.classList.add('hidden');
//             if (inputEl) inputEl.value = ''; // Auto-clear
//         }
//     }
// },

//     handleRelStatusChange(e){
//     const isMarried = e.target.value === 'married';
//     const isEdit = e.target.id === 'edit_relStatus' || e.target.id === 'edit_ageInput'; // Handle edit IDs too
    
//     // Toggle Visibility
//     const sectionEl = document.getElementById(isEdit ? 'edit_spouseSection' : 'spouseSection');
//     const inputEl = document.getElementById(isEdit ? 'edit_spouseInput' : 'spouseInput');
    
//     if (sectionEl) {
//         if (isMarried) sectionEl.classList.remove('hidden');
//         else {
//             sectionEl.classList.add('hidden');
//             if (inputEl) inputEl.value = ''; // AUTO CLEAR
//         }
//     }
// },

//     toggleTable() {
//         state.isTableVisible = !state.isTableVisible;
//         const btn = document.getElementById('showTableBtn');
//         const tableArea = document.getElementById('tableArea');
//         btn.textContent = state.isTableVisible ? "Hide Table" : "Show Table of Entries";
//         tableArea.style.display = state.isTableVisible ? "block" : "none";
//         if (state.isTableVisible && state.entries.length === 0) loadEntries();
//     },

    
    exportToCSV() {
        if (state.entries.length === 0) return alert("No data to export!");
        
        const headers = tableColumns.map(col => col.label);
        const csvRows = [headers.join(',')];
        
        for (const row of state.entries) {
            const values = tableColumns.map(col => {
                const escaped = ('' + (row[col.key] || '')).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'entries_export.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};

// 5. CRUD & HELPERS
async function loadEntries() {
    const tableArea = document.getElementById('tableArea');
    tableArea.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
    try {
        state.entries = await api.getEntries();
        // ui.renderTable(state.entries);
        ui.renderTable(state.entries, state, tableColumns);
    } catch (err) {
        console.error("API LOAD ERROR:", err);
        tableArea.innerHTML = `<div class="alert alert-danger">Failed to load data. ${err.message}</div>`;
    }
}

// function renderTable(rows) {
//     const start = (state.currentPage - 1) * state.itemsPerPage;
//     const end = start + state.itemsPerPage;
//     const paginatedRows = rows.slice(start, end);
//     const totalPages = Math.ceil(rows.length / state.itemsPerPage);

//     const tableArea = document.getElementById('tableArea');
//     tableArea.innerHTML = '';
    
//     const table = document.createElement('table');
//     table.className = 'table table-striped table-hover align-middle';
//     table.innerHTML = `<thead class="table-light"><tr>${tableColumns.map(col => `<th>${col.label}</th>`).join('')}<th>Actions</th></tr></thead><tbody></tbody>`;
    
//     const tbody = table.querySelector('tbody');
//     paginatedRows.forEach(row => {
//         const tr = document.createElement('tr');
//         tableColumns.forEach(col => tr.appendChild(createCell(row[col.key])));
        
//         const actionTd = document.createElement('td');
//         const editBtn = document.createElement('button');
//         editBtn.className = 'btn btn-sm btn-outline-primary me-1';
//         editBtn.textContent = 'Edit';
//         editBtn.onclick = () => editRow(row); 
        
//         const deleteBtn = document.createElement('button');
//         deleteBtn.className = 'btn btn-sm btn-outline-danger';
//         deleteBtn.textContent = 'Delete';
//         deleteBtn.onclick = () => deleteRow(row.id);
        
//         actionTd.appendChild(editBtn); actionTd.appendChild(deleteBtn);
//         tr.appendChild(actionTd);
//         tbody.appendChild(tr);
//     });
//     tableArea.appendChild(table);

//     // PAGINATION
//     const nav = document.createElement('nav');
//     nav.className = 'mt-3';
//     nav.innerHTML = `
//         <ul class="pagination justify-content-center">
//             <li class="page-item ${state.currentPage === 1 ? 'disabled' : ''}"><button class="page-link" onclick="changePage(-1)">Previous</button></li>
//             <li class="page-item disabled"><span class="page-link">Page ${state.currentPage} of ${totalPages || 1}</span></li>
//             <li class="page-item ${state.currentPage >= totalPages ? 'disabled' : ''}"><button class="page-link" onclick="changePage(1)">Next</button></li>
//         </ul>`;
//     tableArea.appendChild(nav);
// }

// const dbToFormMap = {
//     firstname: 'fn01', lastname: 'fn02', ankval: 'number1', 
//     inpass: 'password01', email: 'email01', phone: 'phone01', 
//     quantity: 'quantity01', age: 'age', guardian: 'guardian', 
//     relstatus: 'relstatus', spousename: 'spousename'
// };

function editRow(row) {
    console.log("Edit button clicked for ID:", row.id); // Add this log!
    Object.keys(dbToFormMap).forEach(dbKey => {
        const schemaKey = window.dbToFormMap[dbKey];
        const inputId = window.formSchema[schemaKey]?.editId;
        const inputEl = document.getElementById(inputId);
        if (inputEl) inputEl.value = row[dbKey] || '';
    });
    document.getElementById('editId').value = row.id;

    // 1. Get the elements
    const guardSec = document.getElementById('edit_guardianSection');
    const spouseSec = document.getElementById('edit_spouseSection');

    // 2. Safely toggle visibility (using classList is cleaner than style.display)
    if (guardSec) {
        if (Number(row.age) < 18) guardSec.classList.remove('hidden');
        else guardSec.classList.add('hidden');
    } else {
        console.warn("Element 'edit_guardianSection' not found in HTML!");
    }

    if (spouseSec) {
        if (row.relstatus === 'married') spouseSec.classList.remove('hidden');
        else spouseSec.classList.add('hidden');
    } else {
        console.warn("Element 'edit_spouseSection' not found in HTML!");
    }
    // if (myModal) myModal.show();
    ui.myModal.show()
}

window.editRow = editRow; // Expose to global for inline onclick


async function deleteRow(id) {
    if (!confirm('Are you sure?')) return;
    if (await api.delete(id)) loadEntries();
}

// function getFormData(type) {
//     const isEdit = type === 'edit';
//     const prefix = isEdit ? 'edit_' : '';
//     return {
//         fn01: document.getElementById(prefix + 'fnaam')?.value.trim(),
//         fn02: document.getElementById(prefix + 'lnaam')?.value.trim(),
//         number1: document.getElementById(prefix + 'num01')?.value.trim(),
//         password01: document.getElementById(prefix + 'pwd01')?.value,
//         email01: document.getElementById(prefix + 'email01')?.value.trim(),
//         phone01: document.getElementById(prefix + 'phone01')?.value.trim(),
//         quantity01: document.getElementById(prefix + 'quantity01')?.value.trim(),
//         age: document.getElementById(prefix + 'ageInput')?.value.trim(),
//         guardian: document.getElementById(prefix + 'guardianInput')?.value.trim(),
//         relstatus: document.getElementById(prefix + 'relStatus')?.value,
//         spousename: document.getElementById(prefix + 'spouseInput')?.value.trim()
//     };
// }

// function createCell(text) {
//     const td = document.createElement('td');
//     td.textContent = text || ''; 
//     return td;
// }

function changePage(direction) {
    state.currentPage += direction;
    // renderTable(state.entries);
    ui.renderTable(state.entries, state, window.tableColumns);
}
window.changePage = changePage; // Expose to global for inline onclick

function updatePasswordStrengthUI(val) {
    const strengthMsg = document.getElementById('strengthMsg');
    if (!strengthMsg) return;

    if (val.length === 0) { strengthMsg.textContent = ""; return; }

    const score = [
        /[A-Z]/.test(val), // Upper
        /[a-z]/.test(val), // Lower
        /\d/.test(val),    // Number
        /[!@#$%^&*]/.test(val), // Special
        val.length >= 8    // Length
    ].filter(Boolean).length;

    if (score < 3) {
        strengthMsg.textContent = "Weak";
        strengthMsg.className = "text-danger small fw-bold";
    } else if (score < 5) {
        strengthMsg.textContent = "Good";
        strengthMsg.className = "text-warning small fw-bold";
    } else {
        strengthMsg.textContent = "Strong";
        strengthMsg.className = "text-success small fw-bold";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ui.init(); // Use the lowercase 'ui' from ui.js
});

// document.addEventListener('DOMContentLoaded', () => UI.init());

