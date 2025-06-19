// Βρες τα στοιχεία
const input = document.getElementById('todoInput');
const addButton = document.getElementById('addButton');
const todoList = document.getElementById('todoList');

// Συνάρτηση για να δημιουργείς νέα λίστα
function addTodo() {
  const taskText = input.value.trim();
  if (taskText === '') {
    alert('Γράψε κάτι πριν πατήσεις το κουμπί!');
    return;
  }

  // Δημιουργία νέου <li>
  const li = document.createElement('li');
  li.textContent = taskText;

  // Όταν κάνεις κλικ στο task, το μαρκάρεις ως ολοκληρωμένο
  li.addEventListener('click', () => {
    li.classList.toggle('completed');
  });

  // Πρόσθεσε το στο ul
  todoList.appendChild(li);

  // Καθάρισε το input
  input.value = '';
}

// Event listener για το κουμπί
addButton.addEventListener('click', addTodo);

// Προαιρετικά: πρόσθεσε δυνατότητα να προσθέτεις με Enter
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTodo();
  }
});
