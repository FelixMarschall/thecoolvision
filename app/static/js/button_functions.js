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

function setStatusMessage(statusMessageText, time) {
    statusMessage.innerText = statusMessageText;
    statusMessage.hidden = false;
    setTimeout(() => {
        statusMessage.hidden = true;
    }, 1000*time); // 3 seconds
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
        setStatusMessage("Please select a person and a best before date.", 3);
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
            setStatusMessage("Product added successfully.", 1);
            abbrechen();
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

////////////////////////////////////////////////////////////////////////////
// Test function for removing a product by returning a list to the user
////////////////////////////////////////////////////////////////////////////

// function entfernen() {
//     var selectedButtons = document.querySelectorAll('.selected');
//     var personName;

//     if (selectedButtons.length < 1) {
//         setStatusMessage("Please select a person.", 3);
//         return;
//     }

//     selectedButtons.forEach(button => {
//         if (button.classList.contains('btn-pers')) {
//             personName = button.innerText;
//         }
//     });

//     // Request to list products for the selected user
//     fetch('/list_products_for_user', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ personName: personName }),
//     })
//     .then(response => response.json())
//     .then(data => {
//         // Display products in a popup and let the user select one to remove
//         const productIdToRemove = displayProductsAndSelect(data); // Implement this function based on your UI framework

//         // Request to remove the selected product
//         fetch('/remove_product', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ productId: productIdToRemove }),
//         })
//         .then(response => response.json())
//         .then(data => {
//             console.log('Product removed successfully:', data);
//         })
//         .catch((error) => {
//             console.error('Error removing product:', error);
//         });
//     })
//     .catch((error) => {
//         console.error('Error listing products:', error);
//     });
// }
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////


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

// Test der funktion entfernen(die hier funktioniert)
function entfernen(event) {
    // Get all selected buttons
    var selectedButtons = document.querySelectorAll('.selected');
    
    // Find a selected person button
    var personButton = Array.from(selectedButtons).find(button => button.classList.contains('btn-pers'));
    
    // Check if a person button is selected
    if (!personButton) {
        setStatusMessage("Please select a person to remove inventory from.", 3);
        return;
    }
    var personName; // Declare the personName variable
    selectedButtons.forEach(button => {
        if (button.classList.contains('btn-pers')) {
            personName = button.innerText;
        }
    });
    toggleModal(event);
    // wurde auskommentiert, da Fehler in der Konsole :ReferenceError: user_id is not defined
    // console.log("Trigger Entfernen with PersonId " + user_id, " PersonDisplayName " + personDisplayName);

    const url= '/user/' + personName + '/products';
    // Fetch products for the selected user
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        // Check if the response is OK and the content type is JSON
        if (response.ok && response.headers.get('Content-Type')?.includes('application/json')) {
            return response.json(); // Parse as JSON if the response is JSON
        } else {
            return response.text(); // Otherwise, return as text
        }
    })
    .then(async data => {  // Use async to await the displayProductsAndSelect function
        console.log("Received product list:", data); // Log the list received from the backend

        // toggleModal(event);

        // Display products in a modal popup and let the user select one to remove
        // Wait for the promise to resolve and get the selected product ID
        const productIdToRemove = await displayProductsAndSelect(data); 
        console.log("Selected Product ID:", productIdToRemove); // Log the selected product ID
        if (!productIdToRemove) {
            console.log("No product selected for removal.");
            return;
        }
        // const productIdToRemoveInt = parseInt(productIdToRemove, 10); // Ensure the ID is an integer
        // Request to remove the selected product
        fetch('/remove_product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId: productIdToRemove }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok, status: ${response.status}`);
            }
            const contentType = response.headers.get('Content-Type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Received non-JSON response from server');
            }
            return response.json();
        })
        .then(data => {
            console.log('Product removed successfully:', data);
            // Select the status message element
            setStatusMessage("Product removed successfully.", 1);
        })
        .catch((error) => {
            console.error('Error removing product:', error);
        });
    })
    .catch((error) => {
        console.error('Error fetching products:', error);
    });
}
// Display Products and Select
function displayProductsAndSelect(products) {
    console.log(products);
    console.log(typeof products); // Check the type
    if (Array.isArray(products)) {
        products.forEach(product => {
        console.log(`Product name: ${product.name}`);
        });
    } else {
        console.log('products is not an array:', products);
    }
    return new Promise((resolve, reject) => {
        const productListElement = document.getElementById('productList');
        console.log(productListElement);
        if (!productListElement) {
            console.error('productList element not found');
        }
        
        // Step 2: Check if the element exists
        if (productListElement) {
            // The element exists, you can safely manipulate it here
            console.log('Element exists:', productListElement);
        } else {
            // The element does not exist, handle accordingly
            console.error('Element with ID productList does not exist in the document.');
        }
        productListElement.innerHTML = ''; // Clear previous content

        // Show Products and Best Before Dates

        if (!products || !Array.isArray(products) || products.length === 0) {
            const noProductsParagraph = document.createElement('p');
            noProductsParagraph.textContent = 'There are no products for this user.';
            productListElement.appendChild(noProductsParagraph);

            console.log('No products found:', products);
            return;
        }

        // Extract unique names
        const uniqueProducts = [...new Set(products.map(product => product.name))];

        // Iterate over unique product names
        uniqueProducts.forEach(productName => {
            productID = products.find(product => product.name === productName).id;

            // Get bestBeforeDateCounts for the current productName
            const bestBeforeDateCounts = getBestBeforeDateCounts(products, productName);

            // Create fieldset element
            const fieldset = document.createElement('fieldset');
            fieldset.setAttribute('role', 'group');

            // Create details element
            const details = document.createElement('details');

            // Create summary element
            const productSummary = document.createElement('summary');
            productSummary.setAttribute('role', 'button');
            productSummary.classList.add('outline');
            productSummary.textContent = productName;

            // Append summary to details
            details.appendChild(productSummary);

            // Append details to fieldset
            fieldset.appendChild(details);

            // Create input element
            const input = document.createElement('input');
            input.setAttribute('type', 'submit');
            input.setAttribute('value', 'Entfernen');

            input.onclick = () => {
                resolve(productID); // Resolve the promise with the selected product ID
                // closeModal(document.getElementById('productSelectModal'));
                closeModal(document.getElementById('modal-remove-item')); 
                };

            // Append input to fieldset
            fieldset.appendChild(input);

            // Append fieldset to productListElement
            productListElement.appendChild(fieldset);

            // Add paragraph for each bestBeforeDate
            const paragraph = document.createElement('p');
                paragraph.textContent = `Best Before Dates for ${productName}`;
                paragraph.style.textAlign = "center";
                details.appendChild(paragraph);

            // Add paragraph for each bestBeforeDate
            for (const date in bestBeforeDateCounts) {
                const paragraph = document.createElement('p');
                paragraph.textContent = `${date}`;
                paragraph.style.textAlign = "center";
                details.appendChild(paragraph);
            }
        });

        // openModal(document.getElementById('productSelectModal'));
        openModal(document.getElementById('modal-remove-item')); 
    });
}

