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

const api = {
    async getEntries() {
        const res = await fetch('/api/entries');
        return res.ok ? await res.json() : [];
    },
    async create(data) {
        const res = await fetch('/api/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data)
        });
        return res.ok;
    },
    async update(id, data) {
        const res = await fetch(`/api/entries/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data)
        });
        return res.ok;
    },
    async delete(id) {
        const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
        return res.ok;
    }
};

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

const myModal = new bootstrap.Modal(document.getElementById('editModal'));

// 3. VALIDATION
const validationRules = {
    fn01: { min: 3, msg: "First Name should be minimum 3 chars" },
    fn02: { min: 3, msg: "Last Name should be minimum 3 chars" },
    number1: { length: 2, isNum: true, msg: "ASIN value is required and should be a 2-digit number" },
    quantity01: { length: 2, isNum: true, msg: "Quantity must be a number and should be a 2-digit number" },
    phone01: { regex: /^\d{10}$/, msg: "Phone Number should be 10-digits only" },
    age: { max: 999, min: 0, msg: "Enter a valid age (0-999)" }
};

function getValidationErrors(d) {
    let err = {};
    Object.keys(validationRules).forEach(key => {
        const rule = validationRules[key];
        const val = String(d[key] || '');
        if (rule.min && val.length < rule.min) err[key] = rule.msg;
        if (rule.length && val.length !== rule.length) err[key] = rule.msg;
        if (rule.isNum && (isNaN(val) || Number(val) < 0)) err[key] = rule.msg;
        if (rule.regex && !rule.regex.test(val)) err[key] = rule.msg;
        if (rule.max !== undefined && Number(val) > rule.max) err[key] = rule.msg;
    });
    const emailErr = utils.validateAuthInput(d.email01, 'email');
    if (emailErr) err.email = emailErr;
    const passErr = utils.validatePassword(d.password01);
    if (passErr) err.password01 = passErr;
    if (Number(d.age) < 18 && !d.guardian) err.guardian = "Guardian name is required for minors";
    if (d.relstatus === 'married' && !d.spousename) err.spouse = "Spouse name required";
    return err;
}

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

        fetch('/me').then(res => res.json()).then(user => {
            const el = document.getElementById('welcomeMsg');
            if(el) el.textContent = `Welcome, ${user.firstname} ${user.lastname}!`;
        });
    },

    async handleSubmit(e) {
        e.preventDefault();
        document.querySelectorAll('.text-danger').forEach(el => el.textContent = '');
        const d = getFormData('main');
        const errors = getValidationErrors(d);
        if (Object.keys(errors).length > 0) {
            document.getElementById('msg').textContent = '❌ ' + Object.values(errors)[0];
            return;
        }
        if (await api.create(d)) {
            document.getElementById('msg').textContent = '✅ Saved successfully!';
            document.getElementById('myForm').reset();
            loadEntries();
        }
    },

    async handleSaveEdit() {
        const id = document.getElementById('editId').value;
        const d = getFormData('edit');
        const errors = getValidationErrors(d);
        if (Object.keys(errors).length > 0) return alert("Errors:\n" + Object.values(errors).join('\n'));
        if (await api.update(id, d)) {
            myModal.hide();
            loadEntries();
        }
    },

    handleNameInput(e) {
        const isFirst = e.target.id === 'fnaam';
        const len = e.target.value.length;
        const counter = document.getElementById(isFirst ? 'fnameCount' : 'lnameCount');
        counter.textContent = `${len} character${len !== 1 ? 's' : ''} entered`;
        counter.style.color = len < 3 ? 'red' : 'green';
    },

    handleNumberInput(e) {
        const { value, id } = e.target;
        if (value < 0) e.target.value = 0;
        if (value.length > 2) e.target.value = value.slice(0, 2);
        const counter = document.getElementById(id === 'num01' ? 'numCount' : 'quantityCount');
        const len = e.target.value.length;
        counter.textContent = `${len} digit${len !== 1 ? 's' : ''} entered`;
        counter.style.color = len <= 2 ? 'green' : 'red';
    },

    handlePasswordInput() {
        const pass = document.getElementById('pwd01').value;
        const counter = document.getElementById('pwdCount');
        counter.textContent = `${pass.length} character${pass.length !== 1 ? 's' : ''} entered`;
    },

    handlePasswordMatch() {
        const pass = document.getElementById('pwd01').value;
        const confirm = document.getElementById('confirmPasswordInput').value;
        const msg = document.getElementById('matchMsg');
        msg.textContent = (pass === confirm) ? '✅ Passwords match' : '❌ Does not match';
        msg.style.color = (pass === confirm) ? 'green' : 'red';
    },

    handleAgeChange(e) {
        const isMinor = Number(e.target.value) < 18 && Number(e.target.value) > 0;
        document.getElementById('guardianSection').style.display = isMinor ? 'block' : 'none';
    },

    handleRelStatusChange(e) {
        const isMarried = e.target.value === 'married';
        document.getElementById('spouseSection').style.display = isMarried ? 'block' : 'none';
    },

    toggleTable() {
        state.isTableVisible = !state.isTableVisible;
        const btn = document.getElementById('showTableBtn');
        const tableArea = document.getElementById('tableArea');
        btn.textContent = state.isTableVisible ? "Hide Table" : "Show Table of Entries";
        tableArea.style.display = state.isTableVisible ? "block" : "none";
        if (state.isTableVisible && state.entries.length === 0) loadEntries();
    }
};

// 5. CRUD & HELPERS
async function loadEntries() {
    const tableArea = document.getElementById('tableArea');
    tableArea.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
    try {
        state.entries = await api.getEntries();
        renderTable(state.entries);
    } catch (err) {
        tableArea.innerHTML = `<div class="alert alert-danger">Failed to load data.</div>`;
    }
}

function renderTable(rows) {
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const paginatedRows = rows.slice(start, end);
    const totalPages = Math.ceil(rows.length / state.itemsPerPage);

    const tableArea = document.getElementById('tableArea');
    tableArea.innerHTML = '';
    
    const table = document.createElement('table');
    table.className = 'table table-striped table-hover align-middle';
    table.innerHTML = `<thead class="table-light"><tr>${tableColumns.map(col => `<th>${col.label}</th>`).join('')}<th>Actions</th></tr></thead><tbody></tbody>`;
    
    const tbody = table.querySelector('tbody');
    paginatedRows.forEach(row => {
        const tr = document.createElement('tr');
        tableColumns.forEach(col => tr.appendChild(createCell(row[col.key])));
        
        const actionTd = document.createElement('td');
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-primary me-1';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => editRow(row); 
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteRow(row.id);
        
        actionTd.appendChild(editBtn); actionTd.appendChild(deleteBtn);
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });
    tableArea.appendChild(table);

    // PAGINATION
    const nav = document.createElement('nav');
    nav.className = 'mt-3';
    nav.innerHTML = `
        <ul class="pagination justify-content-center">
            <li class="page-item ${state.currentPage === 1 ? 'disabled' : ''}"><button class="page-link" onclick="changePage(-1)">Previous</button></li>
            <li class="page-item disabled"><span class="page-link">Page ${state.currentPage} of ${totalPages || 1}</span></li>
            <li class="page-item ${state.currentPage >= totalPages ? 'disabled' : ''}"><button class="page-link" onclick="changePage(1)">Next</button></li>
        </ul>`;
    tableArea.appendChild(nav);
}

const dbToFormMap = {
    firstname: 'fn01', lastname: 'fn02', ankval: 'number1', 
    inpass: 'password01', email: 'email01', phone: 'phone01', 
    quantity: 'quantity01', age: 'age', guardian: 'guardian', 
    relstatus: 'relstatus', spousename: 'spousename'
};

function editRow(row) {
    Object.keys(dbToFormMap).forEach(dbKey => {
        const schemaKey = dbToFormMap[dbKey];
        const inputId = formSchema[schemaKey]?.editId;
        const inputEl = document.getElementById(inputId);
        if (inputEl) inputEl.value = row[dbKey] || '';
    });
    document.getElementById('editId').value = row.id;
    document.getElementById('edit_guardianSection').style.display = (Number(row.age) < 18) ? 'block' : 'none';
    document.getElementById('edit_spouseSection').style.display = (row.relstatus === 'married') ? 'block' : 'none';
    myModal.show();
}

async function deleteRow(id) {
    if (!confirm('Are you sure?')) return;
    if (await api.delete(id)) loadEntries();
}

function getFormData(type) {
    const isEdit = type === 'edit';
    const prefix = isEdit ? 'edit_' : '';
    return {
        fn01: document.getElementById(prefix + 'fnaam')?.value.trim(),
        fn02: document.getElementById(prefix + 'lnaam')?.value.trim(),
        number1: document.getElementById(prefix + 'num01')?.value.trim(),
        password01: document.getElementById(prefix + 'pwd01')?.value,
        email01: document.getElementById(prefix + 'email01')?.value.trim(),
        phone01: document.getElementById(prefix + 'phone01')?.value.trim(),
        quantity01: document.getElementById(prefix + 'quantity01')?.value.trim(),
        age: document.getElementById(prefix + 'ageInput')?.value.trim(),
        guardian: document.getElementById(prefix + 'guardianInput')?.value.trim(),
        relstatus: document.getElementById(prefix + 'relStatus')?.value,
        spousename: document.getElementById(prefix + 'spouseInput')?.value.trim()
    };
}

function createCell(text) {
    const td = document.createElement('td');
    td.textContent = text || ''; 
    return td;
}

function changePage(direction) {
    state.currentPage += direction;
    renderTable(state.entries);
}

document.addEventListener('DOMContentLoaded', () => UI.init());