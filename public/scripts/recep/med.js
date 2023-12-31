const searchbar = document.getElementById("searchmed");
const searchbtn = document.getElementById("searchbtn");
const results = document.getElementById("results");
const rname = document.getElementById("rname");
const rdesc = document.getElementById("rdesc");
const rprice = document.getElementById("rprice");
const rstock = document.getElementById("rstock");
const rnotfound = document.getElementById("rnotfound");

rname.style.display = "none";
rdesc.style.display = "none";
rprice.style.display = "none";
rstock.style.display = "none";

searchbtn.addEventListener("click", () => {
    rnotfound.innerHTML = ""
    let value = searchbar.value;
    if(!value){
        rnotfound.innerHTML = "Please Enter a Name."
        return;
    }
    console.log(value);
    let obj = {
        search: value
    };

    fetch("/recep/med/search",{
        method: "POST",
        body: JSON.stringify(obj),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((res) => {
        if(!res){
            console.log("Response not received!");
        }

        return res.json();

    }).then((data)=>{
        if(data.notfound){
            rname.style.display = "none";
            rdesc.style.display = "none";
            rprice.style.display = "none";
            rstock.style.display = "none";
            rnotfound.innerHTML = "Medicine not found"
            return;
        }

        rname.style.display = "block";
        rdesc.style.display = "block";
        rprice.style.display = "block";
        rstock.style.display = "block";

        rname.innerHTML = "Name: " + data.name;
        rdesc.innerHTML = "Description: " + data.description;
        rprice.innerHTML = "Price: " + data.price;
        rstock.innerHTML = "Stock: " + data.stock;


    }).catch((err)=>{
        console.log("error occured");
        console.log(err);
    });



});










console.log("med.js loaded");