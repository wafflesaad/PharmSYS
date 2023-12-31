const cont = document.getElementById("cont");
const statusmsg = document.getElementById("status");
const nextbtn = document.getElementById("nextbtn");
const prevbtn = document.getElementById("prevbtn");

let limit = 7;
let offset = 0;
let finished = false;

prevbtn.disabled = true;

fetchsales();

function fetchsales(){
    fetch("/manager/sales/getsales",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({limit: limit, offset: offset})
    }).then((res)=>{
        return res.json();
    }).then((data)=>{

        if(data.notfound){
            statusmsg.innerHTML = "No sales found.";
            return;
        
        }

        if(data.nothingtoshow){
            statusmsg.innerHTML = "No more sales to show.";
            finished = true;
            nextbtn.disabled = true;
            return;

        }

        let arr = data.data;

        for(let i = 0; i < arr.length; i++){
            
            let p = document.createElement("p");
            let pstr = `${arr[i].date.substring(0,10)}. Sold ${arr[i].quantity} of ${arr[i].medName} to ${arr[i].custName}. Total: ${arr[i].total}`;
            p.innerHTML = pstr;

            cont.appendChild(p);

        }


    }).catch((err)=>{
        console.log("Error in fetching sales.");
        statusmsg.innerHTML = "Error in fetching sales.";
        console.log(err);
    });
}

nextbtn.addEventListener("click", ()=>{
    statusmsg.innerHTML = "";
    removedata();
    offset += 7;
    limit += 7;
    fetchsales();
    prevbtn.disabled = false;
});

prevbtn.addEventListener("click", ()=>{
    statusmsg.innerHTML = "";
    removedata();
    offset -= 7;
    limit -= 7;
    fetchsales();
    nextbtn.disabled = false;
    finished = false;

    if(offset == 0){
        prevbtn.disabled = true;
    }
});

function removedata(){
    while(cont.firstChild){
        cont.removeChild(cont.firstChild);
    }
}