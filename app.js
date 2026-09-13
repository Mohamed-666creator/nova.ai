document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     ELEMENTS
  ========================= */

  const auth = document.getElementById("auth");
  const app = document.getElementById("app");

  const authForm = document.getElementById("af");
  const loginTab = document.getElementById("lt");
  const signupTab = document.getElementById("st");

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("pass");
  const rememberInput = document.getElementById("remember");

  const authButton = document.getElementById("as");
  const authError = document.getElementById("ae");

  const textInput = document.getElementById("text");
  const chatForm = document.getElementById("cf");
  const messagesBox = document.getElementById("msgs");

  const userBox = document.getElementById("user");
  const chatList = document.getElementById("list");

  const newChatButton = document.getElementById("new");
  const logoutButton = document.getElementById("logout");
  const themeButton = document.getElementById("theme");

  const attachButton = document.getElementById("attachBtn");
  const attachOptions = document.getElementById("attachOptions");

  const addImageButton = document.getElementById("addImageBtn");
  const createImageButton =
    document.getElementById("createImageBtn");

  const imageInput = document.getElementById("img");

  const previewBox = document.getElementById("prev");
  const previewImage = document.getElementById("pi");
  const removeImageButton = document.getElementById("rm");


  /* =========================
     STATE
  ========================= */

  let mode = "login";
  let currentUser = null;
  let chats = [];
  let currentChat = null;
  let pendingImage = null;


  /* =========================
     STORAGE
  ========================= */

  function usersKey() {
    return "nova_users";
  }

  function currentUserKey() {
    return "nova_current_user";
  }

  function chatsKey(email) {
    return "nova_chats_" + email;
  }


  function getUsers() {
    try {
      return JSON.parse(
        localStorage.getItem(usersKey()) || "[]"
      );
    } catch {
      return [];
    }
  }


  function saveUsers(users) {
    localStorage.setItem(
      usersKey(),
      JSON.stringify(users)
    );
  }


  function loadChats() {
    if (!currentUser) return;

    try {
      chats = JSON.parse(
        localStorage.getItem(
          chatsKey(currentUser.email)
        ) || "[]"
      );
    } catch {
      chats = [];
    }

    if (!Array.isArray(chats)) {
      chats = [];
    }

    if (!chats.length) {
      createNewChat();
    } else {
      currentChat = chats[0];
    }
  }


  function saveChats() {
    if (!currentUser) return;

    localStorage.setItem(
      chatsKey(currentUser.email),
      JSON.stringify(chats)
    );
  }


  /* =========================
     AUTH
  ========================= */

  function showLogin() {
    mode = "login";

    loginTab.classList.add("active");
    signupTab.classList.remove("active");

    nameInput.classList.add("hide");

    authButton.textContent = "دخول";

    nameInput.required = false;

    authError.textContent = "";
  }


  function showSignup() {
    mode = "signup";

    signupTab.classList.add("active");
    loginTab.classList.remove("active");

    nameInput.classList.remove("hide");

    authButton.textContent = "إنشاء حساب";

    nameInput.required = true;

    authError.textContent = "";
  }


  loginTab.addEventListener("click", showLogin);
  signupTab.addEventListener("click", showSignup);


  authForm.addEventListener("submit", (event) => {
    event.preventDefault();

    authError.textContent = "";

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passInput.value;

    if (!email || !password) {
      authError.textContent =
        "اكتب البريد الإلكتروني وكلمة المرور.";
      return;
    }


    const users = getUsers();


    if (mode === "signup") {

      if (!name) {
        authError.textContent =
          "اكتب اسمك أولًا.";
        return;
      }

      if (password.length < 6) {
        authError.textContent =
          "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";
        return;
      }

      if (
        users.some(
          user => user.email === email
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

      currentUser = {
        name,
        email
      };

      localStorage.setItem(
        currentUserKey(),
        JSON.stringify(currentUser)
      );

      openApp();

      return;
    }


    const foundUser = users.find(
      user =>
        user.email === email &&
        user.password === password
    );


    if (!foundUser) {
      authError.textContent =
        "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
      return;
    }


    currentUser = {
      name: foundUser.name,
      email: foundUser.email
    };


    if (rememberInput.checked) {
      localStorage.setItem(
        currentUserKey(),
        JSON.stringify(currentUser)
      );
    }


    openApp();
  });


  /* =========================
     OPEN APP
  ========================= */

  function openApp() {
    auth.classList.add("hide");
    app.classList.remove("hide");

    userBox.textContent =
      currentUser?.name || "";

    loadChats();
    renderChatList();
    renderMessages();
  }


  /* =========================
     LOGOUT
  ========================= */

  logoutButton.addEventListener("click", () => {

    localStorage.removeItem(
      currentUserKey()
    );

    currentUser = null;
    chats = [];
    currentChat = null;

    app.classList.add("hide");
    auth.classList.remove("hide");

    authForm.reset();

    showLogin();
  });


  /* =========================
     CHAT
  ========================= */

  function createNewChat() {

    const chat = {
      id: Date.now(),
      title: "محادثة جديدة",
      messages: []
    };

    chats.unshift(chat);
    currentChat = chat;

    saveChats();

    renderChatList();
    renderMessages();
  }


  newChatButton.addEventListener(
    "click",
    createNewChat
  );


  function renderChatList() {

    chatList.innerHTML = "";

    chats.forEach(chat => {

      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "chat-item";

      button.textContent =
        chat.title || "محادثة جديدة";

      if (
        currentChat &&
        chat.id === currentChat.id
      ) {
        button.classList.add("active");
      }


      button.addEventListener(
        "click",
        () => {

          currentChat = chat;

          renderChatList();
          renderMessages();
        }
      );


      chatList.appendChild(button);
    });
  }


  /* =========================
     MESSAGE DISPLAY
  ========================= */

  function addMessageToScreen(
    role,
    content
  ) {

    const message =
      document.createElement("div");

    message.className =
      "msg " +
      (role === "user"
        ? "user-msg"
        : "ai-msg");


    const bubble =
      document.createElement("div");

    bubble.className = "bubble";


    /*
      Handle real image messages
    */

    if (
      typeof content === "object" &&
      content.type === "image" &&
      content.src
    ) {

      message.classList.add(
        "image-message"
      );

      const image =
        document.createElement("img");

      image.src = content.src;

      image.alt =
        content.alt ||
        "صورة تم إنشاؤها بواسطة NOVA AI";

      image.loading = "lazy";

      bubble.appendChild(image);

    } else {

      const text =
        String(content ?? "");


      /*
        Handle Markdown image URLs
      */

      const imageMarkdown =
        text.match(
          /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/
        );


      if (imageMarkdown) {

        message.classList.add(
          "image-message"
        );

        const image =
          document.createElement("img");

        image.src =
          imageMarkdown[1];

        image.alt =
          "صورة";

        image.loading = "lazy";

        bubble.appendChild(image);


        const remaining =
          text.replace(
            imageMarkdown[0],
            ""
          ).trim();


        if (remaining) {

          const caption =
            document.createElement("div");

          caption.className =
            "image-caption";

          caption.textContent =
            remaining;

          bubble.appendChild(caption);
        }

      } else {

        bubble.textContent = text;
      }
    }


    message.appendChild(bubble);

    messagesBox.appendChild(message);

    messagesBox.scrollTop =
      messagesBox.scrollHeight;
  }


  function renderMessages() {

    messagesBox.innerHTML = "";

    if (!currentChat) return;


    if (!currentChat.messages.length) {

      const welcome =
        document.createElement("div");

      welcome.className =
        "welcome";

      welcome.innerHTML = `
        <h2>مرحبًا بك في NOVA AI ✦</h2>
        <p>
          اكتب أي سؤال، وابدأ محادثتك مع الذكاء الاصطناعي.
        </p>
      `;

      messagesBox.appendChild(welcome);

      return;
    }


    currentChat.messages.forEach(
      message => {

        addMessageToScreen(
          message.role,
          message.content
        );
      }
    );
  }


  /* =========================
     TYPING INDICATOR
  ========================= */

  function showTyping() {

    const typing =
      document.createElement("div");

    typing.id =
      "novaTyping";

    typing.className =
      "msg ai-msg";

    typing.innerHTML = `
      <div class="bubble typing">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;

    messagesBox.appendChild(typing);

    messagesBox.scrollTop =
      messagesBox.scrollHeight;
  }


  function hideTyping() {

    const typing =
      document.getElementById(
        "novaTyping"
      );

    if (typing) {
      typing.remove();
    }
  }


  /* =========================
     SEND MESSAGE
  ========================= */

  chatForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const text =
        textInput.value.trim();

      if (!text && !pendingImage) {
        return;
      }


      if (!currentChat) {
        createNewChat();
      }


      /*
        User message
      */

      if (text) {

        currentChat.messages.push({
          role: "user",
          content: text
        });

        if (
          currentChat.title ===
          "محادثة جديدة"
        ) {
          currentChat.title =
            text.substring(0, 35);
        }
      }


      saveChats();

      textInput.value = "";

      removePendingImage();

      renderChatList();
      renderMessages();

      showTyping();


      try {

        const response =
          await fetch(
            "/api/chat",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                messages:
                  currentChat.messages
              })
            }
          );


        const data =
          await response.json()
            .catch(() => ({}));


        if (!response.ok) {

          throw new Error(
            data.error ||
            "حدث خطأ في الخادم."
          );
        }


        if (!data.reply) {

          throw new Error(
            "لم يصل رد من NOVA AI."
          );
        }


        currentChat.messages.push({
          role: "assistant",
          content: data.reply
        });


        saveChats();

        hideTyping();

        renderMessages();

      } catch (error) {

        hideTyping();

        currentChat.messages.push({
          role: "assistant",
          content:
            "⚠️ تعذر الاتصال بـ NOVA AI: " +
            error.message
        });

        saveChats();

        renderMessages();
      }
    }
  );


  /* =========================
     ENTER SEND
  ========================= */

  textInput.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        chatForm.requestSubmit();
      }
    }
  );


  /* =========================
     ATTACH MENU
  ========================= */

  attachButton.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      attachOptions.classList.toggle(
        "hide"
      );
    }
  );


  document.addEventListener(
    "click",
    () => {
      attachOptions.classList.add(
        "hide"
      );
    }
  );


  attachOptions.addEventListener(
    "click",
    event => {
      event.stopPropagation();
    }
  );


  /* =========================
     ADD IMAGE
  ========================= */

  addImageButton.addEventListener(
    "click",
    () => {

      attachOptions.classList.add(
        "hide"
      );

      imageInput.click();
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


      pendingImage = file;


      const reader =
        new FileReader();


      reader.onload = () => {

        previewImage.src =
          reader.result;

        previewBox.classList.remove(
          "hide"
        );
      };


      reader.readAsDataURL(file);
    }
  );


  removeImageButton.addEventListener(
    "click",
    removePendingImage
  );


  function removePendingImage() {

    pendingImage = null;

    imageInput.value = "";

    previewImage.src = "";

    previewBox.classList.add(
      "hide"
    );
  }


  /* =========================
     REAL IMAGE GENERATION
  ========================= */

  createImageButton.addEventListener(
    "click",
    async () => {

      attachOptions.classList.add(
        "hide"
      );


      const prompt =
        textInput.value.trim();


      if (!prompt) {

        textInput.focus();

        textInput.placeholder =
          "اكتب وصف الصورة أولًا...";

        setTimeout(() => {

          textInput.placeholder =
            "اكتب رسالتك إلى NOVA AI...";

        }, 2500);

        return;
      }


      textInput.value = "";

      if (!currentChat) {
        createNewChat();
      }


      /*
        Show prompt in chat
      */

      currentChat.messages.push({
        role: "user",
        content:
          "✨ إنشاء صورة: " +
          prompt
      });


      if (
        currentChat.title ===
        "محادثة جديدة"
      ) {
        currentChat.title =
          "صورة: " +
          prompt.substring(0, 25);
      }


      saveChats();

      renderChatList();
      renderMessages();


      /*
        Image loading effect
      */

      const loading =
        document.createElement("div");

      loading.id =
        "novaImageLoading";

      loading.className =
        "msg ai-msg";

      loading.innerHTML = `
        <div class="bubble image-loading">
          <div class="image-spinner"></div>
          <div>
            <strong>جاري إنشاء الصورة...</strong>
            <small>قد يستغرق الأمر قليلًا ✨</small>
          </div>
        </div>
      `;

      messagesBox.appendChild(
        loading
      );

      messagesBox.scrollTop =
        messagesBox.scrollHeight;


      try {

        const response =
          await fetch(
            "/api/image",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                prompt
              })
            }
          );


        const data =
          await response.json()
            .catch(() => ({}));


        if (!response.ok) {

          throw new Error(
            data.error ||
            "فشل إنشاء الصورة."
          );
        }


        if (!data.image) {

          throw new Error(
            "لم يتم استلام الصورة من الخادم."
          );
        }


        loading.remove();


        const imageSrc =
          `data:${data.mimeType || "image/png"};base64,${data.image}`;


        /*
          Display actual image
        */

        const imageMessage =
          document.createElement("div");

        imageMessage.className =
          "msg ai-msg image-message";


        const bubble =
          document.createElement("div");

        bubble.className =
          "bubble";


        const image =
          document.createElement("img");

        image.src =
          imageSrc;

        image.alt =
          "صورة منشأة بواسطة NOVA AI";

        image.loading = "lazy";


        bubble.appendChild(image);

        imageMessage.appendChild(
          bubble
        );

        messagesBox.appendChild(
          imageMessage
        );


        /*
          Keep image visible during
          the current session.
        */

        messagesBox.scrollTop =
          messagesBox.scrollHeight;

      } catch (error) {

        loading.remove();


        const errorMessage =
          document.createElement("div");

        errorMessage.className =
          "msg ai-msg";


        const bubble =
          document.createElement("div");

        bubble.className =
          "bubble";


        bubble.textContent =
          "⚠️ تعذر إنشاء الصورة: " +
          error.message;


        errorMessage.appendChild(
          bubble
        );

        messagesBox.appendChild(
          errorMessage
        );


        messagesBox.scrollTop =
          messagesBox.scrollHeight;
      }
    }
  );


  /* =========================
     THEME
  ========================= */

  themeButton.addEventListener(
    "click",
    () => {

      document.body.classList.toggle(
        "light"
      );

      localStorage.setItem(
        "nova_theme",
        document.body.classList.contains(
          "light"
        )
          ? "light"
          : "dark"
      );
    }
  );


  if (
    localStorage.getItem(
      "nova_theme"
    ) === "light"
  ) {
    document.body.classList.add(
      "light"
    );
  }


  /* =========================
     AUTO LOGIN
  ========================= */

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          currentUserKey()
        ) || "null"
      );


    if (saved?.email) {

      currentUser = saved;

      openApp();
    }

  } catch {
    // ignore
  }

});
