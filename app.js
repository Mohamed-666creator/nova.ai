document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // AUTH
  // =========================

  const auth = document.getElementById("auth");
  const app = document.getElementById("app");

  const loginTab = document.getElementById("lt");
  const signupTab = document.getElementById("st");

  const authForm = document.getElementById("af");

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("pass");

  const rememberInput = document.getElementById("remember");

  const authSubmit = document.getElementById("as");
  const authError = document.getElementById("ae");

  let authMode = "login";

  const USERS_KEY = "nova_users";
  const CURRENT_KEY = "nova_current_user";


  function getUsers() {
    try {
      return JSON.parse(
        localStorage.getItem(USERS_KEY) || "[]"
      );
    } catch {
      return [];
    }
  }


  function saveUsers(users) {
    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(users)
    );
  }


  function showLogin() {

    authMode = "login";

    loginTab.classList.add("active");
    signupTab.classList.remove("active");

    nameInput.classList.add("hide");

    nameInput.required = false;

    passInput.autocomplete = "current-password";

    authSubmit.textContent = "دخول";

    authError.textContent = "";
  }


  function showSignup() {

    authMode = "signup";

    signupTab.classList.add("active");
    loginTab.classList.remove("active");

    nameInput.classList.remove("hide");

    nameInput.required = true;

    passInput.autocomplete = "new-password";

    authSubmit.textContent = "إنشاء حساب";

    authError.textContent = "";
  }


  loginTab.addEventListener(
    "click",
    showLogin
  );


  signupTab.addEventListener(
    "click",
    showSignup
  );


  authForm.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      authError.textContent = "";

      const name =
        nameInput.value.trim();

      const email =
        emailInput.value.trim().toLowerCase();

      const password =
        passInput.value;


      if (!email || !password) {

        authError.textContent =
          "اكتب البريد الإلكتروني وكلمة المرور.";

        return;
      }


      const users = getUsers();


      // =========================
      // SIGN UP
      // =========================

      if (authMode === "signup") {

        if (!name) {

          authError.textContent =
            "اكتب اسمك.";

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


        const user = {
          name,
          email,
          password
        };


        users.push(user);

        saveUsers(users);


        localStorage.setItem(
          CURRENT_KEY,
          JSON.stringify({
            name,
            email
          })
        );


        openApp({
          name,
          email
        });

        return;
      }


      // =========================
      // LOGIN
      // =========================

      const user = users.find(
        item =>
          item.email === email &&
          item.password === password
      );


      if (!user) {

        authError.textContent =
          "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

        return;
      }


      if (rememberInput.checked) {

        localStorage.setItem(
          CURRENT_KEY,
          JSON.stringify({
            name: user.name,
            email: user.email
          })
        );
      }


      openApp({
        name: user.name,
        email: user.email
      });

    }
  );


  // =========================
  // APP ELEMENTS
  // =========================

  const userBox =
    document.getElementById("user");

  const messagesBox =
    document.getElementById("msgs");

  const chatList =
    document.getElementById("list");


  const newChatButton =
    document.getElementById("new");

  const logoutButton =
    document.getElementById("logout");

  const themeButton =
    document.getElementById("theme");


  const chatForm =
    document.getElementById("cf");

  const textInput =
    document.getElementById("text");

  const sendButton =
    document.querySelector(".send");


  const attachButton =
    document.getElementById("attachBtn");

  const attachOptions =
    document.getElementById("attachOptions");


  const addImageButton =
    document.getElementById("addImageBtn");

  const createImageButton =
    document.getElementById("createImageBtn");


  const imageInput =
    document.getElementById("img");


  const previewBox =
    document.getElementById("prev");

  const previewImage =
    document.getElementById("pi");

  const removeImageButton =
    document.getElementById("rm");


  // =========================
  // STATE
  // =========================

  let currentUser = null;

  let chats = [];

  let currentChat = null;

  let attachedImage = null;

  let imageGenerating = false;


  const theme =
    localStorage.getItem("nova_theme");


  if (theme === "light") {
    document.body.classList.add("light");
  }


  // =========================
  // CHAT STORAGE
  // =========================

  function chatsKey() {

    if (!currentUser) {
      return "nova_chats_unknown";
    }


    return (
      "nova_chats_" +
      currentUser.email
    );
  }


  function loadChats() {

    try {

      chats = JSON.parse(
        localStorage.getItem(chatsKey()) || "[]"
      );

    } catch {

      chats = [];
    }


    if (!Array.isArray(chats)) {
      chats = [];
    }
  }


  function saveChats() {

    localStorage.setItem(
      chatsKey(),
      JSON.stringify(chats)
    );
  }


  // =========================
  // OPEN APP
  // =========================

  function openApp(user) {

    currentUser = user;

    auth.classList.add("hide");

    app.classList.remove("hide");


    userBox.textContent =
      user.name || user.email;


    loadChats();


    if (!chats.length) {

      createNewChat();

    } else {

      currentChat = chats[0];

      renderChatList();

      renderMessages();
    }
  }


  // =========================
  // NEW CHAT
  // =========================

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


  // =========================
  // CHAT LIST
  // =========================

  function renderChatList() {

    chatList.innerHTML = "";


    chats.forEach(chat => {

      const item =
        document.createElement("div");


      item.className = "chat";


      if (
        currentChat &&
        chat.id === currentChat.id
      ) {

        item.classList.add("active");
      }


      item.textContent =
        chat.title || "محادثة جديدة";


      item.addEventListener(
        "click",
        () => {

          currentChat = chat;

          renderChatList();

          renderMessages();
        }
      );


      chatList.appendChild(item);

    });
  }


  // =========================
  // MESSAGE RENDER
  // =========================

  function addMessageToScreen(
    role,
    content,
    imageData = null,
    imageMime = "image/png"
  ) {

    const wrapper =
      document.createElement("div");


    wrapper.className =
      "msg " +
      (
        role === "user"
          ? "user"
          : "ai"
      );


    // =========================
    // REAL IMAGE
    // =========================

    if (imageData) {

      wrapper.classList.add(
        "image-message"
      );


      const image =
        document.createElement("img");


      image.src =
        "data:" +
        imageMime +
        ";base64," +
        imageData;


      image.alt =
        "NOVA AI generated image";


      image.style.display = "block";

      image.style.maxWidth = "500px";

      image.style.width = "100%";

      image.style.borderRadius = "14px";


      wrapper.appendChild(image);


      messagesBox.appendChild(wrapper);


      messagesBox.scrollTop =
        messagesBox.scrollHeight;


      return wrapper;
    }


    // =========================
    // MARKDOWN IMAGE
    // =========================

    const imageMarkdown =
      String(content || "").match(
        /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/
      );


    if (imageMarkdown) {

      const image =
        document.createElement("img");


      image.src =
        imageMarkdown[1];


      image.alt =
        "NOVA AI image";


      image.style.display = "block";

      image.style.maxWidth = "500px";

      image.style.width = "100%";

      image.style.borderRadius = "14px";


      wrapper.appendChild(image);


      const textWithoutImage =
        String(content || "")
          .replace(
            imageMarkdown[0],
            ""
          )
          .trim();


      if (textWithoutImage) {

        const caption =
          document.createElement("div");


        caption.className =
          "image-caption";


        caption.textContent =
          textWithoutImage;


        wrapper.appendChild(caption);
      }

    } else {

      wrapper.textContent =
        content || "";
    }


    messagesBox.appendChild(wrapper);


    messagesBox.scrollTop =
      messagesBox.scrollHeight;


    return wrapper;
  }


  // =========================
  // RENDER MESSAGES
  // =========================

  function renderMessages() {

    messagesBox.innerHTML = "";


    if (!currentChat) {
      return;
    }


    currentChat.messages.forEach(
      message => {

        addMessageToScreen(
          message.role,
          message.content,
          message.imageData || null,
          message.imageMime || "image/png"
        );

      }
    );


    messagesBox.scrollTop =
      messagesBox.scrollHeight;
  }


  // =========================
  // DETECT IMAGE REQUEST
  // =========================

  function looksLikeImageRequest(text) {

    const value =
      String(text || "")
        .trim()
        .toLowerCase();


    const patterns = [

      "ارسم لي",

      "ارسملي",

      "ارسم لى",

      "ارسملي صورة",

      "ارسم لي صورة",

      "اعمل صورة",

      "اعمل صوره",

      "اعمل لي صورة",

      "اعمللي صورة",

      "أنشئ صورة",

      "انشئ صورة",

      "أنشئ لي صورة",

      "انشئ لي صورة",

      "اصنع صورة",

      "اصنع لي صورة",

      "اصنعلي صورة",

      "صمم صورة",

      "صمم لي صورة",

      "صمملي صورة",

      "اعمل تصميم",

      "اعمل لي تصميم",

      "صمم لي",

      "صمملي",

      "حولها لصورة",

      "حول الكلام لصورة",

      "generate an image",

      "generate image",

      "create an image",

      "create image",

      "make an image",

      "make image",

      "draw an image",

      "draw me",

      "draw a",

      "create a picture",

      "generate a picture"

    ];


    return patterns.some(
      pattern =>
        value.includes(pattern)
    );
  }


  // =========================
  // GENERATE IMAGE
  // =========================

  async function generateImage(prompt) {

    if (imageGenerating) {
      return;
    }


    if (!currentChat) {
      return;
    }


    imageGenerating = true;


    const loading =
      addMessageToScreen(
        "assistant",
        "جارٍ إنشاء الصورة..."
      );


    loading.classList.add(
      "loading"
    );


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
              prompt:
                String(prompt).trim()
            })
          }
        );


      let data = {};


      try {

        data =
          await response.json();

      } catch {

        throw new Error(
          "الخادم أرسل ردًا غير صالح."
        );
      }


      if (!response.ok) {

        throw new Error(
          data.error ||
          "فشل إنشاء الصورة."
        );
      }


      if (!data.image) {

        throw new Error(
          "لم يتم استلام الصورة من Gemini."
        );
      }


      loading.remove();


      // عرض الصورة
      addMessageToScreen(
        "assistant",
        "",
        data.image,
        data.mimeType ||
          "image/png"
      );


    } catch (error) {

      loading.remove();


      addMessageToScreen(
        "assistant",
        "تعذر إنشاء الصورة:\n" +
        (
          error?.message ||
          "حدث خطأ غير معروف."
        )
      );

    } finally {

      imageGenerating = false;
    }
  }


  // =========================
  // TEXT MESSAGE
  // =========================

  async function sendTextMessage() {

    const text =
      textInput.value.trim();


    if (!text || !currentChat) {
      return;
    }


    // =========================
    // AUTOMATIC IMAGE REQUEST
    // =========================

    if (looksLikeImageRequest(text)) {

      textInput.value = "";

      attachOptions.classList.add(
        "hide"
      );


      currentChat.messages.push({

        role: "user",

        content: text
      });


      if (
        currentChat.title ===
        "محادثة جديدة"
      ) {

        currentChat.title =
          text.slice(0, 30);


        if (text.length > 30) {

          currentChat.title += "...";
        }
      }


      addMessageToScreen(
        "user",
        text
      );


      saveChats();

      renderChatList();


      await generateImage(text);

      return;
    }


    // =========================
    // NORMAL TEXT CHAT
    // =========================

    textInput.value = "";

    attachOptions.classList.add(
      "hide"
    );


    currentChat.messages.push({

      role: "user",

      content: text
    });


    if (
      currentChat.title ===
      "محادثة جديدة"
    ) {

      currentChat.title =
        text.slice(0, 30);


      if (text.length > 30) {

        currentChat.title += "...";
      }
    }


    addMessageToScreen(
      "user",
      text
    );


    saveChats();

    renderChatList();


    const loading =
      addMessageToScreen(
        "assistant",
        "جارٍ التفكير..."
      );


    loading.classList.add(
      "loading"
    );


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


      let data = {};


      try {

        data =
          await response.json();

      } catch {

        throw new Error(
          "الخادم أرسل ردًا غير صالح."
        );
      }


      if (!response.ok) {

        throw new Error(
          data.error ||
          "حدث خطأ في NOVA AI."
        );
      }


      const reply =
        data.reply ||
        data.output_text ||
        "لم يصل نص في الرد.";


      loading.remove();


      currentChat.messages.push({

        role: "assistant",

        content: reply
      });


      addMessageToScreen(
        "assistant",
        reply
      );


      saveChats();


    } catch (error) {

      loading.remove();


      addMessageToScreen(
        "assistant",
        "تعذر الاتصال بـ NOVA AI:\n" +
        (
          error?.message ||
          "حدث خطأ غير معروف."
        )
      );
    }
  }


  // =========================
  // ENTER SEND
  // =========================

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


  // =========================
  // CHAT FORM
  // =========================

  chatForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (attachedImage) {

        addMessageToScreen(
          "user",
          "🖼️ تم إرفاق صورة."
        );


        attachedImage = null;


        previewBox.classList.add(
          "hide"
        );


        imageInput.value = "";
      }


      await sendTextMessage();
    }
  );


  // =========================
  // ATTACH MENU
  // =========================

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
    event => {

      if (
        !event.target.closest(
          ".attach-menu"
        )
      ) {

        attachOptions.classList.add(
          "hide"
        );
      }
    }
  );


  // =========================
  // ADD IMAGE
  // =========================

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


      if (!file) {
        return;
      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "من فضلك اختر ملف صورة."
        );


        imageInput.value = "";

        return;
      }


      attachedImage = file;


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


  // =========================
  // REMOVE ATTACHED IMAGE
  // =========================

  removeImageButton.addEventListener(
    "click",
    () => {

      attachedImage = null;


      imageInput.value = "";

      previewImage.src = "";


      previewBox.classList.add(
        "hide"
      );
    }
  );


  // =========================
  // CREATE IMAGE BUTTON
  // =========================

  createImageButton.addEventListener(
    "click",
    async event => {

      event.preventDefault();

      event.stopPropagation();


      attachOptions.classList.add(
        "hide"
      );


      const prompt =
        textInput.value.trim();


      if (!prompt) {

        textInput.focus();


        textInput.placeholder =
          "اكتب وصف الصورة أولًا...";


        return;
      }


      textInput.value = "";


      // إرسال طلب الصورة
      await generateImage(prompt);
    }
  );


  // =========================
  // NEW CHAT
  // =========================

  newChatButton.addEventListener(
    "click",
    createNewChat
  );


  // =========================
  // THEME
  // =========================

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


  // =========================
  // LOGOUT
  // =========================

  logoutButton.addEventListener(
    "click",
    () => {

      currentUser = null;

      currentChat = null;

      chats = [];


      app.classList.add(
        "hide"
      );


      auth.classList.remove(
        "hide"
      );


      authForm.reset();


      showLogin();
    }
  );


  // =========================
  // AUTO LOGIN
  // =========================

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          CURRENT_KEY
        ) || "null"
      );


    if (
      saved &&
      saved.email
    ) {

      openApp(saved);

    } else {

      showLogin();
    }


  } catch {

    showLogin();
  }

});
