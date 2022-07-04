let db;

const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('new_tx', { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        // uploadTx();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveBudget(record) {
    const transaction = db.transaction(['new_tx'], 'readwrite');

    const budgetObjectStore = transaction.createObjectStore('new_tx');

    budgetObjectStore.add(record);
};