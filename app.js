document.addEventListener("DOMContentLoaded", function () {

  /* ================= ELEMENTS ================= */

  const $ = (id) => document.getElementById(id);

  const auth = $("auth");
  const app = $("app");

  const loginTab = $("lt");
  const signupTab = $("st");

  const authForm = $("af");

  const nameInput = $("name");
  const emailInput = $("email");
  const passwordInput = $("pass");

  const rememberInput = $("remember");

  const authButton = $("as");
  const errorBox = $("ae");

  const chatForm = $("cf");
  const textInput = $("text");

  const messagesBox = $("msgs");

  const newChatButton = $("new");
  const chatList = $("list");

  const userBox = $("user");

  const themeButton = $("theme");
  const logoutButton = $("logout");

  const imageInput = $("img");
  const preview = $("prev");
  const previewImage = $("pi");
  const removeImageButton = $("rm");

  const attachBtn = $("attachBtn");
  const attachOptions = $("attachOptions");
  const addImageBtn = $("addImageBtn");
  const createImageBtn = $("createImageBtn");


  /* ================= VARIABLES ================= */

  let mode = "login";
  let user = null;
  let chats = [];
  let currentChatId = null;
  let pendingImage = null;


  /* ================= AUTH TABS ================= */

  loginTab.type = "button";
  signupTab.type = "button";
  authButton.type = "submit";


  loginTab.addEventListener("click", function () {

    mode = "login";

    loginTab.classList.add("active");
    signupTab.classList.remove("active");

    nameInput.classList.add("hide");

    authButton.textContent = "دخول";

    errorBox.textContent = "";

  });


  signupTab.addEventListener("click", function () {

    mode = "signup";

    signupTab.classList.add("active");
    loginTab.classList.remove("active");

    nameInput.classList.remove("hide");

    authButton.textContent = "إنشاء حساب";

    errorBox.textContent = "";

  });


  /* ================= USERS ================= */

  function getUsers() {

    try {

      return JSON.parse(
        localStorage.getItem("nova_users") || "[]"
      );

    } catch (error) {

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

  authForm.addEventListener("submit", function (event) {

    event.preventDefault();

    errorBox.textContent = "";

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;


    /* ===== SIGN UP ===== */

    if (mode === "signup") {

      if (!name) {

        errorBox.textContent =
          "من فضلك اكتب الاسم.";

        nameInput.focus();

        return;

      }


      if (!email) {

        errorBox.textContent =
          "من فضلك اكتب البريد الإلكتروني.";

        emailInput.focus();

        return;

      }


      if (!email.includes("@")) {

        errorBox.textContent =
          "اكتب بريدًا إلكترونيًا صحيحًا.";

        emailInput.focus();

        return;

      }


      if (!password) {

        errorBox.textContent =
          "من فضلك اكتب كلمة المرور.";

        passwordInput.focus();

        return;

      }


      if (password.length < 4) {

        errorBox.textContent =
          "كلمة المرور يجب أن تكون 4 أحرف على الأقل.";

        passwordInput.focus();

        return;

      }


      const users = getUsers();

      const alreadyExists =
        users.some(function (item) {

          return item.email === email;

        });


      if (alreadyExists) {

        errorBox.textContent =
          "هذا البريد مسجل بالفعل. استخدم تسجيل الدخول.";

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

    if (!email || !password) {

      errorBox.textContent =
        "اكتب البريد الإلكتروني وكلمة المرور.";

      return;

    }


    const users = getUsers();

    const foundUser =
      users.find(function (item) {

        return (
          item.email === email &&
          item.password === password
        );

      });


    if (!foundUser) {

      errorBox.textContent =
        "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

      return;

    }


    user = foundUser;


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

  });


  /* ================= CHAT STORAGE ================= */

  function getChatStorageKey() {

    if (!user) {

      return "nova_chats";

    }

    return "nova_chats_" + user.email;

  }


  function loadChats() {

    try {

      chats = JSON.parse(
        localStorage.getItem(
          getChatStorageKey()
        ) || "[]"
      );

    } catch (error) {

      chats = [];

    }

  }


  function saveChats() {

    localStorage.setItem(
      getChatStorageKey(),
      JSON.stringify(chats)
    );

  }


  /* ================= START APP ================= */

  function startApp() {

    auth.classList.add("hide");

    app.classList.remove("hide");

    userBox.textContent =
      user.name || user.email;

    loadChats();

    renderChatList();


    if (chats.length === 0) {

      createChat();

    } else {

      currentChatId =
        chats[chats.length - 1].id;

      renderMessages();

    }

  }


  /* ================= NEW CHAT ================= */

  function createChat() {

    const newChat = {

      id: Date.now(),

      title: "محادثة جديدة",

      messages: []

    };


    chats.push(newChat);

    currentChatId =
      newChat.id;


    saveChats();

    renderChatList();

    renderMessages();

  }


  newChatButton.addEventListener(
    "click",
    createChat
  );


  /* ================= CURRENT CHAT ================= */

  function getCurrentChat() {

    return chats.find(function (chat) {

      return chat.id === currentChatId;

    });

  }


  /* ================= CHAT LIST ================= */

  function renderChatList() {

    chatList.innerHTML = "";

    const reversedChats =
      chats.slice().reverse();


    reversedChats.forEach(function (chat) {

      const item =
        document.createElement("div");

      item.className = "chat";


      if (chat.id === currentChatId) {

        item.classList.add("active");

      }


      item.textContent =
        chat.title || "محادثة جديدة";


      item.addEventListener(
        "click",
        function () {

          currentChatId = chat.id;

          renderChatList();

          renderMessages();

        }
      );


      chatList.appendChild(item);

    });

  }


  /* ================= MESSAGE DISPLAY ================= */

  function renderMessages() {

    messagesBox.innerHTML = "";

    const chat = getCurrentChat();


    if (!chat) {

      return;

    }


    chat.messages.forEach(function (message) {

      addMessageToScreen(
        message.role,
        message.content
      );

    });


    messagesBox.scrollTop =
      messagesBox.scrollHeight;

  }


  function addMessageToScreen(role, content) {

    const message =
      document.createElement("div");


    message.className =
      "msg " +
      (
        role === "user"
          ? "user"
          : "ai"
      );


    /*
      لو الرد يحتوي على صورة Markdown
      نحاول عرض الصورة فعليًا.
    */

    const imageMarkdown =
      String(content).match(
        /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/
      );


    if (imageMarkdown) {

      const image =
        document.createElement("img");

      image.src =
        imageMarkdown[1];

      image.alt =
        "صورة من NOVA AI";

      image.style.maxWidth = "100%";
      image.style.borderRadius = "12px";
      image.style.display = "block";

      message.appendChild(image);


      const textWithoutImage =
        String(content)
          .replace(imageMarkdown[0], "")
          .trim();


      if (textWithoutImage) {

        const text =
          document.createElement("div");

        text.textContent =
          textWithoutImage;

        text.style.marginTop = "8px";

        message.appendChild(text);

      }

    } else {

      message.textContent =
        content;

    }


    messagesBox.appendChild(message);

  }


  /* ================= SEND MESSAGE ================= */

  chatForm.addEventListener(
    "submit",
    sendMessage
  );


  /*
    Enter = إرسال
    Shift + Enter = سطر جديد
  */

  textInput.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        chatForm.requestSubmit();

      }

    }
  );


  async function sendMessage(event) {

    if (event) {

      event.preventDefault();

    }


    const text =
      textInput.value.trim();


    if (!text && !pendingImage) {

      return;

    }


    const chat =
      getCurrentChat();


    if (!chat) {

      return;

    }


    let userMessage =
      text;


    if (pendingImage) {

      if (text) {

        userMessage =
          text +
          "\n\n[تم إرفاق صورة]";

      } else {

        userMessage =
          "[تم إرفاق صورة]";

      }

    }


    /* ===== USER MESSAGE ===== */

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

    textInput.style.height =
      "auto";


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


    messagesBox.appendChild(
      loading
    );


    messagesBox.scrollTop =
      messagesBox.scrollHeight;


    /* ===== API ===== */

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

            body:
              JSON.stringify({

                messages:
                  chat.messages.map(
                    function (message) {

                      return {

                        role:
                          message.role,

                        content:
                          message.content

                      };

                    }
                  )

              })

          }
        );


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


      /* ===== AI MESSAGE ===== */

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


      addMessageToScreen(
        "assistant",
        "تعذر الاتصال بـ NOVA AI: " +
        error.message
      );

    }

  }


  /* ================= IMAGE PREVIEW ================= */

  imageInput.addEventListener(
    "change",
    function () {

      const file =
        imageInput.files[0];


      if (!file) {

        return;

      }


      pendingImage = file;


      const reader =
        new FileReader();


      reader.onload =
        function () {

          previewImage.src =
            reader.result;

          preview.classList.remove(
            "hide"
          );

        };


      reader.readAsDataURL(file);

    }
  );


  function removePendingImage() {

    pendingImage = null;

    imageInput.value = "";

    previewImage.src = "";

    preview.classList.add(
      "hide"
    );

  }


  removeImageButton.addEventListener(
    "click",
    removePendingImage
  );


  /* ================= TEXTAREA ================= */

  textInput.addEventListener(
    "input",
    function () {

      textInput.style.height =
        "auto";


      textInput.style.height =
        Math.min(
          textInput.scrollHeight,
          140
        ) + "px";

    }
  );


  /* ================= ATTACH MENU ================= */

  attachBtn.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();

      attachOptions.classList.toggle(
        "hide"
      );

    }
  );


  /* ===== ADD IMAGE ===== */

  addImageBtn.addEventListener(
    "click",
    function () {

      attachOptions.classList.add(
        "hide"
      );

      imageInput.click();

    }
  );


  /* ===== CREATE IMAGE ===== */

  createImageBtn.addEventListener(
    "click",
    async function () {

      attachOptions.classList.add(
        "hide"
      );


      const prompt =
        textInput.value.trim();


      if (!prompt) {

        textInput.placeholder =
          "اكتب وصف الصورة أولًا...";

        textInput.focus();

        return;

      }


      textInput.value = "";

      textInput.placeholder =
        "NOVA AI ينشئ الصورة...";


      const loading =
        document.createElement("div");


      loading.className =
        "msg ai loading";


      loading.textContent =
        "✨ NOVA AI ينشئ الصورة...";


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

              body:
                JSON.stringify({

                  prompt: prompt

                })

            }
          );


        const data =
          await response.json();


        loading.remove();


        if (!response.ok) {

          throw new Error(
            data.error ||
            "فشل إنشاء الصورة."
          );

        }


        if (
          !data.image
        ) {

          throw new Error(
            "لم يتم إرجاع صورة من الخادم."
          );

        }


        const imageMessage =
          document.createElement("div");


        imageMessage.className =
          "msg ai image-message";


        const image =
          document.createElement("img");


        image.src =
          "data:" +
          (
            data.mimeType ||
            "image/png"
          ) +
          ";base64," +
          data.image;


        image.alt =
          "صورة تم إنشاؤها بواسطة NOVA AI";


        imageMessage.appendChild(
          image
        );


        messagesBox.appendChild(
          imageMessage
        );


        messagesBox.scrollTop =
          messagesBox.scrollHeight;


      } catch (error) {

        loading.remove();


        addMessageToScreen(
          "assistant",
          "تعذر إنشاء الصورة: " +
          error.message
        );

      }


      textInput.placeholder =
        "اكتب رسالتك إلى NOVA AI...";

    }
  );


  /* ================= CLOSE MENU ================= */

  document.addEventListener(
    "click",
    function (event) {

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


  /* ================= THEME ================= */

  themeButton.addEventListener(
    "click",
    function () {

      document.body.classList.toggle(
        "light"
      );


      const isLight =
        document.body.classList.contains(
          "light"
        );


      localStorage.setItem(
        "nova_theme",
        isLight
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


  /* ================= LOGOUT ================= */

  logoutButton.addEventListener(
    "click",
    function () {

      localStorage.removeItem(
        "nova_current_user"
      );

      location.reload();

    }
  );


  /* ================= AUTO LOGIN ================= */

  const savedEmail =
    localStorage.getItem(
      "nova_current_user"
    );


  if (savedEmail) {

    const savedUser =
      getUsers().find(
        function (item) {

          return item.email === savedEmail;

        }
      );


    if (savedUser) {

      user = savedUser;

      startApp();

    }

  }

});
