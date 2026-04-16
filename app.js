// ── State ──────────────────────────────────────────────────────
const state = {
  role: null,
  type: null,
  sections: [],
};

// ── Sections per role ───────────────────────────────────────────
const sectionsByRole = {
  student: [
    { id: "daily_schedule",     icon: "📅", name: "Daily Schedule",       desc: "Time slots for your daily activities" },
    { id: "weekly_plan",        icon: "🗓️", name: "Weekly Lesson Plan",   desc: "Full week overview by subject" },
    { id: "assignment_tracker", icon: "📝", name: "Assignment Tracker",   desc: "Track courses, due dates, completion" },
    { id: "exam_tracker",       icon: "📊", name: "Exam Tracker",         desc: "Subjects, dates, topics covered" },
    { id: "grade_tracker",      icon: "🎯", name: "Grade Tracker",        desc: "Monitor scores and final grades" },
    { id: "semester_goals",     icon: "🏆", name: "Semester Goals",       desc: "Set and track your semester targets" },
    { id: "habit_tracker",      icon: "✅", name: "Habit Tracker",        desc: "Weekly habits M T W T F S S" },
    { id: "water_tracker",      icon: "💧", name: "Water Tracker",        desc: "Daily water intake tracker" },
    { id: "monthly_finance",    icon: "💰", name: "Monthly Finance",      desc: "Budget, expenses and balance" },
    { id: "cornell_notes",      icon: "📓", name: "Cornell Notes",        desc: "Keywords + details + summary" },
    { id: "notebook_lined",     icon: "📄", name: "Notebook - Lined",     desc: "Simple lined pages for notes" },
    { id: "notebook_dotgrid",   icon: "🔵", name: "Notebook - Dot Grid",  desc: "Dot grid for flexible writing" },
    { id: "notebook_graph",     icon: "📐", name: "Notebook - Graph",     desc: "Graph paper for science & math" },
    { id: "notebook_blank",     icon: "⬜", name: "Notebook - Blank",     desc: "Free blank pages" },
    { id: "daily_journal",      icon: "✍️", name: "Daily Journal",        desc: "Daily reflections and notes" },
    { id: "weekly_journal",     icon: "📔", name: "Weekly Journal",       desc: "Weekly reflections and review" },
    { id: "todo_list",          icon: "☑️", name: "To-do List",           desc: "Daily tasks with priority" },
  ],
  teacher: [
    { id: "weekly_plan",        icon: "🗓️", name: "Weekly Lesson Plan",   desc: "Full week schedule by class" },
    { id: "lesson_plan",        icon: "📖", name: "Subject Lesson Plan",  desc: "Topics, objectives, resources" },
    { id: "daily_schedule",     icon: "📅", name: "Daily Schedule",       desc: "Time slots for daily classes" },
    { id: "exam_schedule",      icon: "📊", name: "Exam Schedule",        desc: "Class, date, topics covered" },
    { id: "student_goals",      icon: "🎯", name: "Student Goals",        desc: "Character and academic goals" },
    { id: "project_planner",    icon: "🏗️", name: "Project Planner",     desc: "Milestones, resources, deadlines" },
    { id: "habit_tracker",      icon: "✅", name: "Habit Tracker",        desc: "Weekly habits M T W T F S S" },
    { id: "cornell_notes",      icon: "📓", name: "Cornell Notes",        desc: "Keywords + details + summary" },
    { id: "notebook_lined",     icon: "📄", name: "Notebook - Lined",     desc: "Simple lined pages for notes" },
    { id: "notebook_dotgrid",   icon: "🔵", name: "Notebook - Dot Grid",  desc: "Dot grid for flexible writing" },
    { id: "notebook_graph",     icon: "📐", name: "Notebook - Graph",     desc: "Graph paper for science & math" },
    { id: "notebook_blank",     icon: "⬜", name: "Notebook - Blank",     desc: "Free blank pages" },
    { id: "daily_journal",      icon: "✍️", name: "Daily Journal",        desc: "Daily reflections and notes" },
    { id: "weekly_journal",     icon: "📔", name: "Weekly Journal",       desc: "Weekly reflections and review" },
    { id: "todo_list",          icon: "☑️", name: "To-do List",           desc: "Daily tasks with priority" },
  ],
  assistant: [
    { id: "monthly_glance",     icon: "📆", name: "Month at a Glance",    desc: "Full month calendar overview" },
    { id: "weekly_overview",    icon: "🗓️", name: "Weekly Overview",      desc: "Class, assignment, score tracker" },
    { id: "todo_list",          icon: "☑️", name: "To-do List",           desc: "Daily tasks with priority" },
    { id: "contact_list",       icon: "📋", name: "Contact List",         desc: "Name, phone, email, address" },
    { id: "project_planner",    icon: "🏗️", name: "Project Planner",     desc: "Milestones, resources, deadlines" },
    { id: "goal_action_plan",   icon: "🏆", name: "Goal Action Plan",     desc: "Goal, steps, obstacles, solutions" },
    { id: "monthly_finance",    icon: "💰", name: "Monthly Finance",      desc: "Budget, expenses and balance" },
    { id: "cornell_notes",      icon: "📓", name: "Cornell Notes",        desc: "Keywords + details + summary" },
    { id: "notebook_lined",     icon: "📄", name: "Notebook - Lined",     desc: "Simple lined pages for notes" },
    { id: "notebook_dotgrid",   icon: "🔵", name: "Notebook - Dot Grid",  desc: "Dot grid for flexible writing" },
    { id: "notebook_graph",     icon: "📐", name: "Notebook - Graph",     desc: "Graph paper for science & math" },
    { id: "notebook_blank",     icon: "⬜", name: "Notebook - Blank",     desc: "Free blank pages" },
    { id: "daily_journal",      icon: "✍️", name: "Daily Journal",        desc: "Daily reflections and notes" },
    { id: "weekly_journal",     icon: "📔", name: "Weekly Journal",       desc: "Weekly reflections and review" },
  ],
  director: [
    { id: "monthly_glance",     icon: "📆", name: "Month at a Glance",    desc: "Full month calendar overview" },
    { id: "yearly_planner",     icon: "🗃️", name: "Yearly Planner",       desc: "12-month overview at a glance" },
    { id: "weekly_overview",    icon: "🗓️", name: "Weekly Overview",      desc: "Tasks, assignments, scores" },
    { id: "project_planner",    icon: "🏗️", name: "Project Planner",     desc: "Milestones, resources, deadlines" },
    { id: "goal_action_plan",   icon: "🏆", name: "Goal Action Plan",     desc: "Goal, steps, obstacles, solutions" },
    { id: "contact_list",       icon: "📋", name: "Contact List",         desc: "Name, phone, email, address" },
    { id: "monthly_finance",    icon: "💰", name: "Monthly Finance",      desc: "Budget, expenses and balance" },
    { id: "cornell_notes",      icon: "📓", name: "Cornell Notes",        desc: "Keywords + details + summary" },
    { id: "notebook_lined",     icon: "📄", name: "Notebook - Lined",     desc: "Simple lined pages for notes" },
    { id: "notebook_dotgrid",   icon: "🔵", name: "Notebook - Dot Grid",  desc: "Dot grid for flexible writing" },
    { id: "notebook_graph",     icon: "📐", name: "Notebook - Graph",     desc: "Graph paper for science & math" },
    { id: "notebook_blank",     icon: "⬜", name: "Notebook - Blank",     desc: "Free blank pages" },
    { id: "daily_journal",      icon: "✍️", name: "Daily Journal",        desc: "Daily reflections and notes" },
    { id: "weekly_journal",     icon: "📔", name: "Weekly Journal",       desc: "Weekly reflections and review" },
    { id: "todo_list",          icon: "☑️", name: "To-do List",           desc: "Daily tasks with priority" },
  ],
};

