import tkinter as tk
from tkinter import ttk
import sqlite3
import random
import threading
from datetime import datetime, timedelta
from pathlib import Path
from words import WORD_BANK

import pyttsx3

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "words_learning.db"


class Database:
    def __init__(self):
        self.conn = sqlite3.connect(str(DB_PATH))
        self.conn.row_factory = sqlite3.Row
        self._create_tables()
        self._init_word_bank()

    def _create_tables(self):
        cur = self.conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS word_bank (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT NOT NULL,
                meaning TEXT NOT NULL,
                phonetic TEXT NOT NULL
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS daily_words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                word_id INTEGER NOT NULL,
                status TEXT DEFAULT 'new',
                FOREIGN KEY (word_id) REFERENCES word_bank(id)
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS check_in (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL UNIQUE,
                check_in_time TEXT NOT NULL,
                duration_seconds INTEGER DEFAULT 0,
                completed_count INTEGER DEFAULT 0
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS learning_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT,
                duration_seconds INTEGER DEFAULT 0
            )
        """)
        self.conn.commit()

    def _init_word_bank(self):
        cur = self.conn.cursor()
        cur.execute("SELECT COUNT(*) FROM word_bank")
        if cur.fetchone()[0] == 0:
            cur.executemany(
                "INSERT INTO word_bank (word, meaning, phonetic) VALUES (?, ?, ?)",
                WORD_BANK,
            )
            self.conn.commit()

    def generate_daily_words(self, date_str, count=20):
        cur = self.conn.cursor()
        cur.execute("SELECT COUNT(*) FROM daily_words WHERE date = ?", (date_str,))
        if cur.fetchone()[0] > 0:
            return
        cur.execute(
            "SELECT dw.word_id FROM daily_words dw WHERE dw.status != 'mastered' AND dw.date != ?",
            (date_str,),
        )
        unmastered_ids = [row[0] for row in cur.fetchall()]
        cur.execute("SELECT id FROM word_bank")
        all_ids = [row[0] for row in cur.fetchall()]
        if unmastered_ids:
            needed = min(len(unmastered_ids), count)
            chosen = random.sample(unmastered_ids, needed)
            if needed < count:
                remaining = [wid for wid in all_ids if wid not in chosen]
                extra = random.sample(remaining, min(len(remaining), count - needed))
                chosen.extend(extra)
        else:
            chosen = random.sample(all_ids, min(len(all_ids), count))
        for word_id in chosen:
            cur.execute(
                "INSERT INTO daily_words (date, word_id, status) VALUES (?, ?, 'new')",
                (date_str, word_id),
            )
        self.conn.commit()

    def get_daily_words(self, date_str):
        cur = self.conn.cursor()
        cur.execute(
            """
            SELECT dw.id, dw.word_id, dw.status, wb.word, wb.meaning, wb.phonetic
            FROM daily_words dw
            JOIN word_bank wb ON dw.word_id = wb.id
            WHERE dw.date = ?
            ORDER BY dw.id
            """,
            (date_str,),
        )
        return cur.fetchall()

    def update_word_status(self, daily_word_id, status):
        cur = self.conn.cursor()
        cur.execute(
            "UPDATE daily_words SET status = ? WHERE id = ?", (status, daily_word_id)
        )
        self.conn.commit()

    def check_in(self, date_str, duration_seconds, completed_count):
        cur = self.conn.cursor()
        now_str = datetime.now().strftime("%H:%M:%S")
        cur.execute(
            """
            INSERT OR REPLACE INTO check_in (date, check_in_time, duration_seconds, completed_count)
            VALUES (?, ?, ?, ?)
            """,
            (date_str, now_str, duration_seconds, completed_count),
        )
        self.conn.commit()

    def has_checked_in(self, date_str):
        cur = self.conn.cursor()
        cur.execute("SELECT 1 FROM check_in WHERE date = ?", (date_str,))
        return cur.fetchone() is not None

    def get_streak(self):
        cur = self.conn.cursor()
        streak = 0
        check_date = datetime.now().date()
        while True:
            date_str = check_date.strftime("%Y-%m-%d")
            cur.execute("SELECT 1 FROM check_in WHERE date = ?", (date_str,))
            if cur.fetchone():
                streak += 1
                check_date -= timedelta(days=1)
            else:
                break
        return streak

    def get_total_checkin_days(self):
        cur = self.conn.cursor()
        cur.execute("SELECT COUNT(*) FROM check_in")
        return cur.fetchone()[0]

    def get_total_learned_words(self):
        cur = self.conn.cursor()
        cur.execute("SELECT COUNT(DISTINCT word_id) FROM daily_words WHERE status = 'mastered'")
        return cur.fetchone()[0]

    def get_total_learning_time(self):
        cur = self.conn.cursor()
        cur.execute("SELECT COALESCE(SUM(duration_seconds), 0) FROM check_in")
        return cur.fetchone()[0]

    def get_today_duration(self, date_str):
        cur = self.conn.cursor()
        cur.execute(
            "SELECT COALESCE(SUM(duration_seconds), 0) FROM check_in WHERE date = ?",
            (date_str,),
        )
        return cur.fetchone()[0]

    def get_recent_checkins(self, days=7):
        cur = self.conn.cursor()
        cur.execute(
            """
            SELECT date, check_in_time, duration_seconds, completed_count
            FROM check_in
            ORDER BY date DESC
            LIMIT ?
            """,
            (days,),
        )
        return cur.fetchall()

    def get_learning_words(self):
        cur = self.conn.cursor()
        cur.execute(
            """
            SELECT DISTINCT wb.id, wb.word, wb.meaning, wb.phonetic
            FROM daily_words dw
            JOIN word_bank wb ON dw.word_id = wb.id
            WHERE dw.status = 'learning'
            ORDER BY wb.word
            """
        )
        return cur.fetchall()

    def mark_word_mastered(self, word_id):
        cur = self.conn.cursor()
        cur.execute(
            "UPDATE daily_words SET status = 'mastered' WHERE word_id = ? AND status = 'learning'",
            (word_id,),
        )
        self.conn.commit()

    def start_learning_log(self, date_str):
        cur = self.conn.cursor()
        now_str = datetime.now().strftime("%H:%M:%S")
        cur.execute(
            "INSERT INTO learning_log (date, start_time) VALUES (?, ?)",
            (date_str, now_str),
        )
        self.conn.commit()
        return cur.lastrowid

    def end_learning_log(self, log_id, duration_seconds):
        cur = self.conn.cursor()
        now_str = datetime.now().strftime("%H:%M:%S")
        cur.execute(
            "UPDATE learning_log SET end_time = ?, duration_seconds = ? WHERE id = ?",
            (now_str, duration_seconds, log_id),
        )
        self.conn.commit()

    def close(self):
        self.conn.close()


class WordApp:
    BG_COLOR = "#F0F4F8"
    CARD_BG = "#FFFFFF"
    PRIMARY = "#3B82F6"
    PRIMARY_LIGHT = "#DBEAFE"
    GREEN = "#22C55E"
    GREEN_LIGHT = "#DCFCE7"
    RED = "#EF4444"
    RED_LIGHT = "#FEE2E2"
    TEXT_DARK = "#1E293B"
    TEXT_MID = "#64748B"
    ACCENT = "#6366F1"

    def __init__(self, root):
        self.root = root
        self.root.title("英语单词打卡")
        self.root.geometry("900x650")
        self.root.resizable(False, False)
        self.root.configure(bg=self.BG_COLOR)

        self.db = Database()
        self.today = datetime.now().strftime("%Y-%m-%d")
        self.timer_seconds = 0
        self.timer_running = True
        self.current_index = 0
        self.daily_words = []
        self.meaning_visible = False
        self.checked_in = self.db.has_checked_in(self.today)
        self.log_id = self.db.start_learning_log(self.today)

        self._init_tts()
        self._setup_styles()
        self._build_ui()
        self._load_daily_words()
        self._update_timer()
        self._refresh_stats()
        self._refresh_review()

        self.root.protocol("WM_DELETE_WINDOW", self._on_close)

    def _init_tts(self):
        self.speech_semaphore = threading.Semaphore(1)

    def _speak_word(self, word):
        def _do_speak():
            if not self.speech_semaphore.acquire(blocking=False):
                return
            try:
                engine = pyttsx3.init()
                engine.setProperty("rate", 150)
                engine.setProperty("volume", 1.0)
                voices = engine.getProperty("voices")
                for v in voices:
                    vid = v.id.lower()
                    if "en" in vid or "eng" in vid or "zira" in vid or "david" in vid:
                        engine.setProperty("voice", v.id)
                        break
                engine.say(word)
                engine.runAndWait()
                engine.stop()
            except Exception as e:
                print(f"TTS error: {e}")
            finally:
                self.speech_semaphore.release()

        threading.Thread(target=_do_speak, daemon=True).start()

    def _setup_styles(self):
        self.style = ttk.Style()
        self.style.theme_use("clam")
        self.style.configure("TNotebook", background=self.BG_COLOR, borderwidth=0)
        self.style.configure(
            "TNotebook.Tab",
            background=self.PRIMARY_LIGHT,
            foreground=self.TEXT_DARK,
            padding=[25, 10, 25, 10],
            font=("Microsoft YaHei UI", 11, "bold"),
            width=10,
        )
        self.style.map(
            "TNotebook.Tab",
            background=[("selected", self.PRIMARY)],
            foreground=[("selected", "white")],
            padding=[("selected", [25, 10, 25, 10])],
        )
        self.style.configure(
            "TFrame", background=self.BG_COLOR
        )
        self.style.configure(
            "Card.TFrame", background=self.CARD_BG
        )
        self.style.configure(
            "TLabel", background=self.BG_COLOR, foreground=self.TEXT_DARK, font=("Microsoft YaHei UI", 10)
        )
        self.style.configure(
            "Card.TLabel", background=self.CARD_BG, foreground=self.TEXT_DARK
        )
        self.style.configure(
            "Title.TLabel", font=("Microsoft YaHei UI", 11, "bold"), foreground=self.TEXT_DARK
        )
        self.style.configure(
            "Word.TLabel", font=("Consolas", 36, "bold"), foreground=self.PRIMARY, background=self.CARD_BG
        )
        self.style.configure(
            "Phonetic.TLabel", font=("Consolas", 14), foreground=self.TEXT_MID, background=self.CARD_BG
        )
        self.style.configure(
            "Meaning.TLabel", font=("Microsoft YaHei UI", 16), foreground=self.TEXT_DARK, background=self.CARD_BG
        )
        self.style.configure(
            "Counter.TLabel", font=("Microsoft YaHei UI", 13, "bold"), foreground=self.ACCENT, background=self.CARD_BG
        )
        self.style.configure(
            "Green.TButton", font=("Microsoft YaHei UI", 12, "bold")
        )
        self.style.configure(
            "Red.TButton", font=("Microsoft YaHei UI", 12, "bold")
        )
        self.style.configure(
            "TProgressbar", troughcolor=self.PRIMARY_LIGHT, background=self.PRIMARY, thickness=12
        )

    def _build_ui(self):
        self._build_top_bar()
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=(0, 10))
        self._build_learn_tab()
        self._build_stats_tab()
        self._build_review_tab()

    def _build_top_bar(self):
        bar = tk.Frame(self.root, bg=self.PRIMARY, height=52)
        bar.pack(fill=tk.X)
        bar.pack_propagate(False)

        date_label = tk.Label(
            bar,
            text=f"📅 {self.today}",
            font=("Microsoft YaHei UI", 11, "bold"),
            fg="white",
            bg=self.PRIMARY,
            height=1,
        )
        date_label.pack(side=tk.LEFT, padx=20, pady=10)

        self.checkin_btn = tk.Button(
            bar,
            text="已打卡 ✓" if self.checked_in else "每日打卡",
            font=("Microsoft YaHei UI", 11, "bold"),
            fg="white",
            bg=self.GREEN if not self.checked_in else "#6B7280",
            activebackground=self.GREEN,
            activeforeground="white",
            bd=0,
            width=10,
            height=1,
            cursor="hand2" if not self.checked_in else "arrow",
            command=self._do_checkin,
        )
        self.checkin_btn.pack(side=tk.RIGHT, padx=20, pady=10)

        self.timer_label = tk.Label(
            bar,
            text="⏱ 00:00:00",
            font=("Consolas", 13, "bold"),
            fg="#FDE68A",
            bg=self.PRIMARY,
            height=1,
        )
        self.timer_label.pack(side=tk.RIGHT, padx=10, pady=10)

    def _build_learn_tab(self):
        tab = ttk.Frame(self.notebook, style="TFrame")
        self.notebook.add(tab, text="  今日学习  ")

        card = tk.Frame(tab, bg=self.CARD_BG, bd=0, highlightthickness=1, highlightbackground="#E2E8F0")
        card.pack(fill=tk.BOTH, expand=True, padx=20, pady=15)

        inner = tk.Frame(card, bg=self.CARD_BG)
        inner.pack(fill=tk.BOTH, expand=True, padx=30, pady=20)

        self.counter_label = tk.Label(
            inner, text="0/20", font=("Microsoft YaHei UI", 13, "bold"),
            fg=self.ACCENT, bg=self.CARD_BG
        )
        self.counter_label.pack(anchor=tk.E, pady=(0, 5))

        self.progress = ttk.Progressbar(inner, length=780, mode="determinate", maximum=100)
        self.progress.pack(fill=tk.X, pady=(0, 15))

        word_row = tk.Frame(inner, bg=self.CARD_BG)
        word_row.pack(pady=(10, 5))

        self.word_label = tk.Label(
            word_row, text="", font=("Consolas", 36, "bold"),
            fg=self.PRIMARY, bg=self.CARD_BG
        )
        self.word_label.pack(side=tk.LEFT)

        self.speak_btn = tk.Button(
            word_row, text="🔊", font=("Segoe UI Emoji", 18),
            fg=self.PRIMARY, bg=self.CARD_BG, bd=0,
            activebackground=self.PRIMARY_LIGHT, activeforeground=self.PRIMARY,
            cursor="hand2", command=self._speak_current_word
        )
        self.speak_btn.pack(side=tk.LEFT, padx=(12, 0))

        self.phonetic_label = tk.Label(
            inner, text="", font=("Consolas", 14),
            fg=self.TEXT_MID, bg=self.CARD_BG
        )
        self.phonetic_label.pack(pady=(0, 10))

        self.meaning_label = tk.Label(
            inner, text="", font=("Microsoft YaHei UI", 16),
            fg=self.TEXT_DARK, bg=self.CARD_BG
        )
        self.meaning_label.pack(pady=(0, 5))

        self.reveal_btn = tk.Button(
            inner, text="点击显示释义 👁", font=("Microsoft YaHei UI", 10),
            fg=self.PRIMARY, bg=self.PRIMARY_LIGHT, bd=0,
            activebackground=self.PRIMARY, activeforeground="white",
            padx=14, pady=4, cursor="hand2", command=self._toggle_meaning
        )
        self.reveal_btn.pack(pady=(5, 20))

        btn_row = tk.Frame(inner, bg=self.CARD_BG)
        btn_row.pack(pady=(5, 10))

        self.know_btn = tk.Button(
            btn_row, text="认识 ✓", font=("Microsoft YaHei UI", 13, "bold"),
            fg="white", bg=self.GREEN, bd=0,
            activebackground="#16A34A", activeforeground="white",
            width=14, height=2, cursor="hand2", command=lambda: self._mark_word("mastered")
        )
        self.know_btn.pack(side=tk.LEFT, padx=15)

        self.dont_know_btn = tk.Button(
            btn_row, text="不认识 ✗", font=("Microsoft YaHei UI", 13, "bold"),
            fg="white", bg=self.RED, bd=0,
            activebackground="#DC2626", activeforeground="white",
            width=14, height=2, cursor="hand2", command=lambda: self._mark_word("learning")
        )
        self.dont_know_btn.pack(side=tk.LEFT, padx=15)

        nav_row = tk.Frame(inner, bg=self.CARD_BG)
        nav_row.pack(pady=(10, 5))

        self.prev_btn = tk.Button(
            nav_row, text="◀  上一个", font=("Microsoft YaHei UI", 10),
            fg=self.TEXT_MID, bg=self.BG_COLOR, bd=0,
            activebackground=self.PRIMARY_LIGHT, padx=12, pady=4, cursor="hand2",
            command=self._prev_word
        )
        self.prev_btn.pack(side=tk.LEFT, padx=10)

        self.next_btn = tk.Button(
            nav_row, text="下一个  ▶", font=("Microsoft YaHei UI", 10),
            fg=self.TEXT_MID, bg=self.BG_COLOR, bd=0,
            activebackground=self.PRIMARY_LIGHT, padx=12, pady=4, cursor="hand2",
            command=self._next_word
        )
        self.next_btn.pack(side=tk.LEFT, padx=10)

    def _build_stats_tab(self):
        tab = ttk.Frame(self.notebook, style="TFrame")
        self.notebook.add(tab, text="  学习统计  ")

        container = tk.Frame(tab, bg=self.BG_COLOR)
        container.pack(fill=tk.BOTH, expand=True, padx=20, pady=15)

        stats_card = tk.Frame(container, bg=self.CARD_BG, highlightthickness=1, highlightbackground="#E2E8F0")
        stats_card.pack(fill=tk.X, pady=(0, 15))

        tk.Label(
            stats_card, text="📊 学习概览", font=("Microsoft YaHei UI", 14, "bold"),
            fg=self.TEXT_DARK, bg=self.CARD_BG
        ).pack(anchor=tk.W, padx=20, pady=(15, 10))

        grid = tk.Frame(stats_card, bg=self.CARD_BG)
        grid.pack(fill=tk.X, padx=20, pady=(0, 15))

        stats_items = [
            ("📅", "打卡天数", "stat_days"),
            ("🔥", "连续打卡", "stat_streak"),
            ("✅", "已学单词", "stat_learned"),
            ("⏱", "总学习时长", "stat_total_time"),
            ("📝", "今日学习", "stat_today_time"),
        ]
        for i, (icon, label, attr) in enumerate(stats_items):
            cell = tk.Frame(grid, bg=self.CARD_BG)
            cell.grid(row=i // 3, column=i % 3, padx=15, pady=8, sticky="ew")
            grid.columnconfigure(i % 3, weight=1)
            tk.Label(
                cell, text=icon, font=("Segoe UI Emoji", 20), bg=self.CARD_BG
            ).pack()
            tk.Label(
                cell, text=label, font=("Microsoft YaHei UI", 10),
                fg=self.TEXT_MID, bg=self.CARD_BG
            ).pack()
            lbl = tk.Label(
                cell, text="0", font=("Microsoft YaHei UI", 18, "bold"),
                fg=self.PRIMARY, bg=self.CARD_BG
            )
            lbl.pack()
            setattr(self, attr, lbl)

        history_card = tk.Frame(container, bg=self.CARD_BG, highlightthickness=1, highlightbackground="#E2E8F0")
        history_card.pack(fill=tk.BOTH, expand=True)

        tk.Label(
            history_card, text="📋 近7天打卡记录", font=("Microsoft YaHei UI", 14, "bold"),
            fg=self.TEXT_DARK, bg=self.CARD_BG
        ).pack(anchor=tk.W, padx=20, pady=(15, 10))

        self.history_frame = tk.Frame(history_card, bg=self.CARD_BG)
        self.history_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=(0, 15))

    def _build_review_tab(self):
        tab = ttk.Frame(self.notebook, style="TFrame")
        self.notebook.add(tab, text="  单词复习  ")

        container = tk.Frame(tab, bg=self.BG_COLOR)
        container.pack(fill=tk.BOTH, expand=True, padx=20, pady=15)

        header = tk.Frame(container, bg=self.CARD_BG, highlightthickness=1, highlightbackground="#E2E8F0")
        header.pack(fill=tk.X, pady=(0, 10))

        tk.Label(
            header, text="🔄 待复习单词", font=("Microsoft YaHei UI", 14, "bold"),
            fg=self.TEXT_DARK, bg=self.CARD_BG
        ).pack(side=tk.LEFT, padx=20, pady=12)

        self.review_count_label = tk.Label(
            header, text="0 个", font=("Microsoft YaHei UI", 12),
            fg=self.ACCENT, bg=self.CARD_BG
        )
        self.review_count_label.pack(side=tk.RIGHT, padx=20, pady=12)

        list_frame = tk.Frame(container, bg=self.CARD_BG, highlightthickness=1, highlightbackground="#E2E8F0")
        list_frame.pack(fill=tk.BOTH, expand=True)

        canvas = tk.Canvas(list_frame, bg=self.CARD_BG, highlightthickness=0)
        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=canvas.yview)
        self.review_inner = tk.Frame(canvas, bg=self.CARD_BG)

        self.review_inner.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        canvas.create_window((0, 0), window=self.review_inner, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        self.review_canvas = canvas

    def _load_daily_words(self):
        self.db.generate_daily_words(self.today)
        self.daily_words = self.db.get_daily_words(self.today)
        if self.daily_words:
            self.current_index = 0
            self._show_word()

    def _show_word(self):
        if not self.daily_words:
            self.word_label.config(text="暂无单词")
            self.phonetic_label.config(text="")
            self.meaning_label.config(text="")
            self.counter_label.config(text="0/0")
            self.progress["value"] = 0
            return

        word = self.daily_words[self.current_index]
        self.word_label.config(text=word["word"])
        self.phonetic_label.config(text=f"/ {word['phonetic']} /")
        self.meaning_label.config(text="")
        self.meaning_visible = False
        self.reveal_btn.config(text="点击显示释义 👁")

        total = len(self.daily_words)
        completed = sum(1 for w in self.daily_words if w["status"] != "new")
        self.counter_label.config(text=f"{self.current_index + 1}/{total}")
        self.progress["value"] = (completed / total) * 100 if total > 0 else 0

        status = word["status"]
        if status == "mastered":
            self.know_btn.config(bg="#9CA3AF", cursor="arrow")
            self.dont_know_btn.config(bg="#9CA3AF", cursor="arrow")
        elif status == "learning":
            self.know_btn.config(bg=self.GREEN, cursor="hand2")
            self.dont_know_btn.config(bg="#9CA3AF", cursor="arrow")
        else:
            self.know_btn.config(bg=self.GREEN, cursor="hand2")
            self.dont_know_btn.config(bg=self.RED, cursor="hand2")

    def _speak_current_word(self):
        if not self.daily_words:
            return
        word = self.daily_words[self.current_index]
        self._speak_word(word["word"])

    def _toggle_meaning(self):
        if not self.daily_words:
            return
        word = self.daily_words[self.current_index]
        if self.meaning_visible:
            self.meaning_label.config(text="")
            self.reveal_btn.config(text="点击显示释义 👁")
            self.meaning_visible = False
        else:
            self.meaning_label.config(text=word["meaning"])
            self.reveal_btn.config(text="隐藏释义 🔒")
            self.meaning_visible = True

    def _mark_word(self, status):
        if not self.daily_words:
            return
        word = self.daily_words[self.current_index]
        if word["status"] == "mastered":
            return
        if status == "learning" and word["status"] == "learning":
            return
        self.db.update_word_status(word["id"], status)
        self.daily_words = self.db.get_daily_words(self.today)
        if self.current_index < len(self.daily_words) - 1:
            self.current_index += 1
        self._show_word()

    def _prev_word(self):
        if self.daily_words and self.current_index > 0:
            self.current_index -= 1
            self._show_word()

    def _next_word(self):
        if self.daily_words and self.current_index < len(self.daily_words) - 1:
            self.current_index += 1
            self._show_word()

    def _update_timer(self):
        if self.timer_running:
            self.timer_seconds += 1
            h = self.timer_seconds // 3600
            m = (self.timer_seconds % 3600) // 60
            s = self.timer_seconds % 60
            self.timer_label.config(text=f"⏱ {h:02d}:{m:02d}:{s:02d}")
        self.root.after(1000, self._update_timer)

    def _do_checkin(self):
        if self.checked_in:
            return
        self.checked_in = True
        completed = sum(1 for w in self.daily_words if w["status"] != "new")
        self.db.check_in(self.today, self.timer_seconds, completed)
        self.checkin_btn.config(text="已打卡 ✓", bg="#6B7280", cursor="arrow")
        self._refresh_stats()

    def _refresh_stats(self):
        total_days = self.db.get_total_checkin_days()
        streak = self.db.get_streak()
        total_learned = self.db.get_total_learned_words()
        total_time = self.db.get_total_learning_time()
        today_time = self.db.get_today_duration(self.today)

        self.stat_days.config(text=str(total_days))
        self.stat_streak.config(text=f"{streak} 天")
        self.stat_learned.config(text=str(total_learned))
        self.stat_total_time.config(text=self._format_duration(total_time))
        self.stat_today_time.config(text=self._format_duration(today_time))

        for widget in self.history_frame.winfo_children():
            widget.destroy()

        checkins = self.db.get_recent_checkins(7)
        if not checkins:
            tk.Label(
                self.history_frame, text="暂无打卡记录",
                font=("Microsoft YaHei UI", 11), fg=self.TEXT_MID, bg=self.CARD_BG
            ).pack(pady=20)
            return

        for ci in checkins:
            row = tk.Frame(self.history_frame, bg=self.CARD_BG)
            row.pack(fill=tk.X, pady=3)
            tk.Label(
                row, text=f"📅 {ci['date']}", font=("Microsoft YaHei UI", 11),
                fg=self.TEXT_DARK, bg=self.CARD_BG, width=14, anchor=tk.W
            ).pack(side=tk.LEFT)
            tk.Label(
                row, text=f"⏰ {ci['check_in_time']}", font=("Microsoft YaHei UI", 11),
                fg=self.TEXT_MID, bg=self.CARD_BG, width=10, anchor=tk.W
            ).pack(side=tk.LEFT, padx=5)
            tk.Label(
                row, text=f"⏱ {self._format_duration(ci['duration_seconds'])}",
                font=("Microsoft YaHei UI", 11), fg=self.TEXT_MID, bg=self.CARD_BG, width=10, anchor=tk.W
            ).pack(side=tk.LEFT, padx=5)
            tk.Label(
                row, text=f"✅ {ci['completed_count']} 词",
                font=("Microsoft YaHei UI", 11), fg=self.GREEN, bg=self.CARD_BG, anchor=tk.W
            ).pack(side=tk.LEFT, padx=5)

    def _refresh_review(self):
        for widget in self.review_inner.winfo_children():
            widget.destroy()

        learning_words = self.db.get_learning_words()
        self.review_count_label.config(text=f"{len(learning_words)} 个")

        if not learning_words:
            tk.Label(
                self.review_inner, text="🎉 没有待复习的单词！",
                font=("Microsoft YaHei UI", 14), fg=self.TEXT_MID, bg=self.CARD_BG
            ).pack(pady=30)
            return

        for w in learning_words:
            row = tk.Frame(self.review_inner, bg=self.CARD_BG)
            row.pack(fill=tk.X, padx=10, pady=4)

            word_frame = tk.Frame(row, bg=self.CARD_BG)
            word_frame.pack(side=tk.LEFT, fill=tk.X, expand=True)

            tk.Label(
                word_frame, text=w["word"], font=("Consolas", 14, "bold"),
                fg=self.PRIMARY, bg=self.CARD_BG, width=18, anchor=tk.W
            ).pack(side=tk.LEFT)

            tk.Button(
                word_frame, text="🔊", font=("Segoe UI Emoji", 10),
                fg=self.PRIMARY, bg=self.PRIMARY_LIGHT, bd=0,
                padx=4, pady=2, cursor="hand2",
                command=lambda wd=w["word"]: self._speak_word(wd)
            ).pack(side=tk.LEFT, padx=2)

            tk.Label(
                word_frame, text=f"/ {w['phonetic']} /", font=("Consolas", 10),
                fg=self.TEXT_MID, bg=self.CARD_BG, width=18, anchor=tk.W
            ).pack(side=tk.LEFT)

            meaning_lbl = tk.Label(
                word_frame, text="●●●●●", font=("Microsoft YaHei UI", 11),
                fg=self.TEXT_MID, bg=self.CARD_BG, anchor=tk.W
            )
            meaning_lbl.pack(side=tk.LEFT, padx=5)

            revealed = [False]
            original_meaning = w["meaning"]

            def toggle_meaning(ml=meaning_lbl, rev=revealed, m=original_meaning):
                if rev[0]:
                    ml.config(text="●●●●●", fg=self.TEXT_MID)
                    rev[0] = False
                else:
                    ml.config(text=m, fg=self.TEXT_DARK)
                    rev[0] = True

            tk.Button(
                word_frame, text="👁", font=("Segoe UI Emoji", 10),
                fg=self.PRIMARY, bg=self.PRIMARY_LIGHT, bd=0,
                padx=6, pady=2, cursor="hand2", command=toggle_meaning
            ).pack(side=tk.LEFT, padx=3)

            tk.Button(
                row, text="已掌握 ✓", font=("Microsoft YaHei UI", 9, "bold"),
                fg="white", bg=self.GREEN, bd=0,
                activebackground="#16A34A", padx=8, pady=2, cursor="hand2",
                command=lambda wid=w["id"]: self._mark_review_mastered(wid)
            ).pack(side=tk.RIGHT, padx=5)

    def _mark_review_mastered(self, word_id):
        self.db.mark_word_mastered(word_id)
        self.daily_words = self.db.get_daily_words(self.today)
        self._show_word()
        self._refresh_review()
        self._refresh_stats()

    def _format_duration(self, seconds):
        if seconds < 60:
            return f"{seconds}秒"
        elif seconds < 3600:
            m = seconds // 60
            s = seconds % 60
            return f"{m}分{s}秒"
        else:
            h = seconds // 3600
            m = (seconds % 3600) // 60
            return f"{h}时{m}分"

    def _on_close(self):
        self.timer_running = False
        self.db.end_learning_log(self.log_id, self.timer_seconds)
        if self.checked_in:
            completed = sum(1 for w in self.daily_words if w["status"] != "new")
            self.db.check_in(self.today, self.timer_seconds, completed)
        self.db.close()
        self.root.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    app = WordApp(root)
    root.mainloop()
