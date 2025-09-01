import os
import httpx
import mysql.connector
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# --- Configuration ---
DB_HOST = os.getenv("DATABASE_HOST")
DB_USER = os.getenv("DATABASE_USER")
DB_PASS = os.getenv("DATABASE_PASSWORD")
DB_NAME = os.getenv("DATABASE_NAME")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}"

# --- Database Schema (Simplified RAG Context) ---
DATABASE_SCHEMA = """
CREATE TABLE employees ( emp_no INT PRIMARY KEY, birth_date DATE, first_name VARCHAR(14), last_name VARCHAR(16), gender ENUM ('M','F'), hire_date DATE);
CREATE TABLE departments ( dept_no CHAR(4) PRIMARY KEY, dept_name VARCHAR(40) UNIQUE);
CREATE TABLE dept_manager ( emp_no INT, dept_no CHAR(4), from_date DATE, to_date DATE, PRIMARY KEY (emp_no, dept_no));
CREATE TABLE dept_emp ( emp_no INT, dept_no CHAR(4), from_date DATE, to_date DATE, PRIMARY KEY (emp_no, dept_no));
CREATE TABLE titles ( emp_no INT, title VARCHAR(50), from_date DATE, to_date DATE, PRIMARY KEY (emp_no, title, from_date));
CREATE TABLE salaries ( emp_no INT, salary INT, from_date DATE, to_date DATE, PRIMARY KEY (emp_no, from_date));
"""

# --- FastAPI App ---
app = FastAPI()

class QueryRequest(BaseModel):
    question: str

class SQLResponse(BaseModel):
    sql_query: str
    validation_result: str

@app.on_event("startup")
async def startup_event():
    if not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_API_KEY_HERE":
        raise ValueError("GEMINI_API_KEY environment variable not set. Please set it in docker-compose.yml.")

@app.post("/generate-sql", response_model=SQLResponse)
async def generate_sql(request: QueryRequest):
    # 1. Assemble the MCP (Model Context Protocol) Prompt for Gemini
    prompt = f"""
    You are an expert MySQL database administrator. Your task is to convert a user's question into a valid MySQL query.
    Use the provided database schema to construct the query.
    Only respond with the SQL query itself, with no additional explanation, markdown, or text.

    Database Schema:
    {DATABASE_SCHEMA}

    User's question:
    "{request.question}"

    MySQL Query:
    """
    
    # 2. Call Gemini API
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    
    generated_sql = ""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(GEMINI_API_URL, json=payload, headers={"Content-Type": "application/json"})
            response.raise_for_status()
            
            data = response.json()
            candidates = data.get("candidates", [])
            if candidates and "content" in candidates[0] and "parts" in candidates[0]["content"]:
                generated_sql = candidates[0]["content"]["parts"][0].get("text", "").strip()
            else:
                 raise HTTPException(status_code=500, detail=f"Unexpected API response structure: {data}")

            generated_sql = generated_sql.replace("```sql", "").replace("```", "").strip()

    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Could not connect to Google Gemini API: {e}")
    except httpx.HTTPStatusError as e:
         raise HTTPException(status_code=e.response.status_code, detail=f"Error from Gemini API: {e.response.text}")


    # 3. Validate the SQL query
    validation_result = "Validation successful: Query ran without errors."
    if not generated_sql:
        validation_result = "Validation failed: The API returned an empty SQL query."
    else:
        try:
            conn = mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
            cursor = conn.cursor()
            cursor.execute(generated_sql)
            cursor.fetchall()
            cursor.close()
            conn.close()
        except mysql.connector.Error as err:
            validation_result = f"Validation failed: {err}"

    return SQLResponse(sql_query=generated_sql, validation_result=validation_result)

@app.get("/")
def read_root():
    return {"message": "AI SQL Agent (Online Model) is running. POST to /generate-sql to ask a question."}