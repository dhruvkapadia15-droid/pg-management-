// Live search for list tables
const search = document.getElementById('search');
if (search) {
    search.addEventListener('input', () => {
        const q = search.value.toLowerCase();
        document.querySelectorAll('#data tr:not(:first-child)').forEach(tr => {
            tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    });
}
// Confirm before deleting
document.querySelectorAll('form.del').forEach(f =>
    f.addEventListener('submit', e => { if (!confirm('Delete this entry?')) e.preventDefault(); }));
// Fade out flash messages
const flash = document.querySelector('.flash');
if (flash) setTimeout(() => flash.remove(), 3500);
