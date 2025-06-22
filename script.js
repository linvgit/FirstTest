// Επιλέγουμε τα στοιχεία από το DOM
const form = document.getElementById('note-form');
const titleInput = document.getElementById('note-title');
const contentInput = document.getElementById('note-content');
const notesList = document.getElementById('notes-list');

// Φορτώνει τις σημειώσεις από localStorage όταν φορτώνει η σελίδα
window.addEventListener('load', loadNotes);

// Όταν πατάς "Αποθήκευση"
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (title === '' || content === '') return;

  const note = { id: Date.now(), title, content };
  saveNote(note);
  displayNote(note);

  // Καθαρίζουμε τη φόρμα
  form.reset();
});

// Αποθήκευση σε localStorage
function saveNote(note) {
  const notes = getNotes();
  notes.push(note);
  localStorage.setItem('notes', JSON.stringify(notes));
}

// Φέρνουμε τις σημειώσεις από localStorage
function getNotes() {
  return JSON.parse(localStorage.getItem('notes')) || [];
}

// Εμφάνιση όλων των σημειώσεων στην αρχή
function loadNotes() {
  const notes = getNotes();
  notes.forEach(displayNote);
}

// Εμφανίζει μία σημείωση στο DOM
function displayNote(note) {
  const noteDiv = document.createElement('div');
  noteDiv.className = 'note';

  noteDiv.innerHTML = `
    <strong>${note.title}</strong>
    <p>${note.content}</p>
    <button onclick="deleteNote(${note.id})">Διαγραφή</button>
  `;

  notesList.prepend(noteDiv);
}

// Διαγραφή σημείωσης
function deleteNote(id) {
  let notes = getNotes();
  notes = notes.filter(note => note.id !== id);
  localStorage.setItem('notes', JSON.stringify(notes));
  refreshNotes();
}

// Ξαναφορτώνει τη λίστα μετά από διαγραφή
function refreshNotes() {
  notesList.innerHTML = '';
  loadNotes();
}

// Αναζήτηση
const searchInput = document.getElementById('search-input');

searchInput.addEventListener('input', () => {
  const keyword = searchInput.value.toLowerCase();
  const notes = document.querySelectorAll('.note');

  notes.forEach(note => {
    const title = note.querySelector('strong').textContent.toLowerCase();
    const content = note.querySelector('p').textContent.toLowerCase();

    const match = title.includes(keyword) || content.includes(keyword);

    note.style.display = match ? 'block' : 'none';
  });
});
