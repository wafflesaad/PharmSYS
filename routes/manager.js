const express = require("express");
const router = express.Router();
const mysql = require("mysql2"); 

const connection = mysql.createConnection({
    host: 'localhost',
    user: "manager",
    password: "manager",
    database: "pharmsys"
});

connection.connect((err)=>{
    if(err){
        console.log(err);
    }
    console.log("Connected to manager connection!");

});


function QueryF(query){
    let p = new Promise((resolve, reject) =>{
        connection.query(query, (err, rows, fields) =>{
            if(err){
                reject(err);
            }
            else{
                resolve(rows);
            }
        });
    });   

    return p.then((data)=>{
        return data;
    }).catch((err)=>{
        console.log(err);
        return null;
    });

}
router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.get("/", (req,res)=>{
    res.redirect("/manager/addmed");
});
// to solve error
router.get("/addmed", (req,res)=>{
    res.render("man/addmed.ejs");
});

router.post("/addmed/add", async (req,res)=>{
    let body = req.body;
    console.log(body);

    
    if (body.medpresc != "yes" && body.medpresc != "Yes" && body.medpresc != "YES"
    && body.medpresc != "no" && body.medpresc != "No" && body.medpresc != "NO"){
        res.send(`<script>alert("Invalid input for prescription."); window.location="/manager/addmed"</script>`);
    }
    body.medpresc = body.medpresc.toLowerCase();
    body.medpresc = body.medpresc.charAt(0).toUpperCase() + body.medpresc.slice(1);
    
    //check if med already exists

    let checkMedQuery = `SELECT * FROM medication WHERE Name = "${body.medname}"`;
    let checkMed = await QueryF(checkMedQuery);
    if(checkMed.length != 0){
        res.send(`<script>alert("Medicine already exists."); window.location="/manager/addmed"</script>`);
        return;
    }

    //check if manufacturer exists
    let checkManQuery = `SELECT * FROM manufacturer WHERE Name = "${body.medman}"`;
    let checkMan = await QueryF(checkManQuery);
    if(checkMan.length == 0){
        let addManQuery = `INSERT INTO manufacturer (Name, ContactNo, Email) VALUES ("${body.medman}", "555-555-555", "sample@mail.com");`;
        let checManresult = await QueryF(addManQuery);
        if (checManresult == null || checManresult.affectedRows == 0) {
            res.send(`<script>alert("Error adding manufacturer."); window.location="/manager/addmed"</script>`);
            return;            
        }
    }

    //getting manufacturer id
    let getManQuery = `SELECT ManufacturerID FROM manufacturer WHERE Name = "${body.medman}"`;
    let getMan = await QueryF(getManQuery);
    if(!getMan || getMan.length == 0){
        res.send(`<script>alert("Error getting manufacturer."); window.location="/manager/addmed"</script>`);
        return;
    }

    manID = getMan[0].ManufacturerID;

    // Add the medicine

    let addMedQuery = `INSERT INTO medication (Name, Description,ManufacturerID, PricePerUnit, PrescriptionRequired) VALUES ("${body.medname}", "${body.meddesc}", "${manID}", "${body.medprice}", "${body.medpresc}");`;
    let addMed = await QueryF(addMedQuery);
    if(!addMed || addMed.affectedRows == 0){
        res.send(`<script>alert("Error adding medicine."); window.location="/manager/addmed"</script>`);
        return;
    }

    // add the stock
    let getMedIDQuery = `SELECT MedicationID FROM medication WHERE Name = "${body.medname}"`;
    let getMedID = await QueryF(getMedIDQuery);
    if(!getMedID || getMedID.length == 0){
        res.send(`<script>alert("Error getting medicine ID."); window.location="/manager/addmed"</script>`);
        return;
    }
    let medID = getMedID[0].MedicationID;
    let stockQuery = `INSERT INTO inventory (MedicationID, QuantityInStock) VALUES ("${medID}", "${body.medstock}");`;
    let stock = await QueryF(stockQuery);
    if(!stock || stock.affectedRows == 0){
        res.send(`<script>alert("Error adding stock."); window.location="/manager/addmed"</script>`);
        return;
    }



    res.send(`<script>alert("Medicine added."); window.location="/manager/addmed"</script>`);
});

