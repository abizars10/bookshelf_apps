const books = [];
const RENDER_EVENT = "render_book";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addForm();
  });

  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBooks();
  });
});

function searchBooks() {
  const searchTitle = document.getElementById("searchBookTitle").value;

  const filteredBooks = books.filter((book) => book.title.toLowerCase().includes(searchTitle.toLowerCase()));

  // Hapus isi dari rak buku yang belum selesai dibaca dan selesai dibaca
  const incompletedBookList = document.getElementById("incompleteBookshelfList");
  incompletedBookList.innerHTML = "";
  const completedBookList = document.getElementById("completeBookshelfList");
  completedBookList.innerHTML = "";

  // Tambahkan buku hasil pencarian ke rak yang sesuai
  for (const bookItem of filteredBooks) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      incompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
}

function addForm() {
  const textTitle = document.getElementById("inputBookTitle").value;
  const textAuthor = document.getElementById("inputBookAuthor").value;
  const textYear = document.getElementById("inputBookYear").value;
  const checkbox = document.getElementById("inputBookIsComplete");

  const generatedID = generateId();

  const isCompleted = checkbox.checked;

  const bookObject = generateBookObject(generatedID, textTitle, textAuthor, textYear, isCompleted);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  // console.log(books);
  const incompletedBookList = document.getElementById("incompleteBookshelfList");
  incompletedBookList.innerHTML = "";
  const completedBookList = document.getElementById("completeBookshelfList");
  completedBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      incompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;
  const textAuthor = document.createElement("p");
  textAuthor.innerText = bookObject.author;
  const textYear = document.createElement("p");
  textYear.innerText = bookObject.year;
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("action");

  const textContainer = document.createElement("article");
  textContainer.classList.add("book_shelf");
  textContainer.append(textTitle, textAuthor, textYear, buttonContainer);

  const container = document.createElement("div");
  container.append(textContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.innerText = "Belum Selesai Dibaca";
    undoButton.classList.add("green");

    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.innerText = "Hapus Buku";
    trashButton.classList.add("red");

    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(bookObject.id);
    });

    buttonContainer.append(undoButton, trashButton);

    const completeBookshelfList = document.getElementById("completeBookshelfList");
    completeBookshelfList.appendChild(container);
  } else {
    const checkButton = document.createElement("button");
    checkButton.innerText = "Selesai Dibaca";
    checkButton.classList.add("green");

    checkButton.addEventListener("click", function () {
      addTaskToCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.innerText = "Hapus Buku";
    trashButton.classList.add("red");

    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(bookObject.id);
    });

    buttonContainer.append(checkButton, trashButton);
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    incompleteBookshelfList.appendChild(container);
  }

  return container;
}

function addTaskToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeTaskFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = "saved-books";
const STORAGE_KEY = "BOOKSHELF_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage.");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener("DOMContentLoaded", function () {
  // ...
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
