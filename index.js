const form = document.getElementById('form');
const name = document.getElementById("name");
const gdp = document.getElementById("gdp");
const success = document.getElementById("success");
const error = document.getElementById("errors");
const btnSubmit = document.getElementById("btnSubmit");

form.addEventListener("submit", function(e){
  e.preventDefault();
  btnSubmit.disabled = true;
  if(!name.value || !gdp.value) {
    success.innerHTML = "";
    errors.innerHTML = "Please fill in form before submition";
    setTimeout(()=> {errors.innerHTML = ""}, 7000);
    return;
  } 
  if(isNaN(gdp.value)){
    success.innerHTML = "";
    errors.innerHTML = "GDP must be a number";
    setTimeout(()=> {errors.innerHTML = ""}, 7000);
    return;
  }
  const item = {
    name : name.value,
    gdp : +gdp.value
  }
  db.collection("countries").add(item).then(res => {   
    errors.innerHTML = "";
    success.innerHTML = "Add successfully";
    name.value = "";
    gdp.value = "";
    btnSubmit.disabled = false;
  })
  .catch(error => {
    success.innerHTML = "";
    errors.innerHTML = error;
  })
})