require('dotenv').config();
const inquirer= require('inquirer');
const db = require('./config/connection');
require('console.table');

db.connect(err => {
    if (err) throw err;
    console.log("connecting to the neural network of Rhodes Island...\nconnection established.");
 startPRTS();
});

var startPRTS = function(){
    inquirer.prompt([{
        type: 'list',
        name: 'start',
        message: 'Welcome Doctor. Please choose a command.',
        choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add A Department', 'Add A Role', 'Add An Employee', 'Update Employee Role', 'Log Out']
    }]).then((answers) => {
        if (answers.start === 'View All Departments') {
            db.query(`SELECT * FROM department`, (err, result) => {
                console.log("Viewing All Departments: ");
                console.table(result);
             startPRTS();
            });   
        } else if (answers.start === 'View All Roles') {
            db.query(`SELECT roles.id, roles.title, department.dept_name AS department, roles.salary
            FROM roles
            INNER JOIN department ON roles.department_id = department.id`, (err, result) => {
                console.log("Viewing All roles: ");
                console.table(result);
             startPRTS();
            });
        } else if (answers.start === 'View All Employees') {
            db.query(`SELECT employee.id, employee.codename, employee.race, roles.title AS position, department.dept_name AS department, roles.salary AS salary, manager.codename AS manager
            FROM employee
            LEFT JOIN roles ON employee.role_id = roles.id
            LEFT JOIN department ON roles.department_id = department.id
            LEFT JOIN employee manager ON employee.manager_id = manager.id`, (err, result) => {
                console.log("Viewing All employees: ");
                console.table(result);
             startPRTS();
            });
        } else if (answers.start === 'Add A Department') {  
            inquirer.prompt([{
                type: 'input',
                name: 'department',
                message: 'Please provide a name for the department.',
                validate: (department) =>{
                    if(!department) {
                        return 'Error! Departments need names, Doctor!';
                    }
                    return true;
                }
            }]).then((answers) =>{
                db.query(`INSERT INTO department (dept_name) VALUES (?)`,[answers.department],(err, result) =>{
                    console.log(`Created ${answers.department} and added to the database.`)
                 startPRTS();
                });
            });                 
        } else if (answers.start === 'Add A Role') {
            db.query(`SELECT * FROM department`,(err, result)=>{
                inquirer.prompt([
                    {
                    type: 'input',
                    name: 'role',
                    message: 'Please provide a name for the position.',
                    validate: (role) =>{
                        if(!role) {
                            return 'Error! Name for position is required!';
                        }
                        return true;
                        }
                    },
                    {
                        type: 'input',
                        name: 'salary',
                        message: 'what is the salary for this new position?',
                        validate: (salary) =>{
                            if(!salary) {
                                return 'Error! Salary is required, Doctor!';
                            }
                            return true;
                        }
                    },
                    {
                        type: 'list',
                        name: 'department',
                        message: 'Which department does the position belong to?',
                        choices: () => {
                            var array = [];
                            for (var i = 0; i < result.length; i++) {
                                array.push(result[i].dept_name);
                            }
                            return array;
                        }
                    
                    }]).then((answers) =>{
                       // Comparing the result and storing it into the variable
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].dept_name === answers.department) {
                            var department = result[i];
                        }
                    }

                    db.query(`INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)`, [answers.role, answers.salary, department.id], (err, result) => {
                        console.log(`Added ${answers.role} to the database.`)
                         startPRTS();
                        });
                    });  
                });  
        } else if (answers.start === 'Add An Employee') {
            db.query(`Select * FROM employee, roles`,(err, result) => {
                inquirer.prompt([
                    {
                    type: 'input',
                    name: 'name',
                    message: "Please enter the new operator's codename.",
                    validate: (name) =>{
                        if(!name) {
                            return 'Error! Codename is required for all new operators, Doctor!';
                        }
                        return true;
                        }
                    },
                    {
                        type: 'input',
                        name: 'race',
                        message: 'Please input the race for the new operator.',
                        validate: (race) =>{
                            if (!race) {
                                return "Error! Operator's race is required to provide proper support, Doctor!";
                            }
                            return true;
                        }
                    },
                    {  type: 'list',
                    name: 'role',
                    message: 'What position will this operator fill on the landship?',
                    choices: () => {
                        var array = [];
                        for (var i = 0; i < result.length; i++) {
                            array.push(result[i].title);
                        }
                        var newArray = [...new Set(array)];
                        return newArray;
                    }
                },
                {
                    // Adding Employee Manager
                    type: 'list',
                    name: 'manager',
                    message: 'Who will oversee the operator?',
                    choices: () => {
                        var array = [];
                        for (var i = 0; i < result.length; i++) {
                            array.push(result[i].codename);
                        }
                        var newArray2 = [...new Set(array)];
                        return newArray2;
                        }
                }
            ]).then((answers) => {
                // Comparing the result and storing it into the variable
                for (var i = 0; i < result.length; i++) {
                    if (result[i].title === answers.role) {
                        var role = result[i];
                    }
                }

                for (var i=0; i<result.length; i++) {
                    if (result[i].codename ===answers.manager){
                        var manager =result[i];
                    }
                }  
                db.query(`INSERT INTO employee (codename, race, role_id, manager_id) VALUES (?, ?, ?, ?)`, [answers.name, answers.race, role.id, manager.id], (err, result) => {
                    if (err) throw err;
                    console.log(`Added ${answers.name} to the database.`)
                     startPRTS();
                    });
                });                 
            });
            
        } else if (answers.start === 'Update Employee Role') {
            db.query(`SELECT * from employee, roles`,(err, result) =>{
                inquirer.prompt([{
                    type: 'list',
                    name: 'employee',
                    message: 'Which operator would you like to reassign?',
                    choices: () => {
                        var array = [];
                        for (var i = 0; i < result.length; i++) {
                            array.push(result[i].codename);
                        }
                        var employeeArray = [...new Set(array)];
                        return employeeArray;
                    }
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'What is their new position while on the landship?',
                    choices: () =>{
                        var array =[];
                        for (var i=0; i< result.length; i++) {
                            array.push(result[i].title);
                        }
                        var newArray3 = [...new Set(array)];
                        return newArray3;
                    }
                }
            ]).then((answers) =>{
                for (var i= 0; i < result.length; i++) {
                    if (result[i].codename ===answers.employee){
                        var name =result[i];
                    }
                }

                for (var i=0; i <result.length; i++) {
                    if(result[i].title === answers.role){
                        var role = result[i];
                    }
                }
                db.query(`UPDATE employee SET ? WHERE ?`, [role.id, name],(err,result)=>{
                    console.log (`Updated the role for operator ${answers.employee} in the database`)
                 startPRTS();
                });
            })
            });

        } else if (answers.start === 'Log Out') {
            db.end();
            console.log('Terminating connection to the neural network...\nHave a safe day, Doctor.');
        }
    })
};