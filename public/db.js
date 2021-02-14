let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
}

request.onsuccess = function(event) {
  db = event.target.result;
  if(navigator.onLine) checkDatabase();
}

request.onerror = function (event) {
  console.log('Found error: ' + event.target.errorCode);
}

const saveRecord = (record)=>{
  const transaction = db.transaction(["pending"], "readwrite");
  const pendingStore = transaction.objectStore("pending");
  pendingStore.add(record);
}

const checkDatabase = ()=>{
  const transaction = db.transaction(["pending"], "readwrite");
  const pendingStore = transaction.objectStore("pending");
  const getAll = pendingStore.getAll();

  getAll.onsuccess = () =>{
    if(getAll.result.length > 0){
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers:{
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        const transaction = db.transaction(["pending"], "readwrite");
        const pendingStore = transaction.objectStore("pending");
        pendingStore.clear();
      });
    }
  }
}

window.addEventListener("online", checkDatabase);