// Supabase setup
const SUPABASE_URL = 'https://alatqjskbjoevrdgqorr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsYXRxanNrYmpvZXZyZGdxb3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjUxMzAsImV4cCI6MjA2NjI0MTEzMH0.eoG5KeVV65xxPJmgU9-HA2dFDJVmfXTmCcf8awYaT58';
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

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');

// --- SIGNUP ---
btnSignup.addEventListener('click', async () => {
  const email = signupEmailInput.value.trim();
  const password = signupPasswordInput.value.trim();

  if (!email || !password) {
    alert('Γέμισε email και κωδικό για εγγραφή');
    return;
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert('Σφάλμα εγγραφής: ' + error.message);
    return;
  }

  alert('Επιτυχής εγγραφή! Έλεγξε το email σου για επιβεβαίωση.');

  // Καθάρισμα πεδίων
  signupEmailInput.value = '';
  signupPasswordInput.value = '';
});

// --- LOGIN ---
btnLogin.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert('Γέμισε email και κωδικό για σύνδεση');
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert('Σφάλμα σύνδεσης: ' + error.message);
    return;
  }

  // Έλεγχος αν έχει επιβεβαιωθεί το email
  if (!data.user.email_confirmed_at) {
    alert('Πρέπει να επιβεβαιώσεις το email σου πριν συνδεθείς.');
    await supabase.auth.signOut();
    return;
  }

  alert('Επιτυχής σύνδεση!');
  toggleAuthUI();
  loadNotes();
});

// --- LOGOUT ---
btnLogout.addEventListener('click', async () => {
  await supabase.auth.signOut();
  alert('Αποσυνδέθηκες');
  toggleAuthUI();
  notesList.innerHTML = '';
});

// --- Εμφάνιση/απόκρυψη στοιχείων ανάλογα με κατάσταση σύνδεσης ---
async function toggleAuthUI() {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Κρύβουμε τα inputs σύνδεσης/εγγραφής
    document.getElementById('signup').style.display = 'none';
    document.getElementById('auth').style.display = 'none';
    btnLogout.style.display = 'inline-block';

    // Εμφάνιση φόρμας σημειώσεων και αναζήτησης
    form.style.display = 'block';
    searchInput.style.display = 'block';

    loadNotes();
  } else {
    // Εμφάνιση inputs σύνδεσης/εγγραφής
    document.getElementById('signup').style.display = 'flex';
    document.getElementById('auth').style.display = 'flex';
    btnLogout.style.display = 'none';

    // Κρύβουμε φόρμα σημειώσεων και αναζήτησης
    form.style.display = 'none';
    searchInput.style.display = 'none';

    notesList.innerHTML = '';
  }
}

// --- Φόρτωση σημειώσεων ---
async function loadNotes() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    alert('Σφάλμα φόρτωσης σημειώσεων: ' + error.message);
    return;
  }

  notesList.innerHTML = '';
  data.forEach(displayNote);
}

// --- Εμφάνιση σημείωσης στο UI ---
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

// --- Προσθήκη νέας σημείωσης ---
form.addEventListener('submit', async e => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    alert('Γέμισε όλα τα πεδία');
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert('Πρέπει να συνδεθείς για να προσθέσεις σημείωση.');
    return;
  }

  const { error } = await supabase
    .from('notes')
    .insert([{ title, content, user_id: user.id }]);

  if (error) {
    alert('Σφάλμα προσθήκης σημείωσης: ' + error.message);
    return;
  }

  titleInput.value = '';
  contentInput.value = '';
  loadNotes();
});

// --- Διαγραφή σημείωσης ---
async function deleteNote(id) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) {
    alert('Σφάλμα διαγραφής: ' + error.message);
    return;
  }

  loadNotes();
}

// --- Φόρτωση UI κατά το φόρτωμα της σελίδας ---
window.addEventListener('load', toggleAuthUI);