// Function to get best before date counts for a specific name
function getBestBeforeDateCounts(products, product_name) {
    const filteredList = products.filter(item => item.name === product_name);
    return filteredList.reduce((acc, {best_before_date}) => {
        if (!acc[best_before_date]) {
            acc[best_before_date] = 0;
        }
        acc[best_before_date]++;
        return acc;
    }, {});
}

// When you need to display the product selection modal
// displayProductsAndSelect(products).then(selectedProductId => {
//     console.log("Selected Product ID:", selectedProductId);
// });
   
// function entfernen(event) {
//     // Get all selected buttons
//     var selectedButtons = document.querySelectorAll('.selected');
    
//     // Find a selected person button
//     var personButton = Array.from(selectedButtons).find(button => button.classList.contains('btn-pers'));
    
//     // Check if a person button is selected
//     if (!personButton) {
//         setStatusMessage("Please select a person to remove inventory from.", 3);
//         return;
//     }

//     toggleModal(event);
//     // console.log("Trigger Entfernen with PersonId " + personId, " PersonDisplayName " + personDisplayName);

//     // make request to get item by id and add content to table with persons-items id, item-name
//     fetch(`/users/${personUsername}/stock`, {
//         method: 'GET',
//     })
//         .then((response) => response.json())
//         .then((data) => {
//             // console.log(data);            
//             // insert array values into table with id <table id="persons-items">
//             data.forEach(item => {
//                 const row = tbody.insertRow();
//                 const cell1 = row.insertCell(0);
//                 const cell2 = row.insertCell(1);
//                 const cell3 = row.insertCell(2);
//                 const cell4 = row.insertCell(3);
//                 cell1.innerHTML = item.id;
//                 cell2.innerHTML = item.product.name;
//                 cell3.innerHTML = item.amount;
//                 cell4.innerHTML = `<a class="clickable-icon" onclick="deleteItem(event, ${item.id})"><i data-feather="trash-2"></i></a>`;
//             });
//             feather.replace();
//         }).catch((error) => {
//             console.error('Error:', error);
//             // Optionally, update the UI to inform the user that an error occurred
//         });
// }    
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
    }, 100);
}