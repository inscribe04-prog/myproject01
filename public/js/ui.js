// public/js/ui.js
window.ui = {
    myModal: null,

    init() {
    this.myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('editModal'));
        
        // 1. Listeners for Main Form
        this.addSafeListener('fnaam', 'input', this.handleNameInput);
        this.addSafeListener('lnaam', 'input', this.handleNameInput);
        this.addSafeListener('num01', 'input', this.handleNumberInput);
        this.addSafeListener('quantity01', 'input', this.handleNumberInput);
        this.addSafeListener('pwd01', 'input', this.handlePasswordInput);
        this.addSafeListener('confirmPasswordInput', 'input', this.handlePasswordMatch);
        this.addSafeListener('ageInput', 'input', this.handleAgeChange);
        this.addSafeListener('relStatus', 'change', this.handleRelStatusChange);
        this.addSafeListener('showTableBtn', 'click', this.toggleTable);
        this.addSafeListener('searchInput', 'input', this.handleSearch);

        // Listeners for Edit Modal
        this.addSafeListener('saveEditBtn', 'click', () => { 
            // We'll call the orchestrator in form.js
            window.handleSaveEditUI(); 
        });
        this.addSafeListener('edit_ageInput', 'input', this.handleAgeChange);
        this.addSafeListener('edit_relStatus', 'change', this.handleRelStatusChange);
    },
    addSafeListener(id, event, handler) {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, handler.bind(this));
    },

    // --- 2. UI HELPERS ---

    handleSearch(e) {
    const term = e.target.value.toLowerCase();
    const filtered = state.entries.filter(entry => 
        (entry.firstname || '').toLowerCase().includes(term) || 
        (entry.lastname || '').toLowerCase().includes(term)
    );
    state.currentPage = 1; // Reset to page 1 for search
    renderTable(filtered);
},

handleNameInput(e) {
        const isFirst = e.target.id === 'fnaam';
        const isEdit = e.target.id === 'edit_fnaam' || e.target.id === 'edit_lnaam'; // Handle edit IDs too
        const len = e.target.value.length;
        const counterId = isFirst || e.target.id === 'edit_fnaam' ? 'fnameCount' : 'lnameCount';
        const counter = document.getElementById(counterId);
        if (counter) {
        counter.textContent = `${len} character${len !== 1 ? 's' : ''} entered`;
        // Reset color if empty, red if < 3, green if >= 3
        if (len === 0) counter.style.color = 'gray';
        else counter.style.color = len < 3 ? 'red' : 'green';
    }
},

handleNumberInput(e) {
        const { value, id } = e.target;
        if (value < 0) e.target.value = 0;
        if (value.length > 2) e.target.value = value.slice(0, 2);
        const counter = document.getElementById(id === 'num01' || id === 'edit_num01' ? 'numCount' : 'quantityCount');
        const len = e.target.value.length;
        counter.textContent = `${len} digit${len === 1 ? '' : 's'} entered`;
        if (len === 0) counter.style.color = 'gray';
        else counter.style.color = len <= 2 ? 'green' : 'red';
    },

    handlePasswordInput(e) {
        // const pass = document.getElementById('pwd01').value;
        const pass = e.target.value; // Get value from event
        updatePasswordStrengthUI(pass);
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
    // 1. Prevent negative
    if (e.target.value < 0) e.target.value = '';

    const isEdit = e.target.id === 'edit_ageInput';
    const age = Number(e.target.value);
    const isMinor = age < 18 && age > 0;

    // 2. Select Elements based on mode
    const sectionEl = document.getElementById(isEdit ? 'edit_guardianSection' : 'guardianSection');
    const inputEl = document.getElementById(isEdit ? 'edit_guardianInput' : 'guardianInput');

    // 3. Logic: Show if minor, Hide + Clear if not
    if (sectionEl) {
        if (isMinor) {
            sectionEl.classList.remove('hidden');
        } else {
            sectionEl.classList.add('hidden');
            if (inputEl) inputEl.value = ''; // Auto-clear
        }
    }
},

handleRelStatusChange(e){
    const isMarried = e.target.value === 'married';
    const isEdit = e.target.id === 'edit_relStatus' || e.target.id === 'edit_ageInput'; // Handle edit IDs too
    
    // Toggle Visibility
    const sectionEl = document.getElementById(isEdit ? 'edit_spouseSection' : 'spouseSection');
    const inputEl = document.getElementById(isEdit ? 'edit_spouseInput' : 'spouseInput');
    
    if (sectionEl) {
        if (isMarried) sectionEl.classList.remove('hidden');
        else {
            sectionEl.classList.add('hidden');
            if (inputEl) inputEl.value = ''; // AUTO CLEAR
        }
    }
},

toggleTable() {
        state.isTableVisible = !state.isTableVisible;
        const btn = document.getElementById('showTableBtn');
        const tableArea = document.getElementById('tableArea');
        btn.textContent = state.isTableVisible ? "Hide Table" : "Show Table of Entries";
        tableArea.style.display = state.isTableVisible ? "block" : "none";
        if (state.isTableVisible && state.entries.length === 0) loadEntries();
    },

        // --- 3. RENDER TABLE ---

renderTable(rows) {
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
        tableColumns.forEach(col => tr.appendChild(this.createCell(row[col.key])));
        
        const actionTd = document.createElement('td');
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-primary me-1';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => window.editRow(row); 
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => window.deleteRow(row.id);
        
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
            <li class="page-item ${state.currentPage === 1 ? 'disabled' : ''}"><button class="page-link" onclick="window.changePage(-1)">Previous</button></li>
            <li class="page-item disabled"><span class="page-link">Page ${state.currentPage} of ${totalPages || 1}</span></li>
            <li class="page-item ${state.currentPage >= totalPages ? 'disabled' : ''}"><button class="page-link" onclick="window.changePage(1)">Next</button></li>
        </ul>`;
    tableArea.appendChild(nav);

    const dbToFormMap = {
    firstname: 'fn01', lastname: 'fn02', ankval: 'number1', 
    inpass: 'password01', email: 'email01', phone: 'phone01', 
    quantity: 'quantity01', age: 'age', guardian: 'guardian', 
    relstatus: 'relstatus', spousename: 'spousename'
    };
},
//  const nav = document.createElement('nav');
//     nav.className = 'mt-3';
//     nav.innerHTML = `
//         <ul class="pagination justify-content-center">
//             <li class="page-item ${state.currentPage === 1 ? 'disabled' : ''}"><button class="page-link" onclick="changePage(-1)">Previous</button></li>
//             <li class="page-item disabled"><span class="page-link">Page ${state.currentPage} of ${totalPages || 1}</span></li>
//             <li class="page-item ${state.currentPage >= totalPages ? 'disabled' : ''}"><button class="page-link" onclick="changePage(1)">Next</button></li>
//         </ul>`;
//     tableArea.appendChild(nav);
// }

//   const dbToFormMap = {
//     firstname: 'fn01', lastname: 'fn02', ankval: 'number1', 
//     inpass: 'password01', email: 'email01', phone: 'phone01', 
//     quantity: 'quantity01', age: 'age', guardian: 'guardian', 
//     relstatus: 'relstatus', spousename: 'spousename'
// };


createCell(text) {
    const td = document.createElement('td');
    td.textContent = text || ''; 
    return td;
},

getFormData(type) {
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
};