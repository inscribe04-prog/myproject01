// public/js/ui.js
window.ui = {
    myModal: null,

    async init() {
        const modalEl = document.getElementById(schema.ui.editModal);
        if (modalEl) {
            this.myModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        }

        this.bindFieldMode('main');
        this.bindFieldMode('edit');

        const confirmEl = document.getElementById(schema.ui.confirmPassword);
        if (confirmEl) {
            confirmEl.addEventListener('input', (e) => {
                this.handleNoSpaces(e);
                this.handlePasswordMatch();
            });
        }

        this.addSafeListener(schema.ui.showTableBtn, 'click', (e) => {
            e.preventDefault();
            this.toggleTable();
        });

        this.addSafeListener(schema.ui.searchInput, 'input', (e) => {
            this.handleSearch(e);
        });

        this.addSafeListener(schema.ui.exportBtn, 'click', async (e) => {
            e.preventDefault();
            await window.exportToCSV();
        });

        this.addSafeListener(schema.ui.saveEditBtn, 'click', (e) => {
            e.preventDefault();
            window.handleSaveEditUI();
        });

        this.addSafeListener(schema.ui.form, 'submit', async (e) => {
            e.preventDefault();
            await window.handleSubmitUI(e);
        });

        await this.loadWelcomeMessage();
    },

    bindFieldMode(mode) {
        Object.entries(schema.fields).forEach(([key, field]) => {
            const id = mode === 'main' ? field.mainId : field.editId;
            const el = document.getElementById(id);
            if (!el) return;

            if (['firstname', 'lastname', 'guardian', 'spouse'].includes(key)) {
                this.addSafeListener(id, 'input', (e) => this.handleNameInput(e, key, mode));
            } else if (['asin', 'quantity', 'phone'].includes(key)) {
                this.addSafeListener(id, 'input', (e) => this.handleNumberInput(e, key, mode));
            } else if (key === 'age') {
                this.addSafeListener(id, 'input', (e) => this.handleAgeChange(e, mode));
            } else if (key === 'relstatus') {
                this.addSafeListener(id, 'change', (e) => this.handleRelStatusChange(e, mode));
            } else if (key === 'password') {
                this.addSafeListener(id, 'input', (e) => this.handlePasswordInput(e, mode));
            } else if (key === 'email') {
                this.addSafeListener(id, 'input', (e) => this.handleNoSpaces(e));
            }
        });
    },

    addSafeListener(id, event, handler) {
        const el = document.getElementById(id);
        if (!el) {
            console.warn(`Element not found: ${id}`);
            return;
        }
        el.addEventListener(event, handler);
    },

    async loadWelcomeMessage() {
        try {
            const user = await api.getCurrentUser();
            const el = document.getElementById(schema.ui.welcomeMsg);
            if (el && user) {
                el.textContent = `Welcome, ${user.firstname} ${user.lastname}!`;
            }
        } catch (err) {
            console.error('ME fetch failed:', err);
        }
    },

    clearErrors() {
        Object.values(schema.errors).forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = '';
            el.classList.add('d-none');
        });
    },

    showErrors(errors) {
        Object.entries(errors).forEach(([key, message]) => {
            const el = document.getElementById(schema.errors[key] || `${key}Err`);
            if (!el) return;
            el.textContent = message;
            el.classList.remove('d-none');
        });
    },

    resetFormUI() {
        this.clearErrors();

        const msg = document.getElementById(schema.ui.message);
        if (msg) {
            msg.textContent = '';
            msg.className = 'fw-bold mt-3';
        }

        const strength = document.getElementById(schema.ui.strengthMsg);
        if (strength) {
            strength.textContent = '';
            strength.className = 'small fw-bold';
        }

        const match = document.getElementById(schema.ui.matchMsg);
        if (match) {
            match.textContent = '';
            match.className = 'text-danger small';
        }

        const defaults = {
            firstname: '0 character',
            lastname: '0 character',
            asin: '0 digit',
            password: '0 character',
            quantity: '0 digit',
            phone: '0 digit'
        };

        Object.entries(schema.counters).forEach(([key, id]) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = defaults[key] || '';
            el.style.color = 'gray';
        });

        [schema.sections.guardian.main, schema.sections.spouse.main].forEach((sectionId) => {
            const sectionEl = document.getElementById(sectionId);
            if (sectionEl) sectionEl.classList.add('hidden');
        });

        const guardianInput = document.getElementById(schema.fields.guardian.mainId);
        if (guardianInput) guardianInput.value = '';

        const spouseInput = document.getElementById(schema.fields.spouse.mainId);
        if (spouseInput) spouseInput.value = '';
    },

    handleNoSpaces(e) {
        e.target.value = e.target.value.replace(/\s/g, '');
    },

    handleSearch(e) {
        clearTimeout(state.searchTimer);

        const term = e.target.value.toLowerCase().trim();

        state.searchTimer = setTimeout(() => {
            const filtered = !term
                ? state.entries
                : state.entries.filter((entry) => {
                    return Object.values(entry).some((val) =>
                        String(val ?? '').toLowerCase().includes(term)
                    );
                });

            state.currentPage = 1;
            this.renderTable(filtered);
        }, 250);
    },

    handleNameInput(e, key, mode = 'main') {
        const field = schema.fields[key];
        if (!field) return;

        e.target.value = e.target.value
            .replace(/[^A-Za-z]/g, '')
            .slice(0, field.maxLength || 50);

        if (mode !== 'main') return;

        const counterId = field.counterId || schema.counters[key];
        if (!counterId) return;

        const counter = document.getElementById(counterId);
        if (!counter) return;

        const len = e.target.value.length;
        counter.textContent = `${len} character${len === 1 ? '' : 's'} entered`;
        counter.style.color = len === 0 ? 'gray' : (len < (field.min || 1) ? 'red' : 'green');
    },

    handleNumberInput(e, key, mode = 'main') {
        const field = schema.fields[key];
        if (!field) return;

        const limit = field.maxLength || field.exactLength || 50;
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, limit);

        if (mode !== 'main') return;

        const counterId = field.counterId || schema.counters[key];
        if (!counterId) return;

        const counter = document.getElementById(counterId);
        if (!counter) return;

        const len = e.target.value.length;
        counter.textContent = `${len} digit${len === 1 ? '' : 's'} entered`;

        if (len === 0) {
            counter.style.color = 'gray';
        } else if (field.exactLength) {
            counter.style.color = len === field.exactLength ? 'green' : 'red';
        } else {
            counter.style.color = 'green';
        }
    },

    handlePasswordInput(e, mode = 'main') {
        const field = schema.fields.password;

        e.target.value = e.target.value
            .replace(/\s/g, '')
            .slice(0, field.maxLength || 50);

        if (mode !== 'main') return;

        const pass = e.target.value;
        updatePasswordStrengthUI(pass);

        const counter = document.getElementById(schema.counters.password);
        if (!counter) return;

        counter.textContent = `${pass.length} character${pass.length !== 1 ? '' : 's'} entered`;
        counter.style.color = pass.length === 0 ? 'gray' : (pass.length < field.min ? 'red' : 'green');
    },

    handlePasswordMatch() {
        const passEl = document.getElementById(schema.fields.password.mainId);
        const confirmEl = document.getElementById(schema.ui.confirmPassword);
        const msg = document.getElementById(schema.ui.matchMsg);

        if (!passEl || !confirmEl || !msg) return;

        confirmEl.value = confirmEl.value.replace(/\s/g, '').slice(0, 50);

        const matched = passEl.value === confirmEl.value;

        msg.textContent = matched ? '✅ Passwords match' : '❌ Does not match';
        msg.style.color = matched ? 'green' : 'red';
    },

    handleAgeChange(e, mode = 'main') {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, schema.fields.age.maxLength || 3);

        const isEdit = mode === 'edit' || e.target.id === schema.fields.age.editId;
        const age = Number(e.target.value || 0);
        const isMinor = age > 0 && age < 18;

        const sectionId = isEdit ? schema.sections.guardian.edit : schema.sections.guardian.main;
        const inputId = isEdit ? schema.fields.guardian.editId : schema.fields.guardian.mainId;

        const sectionEl = document.getElementById(sectionId);
        const inputEl = document.getElementById(inputId);

        if (!sectionEl) return;

        if (isMinor) {
            sectionEl.classList.remove('hidden');
        } else {
            sectionEl.classList.add('hidden');
            if (inputEl) inputEl.value = '';
        }
    },

    handleRelStatusChange(e, mode = 'main') {
        const isMarried = e.target.value === 'married';
        const isEdit = mode === 'edit' || e.target.id === schema.fields.relstatus.editId;

        const sectionId = isEdit ? schema.sections.spouse.edit : schema.sections.spouse.main;
        const inputId = isEdit ? schema.fields.spouse.editId : schema.fields.spouse.mainId;

        const sectionEl = document.getElementById(sectionId);
        const inputEl = document.getElementById(inputId);

        if (!sectionEl) return;

        if (isMarried) {
            sectionEl.classList.remove('hidden');
        } else {
            sectionEl.classList.add('hidden');
            if (inputEl) inputEl.value = '';
        }
    },

    toggleTable() {
        state.isTableVisible = !state.isTableVisible;

        const btn = document.getElementById(schema.ui.showTableBtn);
        const tableArea = document.getElementById(schema.ui.tableArea);

        if (btn) {
            btn.textContent = state.isTableVisible ? 'Hide Table' : 'Show Table of Entries';
        }

        if (tableArea) {
            tableArea.style.display = state.isTableVisible ? 'block' : 'none';
        }

        if (state.isTableVisible && state.entries.length === 0) {
            loadEntries(true);
        }
    },

    renderTable(rows = state.entries) {
        const columns = window.tableColumns || tableColumns;
        const tableArea = document.getElementById(schema.ui.tableArea);
        if (!tableArea) return;

        tableArea.style.display = 'block';
        tableArea.innerHTML = '';

        const safeRows = Array.isArray(rows) ? rows : [];
        const totalPages = Math.max(1, Math.ceil(safeRows.length / state.itemsPerPage));
        state.currentPage = Math.min(Math.max(1, state.currentPage), totalPages);

        if (safeRows.length === 0) {
            tableArea.innerHTML = `
                <div class="alert alert-info mb-0">
                    No entries found
                </div>
            `;
            return;
        }

        const start = (state.currentPage - 1) * state.itemsPerPage;
        const end = start + state.itemsPerPage;
        const paginatedRows = safeRows.slice(start, end);

        const table = document.createElement('table');
        table.className = 'table table-striped table-hover align-middle';
        table.innerHTML = `
            <thead class="table-light">
                <tr>
                    ${columns.map((col) => `<th>${col.label}</th>`).join('')}
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');

        paginatedRows.forEach((row) => {
            const tr = document.createElement('tr');

            columns.forEach((col) => {
                tr.appendChild(this.createCell(row[col.key]));
            });

            const actionTd = document.createElement('td');

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'btn btn-sm btn-outline-primary me-1';
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => window.editRow(row);

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-sm btn-outline-danger';
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = () => window.deleteRow(row.id);

            actionTd.appendChild(editBtn);
            actionTd.appendChild(deleteBtn);
            tr.appendChild(actionTd);
            tbody.appendChild(tr);
        });

        tableArea.appendChild(table);

        const nav = document.createElement('nav');
        nav.className = 'mt-3';
        nav.innerHTML = `
            <ul class="pagination justify-content-center">
                <li class="page-item ${state.currentPage === 1 ? 'disabled' : ''}">
                    <button type="button" class="page-link" onclick="window.changePage(-1)">Previous</button>
                </li>
                <li class="page-item disabled">
                    <span class="page-link">Page ${state.currentPage} of ${totalPages}</span>
                </li>
                <li class="page-item ${state.currentPage >= totalPages ? 'disabled' : ''}">
                    <button type="button" class="page-link" onclick="window.changePage(1)">Next</button>
                </li>
            </ul>
        `;
        tableArea.appendChild(nav);
    },

    createCell(text) {
        const td = document.createElement('td');
        td.textContent = text ?? '';
        return td;
    },


    getFormData(mode = 'main') {

    const data = {};

    Object.values(schema.fields).forEach(field => {

        const id =
            mode === 'main'
                ? field.mainId
                : field.editId;

        const el =
            document.getElementById(id);

        if (!el) return;

        data[field.name] =
            String(el.value ?? '').trim();
    });

    return data;
}
};




















































































































































// // public/js/ui.js
// window.ui = {
//     myModal: null,

//     async init() {

//     this.myModal = bootstrap.Modal.getOrCreateInstance(
//         document.getElementById(schema.ui.editModal)
//     );


//     [
//         schema.fields.firstname.mainId,
//         schema.fields.lastname.mainId,
//         schema.fields.email.mainId,
//         schema.fields.password.mainId,
//         schema.ui.confirmPassword,
//         schema.fields.phone.mainId
//     ].forEach(id => {

//     this.addSafeListener(
//         id,
//         'input',
//         this.handleNoSpaces
//     );
// });


//     // MAIN FORM
//     this.addSafeListener(
//         schema.fields.firstname.mainId,
//         'input',
//         this.handleNameInput
//     );

//     this.addSafeListener(
//         schema.fields.lastname.mainId,
//         'input',
//         this.handleNameInput
//     );

//     this.addSafeListener(
//         schema.fields.asin.mainId,
//         'input',
//         this.handleNumberInput
//     );

//     this.addSafeListener(
//         schema.fields.quantity.mainId,
//         'input',
//         this.handleNumberInput
//     );

//     this.addSafeListener(
//     schema.fields.phone.mainId,
//     'input',
//     this.handleNumberInput
//     );

//     this.addSafeListener(
//         schema.fields.password.mainId,
//         'input',
//         this.handlePasswordInput
//     );

//     this.addSafeListener(
//         schema.ui.confirmPassword,
//         'input',
//         this.handlePasswordMatch
//     );

//     this.addSafeListener(
//         schema.fields.age.mainId,
//         'input',
//         this.handleAgeChange
//     );

//     this.addSafeListener(
//         schema.fields.relstatus.mainId,
//         'change',
//         this.handleRelStatusChange
//     );

//     this.addSafeListener(
//         schema.fields.age.editId,
//         'input',
//     this.handleAgeChange
//     );

//     this.addSafeListener(
//         schema.fields.relstatus.editId,
//         'change',
//     this.handleRelStatusChange
//     );

//     // APP UI
//     this.addSafeListener(
//         schema.ui.showTableBtn,
//         'click',
//         ()=>this.toggleTable()
//     );

//     this.addSafeListener(
//         schema.ui.searchInput,
//         'input',
//         this.handleSearch
//     );

//     this.addSafeListener(
//         schema.ui.saveEditBtn,
//         'click',
//         () => window.handleSaveEditUI()
//     );

//     this.addSafeListener(
//         schema.ui.form,
//         'submit',
//         async (e) => {
//             e.preventDefault();
//             await window.handleSubmitUI(e);
//         }
//     );

//     this.addSafeListener(
//         schema.ui.exportBtn,
//         'click',
//         exportToCSV
//     );

//     this.addSafeListener(
//     schema.fields.phone.mainId,
//     'input',
//     this.handleNumberInput
//     );

//     const user = await api.getCurrentUser();
//         document.getElementById(schema.ui.welcomeMsg).textContent =
//         `Welcome, ${user.firstname} ${user.lastname}!`;

//     },

// addSafeListener(id, event, handler) {

//     const el = document.getElementById(id);

//     if (!el) {
//         console.warn(`Element not found: ${id}`);
//         return;
//     }

//     el.addEventListener(event, handler.bind(this));
//     },

// resetFormUI() {

//     Object.values(schema.counters).forEach(id => {
//         const el = document.getElementById(id);
//         if (!el) return;
//         el.textContent = '';
//         el.style.color = 'gray';
//     });

//     // Reset messages
//     [
//         schema.ui.strengthMsg,
//         schema.ui.matchMsg
//     ].forEach(id => {

//         const el = document.getElementById(id);

//         if (!el) return;
//         el.textContent = '';
//         el.style.color = '';
//     });

//     // Hide sections
//     [
//         schema.sections.guardian.main,
//         schema.sections.spouse.main
//     ].forEach(id => {

//         const el = document.getElementById(id);

//         if (el) el.classList.add('hidden');
//     });
//     },

//     // --- 2. UI HELPERS ---

// handleNoSpaces(e) {
//     e.target.value =
//         e.target.value.replace(/\s/g, '');
// },

// handleSearch(e) {
//     const term = e.target.value.toLowerCase();
//     const filtered = state.entries.filter(entry => 
//         (entry.firstname || '').toLowerCase().includes(term) || 
//         (entry.lastname || '').toLowerCase().includes(term)
//     );
//     state.currentPage = 1; // Reset to page 1 for search
//     this.renderTable(filtered);
// },

// handleNameInput(e) {

//     e.target.value =
//     e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 20);;

//     const isFirst =
//         e.target.id === schema.fields.firstname.mainId;

//     const counterId = isFirst
//         ? schema.counters.firstname
//         : schema.counters.lastname;

//     const counter =
//         document.getElementById(counterId);

//     const len = e.target.value.length;

//         counter.textContent =
//         `${len} character${len !== 1 ? 's' : ''} entered`;

//     if (len === 0) {
        
//         counter.style.color = 'gray';
//         counter.textContent =
//         `${len} character entered`;
//     } else {
//         counter.style.color = len < 3 ? 'red' : 'green';
//     }
// },

// handleNumberInput(e) {

//     const { value } = e.target;

//     const isPhone =
//         e.target.id === schema.fields.phone.mainId;

//     const limit = isPhone ? 10 : 2;

//     e.target.value =
//         e.target.value
//             .replace(/\D/g, '')
//             .slice(0, limit);
    
//     // if (value < 0) {
//     //     e.target.value = 0;
//     // }

//     // if (value.length > 2) {
//     //     e.target.value.replace(/\D/g, '').slice(0, 2);
//     // }

//     const isAsin =
//         e.target.id === schema.fields.asin.mainId;
    
//     //     if (e.target.value < 0) {
//     //     e.target.value = '';
//     // }

//     const counterId = isPhone 
//         ? schema.counters.phone
//         :isAsin 
//             ? schema.counters.asin
//             : schema.counters.quantity;

//     const counter =
//         document.getElementById(counterId);
        
//     if (!counter) return;

//     const len = e.target.value.length;

//     counter.textContent =
//         `${len} digit${len === 1 ? '' : 's'} entered`;

//     if (len === 0) {
//         counter.style.color = 'gray';
//     } else {
//         counter.style.color = len <= 2 ? 'green' : 'red';
//     }
// },

// handlePasswordInput(e) {

//     e.target.value=
//         e.target.value.slice(0,20);

//     const pass = e.target.value;

//     updatePasswordStrengthUI(pass);

//     const counter = document.getElementById(
//         schema.counters.password
//     );

//     counter.textContent =
//         `${pass.length} character${pass.length !== 1 ? 's' : ''} entered`;
// },

// handlePasswordMatch() {

//     const pass = document.getElementById(
//         schema.fields.password.mainId
//     ).value;

//     const confirmEl = document.getElementById(
//         schema.ui.confirmPassword
//     );

//     confirmEl.value =
//         confirmEl.value.slice(0, 20);

//     const confirm = confirmEl.value;

//     const msg = document.getElementById(
//         schema.ui.matchMsg
//     );

//     const matched = pass === confirm;

//     msg.textContent = matched
//         ? '✅ Passwords match'
//         : '❌ Does not match';

//     msg.style.color = matched
//         ? 'green'
//         : 'red';
// },

// handleAgeChange(e) {

//     e.target.value =
//     e.target.value.replace(/\D/g, '').slice(0, 3);

//     if (e.target.value < 0) {
//         e.target.value = '';
//     }

//     const isEdit =
//         e.target.id === schema.fields.age.editId;

//     const age = Number(e.target.value);

//     const isMinor = age < 18 && age > 0;

//     const sectionId = isEdit
//         ? schema.sections.guardian.edit
//         : schema.sections.guardian.main;

//     const inputId = isEdit
//         ? schema.fields.guardian.editId
//         : schema.fields.guardian.mainId;

//     const sectionEl =
//         document.getElementById(sectionId);

//     const inputEl =
//         document.getElementById(inputId);

//     if (isMinor) {
//         sectionEl.classList.remove('hidden');
//     } else {
//         sectionEl.classList.add('hidden');

//         if (inputEl) {
//             inputEl.value = '';
//         }
//     }
// },

// handleRelStatusChange(e) {

//     const isMarried =
//         e.target.value === 'married';

//     const isEdit =
//         e.target.id === schema.fields.relstatus.editId;

//     const sectionId = isEdit
//         ? schema.sections.spouse.edit
//         : schema.sections.spouse.main;

//     const inputId = isEdit
//         ? schema.fields.spouse.editId
//         : schema.fields.spouse.mainId;

//     const sectionEl =
//         document.getElementById(sectionId);

//     const inputEl =
//         document.getElementById(inputId);

//     if (isMarried) {
//         sectionEl.classList.remove('hidden');
//     } else {
//         sectionEl.classList.add('hidden');

//         if (inputEl) {
//             inputEl.value = '';
//         }
//     }
// },

// toggleTable() {
//         state.isTableVisible = !state.isTableVisible;
//         const btn = document.getElementById(schema.ui.showTableBtn);
//         const tableArea = document.getElementById(schema.ui.tableArea);
//         btn.textContent = state.isTableVisible ? "Hide Table" : "Show Table of Entries";
//         tableArea.style.display = state.isTableVisible ? "block" : "none";
//         if (state.isTableVisible && state.entries.length === 0) loadEntries();
//     },

//         // --- 3. RENDER TABLE ---

// renderTable(rows) {
//     const start = (state.currentPage - 1) * state.itemsPerPage;
//     const end = start + state.itemsPerPage;
//     const paginatedRows = rows.slice(start, end);
//     const totalPages = Math.ceil(rows.length / state.itemsPerPage);

//     const tableArea = document.getElementById(schema.ui.tableArea   );
//     tableArea.innerHTML = '';
    
//     const table = document.createElement('table');
//     table.className = 'table table-striped table-hover align-middle';
//     table.innerHTML = `<thead class="table-light"><tr>${tableColumns.map(col => `<th>${col.label}</th>`).join('')}<th>Actions</th></tr></thead><tbody></tbody>`;
    
//     const tbody = table.querySelector('tbody');
//     paginatedRows.forEach(row => {
//         const tr = document.createElement('tr');
//         tableColumns.forEach(col => tr.appendChild(this.createCell(row[col.key])));
        
//         const actionTd = document.createElement('td');
//         const editBtn = document.createElement('button');
//         editBtn.className = 'btn btn-sm btn-outline-primary me-1';
//         editBtn.textContent = 'Edit';
//         editBtn.onclick = () => window.editRow(row); 
        
//         const deleteBtn = document.createElement('button');
//         deleteBtn.className = 'btn btn-sm btn-outline-danger';
//         deleteBtn.textContent = 'Delete';
//         deleteBtn.onclick = () => window.deleteRow(row.id);
        
//         actionTd.appendChild(editBtn); actionTd.appendChild(deleteBtn);
//         tr.appendChild(actionTd);
//         tbody.appendChild(tr);
//     });
//     tableArea.appendChild(table);

// // PAGINATION
//     const nav = document.createElement('nav');
//     nav.className = 'mt-3';
//     nav.innerHTML = `
//         <ul class="pagination justify-content-center">
//             <li class="page-item ${state.currentPage === 1 ? 'disabled' : ''}"><button class="page-link" onclick="window.changePage(-1)">Previous</button></li>
//             <li class="page-item disabled"><span class="page-link">Page ${state.currentPage} of ${totalPages || 1}</span></li>
//             <li class="page-item ${state.currentPage >= totalPages ? 'disabled' : ''}"><button class="page-link" onclick="window.changePage(1)">Next</button></li>
//         </ul>`;
//     tableArea.appendChild(nav);

// },
// createCell(text) {
//     const td = document.createElement('td');
//     td.textContent = text || ''; 
//     return td;
// },

// getFormData(mode = 'main') {

//     const data = {};

//     Object.values(schema.fields).forEach(field => {

//         const id = mode === 'main'
//             ? field.mainId
//             : field.editId;

//         const el = document.getElementById(id);

//         if (!el) return;

//         data[field.name] = el.value.trim();
//     });

//     return data;
// }
// };