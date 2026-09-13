/* =========================================================
   NOVA AI
   Main Application
   ========================================================= */

"use strict";


/* =========================================================
   ELEMENTS
   ========================================================= */

const auth = document.getElementById("auth");
const app = document.getElementById("app");

const loginTab = document.getElementById("lt");
const signupTab = document.getElementById("st");

const authForm = document.getElementById("af");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("pass");

const rememberInput = document.getElementById("remember");

const authButton = document.getElementById("as");
const authError = document.getElementById("ae");

const userBox = document.getElementById("user");

const newChatButton = document.getElementById("new");
const chatList = document.getElementById("list");

const messagesBox = document.getElementById("msgs");

const chatForm = document.getElementById("cf");
const textInput = document.getElementById("text");

const themeButton = document.getElementById("theme");
const logoutButton = document.getElementById("logout");

const attachButton = document.getElementById("attachBtn");
const attachOptions = document.getElementById("attachOptions");

const addImageButton = document.getElementById("addImageBtn");
const imageInput = document.getElementById("img");

const preview = document.getElementById("prev");
const previewImage = document.getElementById("pi");
const removeImageButton = document.getElementById("rm");

const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarClose = document.getElementById("sidebarClose");
const sidebarOverlay = document.getElementById("sidebarOverlay");


/* =========================================================
   STATE
   ========================================================= */

let authMode = "login";

let currentUser = null;

let chats = [];

let currentChatId = null;

let attachedImage = null;


/* =========================================================
   LOCAL STORAGE KEYS
   ========================================================= */

const USERS_KEY = "nova_users";
const CURRENT_USER_KEY = "nova_current_user";
const THEME_KEY = "nova_theme";


/* =========================================================
   HELPERS
   ========================================================= */

function getUsers() {

  try {

    return JSON.parse(
      localStorage.getItem(USERS_KEY) || "{}"
    );

  } catch {

    return {};

  }

}


function saveUsers(users) {

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(users)
  );

}


function chatsKey() {

  if (!currentUser) return null;

  return `nova_chats_${currentUser.email}`;

}


function saveChats() {

  if (!currentUser) return;

  localStorage.setItem(
    chatsKey(),
    JSON.stringify(chats)
  );

}


function loadChats() {

  if (!currentUser) {

    chats = [];

    return;

  }

  try {

    chats = JSON.parse(
      localStorage.getItem(chatsKey()) || "[]"
    );

  } catch {

    chats = [];

  }

}


function createId() {

  return Date.now().toString(36) +
    Math.random().toString(36).slice(2);

}


function escapeHTML(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   AUTH TABS
   ========================================================= */

function setAuthMode(mode) {

  authMode = mode;

  authError.textContent = "";

  if (mode === "signup") {

    loginTab.classList.remove("active");
    signupTab.classList.add("active");

    nameInput.classList.remove("hide");

    nameInput.required = true;

    passInput.autocomplete = "new-password";

    authButton.textContent = "إنشاء الحساب";

  } else {

    signupTab.classList.remove("active");
    loginTab.classList.add("active");

    nameInput.classList.add("hide");

    nameInput.required = false;

    passInput.autocomplete = "current-password";

    authButton.textContent = "دخول";

  }

}


loginTab.addEventListener("click", () => {

  setAuthMode("login");

});


signupTab.addEventListener("click", () => {

  setAuthMode("signup");

});


/* =========================================================
   AUTH
   ========================================================= */

authForm.addEventListener("submit", (event) => {

  event.preventDefault();

  authError.textContent = "";

  const email = emailInput.value.trim().toLowerCase();

  const password = passInput.value;

  const name = nameInput.value.trim();

  if (!email || !password) {

    authError.textContent =
      "اكتب البريد الإلكتروني وكلمة المرور.";

    return;

  }


  const users = getUsers();


  /* ================= SIGN UP ================= */

  if (authMode === "signup") {

    if (!name) {

      authError.textContent =
        "اكتب اسمك أولاً.";

      return;

    }

    if (password.length < 4) {

      authError.textContent =
        "كلمة المرور يجب أن تكون 4 أحرف على الأقل.";

      return;

    }

    if (users[email]) {

      authError.textContent =
        "هذا الحساب موجود بالفعل.";

      return;

    }


    users[email] = {

      name: name,

      email: email,

      password: password

    };


    saveUsers(users);

    currentUser = {

      name: name,

      email: email

    };


    if (rememberInput.checked) {

      localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(currentUser)
      );

    }


    openApp();

    return;

  }


  /* ================= LOGIN ================= */

  const account = users[email];

  if (!account) {

    authError.textContent =
      "الحساب غير موجود. أنشئ حسابًا أولاً.";

    return;

  }


  if (account.password !== password) {

    authError.textContent =
      "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

    return;

  }


  currentUser = {

    name: account.name,

    email: account.email

  };


  if (rememberInput.checked) {

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(currentUser)
    );

  } else {

    localStorage.removeItem(
      CURRENT_USER_KEY
    );

  }


  openApp();

});


