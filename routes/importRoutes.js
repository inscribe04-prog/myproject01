const express = require('express');
const router = express.Router();
const multer = require('multer');
const ExcelJS = require('exceljs');
const dbQuery = require('../config/dbHelper');


function validateRow(values, rowNumber) {
    const errors = [];

    // ADD THIS LOG TO SEE WHAT IS COMING IN
    console.log(`Row ${rowNumber} values:`, values); 

    

    const firstname = String(values[0] || '').trim();
    const lastname = String(values[1] || '').trim();
    const asin = String(values[2] || '').trim();
    if (!asin || asin.length < 2) { 
    errors.push(`Row ${rowNumber}: Invalid ASIN format`);
}
    const email = String(values[4] || '').trim();
    const phone = String(values[5] || '').trim();
    const quantity = String(values[6] || '').trim();
    const age = String(values[7] || '').trim();
    const relstatus = String(values[9] || '').trim().toLowerCase();

    if (!firstname || firstname.length < 3) errors.push(`Row ${rowNumber}: First name must be at least 3 characters`);
    if (!/^[A-Za-z]+$/.test(firstname)) errors.push(`Row ${rowNumber}: First name can only contain letters`);
    if (!lastname || lastname.length < 3) errors.push(`Row ${rowNumber}: Last name must be at least 3 characters`);
    if (!/^[A-Za-z]+$/.test(lastname)) errors.push(`Row ${rowNumber}: Last name can only contain letters`);
    if (!asin || !/^\d{2}$/.test(asin)) errors.push(`Row ${rowNumber}: ASIN must be exactly 2 digits`);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push(`Row ${rowNumber}: Invalid email`);
    if (!phone || !/^\d{10}$/.test(phone)) errors.push(`Row ${rowNumber}: Phone must be exactly 10 digits`);
    if (!quantity || !/^\d{2}$/.test(quantity)) errors.push(`Row ${rowNumber}: Quantity must be exactly 2 digits`);
    if (!age || isNaN(age) || Number(age) < 0 || Number(age) > 999) errors.push(`Row ${rowNumber}: Invalid age`);
    if (!relstatus) errors.push(`Row ${rowNumber}: Relationship status is required`);

    return errors;
}

// Store file in memory — no disk storage needed
const upload = multer({ storage: multer.memoryStorage() });

router.post('/api/import', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);

        const worksheet = workbook.worksheets[0];
        const rows = [];


//         worksheet.eachRow((row, rowNumber) => {
//     if (rowNumber === 1) {
//         console.log('Headers:', row.values);
//         return;
//     }
//     if (rowNumber === 2) {
//         console.log('First data row:', row.values);
//         return;
//     }
// });


        // first row is headers — skip it
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            console.log("Processing Row:", rowNumber, "Values:", row.values);

            const values = row.values;
            
        rows.push([
            String(values[1] || ''),   // firstname
            String(values[2] || ''),   // lastname
            String(values[3] || ''),   // asin
            String(values[4] || ''),   // inpass
            String(values[5] || ''),   // email
            String(values[6] || ''),   // phone
            String(values[7] || ''),   // quantity
            String(values[8] || ''),   // age
            String(values[9] || ''),   // guardian
            String(values[10] || '').trim().toLowerCase(), // relstatus
            String(values[11] || '')   // spousename
        ]);

        });
        if (rows.length === 0) {
            return res.status(400).json({ error: 'No data rows found in file' });
        }


const allErrors = [];
            rows.forEach((row, index) => {
            const rowErrors = validateRow(row, index + 2); // +2 because row 1 is header
            allErrors.push(...rowErrors);
        });

        console.log('Validation errors:', allErrors);
        

        if (allErrors.length > 0) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: allErrors 
            });
        }

        // Bulk insert
        const sql = `INSERT INTO form_entries 
            (firstname, lastname, asin, inpass, email, phone, quantity, age, guardian, relstatus, spousename) 
            VALUES ?`;

        await dbQuery(sql, [rows]);

        res.json({ message: `Successfully imported ${rows.length} rows` });

    } catch (err) {
        console.error('Import error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

