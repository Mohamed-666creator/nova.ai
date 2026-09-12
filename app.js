let mode = "login";
let user = null;
let chats = [];
let current = null;
let pendingImage = null;

const $ = id => document.getElementById(id);

const auth = $("auth");
const app = $("app");

const loginTab = $("lt");
const signupTab = $("st");

const form = $("af");

const nameInput = $("name");
const emailInput = $("email");
const passInput = $("pass");

const remember = $("remember");
const authButton = $("as");
const errorBox = $("ae");

const messages = $("msgs");
const text = $("text");

const newButton = $("new");
const list = $("list");
const userBox = $("user");

const themeButton = $("theme");
const logoutButton = $("logout");

const imageInput = $("img");
const preview = $("prev");
const previewImage = $("pi");
const removeImage = $("rm");


/* ================= AUTH MODE ================= */

function showLogin() {

  mode = "login";

  loginTab.classList.add("active");
  signupTab.classList.remove("active");

  nameInput.classList.add("hide");

  authButton.textContent = "دخول";

  errorBox.textContent = "";

}


function showSignup() {

  mode = "signup";

  signupTab.classList.add("active");
  loginTab.classList.remove("active");

  nameInput.classList.remove("hide");

  authButton.textContent = "إنشاء حساب";

  errorBox.textContent = "";

}


/* ================= BUTTONS ================= */

loginTab.type = "button";
signupTab.type = "button";

loginTab.onclick = showLogin;
signupTab.onclick = showSignup;


/* ================= USERS ================= */

function getUsers() {

  try {

    return JSON.parse(
      localStorage.getItem("nova_users") || "[]"
    );

  } catch {

    return [];

  }

}


function saveUsers(users) {

  localStorage.setItem(
    "nova_users",
    JSON.stringify(users)
  );

}


/* ================= AUTH ================= */

form.onsubmit = function(event) {

  event.preventDefault();

  errorBox.textContent = "";

  const name =
    nameInput.value.trim();

  const email =
    emailInput.value.trim().toLowerCase();

  const password =
    passInput.value;

  if (!email) {

    errorBox.textContent =
      "اكتب البريد الإلكتروني.";

    return;

  }

  if (!password) {

    errorBox.textContent =
      "اكتب كلمة المرور.";

    return;

  }


  const users = getUsers();


  /* ===== CREATE ACCOUNT ===== */

  if (mode === "signup") {

    if (!name) {

      errorBox.textContent =
        "اكتب الاسم.";

      nameInput.focus();

      return;

    }


    if (password.length < 4) {

      errorBox.textContent =
        "كلمة المرور يجب أن تكون 4 أحرف على الأقل.";

      return;

    }


    const exists =
      users.some(
        u => u.email === email
      );


    if (exists) {

      errorBox.textContent =
        "هذا البريد مسجل بالفعل. جرّب تسجيل الدخول.";

      return;

    }


    const newUser = {

      name: name,

      email: email,

      password: password

    };


    users.push(newUser);

    saveUsers(users);

    user = newUser;


    if (remember.checked) {

      localStorage.setItem(
        "nova_current_user",
        email
      );

    }


    startApp();

    return;

  }


  /* ===== LOGIN ===== */

  const found =
    users.find(
      u =>
        u.email === email &&
        u.password === password
    );


  if (!found) {

    errorBox.textContent =
      "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

    return;

  }


  user = found;


  if (remember.checked) {

    localStorage.setItem(
      "nova_current_user",
      email
    );

  } else {

    localStorage.removeItem(
      "nova_current_user"
    );

  }


  startApp();

};


/* ================= APP ================= */

function chatKey() {

  return user
    ? "nova_chats_" + user.email
    : "nova_chats";

}


function loadChats() {

  try {

    chats = JSON.parse(
      localStorage.getItem(chatKey()) || "[]"
    );

  } catch {

    chats = [];

  }

}


function saveChats() {

  localStorage.setItem(
    chatKey(),
    JSON.stringify(chats)
  );

}


function startApp() {

  auth.classList.add("hide");

  app.classList.remove("hide");

  userBox.textContent =
    user.name || user.email;

  loadChats();

  renderList();


  if (!chats.length) {

    createChat();

  } else {

    current =
      chats[chats.length - 1].id;

    renderMessages();

  }

}


