// public/js/api.js
window.api = {
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
    },

    async getCurrentUser() {
        const res = await fetch('/me');
        if (!res.ok) return null;
        return await res.json();
    }
};



























































// // public/js/api.js
// window.api = {
//     async getEntries() {
//         const res = await fetch('/api/entries');
//         return res.ok ? await res.json() : [];
//     },
//     async create(data) {
//         const res = await fetch('/api/entries', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//             body: new URLSearchParams(data)
//         });
//         return res.ok;
//     },
//     async update(id, data) {
//         const res = await fetch(`/api/entries/${id}`, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//             body: new URLSearchParams(data)
//         });
//         return res.ok;
//     },
//     async delete(id) {
//         const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
//         return res.ok;
//     },
//     async getCurrentUser() {

//     const res = await fetch('/me');

//     return await res.json();
//     },
// };

