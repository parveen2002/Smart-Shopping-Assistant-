from flask import Flask, render_template, request, redirect, session
import sqlite3
import json
import webbrowser

app = Flask(__name__)
app.secret_key = "secret123"

def init_db():
    conn = sqlite3.connect("users.db")
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        password TEXT
    )
    """)
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def home():
    if "user" in session:
        with open("products.json", "r") as f:
            products = json.load(f)
        return render_template("index.html", products=products)
    else:
        return redirect("/login")

@app.route('/register', methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form["name"]
        email = request.form["email"]
        phone = request.form["phone"]
        password = request.form["password"]

        try:
            conn = sqlite3.connect("users.db")
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO users(name,email,phone,password) VALUES(?,?,?,?)",
                (name, email, phone, password)
            )
            conn.commit()
            conn.close()
            return redirect("/login")
        except:
            return "User already exists!"

    return render_template("register.html")

@app.route('/login', methods=["GET", "POST"])
def login():
    if request.method == "POST":
        login_input = request.form["login_input"]
        password = request.form["password"]

        conn = sqlite3.connect("users.db")
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM users WHERE (email=? OR phone=?) AND password=?",
            (login_input, login_input, password)
        )
        user = cur.fetchone()
        conn.close()

        if user:
            session["user"] = user[1]
            return redirect("/")
        else:
            return "Invalid Credentials!"

    return render_template("login.html")

@app.route('/logout')
def logout():
    session.pop("user", None)
    return redirect("/login")

if __name__ == "__main__":
    webbrowser.open("http://127.0.0.1:5000/login")
    app.run(debug=True)