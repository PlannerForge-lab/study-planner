const express = require("express");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

const app = express();


app.use(express.json());
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});
app.use(express.static(path.join(__dirname, "../client")));

// ── Page sizes in points ───────────────────────────────────────
const PAGE_SIZES = {
  A4:         [595, 842],
  A3:         [842, 1191],
  A5:         [420, 595],
  Letter:     [612, 792],
  LetterLand: [792, 612],
  Legal:      [612, 1008],
};

// ── Colors ─────────────────────────────────────────────────────
const C = {
  primary : rgb(0.18, 0.38, 0.72),
  light   : rgb(0.90, 0.93, 0.98),
  muted   : rgb(0.5,  0.5,  0.5),
  dark    : rgb(0.1,  0.1,  0.1),
  white   : rgb(1,    1,    1),
  pink    : rgb(0.98, 0.88, 0.93),
  yellow  : rgb(0.99, 0.95, 0.75),
  green   : rgb(0.88, 0.97, 0.88),
  gray    : rgb(0.95, 0.95, 0.95),
};

// ── Helpers ────────────────────────────────────────────────────
function hLine(page, y, x1, x2, color = C.muted, thickness = 0.5) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness, color });
}

function vLine(page, x, y1, y2, color = C.muted, thickness = 0.5) {
  page.drawLine({ start: { x, y: y1 }, end: { x, y: y2 }, thickness, color });
}

function rect(page, x, y, w, h, color) {
  page.drawRectangle({ x, y, width: w, height: h, color });
}

function txt(page, text, x, y, size, font, color = C.dark) {
  try {
    page.drawText(String(text), { x, y, size, font, color });
  } catch(e) {}
}

function addHeader(page, title, userName, boldFont, regularFont, W, H) {
  rect(page, 0, H - 52, W, 52, C.primary);
  txt(page, title,    36, H - 34, 16, boldFont, C.white);
  txt(page, userName, W - 180, H - 34, 9, regularFont, C.white);
  txt(page, "Title: _______________________    Date: _______________",
    36, H - 58, 8, regularFont, C.muted);
}

// ── PAGES ──────────────────────────────────────────────────────

function addDailySchedule(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Daily Schedule", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const times = [
    "6:00","7:00","8:00","9:00","10:00","11:00",
    "12:00","13:00","14:00","15:00","16:00","17:00",
    "18:00","19:00","20:00","21:00","22:00",
  ];
  times.forEach((time, i) => {
    const bg = i % 2 === 0 ? C.light : C.white;
    rect(page, m, y - 18, W - m * 2, 20, bg);
    txt(page, time, m + 4, y - 12, 8, boldFont, C.primary);
    hLine(page, y - 18, m + 55, W - m, C.muted, 0.3);
    y -= 20;
  });
  y -= 8;
  rect(page, m, y - 18, W - m * 2, 18, C.primary);
  txt(page, "NOTES", m + 4, y - 12, 8, boldFont, C.white);
  y -= 20;
  rect(page, m, y - 45, W - m * 2, 45, C.light);
}

function addWeeklyPlan(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Weekly Lesson Plan", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  const days = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
  const colW = (W - m * 2) / days.length;
  let y = H - 75;
  txt(page, "Month: ___________   Week: ___________", m, y, 8, regularFont, C.muted);
  y -= 18;
  days.forEach((day, i) => {
    rect(page, m + i * colW, y - 18, colW - 1, 20, C.primary);
    txt(page, day, m + i * colW + colW / 2 - 8, y - 12, 8, boldFont, C.white);
  });
  y -= 20;
  for (let row = 0; row < 12; row++) {
    const bg = row % 2 === 0 ? C.light : C.white;
    days.forEach((_, i) => {
      rect(page, m + i * colW, y - 20, colW - 1, 21, bg);
    });
    y -= 21;
  }
  y -= 8;
  rect(page, m, y - 18, W - m * 2, 18, C.primary);
  txt(page, "NOTES", m + 4, y - 12, 8, boldFont, C.white);
  y -= 20;
  rect(page, m, y - 40, W - m * 2, 40, C.light);
}

