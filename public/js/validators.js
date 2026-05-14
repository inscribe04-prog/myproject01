// public/js/validators.js
window.validators = {
    getErrors(d) {
        const errors = {};

        Object.entries(schema.fields).forEach(([key, field]) => {
            const raw = d[field.name] ?? '';
            const value = String(raw).trim();

            if (field.required && !value) {
                errors[key] = `${field.label} is required`;
                return;
            }

            if (!value) return;

            if (field.kind === 'name') {
                if (!/^[A-Za-z]+$/.test(value)) {
                    errors[key] = `${field.label} can contain letters only`;
                    return;
                }
            }

            if (field.kind === 'digits') {
                if (!/^\d+$/.test(value)) {
                    errors[key] = `${field.label} must contain digits only`;
                    return;
                }
            }

            if (field.kind === 'email') {
                const emailErr = utils.validateAuthInput(value, 'email');
                if (emailErr) {
                    errors[key] = emailErr;
                    return;
                }
            }

            if (field.kind === 'password') {
                const passErr = utils.validatePassword(value);
                if (passErr) {
                    errors[key] = passErr;
                    return;
                }
            }

            if (field.min && value.length < field.min) {
                errors[key] = `${field.label} should be minimum ${field.min} characters`;
                return;
            }

            if (field.exactLength && value.length !== field.exactLength) {
                errors[key] = `${field.label} must be exactly ${field.exactLength} digits`;
                return;
            }

            if (field.maxLength && value.length > field.maxLength) {
                errors[key] = `${field.label} must be at most ${field.maxLength} characters`;
                return;
            }

            if (field.max !== undefined && Number(value) > field.max) {
                errors[key] = `${field.label} must be at most ${field.max}`;
                return;
            }

            if (field.regex && !field.regex.test(value)) {
                errors[key] = `Invalid ${field.label}`;
            }
        });

        const age = Number(d.age ?? 0);
        if (age < 18 && !String(d.guardian ?? '').trim()) {
            errors.guardian = 'Guardian name is required for minors';
        }

        if (String(d.relstatus ?? '') === 'married' && !String(d.spousename ?? '').trim()) {
            errors.spouse = 'Spouse name is required';
        }

        return errors;
    }
};







































































































// // public/js/validators.js
// window.validators = {
//     // rules: {
//     //     fn01: { min: 3, msg: "First Name should be minimum 3 chars" },
//     //     fn02: { min: 3, msg: "Last Name should be minimum 3 chars" },
//     //     number1: { length: 2, isNum: true, msg: "ASIN value is required and should be a 2-digit number" },
//     //     quantity01: { length: 2, isNum: true, msg: "Quantity must be a number and should be a 2-digit number" },
//     //     phone01: { regex: /^\d{10}$/, msg: "Phone Number should be 10-digits only" },
//     //     age: { max: 999, min: 0, msg: "Enter a valid age (0-999)" }
//     // },

//     // getErrors(d) {
//     //     let err = {};
//     //     Object.keys(this.rules).forEach(key => {
//     //         const rule = this.rules[key];
//     //         const val = String(d[key] || '');
//     //         if (rule.min && val.length < rule.min) err[key] = rule.msg;
//     //         if (rule.length && val.length !== rule.length) err[key] = rule.msg;
//     //         if (rule.isNum && (isNaN(val) || Number(val) < 0)) err[key] = rule.msg;
//     //         if (rule.regex && !rule.regex.test(val)) err[key] = rule.msg;
//     //         if (rule.max !== undefined && Number(val) > rule.max) err[key] = rule.msg;
//     //     });

//     //     const emailErr = utils.validateAuthInput(d.email01, 'email');
//     //     if (emailErr) err.email = emailErr;
//     //     const passErr = utils.validatePassword(d.password01);
//     //     if (passErr) err.password01 = passErr;
        
//     //     if (Number(d.age) < 18 && !d.guardian) err.guardian = "Guardian name is required for minors";
//     //     if (d.relstatus === 'married' && !d.spousename) err.spouse = "Spouse name required";
//     //     return err;
//     // }


//     getErrors(d) {

//     let err = {};

//     Object.values(schema.fields).forEach(field => {

//         const val =
//             String(d[field.name] || '');

//         // Minimum Length
//         if (field.min && val.length < field.min) {

//             err[field.name] =
//                 `${field.label} should be minimum ${field.min} chars`;
//         }

//         // Exact Length
//         if (field.length && val.length !== field.length) {

//             err[field.name] =
//                 `${field.label} should be ${field.length} digits`;
//         }

//         // Number Validation
//         if (field.isNum) {

//             if (isNaN(val) || Number(val) < 0) {

//                 err[field.name] =
//                     `${field.label} must be a valid number`;
//             }
//         }

//         // Regex
//         if (field.regex && !field.regex.test(val)) {

//             err[field.name] =
//                 `Invalid ${field.label}`;
//         }
//     });

//     // Email
//     const emailErr =
//         utils.validateAuthInput(
//             d.email01,
//             'email'
//         );

//     if (emailErr) {
//         err.email01 = emailErr;
//     }

//     // Password
//     const passErr =
//         utils.validatePassword(
//             d.password01
//         );

//     if (passErr) {
//         err.password01 = passErr;
//     }

//     // Guardian
//     if (
//         Number(d.age) < 18 &&
//         !d.guardian
//     ) {

//         err.guardian =
//             'Guardian name required for minors';
//     }

//     // Spouse
//     if (
//         d.relstatus === 'married' &&
//         !d.spousename
//     ) {

//         err.spousename =
//             'Spouse name required';
//     }

//     return err;
// }   
// };