/* =========================================================
   OPEN APP
   ========================================================= */

function openApp() {

  auth.classList.add("hide");

  app.classList.remove("hide");

  userBox.textContent =
    currentUser?.name || "مستخدم";

  loadChats();

  createFirstChatIfNeeded();

  renderChatList();

  renderCurrentChat();

  createSidebarControls();

}


/* =========================================================
   LOGOUT
   ========================================================= */

logoutButton.addEventListener("click", () => {

  closeSidebar();

  currentUser = null;

  chats = [];

  currentChatId = null;

  attachedImage = null;

  localStorage.removeItem(
    CURRENT_USER_KEY
  );

  app.classList.add("hide");

  auth.classList.remove("hide");

  authForm.reset();

  setAuthMode("login");

});


/* =========================================================
   CHAT CREATION
   ========================================================= */

function createFirstChatIfNeeded() {

  if (chats.length > 0) {

    if (!currentChatId) {

      currentChatId = chats[0].id;

    }

    return;

  }


  const chat = {

    id: createId(),

    title: "محادثة جديدة",

    messages: [],

    createdAt: Date.now()

  };


  chats.unshift(chat);

  currentChatId = chat.id;

  saveChats();

}


function createNewChat() {

  const chat = {

    id: createId(),

    title: "محادثة جديدة",

    messages: [],

    createdAt: Date.now()

  };


  chats.unshift(chat);

  currentChatId = chat.id;

  saveChats();

  renderChatList();

  renderCurrentChat();

  closeSidebar();

  textInput.focus();

}


newChatButton.addEventListener(
  "click",
  createNewChat
);


/* =========================================================
   CHAT LIST
   ========================================================= */

function renderChatList() {

  chatList.innerHTML = "";

  chats.forEach((chat) => {

    const item = document.createElement("div");

    item.className = "chat-item";

    if (chat.id === currentChatId) {

      item.classList.add("active");

    }


    const title = document.createElement("span");

    title.textContent =
      chat.title || "محادثة جديدة";


    const deleteButton =
      document.createElement("button");

    deleteButton.type = "button";

    deleteButton.className =
      "delete-chat";

    deleteButton.textContent = "♲";

    deleteButton.title =
      "حذف المحادثة";


    item.appendChild(title);

    item.appendChild(deleteButton);


    title.addEventListener("click", () => {

      currentChatId = chat.id;

      saveChats();

      renderChatList();

      renderCurrentChat();

      closeSidebar();

    });


    deleteButton.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        deleteChat(chat.id);

      }
    );


    chatList.appendChild(item);

  });

}


function deleteChat(id) {

  chats = chats.filter(
    chat => chat.id !== id
  );


  if (currentChatId === id) {

    currentChatId =
      chats[0]?.id || null;

  }


  if (chats.length === 0) {

    createFirstChatIfNeeded();

  }


  saveChats();

  renderChatList();

  renderCurrentChat();

}


/* =========================================================
   CURRENT CHAT
   ========================================================= */

function getCurrentChat() {

  return chats.find(
    chat => chat.id === currentChatId
  );

}


