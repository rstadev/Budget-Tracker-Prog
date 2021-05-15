const request = window.indexedDB.open("transactionDB", 1);

let db;

request.onupgradeneeded = event => {

  const db = event.target.result;

  // Creates an object store with autoIncrementing index values.
  db.createObjectStore("transaction", {autoIncrement: true});
};

request.onsuccess = event => {
  console.log(event.target.result);
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (e) {
  console.log(`Woops! ${e.target.errorCode}`);
};



function saveRecord(record) {
  const transaction = db.transaction(["transaction"], "readwrite");

  const store = transaction.objectStore("transaction");

  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["transaction"], "readwrite");
  // access your pending object store
  const store = transaction.objectStore("transaction");

  const getAll = store.getAll();


  getAll.onsuccess = function () {

    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {

            transaction = db.transaction(['transaction'], 'readwrite');

            const currentStore = transaction.objectStore('transaction');

            currentStore.clear();
          
        });
    }
  };
};


window.addEventListener("online", checkDatabase);
