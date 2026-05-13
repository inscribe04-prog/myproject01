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
    }
};

