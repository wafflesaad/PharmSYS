const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

router.use(express.json());
router.use(express.urlencoded({extended: true}));


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'receptionist',
    password: 'recep',
    database: 'pharmsys'
});


connection.connect(function(err) {
    if (err){
        console.log(err);
    }
    console.log("Connected to receptionist connection!");
});

function QueryF(query){

    let p = new Promise((resolve, reject) =>{

        connection.query(query, (err, rows, fields) => {
            if (err) {
                reject(err);
            }
            else{
                resolve(rows);
            }
        });

    })

    return p.then((data) =>{
        return data;
    }).catch((err)=>{
        console.log(err);
        return null;
    });
        
}



router.get("/", (req,res)=>{
    res.render("./recep/sell");
});

router.get("/sell", (req,res)=>{
    res.render("./recep/sell");
});

router.post("/sell/check", async (req,res)=>{
    let body = req.body;
    console.log(body);

    let checkquery = `SELECT i.QuantityInStock AS quantity, m.PricePerUnit as price FROM medication as m, inventory as i WHERE m.Name="${body.med}" AND m.MedicationID = i.MedicationID;`;
    let check = await QueryF(checkquery);
    console.log(check);

    if(!check || check.length == 0){
        res.json({mednotfound: true});
        return;
    }

    if(parseInt(check[0].quantity) < parseInt(body.amount)){
        res.json({stocklow: true, mednotfound: false});
        return;
    }


    res.json({mednotfound: false, stocklow: false, price: check[0].price});
    // res.json({notfound: false, price: 500});

});

router.post("/sell/checkout", async (req,res)=>{
    let body = req.body;
    console.log(body);

    // checking customer
    let checkcustquery = `SELECT CustomerID as id, Name as name FROM customer WHERE cnic = "${body.cnic}";`;
    let checkcust = await QueryF(checkcustquery);
    console.log(checkcust);

    if(!checkcust || checkcust.length == 0){
        res.json({custnotfound: true});
        return;
    }

    let custobj = checkcust[0];
    let shoplist = body.shoplist;

    // check if any medicine has required prescription

    for (let i = 0; i < shoplist.length; i++){

        let checkpresquery = `SELECT MedicationID, PrescriptionRequired FROM medication WHERE Name = "${shoplist[i].med}";`;
        let checkpres = await QueryF(checkpresquery);
        console.log(checkpres);
        if(!checkpres || checkpres.length == 0){
            res.json({errorCheckingPrescription: true});
            return;
        }
        // check if customer has that prescription
        if(checkpres[0].PrescriptionRequired == "Yes"){
            
            let checkcustpresquery = `SELECT * FROM prescription WHERE CustomerID = ${custobj.id} AND MedicationID = ${checkpres[0].MedicationID};`;
            let checkcustpres = await QueryF(checkcustpresquery);
            console.log(checkcustpres);
            if(!checkcustpres){
                res.json({errorCheckingPrescription: true});
                return;
            }else if(checkcustpres.length == 0){
                res.json({presnotfound: true});
                return;
            }

            shoplist[i].pres = checkcustpres[0].PrescriptionID;

        }
        else{
            shoplist[i].pres = null;
        }

    }

    

    //getting med id's

    for (let i = 0; i < shoplist.length; i++){
        let medidquery = `SELECT MedicationID FROM medication WHERE Name = "${shoplist[i].med}";`;
        let medidresult = await QueryF(medidquery);
        console.log(medidresult);
        if(!medidresult || medidresult.length == 0){
            res.json({errorGettingMedID: true});
            return;
        }

        shoplist[i].medid = medidresult[0].MedicationID;
    }

    //reducing the stock
    for (let i = 0; i < shoplist.length; i++){
    
        let updatequery = `UPDATE inventory SET QuantityInStock = QuantityInStock - ${shoplist[i].amount} WHERE MedicationID = ${shoplist[i].medid};`;
        let update = await QueryF(updatequery);
        console.log(update);
        if(!update || update.affectedRows == 0){
            res.json({errorUpdatingStock: true});
            return;
        }
    
    }

    let total = body.total;
    let date = new Date();
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
    let year = date.getFullYear();

    let formattedDate = year + '-' + month + '-' + day;
    console.log(formattedDate); 


    //adding to sales
    for(let i = 0; i < shoplist.length; i++){
    
        let transactionQuery = `INSERT INTO transaction(CustomerID, PrescriptionID, MedicationID, TransactionDate, Quantity, TotalPrice) VALUES (${custobj.id}, ${shoplist[i].pres}, ${shoplist[i].medid}, "${formattedDate}", ${shoplist[i].amount}, ${total});`;
        console.log(transactionQuery);
        let transaction = await QueryF(transactionQuery);
        console.log(transaction);

        if(!transaction || transaction.affectedRows == 0){
            res.json({errorAddingTransaction: true});
            return;
        }

    }
    
    res.json({customer: custobj.name, total: total, date: formattedDate});

})

