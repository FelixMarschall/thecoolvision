const videoElement = document.getElementById('webcamVideo');

navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
        videoElement.srcObject = stream;

        // Send the stream to the Flask server
        if (!MediaRecorder.isTypeSupported('video/webm')) {
            console.log('WebM video format is not supported');
        }
        let options = { mimeType: 'video/webm' };
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorder.ondataavailable = function (event) {

            if (event.data.size > 0) {
                const formData = new FormData();
                formData.append('video', event.data, 'webcam_stream.webm');

                fetch('/process_video', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => {
                        if (response.ok) {
                            console.log('Video data sent successfully');
                        } else {
                            console.error('Failed to send video data');
                        }
                    })
                    .catch(error => {
                        console.error('Error sending video data:', error);
                    });
            }
        };

        mediaRecorder.start(10000); // Send data every 1 second
    })
    .catch(function (error) {
        console.error('Error accessing webcam:', error);
    });