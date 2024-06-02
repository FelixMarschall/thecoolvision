// Select the video element and the "take a photo" button
let video = document.querySelector('video');
let button = document.querySelector('#take-photo-button');

// Get access to the webcam
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        video.play();
    })
    .catch(error => console.error('Error:', error));

// Add a click event listener to the "take a photo" button
button.addEventListener('click', () => {
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
});