router.get("/med", (req,res)=>{
    // res.send("med");
    res.render("./recep/med",{name: "", description: "",price: "", stock: "", notfound: false});
});

router.post("/med/search", async (req,res)=>{
    console.log("in search");
    let body = req.body;
    console.log(body);

    let query = `SELECT * FROM medication, inventory WHERE medication.MedicationID = inventory.MedicationID AND Name = "${body.search}";`;
    console.log(query);
    let med =  await QueryF(query);
    console.log(med);

    if(med.length == 0){
        res.json({notfound: true});
        return;
    }

    let medobj = med[0];
    // res.render("./recep/med", {name: "Panadol", description: "Pain killer",price: "200 RS", stock: "4", notfound: false})
    res.json({name: medobj.Name, description: medobj.Description, price: medobj.PricePerUnit,
                 stock: medobj.QuantityInStock,  notfound: false});

});

router.get("/cust", (req, res) =>{

    res.render("./recep/cust.ejs")

});

router.post("/cust/search", async (req, res)=>{
    console.log("In customer search");
    let body = req.body;
    console.log(body);
    //for customer info
    let query = `SELECT * FROM customer WHERE cnic="${body.cnic}"`
    let cust = await QueryF(query);
    console.log(cust);
    if(cust.length == 0){
        res.json({notfound: true});
        return;
    }

    let custobj = cust[0];

    // for prescription info

    let query2 = `SELECT m.Name FROM medication as m, customer as c, prescription as p WHERE m.MedicationID = p.MedicationID
    AND c.CustomerID = p.CustomerID AND c.Name = "${custobj.Name}";`

    let pres = await QueryF(query2);
    console.log(pres);
    let presStr = ""
    if(pres.length == 0){
        presStr += "None";
    }else{
        for(let i = 0; i < pres.length; i++){
            presStr += pres[i].Name;
            if(i == pres.length - 1){
                presStr += ".";
                break;
            }
            presStr += ", "
        }
    }

    custobj.pres = presStr;


    res.json({cname: custobj.Name, cphone: custobj.Phone, caddress: custobj.Address, 
            cemail: custobj.Email, cpres: custobj.pres , notfound: false})
});

router.post("/cust/addCustomer", async (req,res)=>{
    let body = req.body;

    if(body.cnic=="" || body.customerName == "" || body.address == "" || body.phone == "" || body.email == ""){
        res.send(`<script>alert("Please fill all fields"); window.location="/recep/cust"</script>`);
        return;
    };

    console.log(body);

    let query = `INSERT INTO customer(Name, Address, Phone, Email, cnic) 
            VALUES ("${body.customerName}", "${body.address}", "${body.phone}","${body.email}", "${body.cnic}");`;

    let insertResult = await QueryF(query);

    if(!insertResult){
        res.send(`<script>alert("Error adding customer."); window.location="/recep/cust"</script>`);
        return
    }
    console.log(insertResult);

    if(insertResult.affectedRows == 0){
        res.send(`<script>alert("Error adding customer.."); window.location="/recep/cust"</script>`);
        return;
    }

    res.send(`<script>alert("Customer Added."); window.location="/recep/cust"</script>`);
});

router.post("/cust/addpresc", async (req,res)=>{

    let body = req.body;
    console.log(body);
    if(body.cnic.length != 13){
        res.send(`<script>alert("Invalid Cnic"); window.location="/recep/cust"</script>`);
        return;
    }

    let checkquerymed = `SELECT MedicationID FROM medication WHERE Name = "${body.presc}";`
    let checkmed = await QueryF(checkquerymed);
    console.log(checkmed);
    if(checkmed.length == 0){
        res.send(`<script>alert("Medicine not found"); window.location="/recep/cust"</script>`);
        return;
    };


    let checkquerycust = `SELECT CustomerID FROM customer WHERE cnic = "${body.cnic}";`
    let checkcust = await QueryF(checkquerycust);
    console.log(checkcust);
    if(checkcust.length == 0){
        res.send(`<script>alert("Customer not found"); window.location="/recep/cust"</script>`);
        return;
    };

    let finalquery = `INSERT INTO prescription(MedicationID, CustomerID) VALUES (${checkmed[0].MedicationID}, ${checkcust[0].CustomerID});`

    let final = await QueryF(finalquery);
    console.log(final);
    if(!final || final.affectedRows == 0){
        res.send(`<script>alert("Error adding prescription."); window.location="/recep/cust"</script>`);
        return;
    }
    

    res.send(`<script>alert("Prescription Added."); window.location="/recep/cust"</script>`);
});



// connection.end((err) => {
//     if (err) {
//       console.error('Error closing connection:', err);
//       return;
//     }
//     console.log('Connection to MySQL database closed');
//   });


module.exports = router;