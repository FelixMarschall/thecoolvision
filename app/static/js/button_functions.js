// Define some basic elements
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

// Function to display status messages
function setStatusMessage(statusMessageText, time) {
    statusMessage.innerText = statusMessageText;
    statusMessage.hidden = false;
    setTimeout(() => {
        statusMessage.hidden = true;
    }, 1000 * time); // 3 seconds
}

// Function to select a button, does also deselect the relevant buttons
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

// Function to add a product, checks if all the nessesary buttons are selected & picture is taken
function hinzufuegen() {
    var selectedButtons = document.querySelectorAll('.selected');
    var mhdDelay, mhdUnit, personName;

    if (selectedButtons.length < 2) {
        setStatusMessage("Bitte wähle eine Person und ein Mhd-Datum aus.", 3);
        return;
    }
    if (!video.paused) {
        setStatusMessage("Bitte speichere ein Bild ab.", 3);
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

    console.log(`bestBeforeDate: ${bestBeforeDate}`);

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
            setStatusMessage("Produkt erfolgreich hinzugefügt.", 1);
            abbrechen();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Function to calculate the best before date from the given delay and unit
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

// Function to reset the video and the selected buttons
function abbrechen() {
    document.querySelectorAll('.selected').forEach(button => {
        button.classList.remove('selected');
    });
    video.play();
    takePhotoButton.innerHTML = "Foto aufnehmen 📸";
}

// Test der funktion entfernen(die hier funktioniert)
function entfernen(event) {
    // Get all selected buttons
    var selectedButtons = document.querySelectorAll('.selected');

    // Find a selected person button
    var personButton = Array.from(selectedButtons).find(button => button.classList.contains('btn-pers'));

    // Check if a person button is selected
    if (!personButton) {
        setStatusMessage("Bitte wähle eine Peron aus, um das Inventar zu bearbeiten.", 3);
        return;
    }
    var personName; // Declare the personName variable
    selectedButtons.forEach(button => {
        if (button.classList.contains('btn-pers')) {
            personName = button.innerText;
        }
    });
    toggleModal(event);

    const url = '/user/' + personName + '/products';
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
                    setStatusMessage("Produkt erfolgreich entfernt.", 1);
                    abbrechen();
                })
                .catch((error) => {
                    console.error('Error removing product:', error);
                });
        })
        .catch((error) => {
            console.error('Error fetching products:', error);
        });
}

// Function to list the content
function inhalt_auflisten(event) {
    // fetch data from the server
    // get /users/products"
    fetch('/users/products', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            // display content as table with persons and items
            if (response.ok && response.headers.get('Content-Type')?.includes('application/json')) {
                return response.json(); // Parse as JSON if the response is JSON
            } else {
                return response.text(); // Otherwise, return as text
            }
        }).then(data => {
            displayAllProducts(data);
        }).catch((error) => {
            console.error('Error:', error);
        });

    toggleModal(event);
}

// Function to display all products
function displayAllProducts(products) {
    // Assuming 'products' is an array of objects where each object represents a product
    const listAllProductsDiv = document.getElementById('listAllProducts');
    listAllProductsDiv.innerHTML = ''; // Clear existing content

    const table = document.createElement('table');
    table.setAttribute('class', 'products-table'); // Add a class for styling if needed

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    // Assuming product object keys can be used as headers
    if (products.length > 0) {
        Object.keys(products[0]).forEach(key => {
            if (key.toUpperCase() !== 'ID' && key.toUpperCase() !== 'BEST_BEFORE_DATE') { // Skip 'ID' and 'BEST_BEFORE_DATE'
                const th = document.createElement('th');
                th.textContent = key.toUpperCase(); // Convert header keys to uppercase
                headerRow.appendChild(th);
            }
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
    }

    // Create table body
    const tbody = document.createElement('tbody');
    products.forEach(product => {
        const row = document.createElement('tr');
        Object.keys(product).forEach(key => {
            if (key.toUpperCase() !== 'ID' && key.toUpperCase() !== 'BEST_BEFORE_DATE') { // Skip 'ID' and 'BEST_BEFORE_DATE'
                const td = document.createElement('td');
                td.textContent = product[key]; // Add product details to each cell
                row.appendChild(td);
            }
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    // Append the table to the div
    listAllProductsDiv.appendChild(table);
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
            noProductsParagraph.textContent = 'Es gibt keine Produkte für diesen Nutzer.';
            productListElement.appendChild(noProductsParagraph);

            console.log('No products found:', products);
            return;
        }

        // Extract unique names
        const uniqueProducts = [...new Set(products.map(product => product.name))];

        // Iterate over unique product names
        uniqueProducts.forEach(productName => {
            console.log(productName);

            productID = products.find(product => product.name === productName).id;

            console.log(productID);

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
                console.log("resolve: " + productID);
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
            paragraph.textContent = `MhD für ${productName}`;
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
    return filteredList.reduce((acc, { best_before_date }) => {
        if (!acc[best_before_date]) {
            acc[best_before_date] = 0;
        }
        acc[best_before_date]++;
        return acc;
    }, {});
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

// Function to keep the grammer of the month, week and day buttons correct
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

// Function to get the amount of the selected button (e.g. 3 for the days button)
function getAmountSelectedButton(buttonId) {
    const button = document.getElementById(buttonId);
    const buttonTexts = button.innerText.split(' ')
    return parseInt(buttonTexts[0]);
}

// Function to get the unit of the selected button (e.g. "Tage" for the days button)
function getUnitSelectedButton(buttonId) {
    const button = document.getElementById(buttonId);
    const buttonTexts = button.innerText.split(' ')
    return buttonTexts[1];
}

// Function to take a photo
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

// Function to start the photo process, includes the countdown
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
            takePhotoButton.innerHTML = "Foto neu aufnehmen 📸";
            clearInterval(countdownInterval);
        } else {
            overlay.innerText = countdown;
            countdown--;
        }
    }, 400);
}