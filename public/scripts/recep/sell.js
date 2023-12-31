const addbtn = document.getElementById("addbtn");
const sellbtn = document.getElementById("sellbtn");
const cnicfield = document.getElementById("cnicfield");
const medfield = document.getElementById("medfield");
const statusmsg = document.getElementById("status");
const totalamount = document.getElementById("totalamount");
const bill = document.getElementById("bill");
const amountfield = document.getElementById("amount");
const billitems = document.getElementById("billitems");


console.log("connected");

bill.style.display = "none";

let total = 0;
let shoplist = [];

addbtn.addEventListener("click", ()=>{
    bill.style.display = "flex";

    let med = medfield.value;
    let amount = amountfield.value;

    let obj = {
        med: med,
        amount: amount
    }

    fetch("/recep/sell/check",{
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
    }).then((res)=>{
        return res.json();
    }).then((data)=>{
        console.log(data);
        if(data.mednotfound){
            statusmsg.innerHTML = "Medicine not found";
            return;
        }else if(data.stocklow){
            statusmsg.innerHTML = "Stock low";
            return;
        }

        let str = amount + "x " + med + " " + data.price + "Rs.";

        let p = document.createElement("p");
        p.innerHTML = str;
        billitems.appendChild(p);
        obj.price = data.price * amount;
        shoplist.push(obj);
        total += data.price * amount;

        let totalstr = total + "Rs.";
        totalamount.innerHTML = totalstr;

        console.log(shoplist);
    }).catch((err)=>{
        statusmsg.innerHTML = "Error in adding";
        console.log(err);
    });

    {
    // let cnic = cnicfield.value;
    // let name = medfield.value;
    // let number = amount.value;
    
    // console.log(cnic);

    // cnicfield.value = "";
    // medfield.value = "";
    // amount.value = "";

    // let obj = {
    //     medicinename: name,
    //     amount: number,
    //     custcnic: cnic
    // }

    // fetch("/recep/sell/additem",{
    //     method: "POST",
    //     headers:{
    //         "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify(obj)
    // }).then((res)=>{
    //     return res.json();
    // }).then((data)=>{
    //     if(data.notfound){
    //         statusmsg.innerHTML = "User not found";
    //         return;
    //     }

    //     let str = number + "x " + name + " " + data.price + "Rs.";
    //     let p = document.createElement("p");
    //     p.innerHTML = str;
    //     billitems.appendChild(p);

    //     total += data.price * number;
    //     let totalstr = total + "Rs.";
    //     totalamount.innerHTML = totalstr;


    // }).catch((err)=>{
    //     console.log("Error in adding");
    //     console.log(err);
    // });
    }
});

sellbtn.addEventListener("click", ()=>{
    let cnic = cnicfield.value;

    let obj = {
        cnic: cnic,
        shoplist: shoplist,
        total: total
    }

    fetch("/recep/sell/checkout",{
        method: "POST",
        headers:{
            "Content-type": "application/json"
        },
        body: JSON.stringify(obj)
    }).then((res)=>{
        return res.json();
    }).then((data)=>{
        if(data.custnotfound){
            statusmsg.innerHTML = "Customer not found";
            return;
        }

        if(data.errorCheckingPrescription){
            statusmsg.innerHTML = "Error in checking prescription";
            return;
        }

        if(data.presnotfound){
            statusmsg.innerHTML = "Customer dosent have prescription.";
            return;
        }

        if(data.errorGettingMedID){
            statusmsg.innerHTML = "Error in getting med id";
            return;
        }

        if(data.errorUpdatingStock){
            statusmsg.innerHTML = "Error in updating stock";
            return;
        }

        if(data.errorAddingTransaction){
            statusmsg.innerHTML = "Error in adding transaction";
            return;
        }

        //customer, total, date

        statusmsg.innerHTML = "Checkout successful. Total: " + total + "Rs. Sold to " + data.customer + " on " + data.date + ".";

        billitems.innerHTML = "";
        totalamount.innerHTML = "";
        bill.style.display = "none";
    }).catch((err)=>{
        statusmsg.innerHTML = "Error in checkout";
        console.log(err);
    });

});
