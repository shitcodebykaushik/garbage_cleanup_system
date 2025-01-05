// Handle "Before Image" file selection and preview
document.getElementById('before-image').addEventListener('change', function (event) {
    displayImagePreview(event, 'before-preview');
});

// Handle "After Image" file selection and preview
document.getElementById('after-image').addEventListener('change', function (event) {
    displayImagePreview(event, 'after-preview');
});

// Function to display the image preview
function displayImagePreview(event, previewId) {
    const file = event.target.files[0];
    const preview = document.getElementById(previewId);
    preview.innerHTML = ''; // Clear any previous content

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

// Handle "Before Image" form submission
document.getElementById('before-form').onsubmit = async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const response = await fetch('/upload', { method: 'POST', body: formData });
    const result = await response.json();
    alert(result.success ? "Before Image Uploaded!" : `Error: ${result.error}`);
};

// Handle "After Image" form submission
document.getElementById('after-form').onsubmit = async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const response = await fetch('/upload', { method: 'POST', body: formData });
    const result = await response.json();
    alert(result.success ? "After Image Uploaded!" : `Error: ${result.error}`);
};

// Handle "Generate Report" button click
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

        // Refresh the list of available reports
        loadReports();
    } else {
        alert("Failed to generate report.");
    }
};

// Fetch and display available reports
async function loadReports() {
    const response = await fetch('/get_reports');
    const reports = await response.json();
    const reportsList = document.getElementById('reports-list');
    reportsList.innerHTML = ''; // Clear any existing content

    if (reports.length === 0) {
        reportsList.innerHTML = '<p>No reports available</p>';
        return;
    }

    // Populate the reports list
    reports.forEach(report => {
        const reportLink = document.createElement('a');
        reportLink.href = report.url;
        reportLink.textContent = report.name;
        reportLink.target = '_blank';
        reportLink.classList.add('report-link');
        reportsList.appendChild(reportLink);
    });
}

// Load reports when the page loads
window.onload = loadReports;
