from flask import Flask, render_template, request, redirect, session, flash, url_for
import mysql.connector
import hashlib, re

app = Flask(__name__)
app.secret_key = "jeevan_raksha_secret"

# ---------------- DATABASE ----------------
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="jeevan_raksha"
)
cursor = db.cursor(dictionary=True)

# ---------------- HELPERS ----------------
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def valid_mobile(mobile):
    return bool(re.fullmatch(r"[6-9][0-9]{9}", mobile))

def empty(*args):
    return any(not x.strip() for x in args)

def is_logged_in():
    return "role" in session


# =================================================
#                   PUBLIC
# =================================================
@app.route("/home")
def home():
    return render_template("public/index.html")


# =================================================
#                   AUTH
# =================================================
@app.route("/")
def login_page():
    return render_template("auth/login.html")

@app.route("/register")
def register_page():
    return render_template("auth/register.html")


# =================================================
#               USER REGISTER
# =================================================
@app.route("/register_user", methods=["POST"])
def register_user():
    name = request.form["name"].strip()
    mobile = request.form["mobile"].strip()
    password = request.form["password"].strip()

    if empty(name, mobile, password):
        flash("All fields are required", "error")
        return redirect("/register")

    if not valid_mobile(mobile):
        flash("Invalid mobile number", "error")
        return redirect("/register")

    cursor.execute("SELECT id FROM users WHERE mobile=%s", (mobile,))
    if cursor.fetchone():
        flash("Mobile already registered", "error")
        return redirect("/register")

    cursor.execute(
        "INSERT INTO users (name, mobile, password) VALUES (%s,%s,%s)",
        (name, mobile, hash_password(password))
    )
    db.commit()

    flash("Registration successful. Please login.", "success")
    return redirect("/")


# =================================================
#               USER LOGIN
# =================================================
@app.route("/login_user", methods=["POST"])
def login_user():
    mobile = request.form["mobile"].strip()
    password = hash_password(request.form["password"])

    cursor.execute(
        "SELECT * FROM users WHERE mobile=%s AND password=%s",
        (mobile, password)
    )
    user = cursor.fetchone()

    if not user:
        flash("Invalid credentials", "error")
        return redirect(url_for("login_page"))

    session.clear()
    session["user_id"] = user["id"]
    session["name"] = user["name"]
    session["role"] = "user"

    # 🔑 KEY LOGIC
    next_page = session.pop("next", None)
    if next_page:
        return redirect(next_page)

    # ✅ Normal login goes back to landing page
    return redirect(url_for("home"))


# =================================================
#               ADMIN LOGIN
# =================================================
@app.route("/login_admin", methods=["POST"])
def login_admin():
    mobile = request.form["mobile"].strip()
    password = hash_password(request.form["password"])

    cursor.execute(
        "SELECT * FROM admins WHERE mobile=%s AND password=%s",
        (mobile, password)
    )
    admin = cursor.fetchone()

    if not admin:
        flash("Invalid admin credentials", "error")
        return redirect(url_for("login_page"))

    session.clear()
    session["admin_id"] = admin["id"]
    session["role"] = "admin"

    next_page = session.pop("next", None)
    if next_page:
        return redirect(next_page)

    return redirect(url_for("home"))

# =================================================
#                 DASHBOARDS
# =================================================
@app.route("/user_dashboard")
def user_dashboard():
    if session.get("role") != "user":
        return redirect("/")
    return render_template("user/dashboard.html")

@app.route("/admin_dashboard")
def admin_dashboard():
    if session.get("role") != "admin":
        return redirect("/")
    return render_template("admin/admin_dashboard.html")


# =================================================
#          APPOINTMENT SERVICE (ROLE BASED)
# =================================================
@app.route("/service/appointment")
def appointment_service():
    if "role" not in session:
        session["next"] = url_for("appointment_service")
        return redirect(url_for("login_page"))

    if session["role"] == "admin":
        return redirect(url_for("admin_appointments"))

    return redirect(url_for("appointment_options"))

