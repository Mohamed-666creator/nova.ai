document.addEventListener("DOMContentLoaded", () => {

  /* ================= AUTH ================= */

  const auth = document.getElementById("auth");
  const app = document.getElementById("app");

  const loginTab = document.getElementById("lt");
  const signupTab = document.getElementById("st");

  const authForm = document.getElementById("af");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("pass");
  const rememberInput = document.getElementById("remember");
  const authStatus = document.getElementById("as");
  const authError = document.getElementById("ae");

  let authMode = "login";

  let currentUser = null;
  let chats = [];
  let currentChat = null;
  let attachedImage = null;

  /* ================= APP ELEMENTS ================= */

  const userName = document.getElementById("user");
  const messagesBox = document.getElementById("msgs");
  const chatList = document.getElementById("list");

  const newChatBtn = document.getElementById("new");
  const logoutBtn = document.getElementById("logout");
  const themeBtn = document.getElementById("theme");

  const chatForm = document.getElementById("cf");
  const textInput = document.getElementById("text");

  const attachBtn = document.getElementById("attachBtn");
  const attachOptions = document.getElementById("attachOptions");
  const addImageBtn = document.getElementById("addImageBtn");

  const imageInput = document.getElementById("img");
  const previewBox = document.getElementById("prev");
  const previewImage = document.getElementById("pi");
  const removeImageBtn = document.getElementById("rm");

  /* ================= SIDEBAR ================= */

  let sidebarOverlay = null;

  function createMobileSidebarControls() {
    const header = document.querySelector(".app header");

    if (!header) return;

    let menuButton = document.getElementById("sidebarToggle");

    if (!menuButton) {
      menuButton = document.createElement("button");

      menuButton.id = "sidebarToggle";
      menuButton.type = "button";
      menuButton.className = "sidebar-toggle";
      menuButton.setAttribute("aria-label", "فتح القائمة");
      menuButton.innerHTML = "☰";

      header.insertBefore(menuButton, header.firstChild);

      menuButton.addEventListener("click", () => {
        toggleSidebar();
      });
    }

    sidebarOverlay = document.getElementById("sidebarOverlay");

    if (!sidebarOverlay) {
      sidebarOverlay = document.createElement("div");

      sidebarOverlay.id = "sidebarOverlay";
      sidebarOverlay.className = "sidebar-overlay";

      document.querySelector(".app").appendChild(sidebarOverlay);

      sidebarOverlay.addEventListener("click", () => {
        closeSidebar();
      });
    }
  }

  function openSidebar() {
    const appElement = document.querySelector(".app");

    if (!appElement) return;

    appElement.classList.add("sidebar-open");

    if (sidebarOverlay) {
      sidebarOverlay.classList.add("show");
    }
  }

  function closeSidebar() {
    const appElement = document.querySelector(".app");

    if (!appElement) return;

    appElement.classList.remove("sidebar-open");

    if (sidebarOverlay) {
      sidebarOverlay.classList.remove("show");
    }
  }

  function toggleSidebar() {
    const appElement = document.querySelector(".app");

    if (!appElement) return;

    if (appElement.classList.contains("sidebar-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  /* ================= AUTH TABS ================= */

  function setAuthMode(mode) {
    authMode = mode;

    if (authMode === "login") {
      loginTab?.classList.add("active");
      signupTab?.classList.remove("active");

      if (nameInput) {
        nameInput.classList.add("hide");
      }

      if (authStatus) {
        authStatus.textContent = "سجل دخولك إلى NOVA AI";
      }

    } else {
      signupTab?.classList.add("active");
      loginTab?.classList.remove("active");

      if (nameInput) {
        nameInput.classList.remove("hide");
      }

      if (authStatus) {
        authStatus.textContent = "أنشئ حساب NOVA AI";
      }
    }

    if (authError) {
      authError.textContent = "";
    }
  }

  loginTab?.addEventListener("click", () => {
    setAuthMode("login");
  });

  signupTab?.addEventListener("click", () => {
    setAuthMode("signup");
  });

  /* ================= LOCAL USERS ================= */

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem("nova_users") || "[]");
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem("nova_users", JSON.stringify(users));
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  /* ================= AUTH FORM ================= */

  authForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = String(nameInput?.value || "").trim();
    const email = normalizeEmail(emailInput?.value);
    const password = String(passInput?.value || "");

    if (authError) {
      authError.textContent = "";
    }

    if (!email || !password) {
      if (authError) {
        authError.textContent = "من فضلك اكتب البريد الإلكتروني وكلمة المرور.";
      }
      return;
    }

    const users = getUsers();

    if (authMode === "signup") {

      if (!name) {
        if (authError) {
          authError.textContent = "اكتب اسمك أولًا.";
        }
        return;
      }

      const exists = users.some(
        (item) => normalizeEmail(item.email) === email
      );

      if (exists) {
        if (authError) {
          authError.textContent = "هذا البريد مسجل بالفعل.";
        }
        return;
      }

      const newUser = {
        name,
        email,
        password
      };

      users.push(newUser);
      saveUsers(users);

      currentUser = {
        name,
        email
      };

      localStorage.setItem(
        "nova_current_user",
        JSON.stringify(currentUser)
      );

      openApp();

      return;
    }

    const foundUser = users.find(
      (item) =>
        normalizeEmail(item.email) === email &&
        item.password === password
    );

    if (!foundUser) {
      if (authError) {
        authError.textContent =
          "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
      }
      return;
    }

    currentUser = {
      name: foundUser.name,
      email: foundUser.email
    };

    if (rememberInput?.checked) {
      localStorage.setItem(
        "nova_current_user",
        JSON.stringify(currentUser)
      );
    } else {
      sessionStorage.setItem(
        "nova_current_user",
        JSON.stringify(currentUser)
      );
    }

    openApp();
  });

  /* ================= CHAT STORAGE ================= */

  function chatStorageKey() {
    if (!currentUser?.email) return null;

    return "nova_chats_" + normalizeEmail(currentUser.email);
  }

  function loadChats() {
    const key = chatStorageKey();

    if (!key) {
      chats = [];
      return;
    }

    try {
      chats = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      chats = [];
    }

    if (!Array.isArray(chats)) {
      chats = [];
    }
  }

  function saveChats() {
    const key = chatStorageKey();

    if (!key) return;

    localStorage.setItem(key, JSON.stringify(chats));
  }

  /* ================= CHAT CREATION ================= */

  function createNewChat() {
    const chat = {
      id:
        Date.now().toString() +
        "_" +
        Math.random().toString(36).slice(2),

      title: "محادثة جديدة",

      messages: [],

      createdAt: Date.now(),

      updatedAt: Date.now()
    };

    chats.unshift(chat);

    currentChat = chat;

    saveChats();
    renderChatList();
    renderMessages();

    closeSidebar();

    setTimeout(() => {
      textInput?.focus();
    }, 100);
  }

  function ensureChat() {
    if (!currentChat) {
      createNewChat();
    }
  }

  /* ================= OPEN CHAT ================= */

  function openChat(chatId) {
    const chat = chats.find(
      (item) => item.id === chatId
    );

    if (!chat) return;

    currentChat = chat;

    renderChatList();
    renderMessages();

    closeSidebar();
  }

  /* ================= CHAT TITLE ================= */

  function updateChatTitle(message) {
    if (!currentChat) return;

    if (
      currentChat.title === "محادثة جديدة" &&
      String(message || "").trim()
    ) {
      let title = String(message).trim();

      if (title.length > 35) {
        title = title.slice(0, 35) + "…";
      }

      currentChat.title = title;
    }

    currentChat.updatedAt = Date.now();

    saveChats();
    renderChatList();
  }

  /* ================= DELETE CHAT ================= */

  function deleteChat(chatId) {
    const chat = chats.find(
      (item) => item.id === chatId
    );

    if (!chat) return;

    const title =
      chat.title && chat.title !== "محادثة جديدة"
        ? chat.title
        : "هذه المحادثة";

    const confirmed = window.confirm(
      `هل أنت متأكد أنك تريد حذف "${title}"؟\n\nلا يمكن التراجع عن هذا الحذف.`
    );

    if (!confirmed) return;

    const index = chats.findIndex(
      (item) => item.id === chatId
    );

    if (index === -1) return;

    chats.splice(index, 1);

    if (currentChat?.id === chatId) {
      currentChat = null;
    }

    saveChats();
    renderChatList();

    if (!currentChat && chats.length > 0) {
      currentChat = chats[0];
    }

    if (!currentChat) {
      renderMessages();
    } else {
      renderMessages();
    }

    closeSidebar();
  }

  /* ================= CHAT LIST ================= */

  function renderChatList() {
    if (!chatList) return;

    chatList.innerHTML = "";

    if (chats.length === 0) {
      const empty = document.createElement("div");

      empty.className = "chat-empty";
      empty.textContent = "لا توجد محادثات";

      chatList.appendChild(empty);

      return;
    }

    const sortedChats = [...chats].sort(
      (a, b) =>
        Number(b.updatedAt || b.createdAt || 0) -
        Number(a.updatedAt || a.createdAt || 0)
    );

    sortedChats.forEach((chat) => {

      const wrapper = document.createElement("div");

      wrapper.className = "chat-row";

      if (currentChat?.id === chat.id) {
        wrapper.classList.add("active");
      }

      const openButton = document.createElement("button");

      openButton.type = "button";
      openButton.className = "chat";

      openButton.title = chat.title;

      openButton.textContent =
        chat.title || "محادثة جديدة";

      openButton.addEventListener("click", () => {
        openChat(chat.id);
      });

      const deleteButton = document.createElement("button");

      deleteButton.type = "button";

      deleteButton.className = "chat-delete";

      deleteButton.title = "حذف المحادثة";

      deleteButton.setAttribute(
        "aria-label",
        "حذف المحادثة"
      );

      deleteButton.innerHTML = "🗑";

      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        deleteChat(chat.id);
      });

      wrapper.appendChild(openButton);
      wrapper.appendChild(deleteButton);

      chatList.appendChild(wrapper);
    });
  }

  /* ================= MESSAGE RENDER ================= */

  function addMessageToScreen(role, content, loading = false) {
    if (!messagesBox) return null;

    const message = document.createElement("div");

    message.className =
      "msg " +
      (role === "user" ? "user" : "ai");

    if (loading) {
      message.classList.add("loading");
    }

    message.textContent = content;

    messagesBox.appendChild(message);

    messagesBox.scrollTop =
      messagesBox.scrollHeight;

    return message;
  }

  function renderMessages() {
    if (!messagesBox) return;

    messagesBox.innerHTML = "";

    if (!currentChat) {
      const welcome = document.createElement("div");

      welcome.className = "welcome";

      welcome.innerHTML = `
        <div class="welcome-logo">
          <img src="/nova-icon-192.png" alt="NOVA AI">
        </div>

        <h2>مرحبًا بك في NOVA AI</h2>

        <p>كيف يمكنني مساعدتك اليوم؟</p>
      `;

      messagesBox.appendChild(welcome);

      return;
    }

    if (!Array.isArray(currentChat.messages)) {
      currentChat.messages = [];
    }

    currentChat.messages.forEach((message) => {
      addMessageToScreen(
        message.role,
        message.content
      );
    });

    messagesBox.scrollTop =
      messagesBox.scrollHeight;
  }

  /* ================= SEND MESSAGE ================= */

  async function sendTextMessage(text) {

    ensureChat();

    if (!currentChat) return;

    const cleanText = String(text || "").trim();

    if (!cleanText && !attachedImage) {
      return;
    }

    let userText = cleanText;

    if (attachedImage) {
      if (userText) {
        userText += "\n\n🖼️ تم إرفاق صورة.";
      } else {
        userText = "🖼️ تم إرفاق صورة.";
      }
    }

    currentChat.messages.push({
      role: "user",
      content: userText
    });

    currentChat.updatedAt = Date.now();

    updateChatTitle(cleanText || "صورة مرفقة");

    saveChats();

    addMessageToScreen(
      "user",
      userText
    );

    if (textInput) {
      textInput.value = "";
      textInput.style.height = "auto";
    }

    removeAttachment();

    const loadingMessage =
      addMessageToScreen(
        "assistant",
        "جاري التفكير…",
        true
      );

    try {

      const response = await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            messages: currentChat.messages
              .map((message) => ({
                role: message.role,
                content: message.content
              }))
          })
        }
      );

      let data = null;

      const responseText =
        await response.text();

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "الخادم أرسل استجابة غير صالحة."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
          "حدث خطأ أثناء الاتصال بـ NOVA AI."
        );
      }

      const reply =
        String(data?.reply || "").trim();

      if (!reply) {
        throw new Error(
          "لم يصل نص في الرد."
        );
      }

      if (loadingMessage) {
        loadingMessage.remove();
      }

      currentChat.messages.push({
        role: "assistant",
        content: reply
      });

      currentChat.updatedAt = Date.now();

      saveChats();

      addMessageToScreen(
        "assistant",
        reply
      );

      renderChatList();

    } catch (error) {

      if (loadingMessage) {
        loadingMessage.remove();
      }

      const errorText =
        error?.message ||
        "تعذر الاتصال بـ NOVA AI.";

      addMessageToScreen(
        "assistant",
        "⚠️ " + errorText
      );
    }
  }

  /* ================= CHAT FORM ================= */

  chatForm?.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const value =
        String(textInput?.value || "").trim();

      await sendTextMessage(value);
    }
  );

  /* ================= ENTER KEY ================= */

  textInput?.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        chatForm?.requestSubmit();
      }
    }
  );

  /* ================= TEXTAREA AUTO HEIGHT ================= */

  textInput?.addEventListener(
    "input",
    () => {

      textInput.style.height = "auto";

      textInput.style.height =
        Math.min(
          textInput.scrollHeight,
          140
        ) + "px";
    }
  );

  /* ================= ATTACH MENU ================= */

  attachBtn?.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      if (!attachOptions) return;

      attachOptions.classList.toggle("hide");
    }
  );

  document.addEventListener(
    "click",
    (event) => {

      if (
        attachOptions &&
        !attachOptions.contains(event.target) &&
        event.target !== attachBtn
      ) {
        attachOptions.classList.add("hide");
      }
    }
  );

  /* ================= IMAGE ATTACHMENT ================= */

  addImageBtn?.addEventListener(
    "click",
    () => {

      attachOptions?.classList.add("hide");

      imageInput?.click();
    }
  );

  imageInput?.addEventListener(
    "change",
    () => {

      const file =
        imageInput.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("من فضلك اختر صورة فقط.");

        imageInput.value = "";

        return;
      }

      attachedImage = file;

      const reader = new FileReader();

      reader.onload = (event) => {

        if (previewImage) {
          previewImage.src =
            event.target.result;
        }

        previewBox?.classList.remove("hide");
      };

      reader.readAsDataURL(file);
    }
  );

  function removeAttachment() {

    attachedImage = null;

    if (imageInput) {
      imageInput.value = "";
    }

    if (previewImage) {
      previewImage.src = "";
    }

    previewBox?.classList.add("hide");
  }

  removeImageBtn?.addEventListener(
    "click",
    () => {
      removeAttachment();
    }
  );

  /* ================= NEW CHAT ================= */

  newChatBtn?.addEventListener(
    "click",
    () => {
      createNewChat();
    }
  );

  /* ================= LOGOUT ================= */

  logoutBtn?.addEventListener(
    "click",
    () => {

      const confirmed = window.confirm(
        "هل تريد تسجيل الخروج من NOVA AI؟"
      );

      if (!confirmed) return;

      sessionStorage.removeItem(
        "nova_current_user"
      );

      localStorage.removeItem(
        "nova_current_user"
      );

      currentUser = null;
      chats = [];
      currentChat = null;

      if (app) {
        app.classList.add("hide");
      }

      if (auth) {
        auth.classList.remove("hide");
      }

      closeSidebar();

      setAuthMode("login");
    }
  );

  /* ================= THEME ================= */

  function applyTheme() {

    const savedTheme =
      localStorage.getItem("nova_theme") ||
      "dark";

    document.body.classList.toggle(
      "light",
      savedTheme === "light"
    );

    if (themeBtn) {
      themeBtn.textContent =
        savedTheme === "light"
          ? "🌙 الوضع الداكن"
          : "☀️ الوضع الفاتح";
    }
  }

  themeBtn?.addEventListener(
    "click",
    () => {

      const isLight =
        document.body.classList.contains(
          "light"
        );

      localStorage.setItem(
        "nova_theme",
        isLight ? "dark" : "light"
      );

      applyTheme();
    }
  );

  /* ================= OPEN APP ================= */

  function openApp() {

    if (!currentUser) return;

    if (auth) {
      auth.classList.add("hide");
    }

    if (app) {
      app.classList.remove("hide");
    }

    if (userName) {
      userName.textContent =
        currentUser.name || "المستخدم";
    }

    loadChats();

    if (chats.length > 0) {
      const sorted =
        [...chats].sort(
          (a, b) =>
            Number(
              b.updatedAt ||
              b.createdAt ||
              0
            ) -
            Number(
              a.updatedAt ||
              a.createdAt ||
              0
            )
        );

      currentChat = sorted[0];
    } else {
      currentChat = null;
    }

    renderChatList();
    renderMessages();

    createMobileSidebarControls();

    applyTheme();
  }

  /* ================= AUTO LOGIN ================= */

  function restoreUser() {

    let saved = null;

    try {
      saved =
        JSON.parse(
          localStorage.getItem(
            "nova_current_user"
          ) || "null"
        );
    } catch {
      saved = null;
    }

    if (!saved) {

      try {
        saved =
          JSON.parse(
            sessionStorage.getItem(
              "nova_current_user"
            ) || "null"
          );
      } catch {
        saved = null;
      }
    }

    if (
      saved &&
      saved.email
    ) {
      currentUser = saved;

      openApp();

    } else {

      if (auth) {
        auth.classList.remove("hide");
      }

      if (app) {
        app.classList.add("hide");
      }

      setAuthMode("login");
    }
  }

  /* ================= START ================= */

  applyTheme();

  createMobileSidebarControls();

  restoreUser();

});
