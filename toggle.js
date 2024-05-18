function toggleView() {
    const output = document.getElementById('output');
    if (output.innerHTML.trim() === output.dataset.formatted.trim()) {
        output.textContent = output.dataset.json;
    } else {
        output.innerHTML = output.dataset.formatted;
    }
}
