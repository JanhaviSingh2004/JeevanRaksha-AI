from flask import Flask, render_template, request, redirect, session
import mysql.connector

app = Flask(__name__)
app.secret_key = "jeevanraksha"

db = mysql.connector.connect(
    host="localhost",
    user="root",          # CHANGE if needed
    password="root",   # CHANGE if needed
    database="jeevan_raksha"
)
cursor = db.cursor(dictionary=True)

# ---------------- HOME ----------------
@app.route("/")
def index():
    return render_template("index.html")

# ---------------- USER PAGES ----------------
@app.route("/user/medicine_options")
def medicine_options():
    return render_template("user/medicine_options.html")

@app.route("/book_medicine_form")
def book_medicine_form():
    return render_template("user/book_medicine.html")

@app.route("/review_price_form")
def review_price_form():
    return render_template("user/review_price.html")

# ---------------- USER ACTIONS ----------------
@app.route("/book_medicine", methods=["POST"])
def book_medicine():
    cursor.execute("""
        INSERT INTO medicine_booking
        (user_id, name, phone, medicine, quantity, doctor, delivery_date)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
    """, (
        1,  # TEMP user_id (replace with session later)
        request.form["name"],
        request.form["phone"],
        request.form["medicine"],
        request.form["quantity"],
        request.form["doctor"],
        request.form["delivery_date"]
    ))
    db.commit()
    return redirect("/review_medicines")

@app.route("/review_price", methods=["POST"])
def review_price():
    cursor.execute("""
        INSERT INTO medicine_price_request
        (user_id, name, phone, medicine, quantity, doctor)
        VALUES (%s,%s,%s,%s,%s,%s)
    """, (
        1,
        request.form["name"],
        request.form["phone"],
        request.form["medicine"],
        request.form["quantity"],
        request.form["doctor"]
    ))
    db.commit()
    return redirect("/review_medicines")

@app.route("/review_medicines")
def review_medicines():

    user_id = 1  # replace with session["user_id"] later

    # Booked medicines
    cursor.execute("""
        SELECT 
            medicine,
            quantity,
            status,
            delivery_date,
            price_per_unit,
            total_price,
            created_at,
            'BOOKING' AS type
        FROM medicine_booking
        WHERE user_id = %s
    """, (user_id,))
    bookings = cursor.fetchall()

    # Price review requests
    cursor.execute("""
        SELECT
            medicine,
            quantity,
            NULL AS status,
            NULL AS delivery_date,
            NULL AS price_per_unit,
            NULL AS total_price,
            created_at,
            'PRICE_REQUEST' AS type
        FROM medicine_price_request
        WHERE user_id = %s
    """, (user_id,))
    price_requests = cursor.fetchall()

    history = bookings + price_requests

    return render_template(
        "user/review_medicines.html",
        history=history
    )

# ---------------- ADMIN PAGES ----------------
@app.route("/admin/medicine_admin_options")
def admin_options():
    return render_template("admin/medicine_admin_options.html")

@app.route("/admin/bookings")
def admin_bookings():
    cursor.execute("SELECT * FROM medicine_booking")
    bookings = cursor.fetchall()
    return render_template("admin/bookings.html", bookings=bookings)

@app.route("/admin/update_booking", methods=["POST"])
def update_booking():
    cursor.execute("""
        UPDATE medicine_booking
        SET status=%s, delivery_date=%s
        WHERE id=%s
    """, (
        request.form["status"],
        request.form["delivery_date"],
        request.form["id"]
    ))
    db.commit()
    return redirect("/admin/bookings")

@app.route("/admin/fare")
def admin_fare():
    cursor.execute("SELECT * FROM medicine_price_request")
    requests = cursor.fetchall()
    return render_template("admin/fare.html", requests=requests)

@app.route("/admin/save_fare", methods=["POST"])
def save_fare():
    medicine = request.form["medicine"]
    price = request.form["price"]

    cursor.execute("""
        INSERT INTO medicine_fare (medicine, price_per_unit)
        VALUES (%s, %s)
    """, (medicine, price))

    db.commit()
    return redirect("/admin/fare")


# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True, port=5003)
