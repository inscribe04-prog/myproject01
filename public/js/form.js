// public/js/form.js
console.log('form.js loaded (Final Stable Version)');

// 1. STATE & API
const state = {
    entries: [],
    currentPage: 1,
    itemsPerPage: 3,
    isTableVisible: false,
    searchTimer: null
};

let myModal;

const tableColumns = [
    { label: 'ID', key: 'id' },
    ...Object.values(schema.fields).map((field) => ({
        label: field.label,
        key: field.db
    }))
];

window.tableColumns = tableColumns;

async function ensureEntriesLoaded() {
    if (!state.entries.length) {
        state.entries = await api.getEntries();
    }
    return state.entries;
}

async function loadEntries(render = false) {
    const tableArea = document.getElementById(schema.ui.tableArea);
    if (render && tableArea) {
        tableArea.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
    }

    try {
        state.entries = await api.getEntries();
        if (render) {
            ui.renderTable(state.entries);
        }
        return state.entries;
    } catch (err) {
        console.error('API LOAD ERROR:', err);
        if (tableArea) {
            tableArea.innerHTML = `<div class="alert alert-danger">Failed to load data. ${err.message}</div>`;
        }
        return [];
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    ui.clearErrors();

    const data = ui.getFormData('main');
    const errors = validators.getErrors(data);

    const confirm = document.getElementById(schema.ui.confirmPassword)?.value.trim() || '';
    if (confirm !== (document.getElementById(schema.fields.password.mainId)?.value.trim() || '')) {
        errors.password = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
        ui.showErrors(errors);

        const msgEl = document.getElementById(schema.ui.message);
        if (msgEl) {
            msgEl.textContent = '❌ Please fix the highlighted fields.';
            msgEl.className = 'fw-bold mt-3 text-danger';
        }
        return;
    }

    // await ensureEntriesLoaded();

    // const duplicate = state.entries.some((row) => {
    //     return row.email === data.email01 || row.phone === data.phone01;
    // });

    // if (duplicate) {
    //     ui.showErrors({
    //         email: 'Email or phone already exists'
    //     });

    //     const msgEl = document.getElementById(schema.ui.message);
    //     if (msgEl) {
    //         msgEl.textContent = '❌ Duplicate entry found.';
    //         msgEl.className = 'fw-bold mt-3 text-danger';
    //     }
    //     return;
    // }

    if (await api.create(data)) {
        const msgEl = document.getElementById(schema.ui.message);
        if (msgEl) {
            msgEl.textContent = '✅ Saved successfully!';
            msgEl.className = 'fw-bold mt-3 text-success';
        }

        document.getElementById(schema.ui.form).reset();
        ui.resetFormUI();

        state.currentPage = 1;
        await loadEntries(state.isTableVisible);
    } else {
        const msgEl = document.getElementById(schema.ui.message);
        if (msgEl) {
            msgEl.textContent = '❌ Save failed.';
            msgEl.className = 'fw-bold mt-3 text-danger';
        }
    }
}

async function handleSaveEdit() {
    const id = document.getElementById(schema.ui.editId).value;
    const data = ui.getFormData('edit');
    const errors = validators.getErrors(data);

    if (Object.keys(errors).length > 0) {
        alert('Errors:\n' + Object.values(errors).join('\n'));
        return;
    }

    // await ensureEntriesLoaded();

    // const duplicate = state.entries.some((row) => {
    //     return String(row.id) !== String(id) &&
    //         (row.email === data.email01 || row.phone === data.phone01);
    // });

    // if (duplicate) {
    //     alert('Duplicate email or phone already exists.');
    //     return;
    // }

    if (await api.update(id, data)) {
        if (ui.myModal) ui.myModal.hide();
        await loadEntries(state.isTableVisible);
    } else {
        alert('Update failed');
    }
}

async function exportToCSV() {
    // await ensureEntriesLoaded();

    if (state.entries.length === 0) {
        alert('No data to export!');
        return;
    }

    const headers = tableColumns.map((col) => col.label);
    const csvRows = [headers.join(',')];

    for (const row of state.entries) {
        const values = tableColumns.map((col) => {
            const escaped = String(row[col.key] ?? '').replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'entries_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
}

function editRow(row) {
    Object.values(schema.fields).forEach((field) => {
        const el = document.getElementById(field.editId);
        if (!el) return;
        el.value = String(row[field.db] ?? '');
    });

    const editIdEl = document.getElementById(schema.ui.editId);
    if (editIdEl) editIdEl.value = row.id;

    ui.handleAgeChange({
        target: document.getElementById(schema.fields.age.editId)
    }, 'edit');

    ui.handleRelStatusChange({
        target: document.getElementById(schema.fields.relstatus.editId)
    }, 'edit');

    if (ui.myModal) ui.myModal.show();
}

async function deleteRow(id) {
    if (!confirm('Are you sure?')) return;

    if (await api.delete(id)) {
        await loadEntries(state.isTableVisible);
    }
}

function changePage(direction) {
    state.currentPage = Math.max(1, state.currentPage + direction);
    ui.renderTable(state.entries);
}

function updatePasswordStrengthUI(val) {
    const strengthMsg = document.getElementById(schema.ui.strengthMsg);
    if (!strengthMsg) return;

    if (val.length === 0) {
        strengthMsg.textContent = '';
        return;
    }

    const score = [
        /[A-Z]/.test(val),
        /[a-z]/.test(val),
        /\d/.test(val),
        /[!@#$%^&*]/.test(val),
        val.length >= 8
    ].filter(Boolean).length;

    if (score < 3) {
        strengthMsg.textContent = 'Weak';
        strengthMsg.className = 'text-danger small fw-bold';
    } else if (score < 5) {
        strengthMsg.textContent = 'Good';
        strengthMsg.className = 'text-warning small fw-bold';
    } else {
        strengthMsg.textContent = 'Strong';
        strengthMsg.className = 'text-success small fw-bold';
    }
}

window.editRow = editRow;
window.deleteRow = deleteRow;
window.changePage = changePage;
window.handleSubmitUI = handleSubmit;
window.handleSaveEditUI = handleSaveEdit;
window.exportToCSV = exportToCSV;
window.loadEntries = loadEntries;

document.addEventListener('DOMContentLoaded', async () => {
    await ui.init();
});











































































































// // public/js/form.js
// // ─────────────────────────────────────────────
// // All JavaScript for form.htm lives here.
// // Linked in form.htm as:
// //   <script src="/js/form.js"></script>
// // Sections:
// //   1. Live input listeners (counters, show/hide)
// //   2. Submit handler (validation + fetch)
// //   3. CRUD table (loadEntries, editRow, deleteRow)
// //   4. DOM Construction Refactor (renderTable)
// // ─────────────────────────────────────────────


// // public/js/form.js
// console.log("form.js loaded (Final Stable Version)");

// // 1. STATE & API
// const state = {
//     entries: [],
//     currentPage: 1,
//     itemsPerPage: 3,
//     isTableVisible: false
// };

// // --- MODAL INITIALIZATION ---
// let myModal; // Global variable to hold the modal instance

// document.addEventListener('DOMContentLoaded', () => {
//     // Initialize the modal once the DOM is ready
//     const modalEl = document.getElementById('editModal');
//     if (modalEl) {
//         myModal = new bootstrap.Modal(modalEl);
//     }
    
//     // Initialize the UI after the modal is ready
//     // UI.init();
// });

// // 2. CONFIGURATION

// const tableColumns = Object.values(schema.fields).map(field => ({
//     label: field.label,
//     key: field.db
// }));


// // 4. UI CONTROLLER

// async function handleSubmit(e) {
//         e.preventDefault();
//         const msgEl = document.getElementById('msg'); // Reference the element
        
//         document.querySelectorAll('.text-danger').forEach(el => el.textContent = '');
//         const d = ui.getFormData('main');
//         const errors = validators.getErrors(d);
//         if (Object.keys(errors).length > 0) {
//             document.getElementById('msg').textContent = '❌ ' + Object.values(errors)[0];
//             msgEl.classList.add('text-danger');
//             return;
//         }
//         if (await api.create(d)) {
//             document.getElementById('msg').textContent = '✅ Saved successfully!';
//             msgEl.classList.add('text-success');
//             document.getElementById('myForm').reset();
//             loadEntries();
//             document.getElementById(schema.ui.form).reset();
//         }
//     }

//     async function handleSaveEdit() {
//         const id = document.getElementById('editId').value;
//         const d = ui.getFormData('edit');
//         const errors = validators.getErrors(d);
//         if (Object.keys(errors).length > 0) return alert("Errors:\n" + Object.values(errors).join('\n'));
//         if (await api.update(id, d)) {
//             if (myModal) myModal.hide(); 
//             loadEntries();
//         }
//     }


//     function exportToCSV() {
//         if (state.entries.length === 0) return alert("No data to export!");
        
//         const headers = tableColumns.map(col => col.label);
//         const csvRows = [headers.join(',')];
        
//         for (const row of state.entries) {
//             const values = tableColumns.map(col => {
//                 const escaped = ('' + (row[col.key] || '')).replace(/"/g, '\\"');
//                 return `"${escaped}"`;
//             });
//             csvRows.push(values.join(','));
//         }
        
//         const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.setAttribute('href', url);
//         a.setAttribute('download', 'entries_export.csv');
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//     }

// // 5. CRUD & HELPERS
// async function loadEntries() {
//     const tableArea = document.getElementById('tableArea');
//     tableArea.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
//     try {
//         state.entries = await api.getEntries();
//         // ui.renderTable(state.entries);
//         ui.renderTable(state.entries, state, tableColumns);
//     } catch (err) {
//         console.error("API LOAD ERROR:", err);
//         tableArea.innerHTML = `<div class="alert alert-danger">Failed to load data. ${err.message}</div>`;
//     }
// }

// function editRow(row) {

//     Object.values(schema.fields).forEach(field => {

//         const el = document.getElementById(field.editId);

//         if (!el) return;

//         el.value = row[field.db] || '';
//     });

//     document.getElementById('editId').value = row.id;

//     ui.handleAgeChange({
//         target: document.getElementById(schema.fields.age.editId)
//     });

//     ui.handleRelStatusChange({
//         target: document.getElementById(schema.fields.relstatus.editId)
//     });

//     ui.myModal.show();
// }

// async function deleteRow(id) {
//     if (!confirm('Are you sure?')) return;
//     if (await api.delete(id)) loadEntries();
// }

// function changePage(direction) {
//     state.currentPage += direction;
//     // renderTable(state.entries);
//     // ui.renderTable(state.entries, state, window.tableColumns);
//     ui.renderTable(state.entries);
// }
// window.changePage = changePage; // Expose to global for inline onclick

// function updatePasswordStrengthUI(val) {
//     const strengthMsg = document.getElementById('strengthMsg');
//     if (!strengthMsg) return;

//     if (val.length === 0) { strengthMsg.textContent = ""; return; }

//     const score = [
//         /[A-Z]/.test(val), // Upper
//         /[a-z]/.test(val), // Lower
//         /\d/.test(val),    // Number
//         /[!@#$%^&*]/.test(val), // Special
//         val.length >= 8    // Length
//     ].filter(Boolean).length;

//     if (score < 3) {
//         strengthMsg.textContent = "Weak";
//         strengthMsg.className = "text-danger small fw-bold";
//     } else if (score < 5) {
//         strengthMsg.textContent = "Good";
//         strengthMsg.className = "text-warning small fw-bold";
//     } else {
//         strengthMsg.textContent = "Strong";
//         strengthMsg.className = "text-success small fw-bold";
//     }
// }

// window.editRow = editRow;
// window.deleteRow = deleteRow;

// window.handleSubmitUI = handleSubmit;
// window.handleSaveEditUI = handleSaveEdit;
// window.exportToCSV = exportToCSV;

// document.addEventListener('DOMContentLoaded', () => {
//     ui.init(); // Use the lowercase 'ui' from ui.js
// });