function addAssignmentTracker(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Assignment Tracker", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  const cols = [
    { label: "COURSE",     w: 0.25 },
    { label: "ASSIGNMENT", w: 0.38 },
    { label: "DUE DATE",   w: 0.22 },
    { label: "DONE",       w: 0.15 },
  ];
  rect(page, m, y - 18, tableW, 20, C.primary);
  let x = m;
  cols.forEach(col => {
    txt(page, col.label, x + 4, y - 12, 8, boldFont, C.white);
    x += tableW * col.w;
  });
  y -= 20;
  for (let i = 0; i < 16; i++) {
    rect(page, m, y - 20, tableW, 21, i % 2 === 0 ? C.light : C.white);
    x = m;
    cols.forEach(col => {
      vLine(page, x, y - 20, y, C.muted, 0.3);
      x += tableW * col.w;
    });
    y -= 21;
  }
}

function addExamTracker(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Exam Tracker", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  const cols = [
    { label: "SUBJECT",          w: 0.28 },
    { label: "EXAM DATE",        w: 0.22 },
    { label: "MATERIAL COVERED", w: 0.35 },
    { label: "DONE",             w: 0.15 },
  ];
  rect(page, m, y - 18, tableW, 20, C.primary);
  let x = m;
  cols.forEach(col => {
    txt(page, col.label, x + 4, y - 12, 8, boldFont, C.white);
    x += tableW * col.w;
  });
  y -= 20;
  for (let i = 0; i < 15; i++) {
    rect(page, m, y - 20, tableW, 21, i % 2 === 0 ? C.light : C.white);
    y -= 21;
  }
  y -= 8;
  rect(page, m, y - 18, tableW, 18, C.yellow);
  txt(page, "NOTES", m + 4, y - 12, 8, boldFont, C.dark);
  y -= 20;
  rect(page, m, y - 40, tableW, 40, C.light);
}

function addGradeTracker(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Grade Tracker", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  rect(page, m, y - 18, tableW * 0.48, 20, C.pink);
  txt(page, "SUBJECT:", m + 4, y - 12, 8, boldFont, C.dark);
  rect(page, m + tableW * 0.50, y - 18, tableW * 0.24, 20, C.pink);
  txt(page, "GOAL GRADE:", m + tableW * 0.50 + 4, y - 12, 8, boldFont, C.dark);
  rect(page, m + tableW * 0.76, y - 18, tableW * 0.24, 20, C.pink);
  txt(page, "FINAL GRADE:", m + tableW * 0.76 + 4, y - 12, 8, boldFont, C.dark);
  y -= 26;
  const cols = [
    { label: "DATE",             w: 0.18 },
    { label: "TOPIC/ASSIGNMENT", w: 0.47 },
    { label: "SCORE",            w: 0.20 },
    { label: "PASSED",           w: 0.15 },
  ];
  rect(page, m, y - 18, tableW, 20, C.primary);
  let x = m;
  cols.forEach(col => {
    txt(page, col.label, x + 4, y - 12, 8, boldFont, C.white);
    x += tableW * col.w;
  });
  y -= 20;
  for (let i = 0; i < 14; i++) {
    rect(page, m, y - 20, tableW, 21, i % 2 === 0 ? C.light : C.white);
    txt(page, "YES / NO", m + tableW * 0.86, y - 13, 7, regularFont, C.muted);
    y -= 21;
  }
}

function addSemesterGoals(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Semester Goals", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  ["Goal 1", "Goal 2", "Goal 3", "Goal 4"].forEach((g) => {
    rect(page, m, y - 18, tableW, 20, C.pink);
    txt(page, "Semester " + g, m + tableW / 2 - 28, y - 12, 9, boldFont, C.dark);
    y -= 22;
    for (let l = 0; l < 5; l++) {
      hLine(page, y - 10, m, W - m, C.muted, 0.4);
      y -= 18;
    }
    y -= 10;
  });
}

function addHabitTracker(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Habit Tracker", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  const days = ["M","T","W","T","F","S","S"];
  const habitColW = tableW * 0.45;
  const dayW = (tableW * 0.55) / 7;
  txt(page, "Week of: _______________", m, y, 8, regularFont, C.muted);
  y -= 18;
  rect(page, m, y - 18, habitColW, 20, C.primary);
  txt(page, "HABIT", m + 4, y - 12, 8, boldFont, C.white);
  days.forEach((d, i) => {
    rect(page, m + habitColW + i * dayW, y - 18, dayW - 1, 20, C.primary);
    txt(page, d, m + habitColW + i * dayW + dayW / 2 - 3, y - 12, 8, boldFont, C.white);
  });
  y -= 20;
  for (let r = 0; r < 12; r++) {
    const bg = r % 2 === 0 ? C.light : C.white;
    rect(page, m, y - 20, habitColW, 21, bg);
    days.forEach((_, i) => {
      rect(page, m + habitColW + i * dayW, y - 20, dayW - 1, 21, bg);
    });
    y -= 21;
  }
  y -= 8;
  rect(page, m, y - 18, tableW, 18, C.yellow);
  txt(page, "NOTES", m + 4, y - 12, 8, boldFont, C.dark);
  y -= 20;
  rect(page, m, y - 40, tableW, 40, C.light);
}

