# 🧠 AI SQL Agent

This project is a **web-based application** that uses a **Large Language Model (LLM)** to convert natural language questions into SQL queries. Users can enter a question in plain English, and the system generates, validates, and executes the SQL query against a sample **MySQL database**, displaying the results in a formatted table.

The entire development environment is **containerized using Docker** and optimized for use with the **VS Code Dev Containers extension**.

---

## 🚀 Features
- **Natural Language to SQL** → Converts plain English questions into executable MySQL queries.  
- **AI-Powered** → Uses the **Google Gemini API** for powerful and accurate query generation.  
- **Query Validation** → Automatically checks generated SQL for syntax errors before execution.  
- **Dynamic Results Table** → Displays query results in a clean, formatted table.  
- **Fully Containerized** → The stack (UI, API, Database) runs in Docker for consistency and reproducibility.  
- **Live-Reloading** → Both frontend and backend automatically reload on file changes for a smooth dev experience.  

---

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)  
- **Backend**: Python 3.11, FastAPI  
- **Database**: MySQL 8.0  
- **AI Model**: Google Gemini API  
- **Containerization**: Docker, Docker Compose  
- **Development**: VS Code Dev Containers  

---

## 📦 Prerequisites
Make sure you have the following installed:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)  
- [Visual Studio Code](https://code.visualstudio.com/)  
- [VS Code Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)  
- [Git](https://git-scm.com/)  

---

## ⚙️ Setup and Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Sourish-Kanna/Text2SQL-Demo.git
cd Text2SQL-Demo
````

### 2. Configure Environment Variables

* Rename `.env.example` to `.env`
* Open `.env` and replace:

  ```env
  GEMINI_API_KEY=your_new_secret_api_key_goes_here
  ```

  with your actual Google Gemini API key.

---

## ▶️ Run the Development Environment

This project is designed to run inside the **VS Code Dev Container**.

1. Open the project in **VS Code**
2. Open the Command Palette (**Ctrl+Shift+P** or **Cmd+Shift+P** on Mac)
3. Run: **Dev Containers: Rebuild and Reopen in Container**

   * This will build Docker images and set up the environment.
   * First run may take a few minutes.

---

## 🖥️ Start the Servers

Open a terminal (**Ctrl+\`**) and split it into two panes.

### 🔹 Terminal 1 → Backend (FastAPI)

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Runs the FastAPI backend with hot reload.

### 🔹 Terminal 2 → Frontend (Livereload)

```bash
cd frontend
livereload --port 8080 .
```

Runs a live-reloading dev server.

* Livereload runs on port **5500**
* The frontend is available at **[http://127.0.0.1:8080](http://127.0.0.1:8080)**

---

## 🌐 Access the Application

* **Frontend UI** → [http://127.0.0.1:8080](http://127.0.0.1:8080)
* **Backend API Docs (Swagger)** → [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛑 Stopping the Environment

* Stop servers → Press **Ctrl+C** in each terminal
* Shut down containers:

```bash
docker-compose down
```

## 🛢️ Accessing the Database

To directly access the **MySQL command line** for debugging or manual queries:

1. Ensure your containers are running (`docker-compose up` or via the Dev Container).  
2. Open a **new local terminal** (not inside VS Code’s integrated terminal).  
3. Navigate to the project’s root directory.  
4. Run the following command:  

```bash
docker-compose exec db mysql -u root -p employees
```

5. When prompted, enter the password:

```text
mysecretpassword
```
