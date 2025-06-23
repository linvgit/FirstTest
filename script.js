// Supabase setup
const SUPABASE_URL = 'https://alatqjskbjoevrdgqorr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsYXRxanNrYmpvZXZyZGdxb3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjUxMzAsImV4cCI6MjA2NjI0MTEzMH0.eoG5KeVV65xxPJmgU9-HA2dFDJVmfXTmCcf8awYaT58';

// Αφού φορτώθηκε το supabase-js (v2), το global object είναι supabase
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

const notesHeader = document.getElementById('notes-header');
const signupDiv = document.getElementById('signup');
const authDiv = document.getElementById('auth');

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

  // Σημείωση: το πεδίο email_confirmed_at δεν είναι πάντα διαθέσιμο εδώ,
  // συνήθως το διαχειρίζεται ο server. Μπορείς να εμπιστευτείς το status του user.
  if (!data.user || !data.user.email_confirmed_at) {
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    signupDiv.style.display = 'none';
    authDiv.style.display = 'none';
    btnLogout.style.display = 'inline-block';
    form.style.display = 'block';
    searchInput.style.display = 'block';
    notesHeader.style.display = 'block';

    loadNotes();
  } else {
    signupDiv.style.display = 'flex';
    authDiv.style.display = 'flex';
    btnLogout.style.display = 'none';
    form.style.display = 'none';
    searchInput.style.display = 'none';
    notesHeader.style.display = 'none';
    notesList.innerHTML = '';
  }
}

// --- Φόρτωση σημειώσεων ---
async function loadNotes() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
    <strong>${escapeHtml(note.title)}</strong>
    <p>${escapeHtml(note.content)}</p>
    <button data-id="${note.id}" class="delete-btn">Διαγραφή</button>
  `;

  notesList.prepend(noteDiv);
}

// Ασφαλής αποφυγή XSS (αν θες προαιρετικά)
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, (m) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[m];
  });
}

// --- Προσθήκη νέας σημείωσης ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    alert('Γέμισε όλα τα πεδία');
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
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
// Χρησιμοποιούμε event delegation για τα κουμπιά διαγραφής
notesList.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.getAttribute('data-id');
    if (id) {
      const { error } = await supabase.from('notes').delete().eq('id', id);

      if (error) {
        alert('Σφάλμα διαγραφής: ' + error.message);
        return;
      }
      loadNotes();
    }
  }
});

// --- Φόρτωση UI κατά το φόρτωμα της σελίδας ---
window.addEventListener('load', toggleAuthUI);
