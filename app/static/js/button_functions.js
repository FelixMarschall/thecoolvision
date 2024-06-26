let takePhotoButton = document.querySelector("#take-photo-button");
let statusMessage = document.querySelector("#status-message");
let video = document.querySelector('video');

// Get access to the webcam TODO: Check if the function is needed
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        video.play();
    })
    .catch(error => console.error('Error:', error));

function setStatusMessage(statusMessageText) {
    statusMessage.innerText = statusMessageText;
    statusMessage.hidden = false;
    setTimeout(() => {
        statusMessage.hidden = true;
    }, 3000); // 3 seconds
}

function selectButton(selectedId) {
    // Check if the button is already selected
    var button = document.getElementById(selectedId);
    var isSelected = button.classList.contains('selected');
    var buttonClass = button.classList[0];


    // Deselect all buttons if the button is already selected
    if (isSelected) {
        button.classList.remove('selected');
    } else {
        // Deselect all buttons
        document.querySelectorAll('.' + buttonClass).forEach(button => {
            button.classList.remove('selected');
        });

        // Select the clicked button
        button.classList.add('selected');
    }
}

function hinzufuegen() {
    var selectedButtons = document.querySelectorAll('.selected');
    var mhdDelay, mhdUnit, personName;

    if (selectedButtons.length < 2) {
        setStatusMessage("Please select a person and a best before date.");
        return;
    }

    selectedButtons.forEach(button => {
        if (button.classList.contains('btn-mhd')) {
            mhdUnit = getUnitSelectedButton(button.id);
            mhdDelay = getAmountSelectedButton(button.id);

        console.log(`mhdUnit: ${mhdUnit}, mhdDelay: ${mhdDelay}`); // Debugging line

        } else if (button.classList.contains('btn-pers')) {
            personName = button.innerText;
        }
    });    
        // Calculate best before date based on mhdUnit and mhdDelay
        var bestBeforeDate = calculateBestBeforeDate(mhdDelay, mhdUnit);

        console.log(`bestBeforeDate: ${bestBeforeDate}`); // Debugging line
        
        // Send data to backend
        fetch('/add_product_by_photo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                personName: personName,
                bestBeforeDate: bestBeforeDate
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
    function calculateBestBeforeDate(mhdDelay, mhdUnit) {
        const date = new Date();
        mhdDelay = parseInt(mhdDelay, 10); // Ensure delay is an integer
    
        switch (mhdUnit) {
            case 'Tag':
                date.setDate(date.getDate() + mhdDelay);
                break;
            case 'Tage':
                date.setDate(date.getDate() + mhdDelay);
                break;
            case 'Woche':
                date.setDate(date.getDate() + mhdDelay * 7);
                break;
            case 'Wochen':
                date.setDate(date.getDate() + mhdDelay * 7);
                break;
            case 'Monat':
                date.setMonth(date.getMonth() + mhdDelay);
                break;    
            case 'Monate':
                date.setMonth(date.getMonth() + mhdDelay);
                break;
            default:
                throw new Error('Invalid unit provided. Use "days", "weeks", or "months".');
        }
    
        // Format the date to YYYY-MM-DD
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensure month is 2 digits
        const day = date.getDate().toString().padStart(2, '0'); // Ensure day is 2 digits
    
        return `${year}-${month}-${day}`;
    }
    // function calculateBestBeforeDate(delay, unit) {
    //     var date = new Date();
    //     if (unit === 'days') {
    //         date.setDate(date.getDate() + parseInt(delay));
    //     } else if (unit === 'weeks') {
    //         date.setDate(date.getDate() + parseInt(delay) * 7); 
    //     } else if (unit === 'months') {
    //         date.setMonth(date.getMonth() + parseInt(delay));
    //     }
    //     return date.toISOString().split('T')[0]; // Return date in YYYY-MM-DD format
    // }
    // implement the fetch request to add the item to the database HERE
    // use personName, mdhDelay (Anzahl an Tagen/Wochen/Monaten) and mhdUnit (Tag/Woche/Monat).
    // Den Name vom Produkt bekommst du über openapi.process_image("thecoolvision/app/temp/image.jpg") in der main.py Datei.
    // Dann musst du noch in deiner Funktion das Datum berechnen, geht bestimmt mit einem Modul in python, frag am besten ChatGPT.
    
// // Function to call add_product_by_photo endpoint
// function addProductByPhoto() {
//     // Assuming you need to send some data, adjust as necessary
//     const formData = new FormData();
//     formData.append('photo', /* Assuming you have a file input for the product photo */);

//     fetch('/add_product_by_photo', {
//         method: 'POST',
//         body: formData
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log('Success:', data);
//         // Handle success, update UI accordingly
//     })
//     .catch((error) => {
//         console.error('Error:', error);
//     });
// }

// // Function to call add_product_to_md endpoint
// function addProductToMd(productName) {
//     // Prepare the data to send
//     const data = { name: productName };

//     fetch('/add_product_to_md', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data)
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log('Success:', data);
//         // Handle success, update UI accordingly
//     })
//     .catch((error) => {
//         console.error('Error:', error);
//     });
// }

// // Example of attaching these functions to button clicks
// document.getElementById('addProductByPhotoButton').addEventListener('click', addProductByPhoto);
// document.getElementById('addProductToMdButton').addEventListener('click', () => addProductToMd('ExampleProductName'));
 
// Implementierung


function abbrechen() {
    document.querySelectorAll('.selected').forEach(button => {
        button.classList.remove('selected');
    });
    video.play();
    takePhotoButton.innerHTML = "Take a photo 📸";
}

function entfernen(event) {
    // Get all selected buttons
    var selectedButtons = document.querySelectorAll('.selected');
    
    // Find a selected person button
    var personButton = Array.from(selectedButtons).find(button => button.classList.contains('btn-pers'));
    
    // Check if a person button is selected
    if (!personButton) {
        setStatusMessage("Please select a person to remove inventory from.");
        return;
    }

    toggleModal(event);
    console.log("Trigger Entfernen with PersonId " + personId, " PersonDisplayName " + personDisplayName);

    // make request to get item by id and add content to table with persons-items id, item-name
    fetch(`/users/${personUsername}/stock`, {
        method: 'GET',
    })
        .then((response) => response.json())
        .then((data) => {
            // console.log(data);            
            // insert array values into table with id <table id="persons-items">
            data.forEach(item => {
                const row = tbody.insertRow();
                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);
                const cell3 = row.insertCell(2);
                const cell4 = row.insertCell(3);
                cell1.innerHTML = item.id;
                cell2.innerHTML = item.product.name;
                cell3.innerHTML = item.amount;
                cell4.innerHTML = `<a class="clickable-icon" onclick="deleteItem(event, ${item.id})"><i data-feather="trash-2"></i></a>`;
            });
            feather.replace();
        }).catch((error) => console.error('Error:', error));
}

function deleteItem(event, itemId) {
    event.preventDefault();
    console.log("Delete Item with ID " + itemId);
    fetch(`/items/${itemId}`, {
        method: 'DELETE',
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            // remove row from table
            const table = document.getElementById("persons-items");
            const tbody = table.tBodies[0];
            const row = document.getElementById(itemId);
            tbody.removeChild(row);
        }).catch((error) => console.error('Error:', error));
}

// Function to increase the amount
function increase(buttonId) {
    const button = document.getElementById(buttonId);
    if (!button.classList.contains('selected')) {
        selectButton(buttonId);
    }
    const buttonTexts = button.innerText.split(' ')
    let amount = parseInt(buttonTexts[0]);
    amount++;
    button.innerText = `${amount} ${buttonTexts[1]}`;
    checkGrammer(buttonId);
}

// Function to decrease the amount
function decrease(buttonId) {
    const button = document.getElementById(buttonId);
    if (!button.classList.contains('selected')) {
        selectButton(buttonId);
    }
    const buttonTexts = button.innerText.split(' ')
    let amount = parseInt(buttonTexts[0]);
    if (amount > 1) {  // Ensure amount do not go below 1
        amount--;
    }
    button.innerText = `${amount} ${buttonTexts[1]}`;
    checkGrammer(buttonId);
}

function checkGrammer(buttonID) {
    var button = document.getElementById(buttonID);
    var buttonText = button.innerText;
    var buttonTexts = buttonText.split(' ');
    var amount = parseInt(buttonTexts[0]);
    var unit = buttonTexts[1];
    if (amount > 1) {
        if (unit.includes("Tag")) {
            unit = "Tage";
        } else if (unit.includes("Woche")) {
            unit = "Wochen";
        } else if (unit.includes("Monat")) {
            unit = "Monate";
        }
        button.innerText = `${amount} ${unit}`;
    } else {
        if (unit.includes("Tage")) {
            unit = "Tag";
        } else if (unit.includes("Wochen")) {
            unit = "Woche";
        } else if (unit.includes("Monate")) {
            unit = "Monat";
        }
        button.innerText = `${amount} ${unit}`;
    }
}

function getAmountSelectedButton(buttonId) {
    const button = document.getElementById(buttonId);
    const buttonTexts = button.innerText.split(' ')
    return parseInt(buttonTexts[0]);
}

function getUnitSelectedButton(buttonId) {
    const button = document.getElementById(buttonId);
    const buttonTexts = button.innerText.split(' ')
    return buttonTexts[1];
}

function takePhoto() {
    let canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let context = canvas.getContext('2d');
    context.drawImage(video, 0, 0);
    let imageDataUrl = canvas.toDataURL('image/jpeg');

    // Convert the data URL to a Blob
    let byteString = atob(imageDataUrl.split(',')[1]);
    let mimeString = imageDataUrl.split(',')[0].split(':')[1].split(';')[0];
    let arrayBuffer = new ArrayBuffer(byteString.length);
    let uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }
    let blob = new Blob([uint8Array], { type: mimeString });

    // Send the Blob to the server
    let formData = new FormData();
    formData.append('image', blob);
    fetch('/process_image', {
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
}

function startPhotoProcess() {
    var overlay = document.querySelector(".countdown-overlay");
    var countdown = 3;

    video.play();
    var countdownInterval = setInterval(function () {
        if (countdown === 0) {
            console.log("Take the photo!");
            takePhoto();
            // Stop the video
            video.pause();
            overlay.innerText = "";
            takePhotoButton.innerHTML = "Retake the photo 📸";
            clearInterval(countdownInterval);
        } else {
            overlay.innerText = countdown;
            countdown--;
        }
    }, 700);
}