# =================================================
#       USER APPOINTMENT OPTIONS PAGE
# =================================================
@app.route("/appointment-options")
def appointment_options():
    if session.get("role") == "admin":
        return redirect(url_for("admin_appointments"))

    if session.get("role") == "user":
        return render_template("user/appointment_options.html")

    return redirect("/")



# =================================================
#             BOOK APPOINTMENT
# =================================================
@app.route("/appointment", methods=["GET", "POST"])
def appointment_page():
    if session.get("role") != "user":
        return redirect("/")

    if request.method == "POST":
        cursor.execute("""
            INSERT INTO appointments
            (user_id, patient_name, phone, age, date, gender,
             department, mode, doctor, time_slot, status)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'Pending')
        """, (
            session["user_id"],
            request.form["patient_name"],
            request.form["phone"],
            request.form["age"],
            request.form["date"],
            request.form["gender"],
            request.form["department"],
            request.form["mode"],
            request.form["doctor"],
            request.form["time_slot"]
        ))
        db.commit()
        flash("Appointment request sent", "success")
        return redirect(url_for("appointment_options"))


    return render_template("user/booking.html")


# =================================================
#        USER – REVIEW APPOINTMENTS
# =================================================
@app.route("/review_appointments")
def review_appointments():
    if session.get("role") != "user":
        return redirect("/")

    cursor.execute("""
        SELECT patient_name, department, doctor, date, time_slot, status
        FROM appointments
        WHERE user_id=%s
        ORDER BY id DESC
    """, (session["user_id"],))

    return render_template(
        "user/review_appointments.html",
        appointments=cursor.fetchall()
    )



# =================================================
#            ADMIN – VIEW APPOINTMENTS
# =================================================
@app.route("/admin_appointments")
def admin_appointments():
    if session.get("role") != "admin":
        return redirect("/")

    cursor.execute("""
        SELECT a.*, u.name AS user_name
        FROM appointments a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.id DESC
    """)
    return render_template(
        "admin/admin_appointments.html",
        appointments=cursor.fetchall()
    )


# =================================================
#         ADMIN – APPROVE / REJECT
# =================================================
@app.route("/update_appointment/<int:aid>/<string:action>")
def update_appointment(aid, action):
    if session.get("role") != "admin":
        return redirect("/")

    if action not in ["Approved", "Rejected"]:
        return redirect("/admin_appointments")

    cursor.execute(
        "UPDATE appointments SET status=%s WHERE id=%s",
        (action, aid)
    )
    db.commit()

    flash(f"Appointment {action}", "success")
    return redirect("/admin_appointments")


# =================================================
#            QUERY SERVICE (ROLE BASED)
# =================================================
@app.route("/service/query")
def query_service():
    if not is_logged_in():
        session["next"] = request.path
        return redirect(url_for("login_page"))

    if session["role"] == "admin":
        return redirect("http://localhost:3001/admin/admin.html")

    return redirect("http://localhost:3001/user/query.html")



# =================================================
#        OTHER SERVICES
# =================================================
@app.route("/service/arogya-mitra")
def arogya_mitra():
    if "role" not in session:
        session["next"] = url_for("arogya_mitra")
        return redirect(url_for("login_page"))

    # ONLY logged-in users reach here
    return redirect("http://localhost:5001")



@app.route("/service/medilingo")
def medilingo():
    if "role" not in session:
        session["next"] = url_for("medilingo")
        return redirect(url_for("login_page"))

    return redirect("http://localhost:5002")


@app.route("/medicine")
def medicine_redirect():
    role = session.get("role")

    if role == "admin":
        # redirect to medicine_booking admin panel
        return redirect("http://127.0.0.1:5003/admin/medicine_admin_options")

    elif role == "user":
        # redirect to medicine_booking user page
        return redirect("http://127.0.0.1:5003/user/medicine_options")
    return redirect("/")

# =================================================
#                   LOGOUT
# =================================================
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")


if __name__ == "__main__":
    app.run(port=5000, debug=True, use_reloader=False)
    