// public/js/schema.js

window.schema = {
    fields: {
        firstname: {
            name: 'fn01',
            db: 'firstname',
            mainId: 'main_firstname',
            editId: 'edit_firstname',
            label: 'First Name',
            kind: 'name',
            required: true,
            min: 3,
            maxLength: 20,
            allowSpaces: false,
            counterId: 'fnameCount'
        },

        lastname: {
            name: 'fn02',
            db: 'lastname',
            mainId: 'main_lastname',
            editId: 'edit_lastname',
            label: 'Last Name',
            kind: 'name',
            required: true,
            min: 3,
            maxLength: 20,
            allowSpaces: false,
            counterId: 'lnameCount'
        },

        asin: {
            name: 'number1',
            db: 'asin',
            mainId: 'main_asin',
            editId: 'edit_asin',
            label: 'ASIN',
            kind: 'digits',
            required: true,
            exactLength: 2,
            maxLength: 2,
            min: 0,
            max: 99,
            counterId: 'numCount'
        },

        password: {
            name: 'password01',
            db: 'inpass',
            mainId: 'main_inpass',
            editId: 'edit_inpass',
            label: 'Password',
            kind: 'password',
            required: true,
            min: 8,
            maxLength: 50,
            allowSpaces: false,
            counterId: 'pwdCount'
        },

        email: {
            name: 'email01',
            db: 'email',
            mainId: 'main_email',
            editId: 'edit_email',
            label: 'Email',
            kind: 'email',
            required: true,
            maxLength: 254,
            allowSpaces: false
        },

        phone: {
            name: 'phone01',
            db: 'phone',
            mainId: 'main_phone',
            editId: 'edit_phone',
            label: 'Phone',
            kind: 'digits',
            required: true,
            exactLength: 10,
            maxLength: 10,
            regex: /^\d{10}$/,
            counterId: 'phoneCounter'
        },

        quantity: {
            name: 'quantity01',
            db: 'quantity',
            mainId: 'main_quantity',
            editId: 'edit_quantity',
            label: 'Quantity',
            kind: 'digits',
            required: true,
            exactLength: 2,
            maxLength: 2,
            min: 0,
            max: 99,
            counterId: 'quantityCount'
        },

        age: {
            name: 'age',
            db: 'age',
            mainId: 'main_age',
            editId: 'edit_age',
            label: 'Age',
            kind: 'digits',
            required: true,
            maxLength: 3,
            min: 0,
            max: 999
        },

        guardian: {
            name: 'guardian',
            db: 'guardian',
            mainId: 'main_guardian',
            editId: 'edit_guardian',
            label: 'Guardian',
            kind: 'name',
            required: false,
            min: 3,
            maxLength: 50,
            allowSpaces: false
        },

        relstatus: {
            name: 'relstatus',
            db: 'relstatus',
            mainId: 'main_relstatus',
            editId: 'edit_relstatus',
            label: 'Relationship Status',
            kind: 'select',
            required: true
        },

        spouse: {
            name: 'spousename',
            db: 'spousename',
            mainId: 'main_spousename',
            editId: 'edit_spousename',
            label: 'Spouse Name',
            kind: 'name',
            required: false,
            min: 3,
            maxLength: 50,
            allowSpaces: false
        }
    },

    ui: {
        form: 'myForm',
        submitBtn: 'sbutt1',
        showTableBtn: 'main_showTableBtn',
        exportBtn: 'main_exportBtn',
        searchInput: 'main_search',
        tableArea: 'tableArea',
        message: 'msg',
        welcomeMsg: 'welcomeMsg',
        editModal: 'editModal',
        saveEditBtn: 'saveEditBtn',
        editId: 'editId',
        confirmPassword: 'main_confirminpass',
        strengthMsg: 'strengthMsg',
        matchMsg: 'matchMsg'
    },

    sections: {
        guardian: {
            main: 'main_guardiansection',
            edit: 'edit_guardiansection'
        },

        spouse: {
            main: 'main_spousesection',
            edit: 'edit_spousesection'
        }
    },

    counters: {
        firstname: 'fnameCount',
        lastname: 'lnameCount',
        asin: 'numCount',
        password: 'pwdCount',
        quantity: 'quantityCount',
        phone: 'phoneCounter'
    },

    errors: {
        firstname: 'firstErr',
        lastname: 'lastErr',
        asin: 'numErr',
        password: 'pwdErr',
        email: 'emailErr',
        phone: 'phoneErr',
        quantity: 'quantityErr',
        age: 'ageErr',
        guardian: 'guardianErr',
        relstatus: 'relErr',
        spouse: 'spouseErr'
    }
};






































































