function addWaterTracker(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Water Tracker", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  txt(page, "Goal: 8 glasses per day", m, y, 9, regularFont, C.muted);
  y -= 22;
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  days.forEach((day, i) => {
    const bg = i % 2 === 0 ? C.light : C.white;
    rect(page, m, y - 22, tableW, 24, bg);
    txt(page, day, m + 6, y - 13, 9, boldFont, C.primary);
    for (let g = 0; g < 8; g++) {
      page.drawRectangle({
        x: m + 110 + g * 34, y: y - 20,
        width: 26, height: 16,
        borderColor: C.primary, borderWidth: 1,
        color: C.white,
      });
      txt(page, "H2O", m + 114 + g * 34, y - 16, 6, regularFont, C.muted);
    }
    y -= 26;
  });
}

function addMonthlyFinance(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Monthly Finance", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  txt(page, "Month: _______________", m, y, 9, regularFont, C.muted);
  y -= 20;
  const sections = [
    { title: "INCOME",           cols: ["DATE","SOURCE","CATEGORY","AMOUNT"] },
    { title: "BILLS & EXPENSES", cols: ["DATE","EXPENSE","TYPE","AMOUNT"] },
  ];
  sections.forEach(sec => {
    rect(page, m, y - 18, tableW, 20, C.primary);
    txt(page, sec.title, m + tableW / 2 - 25, y - 12, 9, boldFont, C.white);
    y -= 20;
    const colW = tableW / sec.cols.length;
    let x = m;
    sec.cols.forEach(col => {
      rect(page, x, y - 16, colW - 1, 18, C.pink);
      txt(page, col, x + 4, y - 12, 7, boldFont, C.dark);
      x += colW;
    });
    y -= 18;
    for (let r = 0; r < 5; r++) {
      rect(page, m, y - 18, tableW, 19, r % 2 === 0 ? C.light : C.white);
      y -= 19;
    }
    y -= 10;
  });
  rect(page, m, y - 18, tableW, 20, C.primary);
  txt(page, "SUMMARY", m + tableW / 2 - 20, y - 12, 9, boldFont, C.white);
  y -= 20;
  ["INCOME","BILLS & EXPENSES","BALANCE"].forEach((row, i) => {
    rect(page, m, y - 18, tableW * 0.6, 19, i % 2 === 0 ? C.light : C.white);
    rect(page, m + tableW * 0.6, y - 18, tableW * 0.4, 19, i % 2 === 0 ? C.light : C.white);
    txt(page, row, m + 4, y - 12, 8, regularFont, C.dark);
    y -= 19;
  });
}

function addCornellNotes(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Cornell Notes", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  const keyColW = W * 0.28;
  const noteColW = W - m - keyColW - m;
  let y = H - 72;
  const bodyH = H * 0.72;
  rect(page, m, y - bodyH, keyColW, bodyH, C.light);
  txt(page, "Keywords / Questions", m + 4, y - 12, 7, boldFont, C.primary);
  txt(page, "Notes", m + keyColW + 10, y - 12, 7, boldFont, C.primary);
  vLine(page, m + keyColW, y - bodyH, y, C.primary, 1);
  for (let i = 0; i < 22; i++) {
    hLine(page, y - 18 - i * 22, m, W - m, C.muted, 0.3);
  }
  y = y - bodyH - 8;
  rect(page, m, y - 55, W - m * 2, 55, C.light);
  rect(page, m, y, W - m * 2, 14, C.primary);
  txt(page, "SUMMARY", m + 4, y - 10, 8, boldFont, C.white);
}

function addNotebookLined(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Notebook - Lined", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 72;
  for (let i = 0; i < 28; i++) {
    hLine(page, y - i * 24, m, W - m, C.muted, 0.4);
  }
}

