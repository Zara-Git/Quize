"use strict";

const STORAGE_KEY = "quizApp.quizzes.v1";
const $ = (sel) => document.querySelector(sel);

document.addEventListener("DOMContentLoaded", () => {
  // Views
  const viewHome = $("#view-home");
  const viewQuiz = $("#view-quiz");

  // Home list
  const quizListEl = $("#quiz-list");

  // Quiz view
  const quizTitleEl = $("#quiz-title");
  const quizDescEl = $("#quiz-desc");
  const quizFormEl = $("#quiz-form");
  const backBtn = $("#btn-back");

  // Create quiz (single-question flow)
  const createForm = $("#create-quiz-form");
  const createMsg = $("#create-msg");

  const titleInput = $("#new-title");
  const descInput = $("#new-desc");

  const qInput = $("#new-q");
  const a1Input = $("#a1");
  const a2Input = $("#a2");
  const a3Input = $("#a3");
  const a4Input = $("#a4");
  const correctSelect = $("#correct");

  const addQuestionBtn = $("#btn-add-question");
  const clearDraftBtn = $("#btn-clear-draft");
  const saveQuizBtn = $("#btn-save-quiz");
  const draftCountEl = $("#draft-count");
  const draftListEl = $("#draft-list");

  // Modal
  const modalEl = $("#modal");
  const modalBody = $("#modal-body");
  const modalTitle = $("#modal-title");
  const modalClose = $("#modal-close");
  const modalOk = $("#modal-ok");
  const modalBackdrop = modalEl?.querySelector(".modal-backdrop");

  backBtn?.addEventListener("click", showHome);

  // close modal
  modalClose?.addEventListener("click", hideModal);
  modalOk?.addEventListener("click", hideModal);
  modalBackdrop?.addEventListener("click", (e) => {
    if (e.target?.dataset?.close === "true") hideModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideModal();
  });

  // ✅ Draft questions live here (not saved until quiz is saved)
  let draftQuestions = [];

  init();

  function init() {
    seedIfEmpty();
    renderQuizList();
    bindCreateQuiz();
    updateDraftUI();
    showHome();
  }

  /* -----------------------------
    LocalStorage
  ------------------------------ */
  function getQuizzes() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveQuizzes(quizzes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
  }

  /* -----------------------------
    Seed data (min 4 frågor)
  ------------------------------ */
  function seedIfEmpty() {
    const quizzes = getQuizzes();
    if (quizzes.length > 0) return;

    const seed = [
      {
        id: "eng-4c",
        title: "Engelska – Åk 4",
        description: "Ord + enkel grammatik (4 frågor).",
        questions: [
          {
            text: "What is 'hund' in English?",
            options: [
              { text: "Cat", isCorrect: false },
              { text: "Dog", isCorrect: true },
              { text: "Bird", isCorrect: false },
              { text: "Fish", isCorrect: false },
            ],
          },
          {
            text: "Choose the correct: I ___ a student.",
            options: [
              { text: "am", isCorrect: true },
              { text: "is", isCorrect: false },
              { text: "are", isCorrect: false },
              { text: "be", isCorrect: false },
            ],
          },
          {
            text: "What is 'tack' in English?",
            options: [
              { text: "Hello", isCorrect: false },
              { text: "Thank you", isCorrect: true },
              { text: "Sorry", isCorrect: false },
              { text: "Please", isCorrect: false },
            ],
          },
          {
            text: "Plural: one cat, two ____",
            options: [
              { text: "cat", isCorrect: false },
              { text: "cats", isCorrect: true },
              { text: "cates", isCorrect: false },
              { text: "catss", isCorrect: false },
            ],
          },
        ],
      },
      {
        id: "math-4c",
        title: "Matematik – Åk 4",
        description: "+, −, ×, ÷ (4 frågor).",
        questions: [
          {
            text: "Vad är 7 + 8?",
            options: [
              { text: "14", isCorrect: false },
              { text: "15", isCorrect: true },
              { text: "16", isCorrect: false },
              { text: "17", isCorrect: false },
            ],
          },
          {
            text: "Vad är 12 − 5?",
            options: [
              { text: "6", isCorrect: false },
              { text: "7", isCorrect: true },
              { text: "8", isCorrect: false },
              { text: "9", isCorrect: false },
            ],
          },
          {
            text: "Vad är 6 × 4?",
            options: [
              { text: "20", isCorrect: false },
              { text: "22", isCorrect: false },
              { text: "24", isCorrect: true },
              { text: "26", isCorrect: false },
            ],
          },
          {
            text: "Vad är 24 ÷ 6?",
            options: [
              { text: "3", isCorrect: false },
              { text: "4", isCorrect: true },
              { text: "5", isCorrect: false },
              { text: "6", isCorrect: false },
            ],
          },
        ],
      },
    ];

    saveQuizzes(seed);
  }

  /* -----------------------------
    Views
  ------------------------------ */
  function showHome() {
    viewHome?.classList.remove("hidden");
    viewQuiz?.classList.add("hidden");
    hideModal();
  }

  function showQuizView() {
    viewHome?.classList.add("hidden");
    viewQuiz?.classList.remove("hidden");
    hideModal();
  }

  /* -----------------------------
    Render quiz list
  ------------------------------ */
  function renderQuizList() {
    const quizzes = getQuizzes();
    quizListEl.innerHTML = "";

    quizzes.forEach((qz) => {
      const card = document.createElement("div");
      card.className = "quiz-card";

      card.innerHTML = `
        <div class="quiz-card-top">
          <div class="quiz-icon" aria-hidden="true">${getQuizIcon(qz.id)}</div>

          <div class="quiz-card-title">
            <h3>${escapeHtml(qz.title)}</h3>
            <p class="muted">${escapeHtml(qz.description || "")}</p>
          </div>

          <span class="badge">${qz.questions.length} frågor</span>
        </div>

        <div class="quiz-card-actions">
          <button class="btn btn-primary" type="button">Starta</button>
        </div>
      `;

      card.querySelector("button").addEventListener("click", () => startQuiz(qz.id));
      quizListEl.appendChild(card);
    });
  }

  function getQuizIcon(id = "") {
    if (id.startsWith("math")) return `<i class="bi bi-calculator"></i>`;
    if (id.startsWith("eng")) return `<i class="bi bi-translate"></i>`;
    if (id.startsWith("hist")) return `<i class="bi bi-hourglass-split"></i>`;
    if (id.startsWith("sci")) return `<i class="bi bi-flower1"></i>`;
    return `<i class="bi bi-patch-question"></i>`;
  }

  /* -----------------------------
    Start quiz + render questions
  ------------------------------ */
  function startQuiz(quizId) {
    const quiz = getQuizzes().find((q) => q.id === quizId);
    if (!quiz) return;

    quizTitleEl.textContent = quiz.title;
    quizDescEl.textContent = quiz.description || "";
    quizFormEl.innerHTML = "";

    quiz.questions.forEach((question, qi) => {
      const fieldset = document.createElement("fieldset");
      fieldset.className = "q";

      const legend = document.createElement("legend");
      legend.textContent = `Fråga ${qi + 1}: ${question.text}`;
      fieldset.appendChild(legend);

      question.options.forEach((opt, oi) => {
        const id = `q${qi}_opt${oi}`;
        const label = document.createElement("label");
        label.className = "opt";
        label.htmlFor = id;

        const requiredAttr = oi === 0 ? "required" : "";

        label.innerHTML = `
          <input id="${id}" type="radio" name="q${qi}" value="${oi}" ${requiredAttr}/>
          <span>${escapeHtml(opt.text)}</span>
        `;

        fieldset.appendChild(label);
      });

      quizFormEl.appendChild(fieldset);
    });

    const submitBtn = document.createElement("button");
    submitBtn.className = "btn btn-primary";
    submitBtn.type = "submit";
    submitBtn.textContent = "Rätta quiz";
    quizFormEl.appendChild(submitBtn);

    quizFormEl.onsubmit = (e) => {
      e.preventDefault();
      gradeQuiz(quiz);
    };

    showQuizView();
  }

  function gradeQuiz(quiz) {
    let correct = 0;

    for (let qi = 0; qi < quiz.questions.length; qi++) {
      const selected = quizFormEl.querySelector(`input[name="q${qi}"]:checked`);
      if (!selected) {
        showModal({
          type: "error",
          title: "Inte klart",
          message: "Svara på alla frågor innan du rättar.",
        });
        return;
      }
      const selectedIndex = Number(selected.value);
      const isRight = quiz.questions[qi].options[selectedIndex]?.isCorrect === true;
      if (isRight) correct++;
    }

    const total = quiz.questions.length;
    const percent = Math.round((correct / total) * 100);
    const isPass = percent >= 70;

    showModal({
      type: isPass ? "success" : "error",
      title: "Resultat",
      message: `Du fick <strong>${correct}</strong> av <strong>${total}</strong> rätt (${percent}%).`,
      badge: isPass ? "Bra jobbat!" : "Försök igen!",
    });
  }

  /* -----------------------------
    Modal
  ------------------------------ */
  function showModal({ type = "success", title = "Resultat", message = "", badge = "" }) {
    if (!modalEl) return;

    modalTitle.textContent = title;

    const badgeHtml = badge
      ? `<div class="modal-badge ${type}">${escapeHtml(badge)}</div>`
      : "";

    modalBody.innerHTML = `${badgeHtml}<p>${message}</p>`;

    const card = modalEl.querySelector(".modal-card");
    card?.classList.remove("success", "error");
    card?.classList.add(type);

    modalEl.classList.remove("hidden");
    modalOk?.focus();
  }

  function hideModal() {
    if (!modalEl) return;
    modalEl.classList.add("hidden");
  }

  /* -----------------------------
    ✅ Create Quiz (single-question add flow)
  ------------------------------ */
  function bindCreateQuiz() {
    if (!createForm) return;

    addQuestionBtn?.addEventListener("click", () => {
      if (createMsg) createMsg.textContent = "";

      const qText = qInput.value.trim();
      const a1 = a1Input.value.trim();
      const a2 = a2Input.value.trim();
      const a3 = a3Input.value.trim();
      const a4 = a4Input.value.trim();
      const correctIndex = Number(correctSelect.value);

      if (!qText || !a1 || !a2 || !a3 || !a4) {
        if (createMsg) createMsg.textContent = "Fyll i frågan och alla 4 alternativ.";
        return;
      }

      draftQuestions.push({
        text: qText,
        options: [
          { text: a1, isCorrect: correctIndex === 0 },
          { text: a2, isCorrect: correctIndex === 1 },
          { text: a3, isCorrect: correctIndex === 2 },
          { text: a4, isCorrect: correctIndex === 3 },
        ],
      });

      // ✅ clear ONLY question inputs (like you want)
      clearQuestionInputs();
      updateDraftUI();

      if (createMsg) createMsg.textContent = "Fråga tillagd ✅";
      qInput.focus();
    });

    clearDraftBtn?.addEventListener("click", () => {
      draftQuestions = [];
      updateDraftUI();
      if (createMsg) createMsg.textContent = "Alla frågor rensade.";
    });

    createForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = titleInput.value.trim();
      const desc = descInput.value.trim();

      if (!title) {
        if (createMsg) createMsg.textContent = "Titel krävs.";
        return;
      }
      if (draftQuestions.length < 4) {
        if (createMsg) createMsg.textContent = "Du måste lägga till minst 4 frågor قبل از Spara.";
        return;
      }

      const newQuiz = {
        id: createQuizId(),
        title,
        description: desc,
        questions: draftQuestions,
      };

      const quizzes = getQuizzes();
      quizzes.push(newQuiz);
      saveQuizzes(quizzes);

      // reset everything after saving quiz
      draftQuestions = [];
      createForm.reset();
      updateDraftUI();
      renderQuizList();

      if (createMsg) createMsg.textContent = "Quiz sparat! ✅";
    });
  }

  function clearQuestionInputs() {
    qInput.value = "";
    a1Input.value = "";
    a2Input.value = "";
    a3Input.value = "";
    a4Input.value = "";
    correctSelect.value = "0";
  }

  function updateDraftUI() {
    const count = draftQuestions.length;

    if (draftCountEl) draftCountEl.textContent = `${count} frågor tillagda`;
    if (draftListEl) {
      draftListEl.innerHTML = "";
      draftQuestions.forEach((q, idx) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${idx + 1}.</strong> ${escapeHtml(q.text)}`;
        draftListEl.appendChild(li);
      });
    }

    if (saveQuizBtn) saveQuizBtn.disabled = count < 4;
  }

  function createQuizId() {
    if (crypto?.randomUUID) return `quiz-${crypto.randomUUID()}`;
    return `quiz-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});
