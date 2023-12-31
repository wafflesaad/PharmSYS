const searchbar = document.getElementById("searchcust");
const searchbtn = document.getElementById("searchbtn");
const cnicerror = document.getElementById("cnicerror");
const cname = document.getElementById("cname");
const cphone = document.getElementById("cphone");
const cemail = document.getElementById("cemail");
const caddress = document.getElementById("caddress");
const cpres = document.getElementById("cprescription");
const addcustbtn = document.getElementById("addcustbtn");
const custform = document.getElementById("custform");
const prescform = document.getElementById("prescform");
const addpresbtn = document.getElementById("addpresbtn");

disableCustInfo();
custform.style.display = "none";
cnicerror.style.display = "none";
prescform.style.display = "none";

searchbtn.addEventListener("click", ()=>{
    disableCustInfo();

    let cnic = String(searchbar.value);
    if (cnic.length != 13){
        cnicerror.style.display = "block";
        cnicerror.innerHTML = "Invalid Cnic";
        return;
    }

    console.log(cnic);

    cnicerror.style.display = "none";

    fetch("/recep/cust/search",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({cnic: cnic})
    }).then((res)=>{
        if(!res){
            console.log("Response not received!");
        }

        return res.json();
    }).then((data)=>{
        console.log(data.notfound);
        if(data.notfound){
            cnicerror.style.display = "block";
            cnicerror.innerHTML = "Customer not found"
            return;
        }

        cname.style.display = "block";
        cemail.style.display = "block";
        caddress.style.display = "block";
        cphone.style.display = "block";
        cpres.style.display = "block";


        cname.innerHTML = "Name: " + data.cname;
        cphone.innerHTML = "Phone: " + data.cphone;
        caddress.innerHTML = "Address: " + data.caddress;
        cemail.innerHTML = "Email: " + data.cemail;
        cpres.innerHTML = "Prescriptions: " + data.cpres;

    }).catch((err)=>{
        console.log("Error in getting customer");
        console.log(err);
    })

});

addcustbtn.addEventListener("click", ()=>{
    disableCustInfo();
    prescform.style.display = "none";
    if (custform.style.display == "flex"){
        custform.style.display = "none";
    }else{
        custform.style.display = "flex";
    }
});

addpresbtn.addEventListener("click", ()=>{
    disableCustInfo();
    custform.style.display = "none";
    if (prescform.style.display == "flex"){
        prescform.style.display = "none";
    }else{
        prescform.style.display = "flex";
    }
});

function disableCustInfo(){
    cname.style.display = "none";
    cemail.style.display = "none";
    caddress.style.display = "none";
    cphone.style.display = "none";
    cpres.style.display = "none";
}


