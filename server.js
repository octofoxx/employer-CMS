require('dotenv').config();
const inquirer= require('inquirer');
const db = require('./config/connection');
require('console.table');

db.connect(err => {
    if (err) throw err;
    console.log("connection established.");
    startCMS();
});

var startCMS = function(){
    inquirer.prompt([{
        type: 'list',
        name: 'start',
        message: 'Welcome Doctor. Please choose a command.',
        choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add A Department', 'Add A Role', 'Add An Employee', 'Update An Employee Role', 'Log Out']
    }]).then((answers) => {
        if (answers.start === 'View All Departments') {
            db.query(`SELECT * FROM department`, (err, result) => {
                console.log("Viewing All Departments: ");
                console.table(result);
                startCMS();
            });   
        } else if (answers.start === 'View All Roles') {
            db.query(`SELECT * FROM roles`, (err, result) => {
                console.log("Viewing All roles: ");
                console.table(result);
                startCMS();
            });
        } else if (answers.start === 'View All Employees') {
            db.query(`SELECT * FROM employee`, (err, result) => {
                console.log("Viewing All employees: ");
                console.table(result);
                startCMS();
            });               
        };
    });
};