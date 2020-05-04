const name = document.getElementById("name");
const gdp  = document.getElementById("gdp");
const errors = document.getElementById("errors");
const success = document.getElementById("success");

document.getElementById("form").addEventListener("submit", function(e){
  e.preventDefault();  
  if(!name.value || !gdp.value){
    errors.innerHTML = 'Please fill in form before submitting';
    setTimeout(() => { errors.innerHTML = ""}, 7000);
    return ;
  }
  if(isNaN(gdp.value)){
    errors.innerHTML = 'Gdp must a number';
    setTimeout(() => { errors.innerHTML = ""}, 7000);
    return ;
  }
  let countryItem = {
    name : name.value,
    gdp : +gdp.value
  }
  console.log(countryItem)
  db.collection("countries").add(countryItem).then(res => {    
    errors.innerHTML = "";
    success.innerHTML ="Add Successfully";
    setTimeout(()=>{success.innerHTML = ""}, 7000);
    name.value = "";
    gdp.value = "";
  })
})