// ── Step 1: Select Role ─────────────────────────────────────────
function selectRole(role) {
  state.role = role;
  document.querySelectorAll(".role-btn").forEach(btn => btn.classList.remove("selected"));
  event.currentTarget.classList.add("selected");
  setTimeout(() => showStep(2), 300);
}

// ── Step 2: Select Type ─────────────────────────────────────────
function selectType(type) {
  state.type = type;
  document.querySelectorAll(".type-btn").forEach(btn => btn.classList.remove("selected"));
  event.currentTarget.classList.add("selected");
  buildSectionList();
  setTimeout(() => showStep(3), 300);
}

// ── Step 3: Build Section List ──────────────────────────────────
function buildSectionList() {
  const container = document.getElementById("sectionList");
  container.innerHTML = "";
  const sections = sectionsByRole[state.role] || [];

  sections.forEach(section => {
    const item = document.createElement("label");
    item.className = "section-item selected";
    item.innerHTML = `
      <input type="checkbox" value="${section.id}" checked />
      <span class="section-icon">${section.icon}</span>
      <div>
        <div class="section-name">${section.name}</div>
        <div class="section-desc">${section.desc}</div>
      </div>
    `;
    item.querySelector("input").addEventListener("change", function() {
      item.classList.toggle("selected", this.checked);
    });
    container.appendChild(item);
  });
}

