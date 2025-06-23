// Supabase setup
const SUPABASE_URL = 'https://alatqjskbjoevrdgqorr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsYXRxanNrYmpvZXZyZGdxb3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjUxMzAsImV4cCI6MjA2NjI0MTEzMH0.eoG5KeVV65xxPJmgU9-HA2dFDJVmfXTmCcf8awYaT58'; // Βάλε το δικό σου
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const form = document.getElementById('note-form');
const titleInput = document.getElementById('note-title');
const contentInput = document.getElementById('note-content');
const notesList = document.getElementById('notes-list');
const searchInput = document.getElementById('search-input');
const signupEmailInput = document.getElementById('signup-email');
const signupPasswordInput = document.getElementById('signup-password');
const btnSignup = document.getElementById('btn-signup');
const { data, error } = await supabase.auth.signUp({ email, password });

if (error) {
  console.log('Σφάλμα εγγραφής:', error.message);
  alert('Σφάλμα εγγραφής: ' + error.message);
} else {
  console.log('Εγγραφή επιτυχής, τσέκαρε το email για επιβεβαίωση');
  alert('Επιτυχής εγγραφή! Έλεγξε το email σου για επιβεβαίωση.');
}
if (data.user && !data.user.email_confirmed_at) {
  alert('Πρέπει να επιβεβαιώσεις το email σου πριν συνδεθείς');
}




// Authentication UI (πρόσθεσε αν θες input και κουμπιά login/signup)
const authDiv = document.createElement('div');
authDiv.innerHTML = `
  <input type="email" id="email" placeholder="Email" />
  <input type="password" id="password" placeholder="Κωδικός" />
  <button id="btn-login">Σύνδεση</button>
  <button id="btn-logout" style="display:none;">Αποσύνδεση</button>
`;
document.body.insertBefore(authDiv, document.body.firstChild);

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');

// Event Listeners για login/logout
btnLogin.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return alert('Σφάλμα σύνδεσης: ' + error.message);
  alert('Επιτυχής σύνδεση!');
  toggleAuthUI();
  loadNotes();
});

btnLogout.addEventListener('click', async () => {
  await supabase.auth.signOut();
  alert('Αποσυνδέθηκες');
  toggleAuthUI();
  notesList.innerHTML = '';
});

// Εμφάνιση/απόκρυψη στοιχείων ανάλογα με κατάσταση σύνδεσης
async function toggleAuthUI() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    authDiv.style.display = 'none';
    btnLogout.style.display = 'inline-block';
    form.style.display = 'block';
    searchInput.style.display = 'block';
  } else {
    authDiv.style.display = 'block';
    btnLogout.style.display = 'none';
    form.style.display = 'none';
    searchInput.style.display = 'none';
  }
}

// Φόρτωση σημειώσεων από Supabase
async function loadNotes() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return alert('Σφάλμα φόρτωσης σημειώσεων: ' + error.message);

  notesList.innerHTML = '';
  data.forEach(displayNote);
}

// Εμφάνιση σημείωσης στο UI
function displayNote(note) {
  const noteDiv = document.createElement('div');
  noteDiv.className = 'note';

  noteDiv.innerHTML = `
    <strong>${note.title}</strong>
    <p>${note.content}</p>
    <button onclick="deleteNote('${note.id}')">Διαγραφή</button>
  `;

  notesList.prepend(noteDiv);
}

// Προσθήκη νέας σημείωσης
form.addEventListener('submit', async e => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) return alert('Γέμισε όλα τα πεδία');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert('Πρέπει να συνδεθείς για να προσθέσεις σημείωση.');

  const { error } = await supabase
    .from('notes')
    .insert([{ title, content, user_id: user.id }]);

  if (error) return alert('Σφάλμα προσθήκης σημείωσης: ' + error.message);

  titleInput.value = '';
  contentInput.value = '';
  loadNotes();
});

// Διαγραφή σημείωσης
async function deleteNote(id) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) return alert('Σφάλμα διαγραφής: ' + error.message);
  loadNotes();
}

// Φόρτωση UI ανάλογα με κατάσταση σύνδεσης μόλις φορτώσει η σελίδα
window.addEventListener('load', toggleAuthUI);
