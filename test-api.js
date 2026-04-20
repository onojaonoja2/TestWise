console.log("Checking API");
fetch("http://localhost:3000/api/tests/cm2001").then(r => console.log(r.status));
