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
    var selectedButtonsText = [];
    var amount, unit, person;

    selectedButtons.forEach(button => {
        if (button.classList.contains('btn-mhd')) {
            unit = getUnitSelectedButton(button.id);
            amount = getAmountSelectedButton(button.id);
        } else if (button.classList.contains('btn-pers')) {
            person = button.innerText;
        }
    });

    console.log(amount, unit, person);
}

function abbrechen() {
        document.querySelectorAll('.selected').forEach(button => {
        button.classList.remove('selected');
    });
}

function entfernen(event) {
    // get the button id of the selected button
    var selectedButtons = document.querySelectorAll('.selected');
    var personId, personDisplayName;

    // is selectedButtons empty?
    if (selectedButtons.length == 0) {
        console.log("No Person button selected");
        return;
    }

    const table = document.getElementById("persons-items");
    const tbody = table.tBodies[0];
    tbody.innerHTML = "";

    toggleModal(event);

    // get id of button
    selectedButtons.forEach(button => {
        if (button.classList.contains('btn-pers')) {
            personId = button.id;
            personDisplayName = button.innerText;
            console.log("Trigger Entfernen with PersonId " + personId, " PersonDisplayName " + personDisplayName);
        }
    });

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
    if (! button.classList.contains('selected')) {
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
    if (! button.classList.contains('selected')) {
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

function checkGrammer(buttonID){
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
    var overlay = document.querySelector(".countdown-overlay");
    var countdown = 3;
    var countdownInterval = setInterval(function() {
        if (countdown === 0) {
            console.log("Take the photo!");
            overlay.innerText = "";
            clearInterval(countdownInterval);
        } else {
            overlay.innerText = countdown;
            countdown--;
        }
    }, 700);
}