function addNotebookDotGrid(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Notebook - Dot Grid", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  const spacing = 18;
  for (let row = 0; row * spacing < H - 80; row++) {
    for (let col = 0; col * spacing < W - m * 2; col++) {
      page.drawCircle({
        x: m + col * spacing,
        y: H - 78 - row * spacing,
        size: 1,
        color: C.muted,
      });
    }
  }
}

function addNotebookGraph(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Notebook - Graph", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  const spacing = 18;
  for (let row = 0; row * spacing < H - 70; row++) {
    hLine(page, H - 74 - row * spacing, m, W - m, C.muted, 0.3);
  }
  for (let col = 0; col * spacing < W - m * 2; col++) {
    vLine(page, m + col * spacing, 30, H - 74, C.muted, 0.3);
  }
}

function addNotebookBlank(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Notebook - Blank", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  page.drawRectangle({
    x: m, y: 30,
    width: W - m * 2, height: H - 100,
    borderColor: C.muted, borderWidth: 0.5,
    color: C.white,
  });
}

function addDailyJournal(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Daily Journal", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  rect(page, m, y - 18, tableW, 20, C.primary);
  txt(page, "TODAY I AM GRATEFUL FOR", m + tableW / 2 - 55, y - 12, 8, boldFont, C.white);
  y -= 20;
  [1, 2, 3].forEach(n => {
    rect(page, m, y - 20, 22, 20, C.pink);
    txt(page, String(n), m + 8, y - 14, 9, boldFont, C.dark);
    rect(page, m + 22, y - 20, tableW - 22, 20, C.light);
    y -= 22;
  });
  y -= 10;
  rect(page, m, y - 18, tableW, 18, C.primary);
  txt(page, "TODAY'S PRIORITIES", m + tableW / 2 - 45, y - 12, 8, boldFont, C.white);
  y -= 20;
  [1, 2, 3].forEach(n => {
    rect(page, m, y - 20, 22, 20, C.yellow);
    txt(page, String(n), m + 8, y - 14, 9, boldFont, C.dark);
    rect(page, m + 22, y - 20, tableW - 22, 20, C.light);
    y -= 22;
  });
  y -= 10;
  rect(page, m, y - 18, tableW, 18, C.primary);
  txt(page, "NOTES & REFLECTIONS", m + tableW / 2 - 48, y - 12, 8, boldFont, C.white);
  y -= 20;
  for (let i = 0; i < 10; i++) {
    hLine(page, y - i * 22, m, W - m, C.muted, 0.4);
  }
  y -= 10 * 22 + 10;
  rect(page, m, y - 18, tableW, 18, C.primary);
  txt(page, "HOW DO I FEEL TODAY?", m + tableW / 2 - 48, y - 12, 8, boldFont, C.white);
  y -= 22;
  const moods = ["Great", "Good", "Okay", "Tired", "Stressed"];
  moods.forEach((mood, i) => {
    rect(page, m + i * (tableW / 5), y - 20, tableW / 5 - 4, 22, C.light);
    txt(page, mood, m + i * (tableW / 5) + 6, y - 13, 8, regularFont, C.dark);
  });
}

function addWeeklyJournal(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Weekly Journal", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  txt(page, "Week of: _______________", m, y, 9, regularFont, C.muted);
  y -= 20;
  rect(page, m, y - 18, tableW, 18, C.primary);
  txt(page, "THIS WEEK'S HIGHLIGHTS", m + tableW / 2 - 55, y - 12, 8, boldFont, C.white);
  y -= 20;
  for (let i = 0; i < 5; i++) {
    hLine(page, y - i * 22, m, W - m, C.muted, 0.4);
  }
  y -= 5 * 22 + 12;
  rect(page, m, y - 18, tableW, 18, C.primary);
  txt(page, "WHAT WENT WELL", m + tableW / 2 - 38, y - 12, 8, boldFont, C.white);
  y -= 20;
  for (let i = 0; i < 4; i++) {
    hLine(page, y - i * 22, m, W - m, C.muted, 0.4);
  }
  y -= 4 * 22 + 12;
  rect(page, m, y - 18, tableW, 18, C.primary);
  txt(page, "WHAT TO IMPROVE", m + tableW / 2 - 38, y - 12, 8, boldFont, C.white);
  y -= 20;
  for (let i = 0; i < 4; i++) {
    hLine(page, y - i * 22, m, W - m, C.muted, 0.4);
  }
  y -= 4 * 22 + 12;
  rect(page, m, y - 18, tableW, 18, C.primary);
  txt(page, "NEXT WEEK GOALS", m + tableW / 2 - 38, y - 12, 8, boldFont, C.white);
  y -= 20;
  [1, 2, 3].forEach(n => {
    rect(page, m, y - 20, 22, 20, C.pink);
    txt(page, String(n), m + 8, y - 14, 9, boldFont, C.dark);
    rect(page, m + 22, y - 20, tableW - 22, 20, C.light);
    y -= 22;
  });
}

