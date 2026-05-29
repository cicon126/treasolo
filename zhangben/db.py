import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "zhangben.db")

CATEGORIES = ["餐费", "通讯费", "交通费", "应酬", "旅游", "购物", "看病", "学费", "物业费", "水电费", "其他"]

RECORD_TYPES = ["收入", "支出"]


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            record_type TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            category TEXT NOT NULL,
            note TEXT DEFAULT ''
        )
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_records_date ON records(date)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_records_type ON records(record_type)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_records_category ON records(category)
    """)
    conn.commit()
    conn.close()


def add_record(record_type, amount, date, category, note=""):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO records (record_type, amount, date, category, note) VALUES (?, ?, ?, ?, ?)",
        (record_type, amount, date, category, note),
    )
    conn.commit()
    record_id = cursor.lastrowid
    conn.close()
    return record_id


def update_record(record_id, record_type, amount, date, category, note=""):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE records SET record_type=?, amount=?, date=?, category=?, note=? WHERE id=?",
        (record_type, amount, date, category, note, record_id),
    )
    conn.commit()
    conn.close()


def delete_record(record_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM records WHERE id=?", (record_id,))
    conn.commit()
    conn.close()


def get_records(record_type=None, category=None, start_date=None, end_date=None, keyword=None):
    conn = get_connection()
    cursor = conn.cursor()
    sql = "SELECT * FROM records WHERE 1=1"
    params = []

    if record_type:
        sql += " AND record_type=?"
        params.append(record_type)
    if category:
        sql += " AND category=?"
        params.append(category)
    if start_date:
        sql += " AND date>=?"
        params.append(start_date)
    if end_date:
        sql += " AND date<=?"
        params.append(end_date)
    if keyword:
        sql += " AND note LIKE ?"
        params.append(f"%{keyword}%")

    sql += " ORDER BY date DESC, id DESC"
    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_record_by_id(record_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM records WHERE id=?", (record_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_monthly_summary(year, month):
    conn = get_connection()
    cursor = conn.cursor()
    month_str = f"{year}-{month:02d}"
    cursor.execute(
        "SELECT record_type, SUM(amount) as total FROM records WHERE date LIKE ? GROUP BY record_type",
        (f"{month_str}%",),
    )
    rows = cursor.fetchall()
    conn.close()
    result = {"收入": 0.0, "支出": 0.0}
    for row in rows:
        result[row["record_type"]] = round(row["total"], 2)
    result["结余"] = round(result["收入"] - result["支出"], 2)
    return result


def get_category_summary(year, month, record_type=None):
    conn = get_connection()
    cursor = conn.cursor()
    month_str = f"{year}-{month:02d}"
    sql = "SELECT category, SUM(amount) as total FROM records WHERE date LIKE ?"
    params = [f"{month_str}%"]
    if record_type:
        sql += " AND record_type=?"
        params.append(record_type)
    sql += " GROUP BY category ORDER BY total DESC"
    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()
    return [{"category": row["category"], "total": round(row["total"], 2)} for row in rows]


def get_yearly_month_summary(year):
    conn = get_connection()
    cursor = conn.cursor()
    year_str = f"{year}"
    cursor.execute(
        "SELECT substr(date, 1, 7) as month, record_type, SUM(amount) as total "
        "FROM records WHERE date LIKE ? GROUP BY month, record_type ORDER BY month",
        (f"{year_str}%",),
    )
    rows = cursor.fetchall()
    conn.close()
    result = {}
    for row in rows:
        m = row["month"]
        if m not in result:
            result[m] = {"收入": 0.0, "支出": 0.0}
        result[m][row["record_type"]] = round(row["total"], 2)
    for m in result:
        result[m]["结余"] = round(result[m]["收入"] - result[m]["支出"], 2)
    return result


def get_all_records_for_export(record_type=None, start_date=None, end_date=None):
    conn = get_connection()
    cursor = conn.cursor()
    sql = "SELECT * FROM records WHERE 1=1"
    params = []
    if record_type:
        sql += " AND record_type=?"
        params.append(record_type)
    if start_date:
        sql += " AND date>=?"
        params.append(start_date)
    if end_date:
        sql += " AND date<=?"
        params.append(end_date)
    sql += " ORDER BY date ASC, id ASC"
    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def import_records(records_list):
    conn = get_connection()
    cursor = conn.cursor()
    success_count = 0
    fail_count = 0
    for record in records_list:
        try:
            cursor.execute(
                "INSERT INTO records (record_type, amount, date, category, note) VALUES (?, ?, ?, ?, ?)",
                (
                    record.get("record_type", "支出"),
                    float(record.get("amount", 0)),
                    record.get("date", ""),
                    record.get("category", "其他"),
                    record.get("note", ""),
                ),
            )
            success_count += 1
        except (ValueError, sqlite3.Error):
            fail_count += 1
    conn.commit()
    conn.close()
    return success_count, fail_count
