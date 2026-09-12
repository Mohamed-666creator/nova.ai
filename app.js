const $ = (id) => document.getElementById(id);


/* ================= DATA ================= */

let mode = "login";
let user = null;
let chats = [];
let current = null;
let pendingImage = null;


/* ================= ELEMENTS ================= */

const auth = $("auth");
const app = $("app");

const loginTab = $("lt");
const signupTab = $("st");

const authForm = $("af");

const nameInput = $("name");
const emailInput = $("email");
const passInput = $("pass");

const rememberInput = $("remember");

const authButton = $("as");
const authError = $("ae");

const messagesBox = $("msgs");

const textInput = $("text");

const chatForm = $("cf");

const chatList = $("list");

const userBox = $("user");

const newChatButton = $("new");

const themeButton = $("theme");

const logoutButton = $("logout");

const imageInput = $("img");

const preview = $("prev");
const previewImage = $("pi");
const removeImage = $("rm");


/* ================= STORAGE ================= */

function getUsers() {

  return JSON.parse(
    localStorage.getItem("nova_users") || "[]"
  );

}


function saveUsers(users) {

  localStorage.setItem(
    "nova_users",
    JSON.stringify(users)
  );

}


function userChatsKey() {

  if (!user) return "nova_chats";

  return "nova_chats_" + user.email;

}


function loadChats() {

  chats = JSON.parse(
    localStorage.getItem(userChatsKey()) || "[]"
  );

}


function saveChats() {

  localStorage.setItem(
    userChatsKey(),
    JSON.stringify(chats)
  );

}


/* ================= AUTH TABS ================= */

loginTab.onclick = () => {

  mode = "login";

  loginTab.classList.add("active");
  signupTab.classList.remove("active");

  nameInput.classList.add("hide");

  authButton.textContent = "دخول";

  authError.textContent = "";

};


signupTab.onclick = () => {

  mode = "signup";

  signupTab.classList.add("active");
  loginTab.classList.remove("active");

  nameInput.classList.remove("hide");

  authButton.textContent = "إنشاء حساب";

  authError.textContent = "";

};


/* ================= AUTH ================= */