function addTodoList(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "To-do List", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  txt(page, "Date: _______________    Priority: High / Medium / Low", m, y, 8, regularFont, C.muted);
  y -= 20;
  rect(page, m, y - 18, tableW, 18, C.primary);
  txt(page, "TASKS", m + tableW / 2 - 15, y - 12, 8, boldFont, C.white);
  y -= 20;
  for (let i = 0; i < 18; i++) {
    const bg = i % 2 === 0 ? C.light : C.white;
    rect(page, m, y - 20, 22, 20, bg);
    page.drawRectangle({
      x: m + 4, y: y - 17,
      width: 13, height: 13,
      borderColor: C.primary, borderWidth: 1,
      color: C.white,
    });
    rect(page, m + 22, y - 20, tableW - 22, 20, bg);
    y -= 21;
  }
  y -= 8;
  rect(page, m, y - 18, tableW, 18, C.yellow);
  txt(page, "NOTES", m + 4, y - 12, 8, boldFont, C.dark);
  y -= 20;
  rect(page, m, y - 40, tableW, 40, C.light);
}

function addContactList(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Contact List", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  for (let i = 0; i < 6; i++) {
    rect(page, m, y - 18, tableW, 18, C.primary);
    y -= 20;
    const fields = [
      { label: "Name:", w: 0.5 },
      { label: "Company:", w: 0.5 },
    ];
    let x = m;
    fields.forEach(f => {
      rect(page, x, y - 16, tableW * f.w - 4, 16, C.light);
      txt(page, f.label, x + 4, y - 12, 7, boldFont, C.primary);
      x += tableW * f.w;
    });
    y -= 18;
    ["Email:", "Phone:", "Address:", "Notes:"].forEach(field => {
      rect(page, m, y - 14, tableW, 14, i % 2 === 0 ? C.light : C.white);
      txt(page, field, m + 4, y - 10, 7, boldFont, C.muted);
      y -= 15;
    });
    y -= 8;
  }
}

function addProjectPlanner(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Project Planner", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  rect(page, m, y - 18, tableW, 18, C.pink);
  txt(page, "TITLE:", m + 4, y - 12, 8, boldFont, C.dark);
  y -= 22;
  rect(page, m, y - 18, tableW * 0.5 - 4, 18, C.pink);
  txt(page, "START DATE:", m + 4, y - 12, 8, boldFont, C.dark);
  rect(page, m + tableW * 0.5, y - 18, tableW * 0.5, 18, C.pink);
  txt(page, "DUE DATE:", m + tableW * 0.5 + 4, y - 12, 8, boldFont, C.dark);
  y -= 22;
  const halfW = tableW / 2 - 4;
  rect(page, m, y - 18, halfW, 18, C.primary);
  txt(page, "MILESTONES", m + halfW / 2 - 25, y - 12, 8, boldFont, C.white);
  rect(page, m + tableW / 2, y - 18, halfW, 18, C.primary);
  txt(page, "RESOURCES", m + tableW / 2 + halfW / 2 - 25, y - 12, 8, boldFont, C.white);
  y -= 20;
  for (let i = 0; i < 7; i++) {
    rect(page, m, y - 20, halfW, 20, i % 2 === 0 ? C.light : C.white);
    rect(page, m + tableW / 2, y - 20, halfW, 20, i % 2 === 0 ? C.light : C.white);
    y -= 20;
  }
  y -= 8;
  rect(page, m, y - 18, tableW, 18, C.primary);
  txt(page, "ACTION STEPS", m + 4, y - 12, 8, boldFont, C.white);
  rect(page, m + tableW * 0.6, y - 18, tableW * 0.4, 18, C.primary);
  txt(page, "DEADLINE", m + tableW * 0.6 + 4, y - 12, 8, boldFont, C.white);
  y -= 20;
  for (let i = 0; i < 6; i++) {
    rect(page, m, y - 20, tableW, 20, i % 2 === 0 ? C.light : C.white);
    vLine(page, m + tableW * 0.6, y - 20, y, C.muted, 0.5);
    y -= 20;
  }
}

