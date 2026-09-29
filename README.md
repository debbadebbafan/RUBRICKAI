# RubricAI

### Evidence-backed review for student data-science projects.

**RubricAI** is an intelligent project-review platform designed to help students understand, evaluate, and improve their data-science projects before submission.

Instead of simply generating generic AI feedback, RubricAI investigates the student's actual project files, extracts evidence, evaluates the project against predefined rubric areas, identifies potential issues, and explains what can be improved.

> **Upload your project. Understand what you built. Find what needs attention. Submit with confidence.**

---

## ✨ Why RubricAI?

Building a data-science project is only part of the challenge.

Students often struggle with questions like:

* Did I handle my data correctly?
* Is my methodology appropriate?
* Did I evaluate my model properly?
* Are there hidden issues in my project?
* Where exactly did I make a mistake?
* Does my project satisfy the rubric?
* What should I fix before submission?

Existing AI assistants can provide suggestions, but generic suggestions are not enough.

**RubricAI focuses on the student's actual project evidence.**

It analyzes the available project material and connects findings to the underlying evidence whenever possible.

---

# 🎯 Problem

Students frequently receive a dataset and a project rubric, but evaluating their completed work can be difficult.

A student may have:

* incomplete data preprocessing
* weak methodology
* inappropriate modeling choices
* insufficient evaluation
* documentation gaps
* potential data leakage
* inconsistencies between the project and rubric

The problem is not simply:

> "Can AI answer my question?"

The real problem is:

> **"Can I understand what is happening inside my project, identify what needs improvement, and know why?"**

RubricAI is designed around that problem.

---

# 💡 Solution

RubricAI transforms a student's data-science project into an interactive review experience.

```text
        STUDENT PROJECT
              │
              ▼
        PROJECT ANALYSIS
              │
              ▼
       EVIDENCE EXTRACTION
              │
              ▼
      RUBRIC-BASED REVIEW
              │
       ┌──────┼───────┐
       ▼      ▼       ▼
     ISSUES  HEALTH  EVIDENCE
       │      │       │
       └──────┼───────┘
              ▼
       EXPLANATIONS
              │
              ▼
      RECOMMENDATIONS
              │
              ▼
      BEFORE-YOU-SUBMIT
```

The goal is to move from:

**"I have a project."**

to:

**"I understand my project, I know what needs attention, and I can see the evidence behind the feedback."**

---

# 🚀 Key Features

## 🔎 Project Detective

Investigate the student's project for potential problems and areas that deserve attention.

Instead of simply displaying a score, Project Detective helps answer:

* What was detected?
* Why does it matter?
* Where was it detected?
* What should the student investigate?

---

## 🩺 Project Autopsy

A visual health-oriented view of the project.

RubricAI examines major areas such as:

* Data
* Methodology
* Modeling
* Evaluation
* Documentation

The goal is to provide a quick understanding of the project's overall condition and highlight areas requiring attention.

---

## 🧾 Evidence Explorer

One of RubricAI's core ideas is **evidence-backed feedback**.

Instead of only saying:

> "Your evaluation could be improved."

RubricAI aims to show the evidence that led to the finding.

Evidence can be associated with project material such as:

* notebook content
* code
* dataset information
* cells
* detected metrics
* modeling steps

This makes feedback more traceable and understandable.

---

## 🕵️ Find Hidden Issues

RubricAI looks beyond the obvious output and searches for potential methodological or project-quality issues.

Examples of areas that can be investigated include:

* data leakage
* preprocessing concerns
* evaluation problems
* inconsistencies
* missing project components
* methodological warning signs

The purpose is not simply to criticize the project, but to help the student understand what deserves another look.

---

## 🤖 Ask RubricAI

Students can interact with their project through a conversational interface.

Example questions:

> "Why was this flagged?"

> "What should I fix first?"

> "Show me the evidence."

> "Am I ready to submit?"

The application can use Gemini-powered responses when configured and provides a deterministic fallback for supported functionality when the AI endpoint is unavailable.

---

## 📋 Before You Submit

A final review experience designed around the question:

> **"What should I check before submitting?"**

RubricAI presents important findings and areas requiring attention so students can perform a final project review.

---

## 📊 Rubric-Based Review

RubricAI organizes project review around important data-science dimensions:

| Area          | What is reviewed                               |
| ------------- | ---------------------------------------------- |
| Data Handling | Data preparation and quality-related practices |
| Methodology   | Project approach and methodological decisions  |
| Modeling      | Model usage and modeling workflow              |
| Evaluation    | Metrics and evaluation practices               |
| Documentation | Explanation and completeness of the project    |

The exact review depends on the evidence available in the submitted project.

---

# 🧠 Evidence First

A central principle of RubricAI is:

> **Feedback should be connected to evidence whenever possible.**

Traditional feedback often looks like:

```text
Your project needs better evaluation.
```

RubricAI aims to turn this into a more useful investigation:

```text
FINDING
Evaluation needs attention.

WHY
The project appears to use limited evaluation evidence.

EVIDENCE
Detected evaluation-related content in the project.

ACTION
Review whether the selected metrics adequately support
the project's objective.
```

