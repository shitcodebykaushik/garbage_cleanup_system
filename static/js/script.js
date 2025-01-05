document.getElementById('before-image').addEventListener('change', function (event) {
    displayImagePreview(event, 'before-preview');
});

document.getElementById('after-image').addEventListener('change', function (event) {
    displayImagePreview(event, 'after-preview');
});

function displayImagePreview(event, previewId) {
    const file = event.target.files[0];
    const preview = document.getElementById(previewId);
    preview.innerHTML = '';

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '<p>No image selected</p>';
    }
}

document.getElementById('before-form').onsubmit = async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const response = await fetch('/upload', { method: 'POST', body: formData });
    const result = await response.json();
    alert(result.success ? "Before Image Uploaded!" : `Error: ${result.error}`);
};

document.getElementById('after-form').onsubmit = async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const response = await fetch('/upload', { method: 'POST', body: formData });
    const result = await response.json();
    alert(result.success ? "After Image Uploaded!" : `Error: ${result.error}`);
};

document.getElementById('generate-report').onclick = async function () {
    const response = await fetch('/generate_report', { method: 'POST' });
    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'cleanup_report.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        alert("Report Generated and Downloaded!");
    } else {
        alert("Failed to generate report.");
    }
};