// // public/js/schema.js

// window.schema = {
//     fields: {

//         firstname: {
//             name: 'fn01',
//             db: 'firstname',
//             mainId: 'main_firstname',
//             editId: 'edit_firstname',
//             label: 'First Name',
//             min: 3
//         },

//         lastname: {
//             name: 'fn02',
//             db: 'lastname',
//             mainId: 'main_lastname',
//             editId: 'edit_lastname',
//             label: 'Last Name',
//             min: 3
//         },

//         asin: {
//             name: 'number1',
//             db: 'asin',
//             mainId: 'main_asin',
//             editId: 'edit_asin',
//             label: 'ASIN',
//             length: 2,
//             isNum: true
//         },

//         password: {
//             name: 'password01',
//             db: 'inpass',
//             mainId: 'main_inpass',
//             editId: 'edit_inpass',
//             label: 'Password'
//         },

//         email: {
//             name: 'email01',
//             db: 'email',
//             mainId: 'main_email',
//             editId: 'edit_email',
//             label: 'Email'
//         },

//         phone: {
//             name: 'phone01',
//             db: 'phone',
//             mainId: 'main_phone',
//             editId: 'edit_phone',
//             label: 'Phone',
//             regex: /^\d{10}$/
//         },

//         quantity: {
//             name: 'quantity01',
//             db: 'quantity',
//             mainId: 'main_quantity',
//             editId: 'edit_quantity',
//             label: 'Quantity',
//             length: 2,
//             isNum: true
//         },

//         age: {
//             name: 'age',
//             db: 'age',
//             mainId: 'main_age',
//             editId: 'edit_age',
//             label: 'Age'
//         },

//         guardian: {
//             name: 'guardian',
//             db: 'guardian',
//             mainId: 'main_guardian',
//             editId: 'edit_guardian',
//             label: 'Guardian'
//         },

//         relstatus: {
//             name: 'relstatus',
//             db: 'relstatus',
//             mainId: 'main_relstatus',
//             editId: 'edit_relstatus',
//             label: 'Relationship Status'
//         },

//         spouse: {
//             name: 'spousename',
//             db: 'spousename',
//             mainId: 'main_spousename',
//             editId: 'edit_spousename',
//             label: 'Spouse Name'
//         }
//     },


// ui: {

//     form: 'myForm',

//     submitBtn: 'sbutt1',

//     showTableBtn: 'main_showTableBtn',

//     exportBtn: 'main_exportBtn',

//     searchInput: 'main_search',

//     tableArea: 'tableArea',

//     message: 'msg',

//     welcomeMsg: 'welcomeMsg',

//     editModal: 'editModal',

//     saveEditBtn: 'saveEditBtn',

//     editId: 'editId',

//     confirmPassword: 'main_confirminpass',

//     strengthMsg: 'strengthMsg',

//     matchMsg: 'matchMsg'
// },

// sections: {

//     guardian: {
//         main: 'main_guardiansection',
//         edit: 'edit_guardiansection'
//     },

//     spouse: {
//         main: 'main_spousesection',
//         edit: 'edit_spousesection'
//     }
// },

// counters: {

//     firstname: 'fnameCount',

//     lastname: 'lnameCount',

//     asin: 'numCount',

//     password: 'pwdCount',

//     quantity: 'quantityCount',

//     phone: 'phoneCounter',
// },

// errors: {

//     firstname: 'firstErr',

//     lastname: 'lastErr',

//     asin: 'numErr',

//     password: 'pwdErr',

//     email: 'emailErr',

//     phone: 'phoneErr',

//     quantity: 'quantityErr',

//     age: 'ageErr',

//     guardian: 'guardianErr',

//     relstatus: 'relErr',

//     spouse: 'spouseErr'
// }

// };