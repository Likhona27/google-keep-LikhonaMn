class Note {
  constructor(id, title, text, pinned = false) {
    this.id = id;
    this.title = title;
    this.text = text;
    this.pinned = pinned;
  }
}

class App {
  constructor() {
    this.notes = JSON.parse(localStorage.getItem("notes")) || [];
    this.selectedNoteId = "";
    this.miniSidebar = true;

    this.$activeForm = document.querySelector(".active-form");
    this.$inactiveForm = document.querySelector(".inactive-form");
    this.$noteTitle = document.querySelector("#note-title");
    this.$noteText = document.querySelector("#note-text");
    this.$notes = document.querySelector(".notes");
    this.$form = document.querySelector("#form");
    this.$modal = document.querySelector(".modal");
    this.$modalForm = document.querySelector("#modal-form");
    this.$modalTitle = document.querySelector("#modal-title");
    this.$modalText = document.querySelector("#modal-text");
    this.$closeModalForm = document.querySelector("#modal-btn");
    this.$sidebar = document.querySelector(".sidebar");
    this.$sidebarActiveItem = document.querySelector(".active-item");

    this.addEventListeners();
    this.displayNotes();
  }

  addEventListeners() {
    document.body.addEventListener("click", (event) => {
      this.handleFormClick(event);
      this.closeModal(event);
      this.openModal(event);
      this.handleArchiving(event);
      this.handlePin(event);
    });

    this.$form.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = this.$noteTitle.value;
      const text = this.$noteText.value;
      this.addNote({ title, text });
      this.closeActiveForm();
    });

    this.$modalForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });

    this.$sidebar.addEventListener("mouseover", () => {
      this.$sidebar.style.width = "280px";
      this.$sidebarActiveItem.classList.add("active-item");
    });

    this.$sidebar.addEventListener("mouseout", () => {
      this.$sidebar.style.width = "50px";
      this.$sidebarActiveItem.classList.remove("active-item");
    });
  
  }
  handleFormClick(event) {
    const isActiveFormClickedOn = this.$activeForm.contains(event.target);
    const isInactiveFormClickedOn = this.$inactiveForm.contains(event.target);

    if (isInactiveFormClickedOn) {
      this.openActiveForm();
    } else if (!isActiveFormClickedOn) {
      const title = this.$noteTitle.value;
      const text = this.$noteText.value;
      this.addNote({ title, text });
      this.closeActiveForm();
    }
  }

  openActiveForm() {
    this.$inactiveForm.style.display = "none";
    this.$activeForm.style.display = "block";
    this.$noteText.focus();
  }

  closeActiveForm() {
    this.$inactiveForm.style.display = "block";
    this.$activeForm.style.display = "none";
    this.$noteTitle.value = "";
    this.$noteText.value = "";
  }

  openModal(event) {
    const noteEl = event.target.closest(".note");
    if (noteEl && !event.target.closest(".archive") && !event.target.closest(".pin-icon")) {
      this.selectedNoteId = noteEl.id;
      const note = this.notes.find(n => n.id === this.selectedNoteId);
      this.$modalTitle.value = note.title;
      this.$modalText.value = note.text;
      this.$modal.classList.add("open-modal");
    }
  }

  closeModal(event) {
    const isModalFormClickedOn = this.$modalForm.contains(event.target);
    const isCloseBtnClicked = this.$closeModalForm.contains(event.target);

    if ((!isModalFormClickedOn || isCloseBtnClicked) && this.$modal.classList.contains("open-modal")) {
      this.editNote(this.selectedNoteId, {
        title: this.$modalTitle.value,
        text: this.$modalText.value,
      });
      this.$modal.classList.remove("open-modal");
    }
  }

  handleArchiving(event) {
    if (event.target.closest(".archive")) {
      const noteEl = event.target.closest(".note");
      this.deleteNote(noteEl.id);
    }
  }

  handlePin(event) {
    if (!event.target.classList.contains("pin-icon")) return;

    const noteEl = event.target.closest(".note");
    const noteId = noteEl.id;

    this.notes = this.notes.map(note => {
      if (note.id === noteId) {
        note.pinned = !note.pinned;
      }
      return note;
    });

    this.render();
  }

  addNote({ title, text }) {
    if (!text) return;
    const newNote = new Note(cuid(), title, text);
    this.notes.push(newNote);
    this.render();
  }

  editNote(id, { title, text }) {
    this.notes = this.notes.map(note => {
      if (note.id === id) {
        note.title = title;
        note.text = text;
      }
      return note;
    });
    this.render();
  }

  deleteNote(id) {
    this.notes = this.notes.filter(note => note.id !== id);
    this.render();
  }

  saveNotes() {
    localStorage.setItem("notes", JSON.stringify(this.notes));
  }

  render() {
    this.saveNotes();
    this.displayNotes();
  }

  displayNotes() {
    const pinned = this.notes.filter(note => note.pinned);
    const others = this.notes.filter(note => !note.pinned);

    this.$notes.innerHTML = [...pinned, ...others].map(note => `
      <div class="note" id="${note.id}">
        
        <span class="material-symbols-outlined check-circle">check_circle</span>

        <span class="material-symbols-outlined pin-icon ${note.pinned ? "pinned" : ""}">
          push_pin
        </span>

        <div class="title">${note.title || ""}</div>
        <div class="text">${note.text}</div>

        <!-- ✅ ALL SMALL ICONS PRESERVED -->
        <div class="note-footer">
          <div class="tooltip">
            <span class="material-symbols-outlined small-icon">add_alert</span>
            <span class="tooltip-text">Remind me</span>
          </div>

          <div class="tooltip">
            <span class="material-symbols-outlined small-icon">person_add</span>
            <span class="tooltip-text">Collaborator</span>
          </div>

          <div class="tooltip">
            <span class="material-symbols-outlined small-icon">palette</span>
            <span class="tooltip-text">Change Color</span>
          </div>

          <div class="tooltip">
            <span class="material-symbols-outlined small-icon">image</span>
            <span class="tooltip-text">Add Image</span>
          </div>

          <div class="tooltip archive">
            <span class="material-symbols-outlined small-icon">archive</span>
            <span class="tooltip-text">Archive</span>
          </div>

          <div class="tooltip">
            <span class="material-symbols-outlined small-icon">more_vert</span>
            <span class="tooltip-text">More</span>
          </div>
        </div>
      </div>
    `).join("");
  }

  
}

const app = new App();
/* ================= DARK MODE WITH ICON SWITCH ================= */

const themeToggle = document.getElementById("theme-toggle");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "light_mode";
}

// Toggle theme
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "light_mode";
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.textContent = "dark_mode";
    localStorage.setItem("theme", "light");
  }
});