function addGoalActionPlan(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Goal Action Plan", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  rect(page, m, y - 50, tableW, 50, C.light);
  page.drawRectangle({ x: m, y: y - 50, width: tableW, height: 50, borderColor: C.primary, borderWidth: 1, color: C.light });
  txt(page, "GOAL:", m + 4, y - 12, 8, boldFont, C.primary);
  y -= 58;
  rect(page, m, y - 18, tableW * 0.5 - 4, 18, C.yellow);
  txt(page, "START DATE:", m + 4, y - 12, 8, boldFont, C.dark);
  rect(page, m + tableW * 0.5, y - 18, tableW * 0.5, 18, C.yellow);
  txt(page, "DUE DATE:", m + tableW * 0.5 + 4, y - 12, 8, boldFont, C.dark);
  y -= 22;
  const halfW = tableW / 2 - 4;
  rect(page, m, y - 18, halfW, 18, C.primary);
  txt(page, "ACTION STEPS", m + halfW / 2 - 28, y - 12, 8, boldFont, C.white);
  rect(page, m + tableW / 2, y - 18, halfW, 18, C.primary);
  txt(page, "POSSIBLE OBSTACLES", m + tableW / 2 + 4, y - 12, 8, boldFont, C.white);
  y -= 20;
  for (let i = 0; i < 7; i++) {
    rect(page, m, y - 20, halfW, 20, i % 2 === 0 ? C.light : C.white);
    rect(page, m + tableW / 2, y - 20, halfW, 20, i % 2 === 0 ? C.light : C.white);
    y -= 20;
  }
  y -= 8;
  rect(page, m, y - 18, tableW, 18, C.primary);
  txt(page, "HOW TO OVERCOME OBSTACLES", m + tableW / 2 - 60, y - 12, 8, boldFont, C.white);
  y -= 20;
  rect(page, m, y - 60, tableW, 60, C.light);
}

function addMonthlyGlance(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Month at a Glance", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  txt(page, "Month: _______________    Year: _______", m, y, 9, regularFont, C.muted);
  y -= 18;
  const days = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
  const colW = tableW / 7;
  days.forEach((d, i) => {
    rect(page, m + i * colW, y - 18, colW - 1, 18, C.primary);
    txt(page, d, m + i * colW + colW / 2 - 8, y - 12, 7, boldFont, C.white);
  });
  y -= 20;
  for (let week = 0; week < 5; week++) {
    days.forEach((_, i) => {
      rect(page, m + i * colW, y - 55, colW - 1, 55, week % 2 === 0 ? C.light : C.white);
    });
    y -= 57;
  }
  y -= 8;
  rect(page, m, y - 18, tableW, 18, C.primary);
  txt(page, "MONTHLY GOALS", m + tableW / 2 - 35, y - 12, 8, boldFont, C.white);
  y -= 20;
  rect(page, m, y - 50, tableW, 50, C.light);
}

function addYearlyPlanner(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Yearly Planner", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const colW = tableW / 3;
  const rowH = (H - 120) / 4;
  months.forEach((month, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = m + col * colW;
    const my = y - row * rowH;
    rect(page, x, my - 18, colW - 4, 18, C.primary);
    txt(page, month, x + colW / 2 - 10, my - 12, 8, boldFont, C.white);
    rect(page, x, my - rowH, colW - 4, rowH - 20, C.light);
  });
}

function addWeeklyOverview(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Weekly Overview", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  txt(page, "Class: _______________    Week: _______________", m, y, 9, regularFont, C.muted);
  y -= 20;
  const cols = [
    { label: "DATE",            w: 0.18 },
    { label: "ASSIGNMENT",      w: 0.40 },
    { label: "YOUR SCORE",      w: 0.22 },
    { label: "POINTS POSSIBLE", w: 0.20 },
  ];
  rect(page, m, y - 18, tableW, 18, C.primary);
  let x = m;
  cols.forEach(col => {
    txt(page, col.label, x + 4, y - 12, 7, boldFont, C.white);
    x += tableW * col.w;
  });
  y -= 20;
  for (let i = 0; i < 16; i++) {
    rect(page, m, y - 20, tableW, 20, i % 2 === 0 ? C.light : C.white);
    y -= 20;
  }
}

