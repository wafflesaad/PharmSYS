console.log("Script loaded!");

const statusmsg = document.getElementById("status");
const restockfields = document.getElementById("restockfields");
const restockbtn = document.getElementById("restockbtn");

restockfields.style.display = "none";
statusmsg.style.display = "none";

restockbtn.addEventListener("click", ()=>{

    if(restockfields.style.display == "none"){
        restockfields.style.display = "flex";
    }
    else{
        restockfields.style.display = "none";
    }

});


