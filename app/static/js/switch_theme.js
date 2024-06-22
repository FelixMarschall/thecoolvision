// Get the current theme from local storage or default to 'light'
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);

// Set the initial state of the toggle switch
const toggleSwitch = document.getElementById('theme-toggle');
if (currentTheme === 'dark') {
    toggleSwitch.checked = true;
}

// Add an event listener to the toggle switch
toggleSwitch.addEventListener('change', function() {
    if (toggleSwitch.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
});