function addExamSchedule(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Exam Schedule", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  const cols = [
    { label: "CLASS/SUBJECT",   w: 0.30 },
    { label: "DATE AND TIME",   w: 0.30 },
    { label: "TOPICS COVERED",  w: 0.40 },
  ];
  rect(page, m, y - 18, tableW, 18, C.yellow);
  let x = m;
  cols.forEach(col => {
    txt(page, col.label, x + 4, y - 12, 8, boldFont, C.dark);
    x += tableW * col.w;
  });
  y -= 20;
  for (let i = 0; i < 14; i++) {
    rect(page, m, y - 22, tableW, 22, i % 2 === 0 ? C.light : C.white);
    y -= 22;
  }
  y -= 8;
  rect(page, m, y - 18, tableW, 18, C.yellow);
  txt(page, "NOTES", m + 4, y - 12, 8, boldFont, C.dark);
  y -= 20;
  rect(page, m, y - 50, tableW, 50, C.light);
}

function addStudentGoals(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Student Goals", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  const halfW = tableW / 2 - 4;
  for (let i = 0; i < 3; i++) {
    rect(page, m, y - 18, tableW, 18, C.yellow);
    txt(page, "Student Name:", m + 4, y - 12, 8, boldFont, C.dark);
    y -= 20;
    rect(page, m, y - 18, halfW, 18, C.pink);
    txt(page, "CHARACTER GOALS", m + halfW / 2 - 35, y - 12, 8, boldFont, C.dark);
    rect(page, m + tableW / 2, y - 18, halfW, 18, C.pink);
    txt(page, "ACADEMIC GOALS", m + tableW / 2 + halfW / 2 - 30, y - 12, 8, boldFont, C.dark);
    y -= 20;
    rect(page, m, y - 70, halfW, 70, C.light);
    rect(page, m + tableW / 2, y - 70, halfW, 70, C.light);
    y -= 80;
  }
}

function addLessonPlan(pdfDoc, info, boldFont, regularFont, W, H) {
  const page = pdfDoc.addPage([W, H]);
  addHeader(page, "Subject Lesson Plan", info.userName, boldFont, regularFont, W, H);
  const m = 36;
  let y = H - 75;
  const tableW = W - m * 2;
  const halfW = tableW / 2 - 4;
  [["YEAR/SEMESTER:", "SUBJECT:"], ["UNIT:", "LESSON:"]].forEach(row => {
    rect(page, m, y - 18, halfW, 18, C.yellow);
    txt(page, row[0], m + 4, y - 12, 8, boldFont, C.dark);
    rect(page, m + tableW / 2, y - 18, halfW, 18, C.yellow);
    txt(page, row[1], m + tableW / 2 + 4, y - 12, 8, boldFont, C.dark);
    y -= 22;
  });
  rect(page, m, y - 18, halfW, 18, C.pink);
  txt(page, "TOPICS", m + halfW / 2 - 15, y - 12, 8, boldFont, C.dark);
  rect(page, m + tableW / 2, y - 18, halfW, 18, C.pink);
  txt(page, "OBJECTIVES", m + tableW / 2 + halfW / 2 - 22, y - 12, 8, boldFont, C.dark);
  y -= 20;
  rect(page, m, y - 80, halfW, 80, C.light);
  rect(page, m + tableW / 2, y - 80, halfW, 80, C.light);
  y -= 88;
  rect(page, m, y - 18, tableW, 18, C.primary);
  txt(page, "SUBJECT", m + 4, y - 12, 8, boldFont, C.white);
  y -= 20;
  for (let i = 0; i < 6; i++) {
    rect(page, m, y - 18, tableW, 18, i % 2 === 0 ? C.light : C.white);
    y -= 18;
  }
  y -= 8;
  rect(page, m, y - 18, halfW, 18, C.yellow);
  txt(page, "MATERIALS & RESOURCES", m + 4, y - 12, 7, boldFont, C.dark);
  rect(page, m + tableW / 2, y - 18, halfW, 18, C.yellow);
  txt(page, "NOTES", m + tableW / 2 + halfW / 2 - 15, y - 12, 8, boldFont, C.dark);
  y -= 20;
  rect(page, m, y - 60, halfW, 60, C.light);
  rect(page, m + tableW / 2, y - 60, halfW, 60, C.light);
}

