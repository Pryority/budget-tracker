const indexedDB = window.indexedDB;

let db;

const request = indexedDB.open("txDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    db.createObjectStore('pendingTx', { autoIncrement: true });

}

request.onsuccess = function (event) {
    db = event.target.result
    if (window.navigator.onLine) {
        console.log('Window online.');
        checkIndexDB();
    }
};

request.onerror = function (event) {
    console.log('An error occurred with IndexDB');
    console.log(event.target.errorCode);
};

// Save a record of the transaction if the app fails to connect
function saveRecord(record) {
    // Get a transaction on the objectStore with readwrite access
    const transaction = db.transaction('pendingTx', 'readwrite');
    // Get the pending transaction objectStore
    const store = transaction.objectStore('pendingTx');
    // Add record to the created store
    store.add(record);
}

function checkIndexDB() {
    // Get a transaction on the objectStore with readwrite access
    const transaction = db.transaction('pendingTx', 'readwrite');
    // Get the pending transaction objectStore
    const store = transaction.objectStore('pendingTx');
    // Get all the pending transaction object store's records
    const getAll = store.getAll();

    console.log('getAll():', getAll);

    // If the getAll function is successful, then POST the records
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(() => {
                    // Clear indexdb store after successful POST
                    const transaction = db.transaction(['pendingTx'], 'readwrite');

                    // Access the pending transaction object store
                    const store = transaction.objectStore('pendingTx');

                    // Clear all of the items in pending transaction object store
                    store.clear();
                    alert("All transactions stored offline have been added to the database.");
                });
        };
    };
};

// Listen for the application to connect/come online to then check the pending transaction object store.
window.addEventListener('online', checkIndexDB);