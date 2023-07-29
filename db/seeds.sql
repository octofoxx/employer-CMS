INSERT INTO department(dept_name)
    VALUES  ("engineering"), 
            ("medical"), 
            ("logistics"), 
            ("Human Resources");


INSERT INTO roles(title, salary, department_id)
    VALUES  ("researcher", 95000.00, 1),
            ("maintenance", 80000.00, 1), 
            ("medic", 120000.00, 2), 
            ("medical lead", 300000.00, 2),
            ("messenger", 180000.00, 3),
            ("logistics lead", 250000.00, 3),
            ("legal advisor", 100000.00, 4);

INSERT INTO employee(codename, race, role_id, manager_id)
    VALUES  ("Kal'tsit", "Feline", 4, NULL), 
            ("Closure", "Sarkaz", 6, 1), 
            ("Gavial","Archosauria", 3, 1), 
            ("Penance","Lupo", 7, 1),
            ("Mayer", "Anaty", 1, 2),
        
    