// ── Section dispatcher ─────────────────────────────────────────
function addSection(id, pdfDoc, info, boldFont, regularFont, W, H) {
  switch(id) {
    case "daily_schedule":     addDailySchedule(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "weekly_plan":        addWeeklyPlan(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "assignment_tracker": addAssignmentTracker(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "exam_tracker":       addExamTracker(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "grade_tracker":      addGradeTracker(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "semester_goals":     addSemesterGoals(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "habit_tracker":      addHabitTracker(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "water_tracker":      addWaterTracker(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "monthly_finance":    addMonthlyFinance(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "cornell_notes":      addCornellNotes(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "notebook_lined":     addNotebookLined(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "notebook_dotgrid":   addNotebookDotGrid(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "notebook_graph":     addNotebookGraph(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "notebook_blank":     addNotebookBlank(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "daily_journal":      addDailyJournal(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "weekly_journal":     addWeeklyJournal(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "todo_list":          addTodoList(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "contact_list":       addContactList(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "project_planner":    addProjectPlanner(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "goal_action_plan":   addGoalActionPlan(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "monthly_glance":     addMonthlyGlance(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "yearly_planner":     addYearlyPlanner(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "weekly_overview":    addWeeklyOverview(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "exam_schedule":      addExamSchedule(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "student_goals":      addStudentGoals(pdfDoc, info, boldFont, regularFont, W, H); break;
    case "lesson_plan":        addLessonPlan(pdfDoc, info, boldFont, regularFont, W, H); break;
    default: break;
  }
}

// ── POST /generate-pdf ─────────────────────────────────────────
app.post("/generate-pdf", (req, res) => {
  res.json({ message: "API is working" });
});
    const { role, type, sections, userName, userInstitution,
            academicYear, subjects, pageSize, orientation } = req.body;

    if (!userName || !sections?.length) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    let [W, H] = PAGE_SIZES[pageSize] || PAGE_SIZES["A4"];
    if (orientation === "landscape") [W, H] = [H, W];

    const pdfDoc      = await PDFDocument.create();
    const boldFont    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const info = { userName, userInstitution, academicYear, subjects, role, type };

    // ── Cover Page ─────────────────────────────────────────────
    const cover = pdfDoc.addPage([W, H]);
    rect(cover, 0, 0, W, H, C.primary);
    rect(cover, 24, 24, W - 48, H - 48, C.white);
    rect(cover, 24, H - 90, W - 48, 66, C.primary);

    txt(cover, "PLANNER GENERATOR",  W / 2 - 80, H - 60, 18, boldFont,    C.white);
    txt(cover, role.toUpperCase(),   W / 2 - 30, H - 76, 10, regularFont, C.white);
    hLine(cover, H - 110, 60, W - 60, C.primary, 2);
    txt(cover, userName,             W / 2 - 60, H - 145, 18, boldFont,    C.dark);
    txt(cover, userInstitution || "", W / 2 - 60, H - 170, 11, regularFont, C.muted);
    txt(cover, academicYear || "",   W / 2 - 40, H - 190, 10, regularFont, C.muted);

    hLine(cover, H - 210, 60, W - 60, C.muted, 0.5);

    txt(cover, "SECTIONS INCLUDED:", 60, H - 230, 9, boldFont, C.primary);
    let sy = H - 248;
    sections.forEach((s, i) => {
      txt(cover, "- " + s.replace(/_/g, " ").toUpperCase(), 60 + (i % 2 === 0 ? 0 : W / 2 - 60), sy, 8, regularFont, C.dark);
      if (i % 2 === 1) sy -= 14;
    });

    hLine(cover, 80, 60, W - 60, C.muted, 0.5);
    txt(cover, "Compatible with iPad, Tablets, iPhone & Smartphones", W / 2 - 115, 62, 8, regularFont, C.muted);
    txt(cover, "Generated by Planner Generator  -  " + new Date().toLocaleDateString(), W / 2 - 100, 46, 8, regularFont, C.muted);

    // ── Content Pages ──────────────────────────────────────────
    sections.forEach(id => {
      addSection(id, pdfDoc, info, boldFont, regularFont, W, H);
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition",
      `attachment; filename=planner-${userName.replace(/\s+/g, "_")}.pdf`);
    res.send(Buffer.from(pdfBytes));

  } catch (err) {
    console.error("PDF error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
  module.exports = app;
});