router.post("/addmed/restock", async (req,res)=>{

    let body = req.body;
    console.log(body);

    //check if med exists

    let checkMedQuery = `SELECT * FROM medication WHERE Name = "${body.medname}"`;
    let checkMed = await QueryF(checkMedQuery);
    if(checkMed.length == 0){
        res.send(`<script>alert("Medicine does not exist."); window.location="/manager/addmed"</script>`);
        return;
    }

    let medid = checkMed[0].MedicationID;

    //get current stock
    let getStockQuery = `SELECT QuantityInStock FROM inventory WHERE MedicationID = "${medid}"`;
    let getStock = await QueryF(getStockQuery);
    if(!getStock || getStock.length == 0){
        res.send(`<script>alert("Error getting stock."); window.location="/manager/addmed"</script>`);
        return;
    }

    let currentStock = getStock[0].QuantityInStock;
    let newStock = parseInt(currentStock) + parseInt(body.medstock);

    //update stock
    let updateStockQuery = `UPDATE inventory SET QuantityInStock = ${newStock} WHERE MedicationID = "${medid}";`;
    let updateStock = await QueryF(updateStockQuery);
    if(!updateStock || updateStock.affectedRows == 0){
        res.send(`<script>alert("Error updating stock."); window.location="/manager/addmed"</script>`);
        return;
    }

    res.send(`<script>alert("Stock updated."); window.location="/manager/addmed"</script>`);

});

router.get("/emp", (req,res)=>{
    res.render("man/emp.ejs");
});



router.post("/emp/add", async (req,res)=>{

    let body = req.body;
    console.log(body);

    //check emp cnic
    if(body.cnic.length != 13){
        res.send(`<script>alert("Invalid CNIC."); window.location="/manager/emp"</script>`);
        return;
    }


    //check if emp already exists

    let checkEmpQuery = `SELECT * FROM employee WHERE CNIC = "${body.cnic}"`;
    let checkEmp = await QueryF(checkEmpQuery);
    if(checkEmp.length != 0){
        res.send(`<script>alert("Employee already exists."); window.location="/manager/emp"</script>`);
        return;
    }

    // Add the employee

    let addEmpQuery = `INSERT INTO employee (Name, Classification, Address,Phone,Email, Pay, cnic) VALUES ("${body.Name}", "${body.classification}", "${body.address}", "${body.phone}", "${body.email}", ${parseInt(body.pay)}, "${body.cnic}");`;
    console.log(addEmpQuery);
    let addEmp = await QueryF(addEmpQuery);


    if(!addEmp || addEmp.affectedRows == 0){
        res.send(`<script>alert("Error adding employee."); window.location="/manager/emp"</script>`);
        return;
    }

    res.send(`<script>alert("Employee added."); window.location="/manager/emp"</script>`);

});

router.post("/emp/search", async (req,res)=>{

    let body = req.body;
    console.log(body);

    let query = `SELECT * FROM employee WHERE cnic = "${body.cnic}"`;
    let result = await QueryF(query);

    if(!result || result.length == 0){
        res.json({notfound: true});
        return;
    }

    let emp = result[0];

    res.json({notfound: false, ename: emp.Name, ephone: emp.Phone, eaddress: emp.Address, eemail: emp.Email, epay: emp.Pay, eclass: emp.Classification});

});

router.get("/sales", (req,res)=>{
    res.render("man/sales.ejs");
});

router.post("/sales/getsales", async (req,res)=>{
    let body = req.body;

    let getQuery = `SELECT c.Name as custName, m.Name as medName, t.TransactionDate as date, t.Quantity as quantity, t.TotalPrice as total FROM transaction as t,
    medication as m, customer as c WHERE t.CustomerID = c.CustomerID AND m.MedicationID = t.MedicationID LIMIT ${body.limit} OFFSET ${body.offset};`;

    let get = await QueryF(getQuery);
    console.log(get);

    if(!get){
        res.json({notfound: true});
        return;
    }

    if(get.length == 0){
        res.json({nothingtoshow: true});
        return;
    }

    res.json({notfound: false, data: get});

});

module.exports = router;