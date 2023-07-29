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
            db.query(`SELECT roles.id, roles.title, department.dept_name AS department, roles.salary
            FROM roles
            INNER JOIN department ON roles.department_id = department.id`, (err, result) => {
                console.log("Viewing All roles: ");
                console.table(result);
                startCMS();
            });
        } else if (answers.start === 'View All Employees') {
            db.query(`SELECT employee.id, employee.codename, employee.race, roles.title AS position, department.dept_name AS department, roles.salary AS salary, manager.codename AS manager
            FROM employee
            LEFT JOIN roles ON employee.role_id = roles.id
            LEFT JOIN department ON roles.department_id = department.id
            LEFT JOIN employee manager ON employee.manager_id = manager.id`, (err, result) => {
                console.log("Viewing All employees: ");
                console.table(result);
                startCMS();
            });               
        };
    });
};