// ── Step 3 → Step 4 ─────────────────────────────────────────────
function goToStep4() {
  const checked = document.querySelectorAll("#sectionList input:checked");
  if (checked.length === 0) {
    alert("Please select at least one section.");
    return;
  }
  state.sections = [...checked].map(cb => cb.value);
  showStep(4);
}

// ── Show / Hide Steps ───────────────────────────────────────────
function showStep(n) {
  document.querySelectorAll(".step").forEach(s => s.classList.add("hidden"));
  document.getElementById("step" + n).classList.remove("hidden");
}

function goBack(n) { showStep(n); }

// ── Add / Remove Subject ────────────────────────────────────────
function addSubject() {
  const list = document.getElementById("subjectList");
  const row = document.createElement("div");
  row.className = "subject-row";
  row.innerHTML = `
    <input type="text" placeholder="e.g. Physics" class="subject-input" />
    <button class="btn-remove" onclick="removeSubject(this)">✕</button>
  `;
  list.appendChild(row);
  row.querySelector("input").focus();
}

function removeSubject(btn) {
  const rows = document.querySelectorAll(".subject-row");
  if (rows.length === 1) { showError("You need at least one subject."); return; }
  btn.parentElement.remove();
  clearError();
}

// ── Generate PDF ────────────────────────────────────────────────
async function generatePDF() {
  clearError();

  const userName        = document.getElementById("userName").value.trim();
  const userInstitution = document.getElementById("userInstitution").value.trim();
  const academicYear    = document.getElementById("academicYear").value.trim();
  const pageSize        = document.querySelector("input[name='pageSize']:checked").value;
  const orientation     = document.querySelector("input[name='orientation']:checked").value;
  const colorProfile    = document.querySelector("input[name='colorProfile']:checked").value;
  const fileType        = document.querySelector("input[name='fileType']:checked").value;

  const subjects = [...document.querySelectorAll(".subject-input")]
    .map(i => i.value.trim()).filter(v => v !== "");

  if (!userName)           { showError("Please enter your name."); return; }
  if (subjects.length === 0) { showError("Please add at least one subject."); return; }

  const btn     = document.querySelector(".btn-generate");
  const btnText = document.getElementById("btnText");
  btn.disabled  = true;
  btnText.textContent = "Generating your planner...";

  try {
    const response = await fetch("/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: state.role,
        type: state.type,
        sections: state.sections,
        userName,
        userInstitution,
        academicYear,
        subjects,
        pageSize,
        orientation,
        colorProfile,
        fileType,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Server error");
    }

    const blob = await response.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `planner-${userName.replace(/\s+/g, "_")}.pdf`;
    a.click();
    URL.revokeObjectURL(url);

  } catch (err) {
    showError("Failed to generate PDF: " + err.message);
  } finally {
    btn.disabled        = false;
    btnText.textContent = "Generate My Planner";
  }
}

// ── Helpers ─────────────────────────────────────────────────────
function showError(msg) {
  const el = document.getElementById("errorMsg");
  el.textContent = msg;
  el.classList.remove("hidden");
}

function clearError() {
  const el = document.getElementById("errorMsg");
  el.textContent = "";
  el.classList.add("hidden");
}