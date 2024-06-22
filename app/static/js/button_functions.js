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