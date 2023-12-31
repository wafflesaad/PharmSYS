console.log("connected to script");

const searchbar = document.getElementById("searchemp");
const searchbtn = document.getElementById("searchbtn");
const cnicerror = document.getElementById("cnicerror");
const ename = document.getElementById("ename");
const ephone = document.getElementById("ephone");
const eemail = document.getElementById("eemail");
const eaddress = document.getElementById("eaddress");
const epay = document.getElementById("epay");
const eclass = document.getElementById("eclass");
const addempbtn = document.getElementById("addempbtn");
const empform = document.getElementById("empform");

disableEfields();
empform.style.display = "none";
cnicerror.style.display = "none";

searchbtn.addEventListener("click", ()=>{
    empform.style.display = "none";
    disableEfields();
    let cnic = String(searchbar.value);
    if (cnic.length != 13){
        cnicerror.style.display = "block";
        cnicerror.innerHTML = "Invalid Cnic";
        return;
    }

    console.log(cnic);

    cnicerror.style.display = "none";

    //to rework
    fetch("/manager/emp/search",{
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
        if(data.notfound){
            cnicerror.innerHTML = "Employee not found";
            return;
        }

        ename.style.display = "block";
        ephone.style.display = "block";
        eaddress.style.display = "block";
        eemail.style.display = "block";
        epay.style.display = "block";
        eclass.style.display = "block";



        ename.innerHTML = "Name: " + data.ename;
        ephone.innerHTML = "Phone: " + data.ephone;
        eaddress.innerHTML = "Address: " + data.eaddress;
        eemail.innerHTML = "Email: " + data.eemail;
        epay.innerHTML = "Pay: " + data.epay;
        eclass.innerHTML = "Classification: " + data.eclass;


    }).catch((err)=>{
        console.log("Error in getting employee");
        cnicerror.innerHTML = "Error in getting employee";
        console.log(err);
    })

});

addempbtn.addEventListener("click", ()=>{
    disableEfields();
    if (empform.style.display == "flex"){
        empform.style.display = "none";
    }else{
        empform.style.display = "flex";
    }
});

function disableEfields(){
    ename.style.display = "none";
    ephone.style.display = "none";
    eaddress.style.display = "none";
    eemail.style.display = "none";
    epay.style.display = "none";
    eclass.style.display = "none";
}