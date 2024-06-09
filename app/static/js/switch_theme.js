 // Select the element
 var element = document.querySelector('[data-theme]');

 // Select the toggle switch
 var toggle = document.querySelector('#toggle');

 // Add event listener
 toggle.addEventListener('change', function () {
     // Check current theme
     var currentTheme = element.getAttribute('data-theme');

     // Switch theme
     if (currentTheme === 'light') {
         element.setAttribute('data-theme', 'dark');
     } else {
         element.setAttribute('data-theme', 'light');
     }
 });