authForm.onsubmit = (e) => {

  e.preventDefault();

  const name = nameInput.value.trim();

  const email = emailInput.value.trim().toLowerCase();

  const password = passInput.value;

  if (!email || !password) {

    authError.textContent =
      "من فضلك أكمل البيانات.";

    return;

  }


  const users = getUsers();


  /* ===== SIGNUP ===== */

  if (mode === "signup") {

    if (!name) {

      authError.textContent =
        "اكتب اسمك أولًا.";

      return;

    }


    if (password.length < 4) {

      authError.textContent =
        "كلمة المرور يجب أن تكون 4 أحرف على الأقل.";

      return;

    }


    if (
      users.some(
        (u) => u.email === email
      )
    ) {

      authError.textContent =
        "هذا البريد مسجل بالفعل.";

      return;

    }


    const newUser = {
      name,
      email,
      password
    };


    users.push(newUser);

    saveUsers(users);

    user = newUser;

    if (rememberInput.checked) {

      localStorage.setItem(
        "nova_current_user",
        email
      );

    }


    startApp();

    return;

  }


  /* ===== LOGIN ===== */

  const found = users.find(
    (u) =>
      u.email === email &&
      u.password === password
  );


  if (!found) {

    authError.textContent =
      "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

    return;

  }


  user = found;


  if (rememberInput.checked) {

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


/* ================= START APP ================= */

function startApp() {

  auth.classList.add("hide");

  app.classList.remove("hide");

  userBox.textContent =
    user?.name || user?.email || "";

  loadChats();

  renderChatList();


  if (chats.length === 0) {

    createChat();

  } else {

    current =
      chats[chats.length - 1].id;

    renderMessages();

  }

}


/* ================= CREATE CHAT ================= */

function createChat() {

  const chat = {

    id: Date.now(),

    title: "محادثة جديدة",

    messages: []

  };


  chats.push(chat);

  current = chat.id;

  saveChats();

  renderChatList();

  renderMessages();

  textInput.focus();

}


/* ================= NEW CHAT ================= */

newChatButton.onclick = () => {

  createChat();

};


/* ================= CHAT LIST ================= */

function renderChatList() {

  chatList.innerHTML = "";


  chats
    .slice()
    .reverse()
    .forEach((chat) => {

      const div =
        document.createElement("div");

      div.className = "chat";


      if (chat.id === current) {

        div.classList.add("active");

      }


      div.textContent =
        chat.title || "محادثة جديدة";


      div.onclick = () => {

        current = chat.id;

        renderChatList();

        renderMessages();

      };


      chatList.appendChild(div);

    });

}


/* ================= CURRENT CHAT ================= */

function getCurrentChat() {

  return chats.find(
    (chat) => chat.id === current
  );

}


/* ================= RENDER MESSAGES ================= */

function renderMessages() {

  messagesBox.innerHTML = "";

  const chat = getCurrentChat();

  if (!chat) return;


  chat.messages.forEach(
    (message) => {

      addMessageToScreen(
        message.role,
        message.content
      );

    }
  );


  messagesBox.scrollTop =
    messagesBox.scrollHeight;

}


/* ================= ADD MESSAGE ================= */

function addMessageToScreen(
  role,
  content
) {

  const div =
    document.createElement("div");


  div.className =
    "msg " +
    (role === "user"
      ? "user"
      : "ai");


  div.textContent = content;


  messagesBox.appendChild(div);

}


/* ================= SEND MESSAGE ================= */

chatForm.onsubmit = async (e) => {

  e.preventDefault();


  const text =
    textInput.value.trim();


  if (!text && !pendingImage) {

    return;

  }


  const chat =
    getCurrentChat();


  if (!chat) return;


  let userMessage = text;


  if (pendingImage) {

    userMessage =
      text
        ? text + "\n\n[تم إرفاق صورة]"
        : "[تم إرفاق صورة]";

  }


  chat.messages.push({

    role: "user",

    content: userMessage

  });


  if (
    chat.title === "محادثة جديدة"
  ) {

    chat.title =
      text.slice(0, 35) ||
      "محادثة جديدة";

  }


  addMessageToScreen(
    "user",
    userMessage
  );


  textInput.value = "";

  removePendingImage();

  saveChats();

  renderChatList();


  /* ===== LOADING ===== */

  const loading =
    document.createElement("div");

  loading.className =
    "msg ai loading";

  loading.textContent =
    "NOVA AI يكتب...";

  messagesBox.appendChild(loading);

  messagesBox.scrollTop =
    messagesBox.scrollHeight;


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
            chat.messages.map(
              (m) => ({

                role: m.role,

                content: m.content

              })
            )

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


    addMessageToScreen(
      "assistant",
      reply
    );


    saveChats();


    messagesBox.scrollTop =
      messagesBox.scrollHeight;


  } catch (error) {

    loading.remove();


    const errorMessage =
      "تعذر الاتصال بـ NOVA AI: " +
      error.message;


    addMessageToScreen(
      "assistant",
      errorMessage
    );

  }

};


/* ================= IMAGE ================= */

imageInput.onchange = () => {

  const file =
    imageInput.files?.[0];

  if (!file) return;


  pendingImage = file;


  const reader =
    new FileReader();


  reader.onload = () => {

    previewImage.src =
      reader.result;

    preview.classList.remove(
      "hide"
    );

  };


  reader.readAsDataURL(file);

};


removeImage.onclick = () => {

  removePendingImage();

};


function removePendingImage() {

  pendingImage = null;

  imageInput.value = "";

  previewImage.src = "";

  preview.classList.add(
    "hide"
  );

}


/* ================= TEXTAREA ================= */

textInput.addEventListener(
  "input",
  () => {

    textInput.style.height =
      "auto";

    textInput.style.height =
      Math.min(
        textInput.scrollHeight,
        140
      ) + "px";

  }
);


/* ================= THEME ================= */

themeButton.onclick = () => {

  document.body.classList.toggle(
    "light"
  );


  const light =
    document.body.classList.contains(
      "light"
    );


  localStorage.setItem(
    "nova_theme",
    light
      ? "light"
      : "dark"
  );

};


if (
  localStorage.getItem(
    "nova_theme"
  ) === "light"
) {

  document.body.classList.add(
    "light"
  );

}


/* ================= LOGOUT ================= */

logoutButton.onclick = () => {

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

  const users =
    getUsers();


  const savedUser =
    users.find(
      (u) =>
        u.email === savedEmail
    );


  if (savedUser) {

    user = savedUser;

    startApp();

  }

}
