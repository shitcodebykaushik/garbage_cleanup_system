document.getElementById('before-form').onsubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const response = await fetch('/upload', { method: 'POST', body: formData });
    const result = await response.json();
    alert(result.success ? "Before Image Uploaded!" : "Upload Failed!");
};

document.getElementById('after-form').onsubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const response = await fetch('/upload', { method: 'POST', body: formData });
    const result = await response.json();
    alert(result.success ? "After Image Uploaded!" : "Upload Failed!");
};

document.getElementById('generate-report').onclick = async function() {
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
        alert("Report Downloaded!");
    } else {
        alert("Failed to generate report!");
    }
};
