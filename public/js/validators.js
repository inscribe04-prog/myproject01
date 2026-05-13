// public/js/validators.js
window.validators = {
    rules: {
        fn01: { min: 3, msg: "First Name should be minimum 3 chars" },
        fn02: { min: 3, msg: "Last Name should be minimum 3 chars" },
        number1: { length: 2, isNum: true, msg: "ASIN value is required and should be a 2-digit number" },
        quantity01: { length: 2, isNum: true, msg: "Quantity must be a number and should be a 2-digit number" },
        phone01: { regex: /^\d{10}$/, msg: "Phone Number should be 10-digits only" },
        age: { max: 999, min: 0, msg: "Enter a valid age (0-999)" }
    },

    getErrors(d) {
        let err = {};
        Object.keys(this.rules).forEach(key => {
            const rule = this.rules[key];
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
};