This makes feedback easier for students to understand and act upon.

---

# 🏗️ Architecture

RubricAI uses a full-stack architecture:

```text
┌─────────────────────────────────────────┐
│              React Frontend             │
│                                         │
│  Dashboard                              │
│  Project Detective                      │
│  Project Autopsy                        │
│  Evidence Explorer                      │
│  Ask RubricAI                           │
│  Before You Submit                      │
└───────────────────┬─────────────────────┘
                    │
                    │ HTTP / API
                    ▼
┌─────────────────────────────────────────┐
│             Express Backend             │
│                                         │
│  Project/API handling                   │
│  AI-assisted Q&A                        │
│  Application server                     │
└───────────────────┬─────────────────────┘
                    │
                    ▼
              Gemini API
            (Optional AI layer)
```

The core project-review functionality is designed to work without making the entire application dependent on an external AI API.

---

# 🛠️ Technology Stack

### Frontend

* React 19
* Vite 8
* Tailwind CSS 4
* TypeScript

### Backend

* Node.js
* Express 4
* TypeScript
* `tsx`

### AI

* Google Gemini API
* Deterministic fallback for supported functionality

### Development

* npm
* Git
* GitHub

---

# 📁 Project Structure

A simplified structure of the application:

```text
rubricai/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
│
├── public/
│
├── server.ts
├── package.json
├── package-lock.json
├── vite.config.*
├── tsconfig.*
└── README.md
```

The exact structure may vary as the application evolves.

---

# ⚙️ Getting Started

## Prerequisites

Make sure you have:

* Node.js 20+
* npm
* Git

---

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd rubricai
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create a `.env` file if you want to enable Gemini-powered AI Q&A.

```env
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

The Gemini API key should remain server-side.

**Never commit `.env` or API keys to GitHub.**

---

## 4. Start the development server

```bash
npm run dev
```

The application will start using the project's configured development server.

---

## 5. Build for production

```bash
npm run build
```

The production frontend is generated in:

```text
dist/
```

---

## 6. Start the production application

```bash
npm start
```

---

# 🔐 Security & API Keys

RubricAI is designed so that the Gemini API key is handled on the server side rather than being exposed directly in the frontend.

Do not store secrets inside:

* React components
* frontend source files
* GitHub repositories
* public configuration files

Use environment variables instead.

Example:

```env
GEMINI_API_KEY=your_key_here
```

For production deployments, configure environment variables through the hosting provider rather than committing them to the repository.

---

# 🧪 Testing RubricAI

RubricAI is intended to be tested with complete data-science projects rather than isolated datasets.

A useful test project can contain:

```text
student-project/
│
├── project.ipynb
└── dataset.csv
```

The notebook gives RubricAI project context such as:

* preprocessing
* exploratory analysis
* feature engineering
* model training
* evaluation
* conclusions
* documentation

while the dataset provides the underlying data context.

For meaningful testing, use projects involving different types of data-science workflows, such as:

* classification
* regression
* exploratory data analysis
* student-performance prediction
* customer prediction
* healthcare prediction
* financial/business prediction

---

# 🌟 What Makes RubricAI Different?

RubricAI is designed around three ideas:

### 1. Project-aware

Feedback is based on the student's actual project material rather than a generic explanation of data science.

### 2. Evidence-backed

Findings can be connected to evidence discovered inside the project.

### 3. Action-oriented

The goal is not simply to identify problems.

RubricAI helps students understand:

```text
What happened?
      ↓
Why does it matter?
      ↓
Where is the evidence?
      ↓
What should I do next?
```

---

# 🎓 Who Is It For?

### Students

Review a data-science project before submission.

### Educators

Provide structured feedback around predefined project criteria.

### Hackathons & Project Teams

Quickly investigate the quality and completeness of data-science projects.

### Beginners

Understand complicated project feedback in simpler language.

---

# 🗺️ Future Scope

Potential future improvements include:

* support for additional project formats
* richer notebook analysis
* deeper statistical checks
* improved rubric customization
* instructor-created rubrics
* project comparison
* version-to-version project improvement tracking
* stronger explainability
* expanded data-quality analysis
* collaborative review
* downloadable review reports

---

# ⚠️ Important Note

RubricAI is an **assistive project-review tool**.

Its findings should be treated as guidance rather than an absolute academic or scientific judgment.

Students should verify important findings against their original project, data, methodology, and course requirements.

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

A typical contribution workflow:

```bash
git checkout -b feature/your-feature
```

Make your changes, test them, then commit:

```bash
git add .
git commit -m "Add: your feature"
git push origin feature/your-feature
```

Open a pull request with a clear explanation of the change.

---

# 📜 License

Add the project's chosen license here.

For example:

```text
MIT License
```

If this is being submitted as an academic/hackathon project, confirm the appropriate licensing requirements before selecting a license.

---

# 💜 RubricAI

### Understand your project. Prove the evidence. Improve before you submit.

Built to make data-science project review more understandable, traceable, and actionable.

**From project → evidence → insight → improvement.**