function renderCurrentChat() {

  messagesBox.innerHTML = "";

  const chat = getCurrentChat();

  if (!chat) return;


  if (!chat.messages.length) {

    const welcome =
      document.createElement("div");

    welcome.className =
      "welcome";

    welcome.innerHTML = `
      <img
        src="/nova-icon-192.png"
        alt="NOVA AI"
      >

      <h2>مرحبًا بك في NOVA AI ✦</h2>

      <p>
        أنا مساعدك الذكي. اكتب رسالتك وابدأ المحادثة.
      </p>
    `;

    messagesBox.appendChild(welcome);

    return;

  }


  chat.messages.forEach(
    renderMessage
  );

  scrollMessages();

}


function renderMessage(message) {

  const row =
    document.createElement("div");

  row.className =
    `message-row ${message.role}`;


  const bubble =
    document.createElement("div");

  bubble.className =
    "message";


  if (message.role === "assistant") {

    bubble.innerHTML = `
      <div class="message-name">
        NOVA AI
      </div>
      <div class="message-content">
        ${formatText(message.content)}
      </div>
    `;

  } else {

    bubble.innerHTML = `
      <div class="message-content">
        ${formatText(message.content)}
      </div>
    `;

  }


  row.appendChild(bubble);

  messagesBox.appendChild(row);

}


function formatText(text) {

  return escapeHTML(text)
    .replace(/\n/g, "<br>");

}


function scrollMessages() {

  messagesBox.scrollTop =
    messagesBox.scrollHeight;

}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

chatForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    const text =
      textInput.value.trim();


    if (!text && !attachedImage) {

      return;

    }


    const chat = getCurrentChat();

    if (!chat) return;


    let messageText = text;


    if (attachedImage) {

      messageText +=
        `${messageText ? "\n\n" : ""}🖼️ تم إرفاق صورة.`;

    }


    chat.messages.push({

      role: "user",

      content: messageText

    });


    if (
      chat.title === "محادثة جديدة" &&
      text
    ) {

      chat.title =
        text.slice(0, 35) +
        (text.length > 35 ? "…" : "");

    }


    textInput.value = "";

    autoResize();

    removeAttachedImage();

    saveChats();

    renderChatList();

    renderCurrentChat();


    const loading =
      document.createElement("div");

    loading.className =
      "message-row assistant";

    loading.innerHTML = `
      <div class="message loading-message">
        <div class="message-name">
          NOVA AI
        </div>
        <div class="typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    messagesBox.appendChild(loading);

    scrollMessages();


    try {

      const response =
        await fetch("/api/chat", {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            messages:
              chat.messages

          })

        });


      let data;

      try {

        data = await response.json();

      } catch {

        throw new Error(
          "الخادم لم يُرجع JSON صحيحًا."
        );

      }


      if (!response.ok) {

        throw new Error(
          data.error ||
          "حدث خطأ في الخادم."
        );

      }


      const reply =
        data.reply ||
        data.output ||
        data.text;


      if (!reply) {

        throw new Error(
          "لم يصل نص في الرد."
        );

      }


      loading.remove();


      chat.messages.push({

        role: "assistant",

        content: reply

      });


      saveChats();

      renderCurrentChat();


    } catch (error) {

      loading.remove();


      const errorRow =
        document.createElement("div");

      errorRow.className =
        "message-row assistant";


      errorRow.innerHTML = `
        <div class="message error-message">

          <div class="message-name">
            NOVA AI
          </div>

          <div class="message-content">
            تعذر الاتصال بـ NOVA AI.
            <br>
            <small>
              ${escapeHTML(error.message)}
            </small>
          </div>

        </div>
      `;


      messagesBox.appendChild(errorRow);

      scrollMessages();

    }

  }
);


/* =========================================================
   TEXTAREA
   ========================================================= */

textInput.addEventListener(
  "input",
  autoResize
);


textInput.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      chatForm.requestSubmit();

    }

  }
);


function autoResize() {

  textInput.style.height = "auto";

  textInput.style.height =
    Math.min(
      textInput.scrollHeight,
      180
    ) + "px";

}


/* =========================================================
   ATTACHMENT
   ========================================================= */

attachButton.addEventListener(
  "click",
  (event) => {

    event.stopPropagation();

    attachOptions.classList.toggle("hide");

  }
);


document.addEventListener(
  "click",
  (event) => {

    if (
      !event.target.closest(".attach-menu")
    ) {

      attachOptions.classList.add("hide");

    }

  }
);


addImageButton.addEventListener(
  "click",
  () => {

    imageInput.click();

    attachOptions.classList.add("hide");

  }
);


imageInput.addEventListener(
  "change",
  () => {

    const file =
      imageInput.files?.[0];

    if (!file) return;


    if (!file.type.startsWith("image/")) {

      return;

    }


    attachedImage = file;


    const reader =
      new FileReader();


    reader.onload = (event) => {

      previewImage.src =
        event.target.result;

      preview.classList.remove("hide");

    };


    reader.readAsDataURL(file);

  }
);


removeImageButton.addEventListener(
  "click",
  removeAttachedImage
);


function removeAttachedImage() {

  attachedImage = null;

  imageInput.value = "";

  previewImage.src = "";

  preview.classList.add("hide");

}


/* =========================================================
   THEME
   ========================================================= */

function applyTheme() {

  const theme =
    localStorage.getItem(
      THEME_KEY
    ) || "dark";


  if (theme === "light") {

    document.body.classList.add("light");

    themeButton.textContent =
      "🌙 الوضع الداكن";

  } else {

    document.body.classList.remove("light");

    themeButton.textContent =
      "☀️ الوضع الفاتح";

  }

}


themeButton.addEventListener(
  "click",
  () => {

    const isLight =
      document.body.classList.contains(
        "light"
      );


    if (isLight) {

      localStorage.setItem(
        THEME_KEY,
        "dark"
      );

    } else {

      localStorage.setItem(
        THEME_KEY,
        "light"
      );

    }


    applyTheme();

  }
);


/* =========================================================
   SIDEBAR
   ========================================================= */

function createSidebarControls() {

  if (!sidebar || !sidebarToggle) {
    return;
  }


  /* زر الفتح */

  sidebarToggle.onclick = (
    event
  ) => {

    event.stopPropagation();

    toggleSidebar();

  };


  /* زر الإغلاق */

  if (sidebarClose) {

    sidebarClose.onclick = (
      event
    ) => {

      event.stopPropagation();

      closeSidebar();

    };

  }


  /* الخلفية */

  if (sidebarOverlay) {

    sidebarOverlay.onclick = () => {

      closeSidebar();

    };

  }

}


function openSidebar() {

  app.classList.add(
    "sidebar-open"
  );

  app.classList.remove(
    "sidebar-closed"
  );

  if (sidebarOverlay) {

    sidebarOverlay.classList.add(
      "show"
    );

  }

  sidebarToggle.setAttribute(
    "aria-label",
    "إغلاق السايد بار"
  );

}


function closeSidebar() {

  app.classList.remove(
    "sidebar-open"
  );

  app.classList.add(
    "sidebar-closed"
  );

  if (sidebarOverlay) {

    sidebarOverlay.classList.remove(
      "show"
    );

  }

  sidebarToggle.setAttribute(
    "aria-label",
    "فتح السايد بار"
  );

}


function toggleSidebar() {

  if (
    app.classList.contains(
      "sidebar-closed"
    )
  ) {

    openSidebar();

  } else {

    closeSidebar();

  }

}


/* ESC */

document.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Escape") {

      closeSidebar();

      attachOptions.classList.add(
        "hide"
      );

    }

  }
);


/* =========================================================
   AUTO LOGIN
   ========================================================= */

function checkSavedLogin() {

  applyTheme();


  let saved = null;


  try {

    saved =
      JSON.parse(
        localStorage.getItem(
          CURRENT_USER_KEY
        )
      );

  } catch {

    saved = null;

  }


  if (
    saved &&
    saved.email
  ) {

    const users =
      getUsers();

    const account =
      users[saved.email];


    if (account) {

      currentUser = {

        name: account.name,

        email: account.email

      };


      openApp();

      return;

    }

  }


  auth.classList.remove("hide");

  app.classList.add("hide");

}


/* =========================================================
   START
   ========================================================= */

setAuthMode("login");

createSidebarControls();

checkSavedLogin();