/* ================= CHAT ================= */

function createChat() {

  const chat = {

    id: Date.now(),

    title: "محادثة جديدة",

    messages: []

  };


  chats.push(chat);

  current = chat.id;

  saveChats();

  renderList();

  renderMessages();

}


newButton.onclick = createChat;


function currentChat() {

  return chats.find(
    chat => chat.id === current
  );

}


/* ================= LIST ================= */

function renderList() {

  list.innerHTML = "";

  [...chats]
    .reverse()
    .forEach(chat => {

      const item =
        document.createElement("div");

      item.className = "chat";

      if (chat.id === current) {

        item.classList.add("active");

      }

      item.textContent =
        chat.title || "محادثة جديدة";

      item.onclick = () => {

        current = chat.id;

        renderList();

        renderMessages();

      };

      list.appendChild(item);

    });

}


/* ================= MESSAGES ================= */

function renderMessages() {

  messages.innerHTML = "";

  const chat = currentChat();

  if (!chat) return;


  chat.messages.forEach(message => {

    addMessage(
      message.role,
      message.content
    );

  });


  messages.scrollTop =
    messages.scrollHeight;

}


function addMessage(role, content) {

  const div =
    document.createElement("div");

  div.className =
    "msg " +
    (role === "user"
      ? "user"
      : "ai");

  div.textContent = content;

  messages.appendChild(div);

}


/* ================= SEND ================= */

document.getElementById("cf").onsubmit =
async function(event) {

  event.preventDefault();

  const message =
    text.value.trim();

  if (!message && !pendingImage) return;

  const chat = currentChat();

  if (!chat) return;


  let content = message;

  if (pendingImage) {

    content =
      message
        ? message + "\n\n[تم إرفاق صورة]"
        : "[تم إرفاق صورة]";

  }


  chat.messages.push({

    role: "user",

    content: content

  });


  if (chat.title === "محادثة جديدة") {

    chat.title =
      message.slice(0, 35) ||
      "محادثة جديدة";

  }


  addMessage("user", content);

  text.value = "";

  removePendingImage();

  saveChats();

  renderList();


  const loading =
    document.createElement("div");

  loading.className =
    "msg ai loading";

  loading.textContent =
    "NOVA AI يكتب...";

  messages.appendChild(loading);

  messages.scrollTop =
    messages.scrollHeight;


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
            chat.messages.map(m => ({

              role: m.role,

              content: m.content

            }))

        })

      });


    const data =
      await response.json();

    loading.remove();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "حدث خطأ في الخادم."
      );

    }


    const reply =
      data.reply ||
      "لم يصل نص في الرد.";


    chat.messages.push({

      role: "assistant",

      content: reply

    });


    addMessage(
      "assistant",
      reply
    );

    saveChats();

    messages.scrollTop =
      messages.scrollHeight;


  } catch (error) {

    loading.remove();

    addMessage(
      "assistant",
      "تعذر الاتصال بـ NOVA AI: " +
      error.message
    );

  }

};


/* ================= IMAGE ================= */

imageInput.onchange = function() {

  const file =
    imageInput.files[0];

  if (!file) return;

  pendingImage = file;

  const reader =
    new FileReader();

  reader.onload = function() {

    previewImage.src =
      reader.result;

    preview.classList.remove("hide");

  };

  reader.readAsDataURL(file);

};


removeImage.onclick =
removePendingImage;


function removePendingImage() {

  pendingImage = null;

  imageInput.value = "";

  previewImage.src = "";

  preview.classList.add("hide");

}


/* ================= THEME ================= */

themeButton.onclick = function() {

  document.body.classList.toggle("light");

  localStorage.setItem(
    "nova_theme",
    document.body.classList.contains("light")
      ? "light"
      : "dark"
  );

};


if (
  localStorage.getItem("nova_theme") === "light"
) {

  document.body.classList.add("light");

}


/* ================= LOGOUT ================= */

logoutButton.onclick = function() {

  localStorage.removeItem(
    "nova_current_user"
  );

  location.reload();

};


/* ================= AUTO LOGIN ================= */

const savedEmail =
  localStorage.getItem(
    "nova_current_user"
  );


if (savedEmail) {

  const found =
    getUsers().find(
      u => u.email === savedEmail
    );

  if (found) {

    user = found;

    startApp();

  }

}
