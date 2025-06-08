document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const output = document.querySelector('.output');
    const copyBtn = document.getElementById('copyBtn');

    // Handle form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const fileInput = document.querySelector('input[type="file"]');
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select a file');
            return;
        }

        // Show loading state
        output.innerHTML = '<p>Converting image to ASCII art...</p>';
        copyBtn.style.display = 'none';

        // Create FormData object
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/Home/Generate', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const asciiContent = await response.text();

                // Display the ASCII art in a pre element to preserve formatting
                output.innerHTML = `<pre style="font-family: monospace; white-space: pre; overflow-x: auto; background: #000; color: #0f0; padding: 10px; border-radius: 4px;">${asciiContent}</pre>`;

                // Show copy button
                copyBtn.style.display = 'inline-block';

            } else if (response.status === 400) {
                output.innerHTML = '<p style="color: red;">Error: No file uploaded or invalid file</p>';
            } else if (response.status === 500) {
                output.innerHTML = '<p style="color: red;">Error: Server error occurred while processing the image</p>';
            } else {
                output.innerHTML = '<p style="color: red;">Error: Unexpected error occurred</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            output.innerHTML = '<p style="color: red;">Error: Failed to connect to server</p>';
        }
    });

    // Handle copy button click
    copyBtn.addEventListener('click', function () {
        const preElement = output.querySelector('pre');

        if (preElement) {
            const textContent = preElement.textContent;

            // Try using the newer Clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textContent).then(function () {
                    showCopyMessage('ASCII art copied to clipboard!');
                }).catch(function () {
                    // Fallback to older method
                    fallbackCopy(textContent);
                });
            } else {
                // Fallback for older browsers
                fallbackCopy(textContent);
            }
        }
    });

    // Fallback copy method for older browsers
    function fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            showCopyMessage('ASCII art copied to clipboard!');
        } catch (err) {
            showCopyMessage('Failed to copy to clipboard', true);
        }

        document.body.removeChild(textArea);
    }

    // Show copy confirmation message
    function showCopyMessage(message, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            background: ${isError ? '#ff4444' : '#4CAF50'};
            color: white;
            border-radius: 4px;
            z-index: 1000;
            font-family: Arial, sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;

        document.body.appendChild(messageDiv);

        // Remove message after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
});