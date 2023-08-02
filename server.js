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
                ]).then(answer =>{
                    const selections = [answer.name, answer.race]
            
                    const roleSql = `SELECT roles.id, roles.title FROM roles`;
                    db.query(roleSql, (err, result)=>{
                        if (err) throw err;
                        const rolePick= result.map(({id, title})=>({ name:title, value:id}));
            
                        inquirer.prompt([{
                            type: 'list',
                            name: 'role',
                            message: "What is the employee's role?",
                            choices: rolePick
                        }
                    ]).then(roleChoice =>{
                        const role = roleChoice.role;
                        selections.push(role);
            
                          const managerSql = `SELECT * FROM employee`;
            
                          db.query(managerSql, (err, result) => {
                            if (err) throw err;
            
                            const managers = result.map(({ id, codename}) => ({ name: codename, value: id }));
            
                            inquirer.prompt([
                              {
                                type: 'list',
                                name: 'manager',
                                message: "Who will oversee this operator while on the landship?",
                                choices: managers
                              }
                            ])
                              .then(managerChoice => {
                                const manager = managerChoice.manager;
                            selections.push(manager);
            
                                const sql = `INSERT INTO employee (codename, race, role_id, manager_id)
                                VALUES (?, ?, ?, ?)`;
            
                                db.query(sql,selections, (err, result) => {
                                if (err) throw err;
                                console.log(`Operator ${answer.name} added to the database, Doctor.`)
                                startPRTS();
                          });
                        });
                      });
                    });
                 });
              });
            
        } else if (answers.start === 'Update Employee Role') {
            const employeeSql = `SELECT * FROM employee`;

            db.query(employeeSql, (err, result) => {
              if (err) throw err; 
            
            const employees = result.map(({ id, codename }) => ({ name: codename, value: id }));
            
              inquirer.prompt([
                {
                  type: 'list',
                  name: 'name',
                  message: 'Which operator would you like to reassign?',
                  choices: employees
                }
              ])
                .then(answer => {
                  const selections =[answer.name]
            
                  const roleSql = `SELECT * FROM roles`;
            
                  db.query(roleSql, (err, result) => {
                    if (err) throw err; 
            
                    const rolePick = result.map(({ id, title }) => ({ name: title, value: id }));
                    
                      inquirer.prompt([
                        {
                          type: 'list',
                          name: 'role',
                          message: "What will the operator's new position be while on the landship?",
                          choices: rolePick
                        }
                      ])
                          .then(roleChoice => {
                          const role = roleChoice.role;
                          selections.push(role); 
                          
                          let employee = selections[0]
                          selections[0] = role
                          selections[1] = employee 
                          
            
                          const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
            
                          db.query(sql, selections, (err, result) => {
                            if (err) throw err;
                          console.log(`Operator has been reassigned, Doctor.`);
                        
                          startPRTS();
                    });
                  });
                });
              });
            });
            

        } else if (answers.start === 'Log Out') {
            db.end();
            console.log('Terminating connection to the neural network...\nHave a safe day, Doctor.');
        }
    })
};