# Occams Advisory Chatbot

A Node.js-based chatbot using **LangChain** and **OpenAI's GPT** model to answer queries about Occams Advisory, strictly based on information from [https://www.occamsadvisory.com/](https://www.occamsadvisory.com/). Includes a basic UI for demo purposes.

---

## 📋 Prerequisites

- Node.js (v18.17.1 or higher)
- Python (v3.8 or higher, *optional* for virtual environment)
- Visual Studio Code
- OpenAI API key (for ChatOpenAI integration)

---

## ⚙️ Setup Instructions

### 1. Clone the Repository (if applicable)
```bash
git clone <repository-url>
cd occams-chatbot


---

## ⚙️ Setup Instructions (Detailed)

### 2. Set Up Python Virtual Environment (*Optional*)
> Only needed if you plan to use Python tools during development.

#### ✅ Ensure Python is Installed
```bash
python --version  # or python3 --version

### ✅ Create Virtual Environment (Optional)
> Only needed if using Python tools during development.

```bash
python -m venv venv

### ✅ Activate Virtual Environment

```bash
.\venv\Scripts\activate

---

### ✅ Install Node.js Dependencies

```bash
npm install

### ✅ Configure Environment

1. Create a `.env` file in the project root.  
2. Add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here

### ✅ Run the Application

```bash
node src/server.js

##UI

![alt text](image.png)