import tkinter as tk
from tkinter import ttk, messagebox, simpledialog, filedialog
import sqlite3
import datetime
import os
import uuid
import shutil

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cuotiben.db")
IMG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")

try:
    from PIL import Image, ImageTk
    HAS_PIL = True
except ImportError:
    HAS_PIL = False


def ensure_img_dir():
    if not os.path.exists(IMG_DIR):
        os.makedirs(IMG_DIR)

COLORS = {
    "primary": "#1E88E5",
    "primary_dark": "#1565C0",
    "primary_light": "#42A5F5",
    "bg_light": "#E3F2FD",
    "bg_white": "#FFFFFF",
    "bg_hover": "#BBDEFB",
    "bg_selected": "#90CAF9",
    "text_dark": "#212121",
    "text_secondary": "#616161",
    "text_white": "#FFFFFF",
    "border": "#90CAF9",
    "accent": "#FF6F00",
    "danger": "#D32F2F",
    "success": "#2E7D32",
}

FONT_TITLE = ("Microsoft YaHei UI", 16, "bold")
FONT_HEADING = ("Microsoft YaHei UI", 13, "bold")
FONT_BODY = ("Microsoft YaHei UI", 11)
FONT_SMALL = ("Microsoft YaHei UI", 9)
FONT_NAV = ("Microsoft YaHei UI", 11)


class Database:
    def __init__(self):
        self.conn = sqlite3.connect(DB_PATH)
        self.conn.row_factory = sqlite3.Row
        self._create_tables()

    def _create_tables(self):
        cur = self.conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                color TEXT DEFAULT '#1E88E5',
                created_at TEXT DEFAULT (datetime('now','localtime'))
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                my_answer TEXT DEFAULT '',
                correct_answer TEXT DEFAULT '',
                analysis TEXT DEFAULT '',
                notes TEXT DEFAULT '',
                difficulty INTEGER DEFAULT 2,
                created_at TEXT DEFAULT (datetime('now','localtime')),
                updated_at TEXT DEFAULT (datetime('now','localtime')),
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question_id INTEGER NOT NULL,
                field_type TEXT NOT NULL,
                file_path TEXT NOT NULL,
                original_name TEXT DEFAULT '',
                sort_order INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now','localtime')),
                FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
            )
        """)
        default_cats = [
            ("数学", "#1E88E5"),
            ("语文", "#43A047"),
            ("英语", "#FB8C00"),
            ("物理", "#8E24AA"),
            ("化学", "#E53935"),
            ("生物", "#00897B"),
        ]
        for name, color in default_cats:
            try:
                cur.execute("INSERT INTO categories (name, color) VALUES (?, ?)", (name, color))
            except sqlite3.IntegrityError:
                pass
        self.conn.commit()
        ensure_img_dir()

    def get_categories(self):
        cur = self.conn.cursor()
        cur.execute("SELECT * FROM categories ORDER BY id")
        return [dict(row) for row in cur.fetchall()]

    def add_category(self, name, color="#1E88E5"):
        try:
            cur = self.conn.cursor()
            cur.execute("INSERT INTO categories (name, color) VALUES (?, ?)", (name, color))
            self.conn.commit()
            return cur.lastrowid
        except sqlite3.IntegrityError:
            return None

    def delete_category(self, cat_id):
        cur = self.conn.cursor()
        cur.execute("DELETE FROM questions WHERE category_id = ?", (cat_id,))
        cur.execute("DELETE FROM categories WHERE id = ?", (cat_id,))
        self.conn.commit()

    def rename_category(self, cat_id, new_name):
        try:
            cur = self.conn.cursor()
            cur.execute("UPDATE categories SET name = ? WHERE id = ?", (new_name, cat_id))
            self.conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False

    def add_question(self, category_id, title, content, my_answer="", correct_answer="", analysis="", notes="", difficulty=2):
        cur = self.conn.cursor()
        cur.execute("""
            INSERT INTO questions (category_id, title, content, my_answer, correct_answer, analysis, notes, difficulty)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (category_id, title, content, my_answer, correct_answer, analysis, notes, difficulty))
        self.conn.commit()
        return cur.lastrowid

    def update_question(self, qid, **kwargs):
        if not kwargs:
            return
        kwargs["updated_at"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        sets = ", ".join(f"{k} = ?" for k in kwargs)
        vals = list(kwargs.values()) + [qid]
        cur = self.conn.cursor()
        cur.execute(f"UPDATE questions SET {sets} WHERE id = ?", vals)
        self.conn.commit()

    def delete_question(self, qid):
        cur = self.conn.cursor()
        cur.execute("DELETE FROM questions WHERE id = ?", (qid,))
        self.conn.commit()

    def get_questions(self, category_id=None, keyword=None):
        cur = self.conn.cursor()
        sql = """
            SELECT q.*, c.name as category_name, c.color as category_color
            FROM questions q
            JOIN categories c ON q.category_id = c.id
        """
        conditions = []
        params = []
        if category_id:
            conditions.append("q.category_id = ?")
            params.append(category_id)
        if keyword:
            conditions.append("(q.title LIKE ? OR q.content LIKE ? OR q.notes LIKE ?)")
            params.extend([f"%{keyword}%"] * 3)
        if conditions:
            sql += " WHERE " + " AND ".join(conditions)
        sql += " ORDER BY q.created_at DESC"
        cur.execute(sql, params)
        return [dict(row) for row in cur.fetchall()]

    def get_question(self, qid):
        cur = self.conn.cursor()
        cur.execute("""
            SELECT q.*, c.name as category_name, c.color as category_color
            FROM questions q
            JOIN categories c ON q.category_id = c.id
            WHERE q.id = ?
        """, (qid,))
        row = cur.fetchone()
        return dict(row) if row else None

    def get_stats(self):
        cur = self.conn.cursor()
        cur.execute("SELECT COUNT(*) as total FROM questions")
        total = cur.fetchone()["total"]
        cur.execute("""
            SELECT c.name, c.color, COUNT(q.id) as cnt
            FROM categories c
            LEFT JOIN questions q ON c.id = q.category_id
            GROUP BY c.id
            ORDER BY cnt DESC
        """)
        by_category = [dict(row) for row in cur.fetchall()]
        cur.execute("SELECT COUNT(*) as cnt FROM questions WHERE difficulty = 1")
        easy = cur.fetchone()["cnt"]
        cur.execute("SELECT COUNT(*) as cnt FROM questions WHERE difficulty = 2")
        medium = cur.fetchone()["cnt"]
        cur.execute("SELECT COUNT(*) as cnt FROM questions WHERE difficulty = 3")
        hard = cur.fetchone()["cnt"]
        return {
            "total": total,
            "by_category": by_category,
            "easy": easy,
            "medium": medium,
            "hard": hard,
        }

    def add_image(self, question_id, field_type, file_path, original_name="", sort_order=0):
        ensure_img_dir()
        ext = os.path.splitext(file_path)[1].lower()
        new_filename = f"{question_id}_{field_type}_{uuid.uuid4().hex[:8]}{ext}"
        dest_path = os.path.join(IMG_DIR, new_filename)
        shutil.copy2(file_path, dest_path)
        cur = self.conn.cursor()
        cur.execute("""
            INSERT INTO images (question_id, field_type, file_path, original_name, sort_order)
            VALUES (?, ?, ?, ?, ?)
        """, (question_id, field_type, dest_path, original_name, sort_order))
        self.conn.commit()
        return cur.lastrowid

    def get_images(self, question_id, field_type=None):
        cur = self.conn.cursor()
        sql = "SELECT * FROM images WHERE question_id = ?"
        params = [question_id]
        if field_type:
            sql += " AND field_type = ?"
            params.append(field_type)
        sql += " ORDER BY sort_order, id"
        cur.execute(sql, params)
        return [dict(row) for row in cur.fetchall()]

    def delete_image(self, image_id):
        cur = self.conn.cursor()
        cur.execute("SELECT file_path FROM images WHERE id = ?", (image_id,))
        row = cur.fetchone()
        if row and os.path.exists(row["file_path"]):
            try:
                os.remove(row["file_path"])
            except:
                pass
        cur.execute("DELETE FROM images WHERE id = ?", (image_id,))
        self.conn.commit()

    def delete_images_by_question(self, question_id):
        images = self.get_images(question_id)
        for img in images:
            if os.path.exists(img["file_path"]):
                try:
                    os.remove(img["file_path"])
                except:
                    pass
        cur = self.conn.cursor()
        cur.execute("DELETE FROM images WHERE question_id = ?", (question_id,))
        self.conn.commit()

    def delete_question(self, qid):
        self.delete_images_by_question(qid)
        cur = self.conn.cursor()
        cur.execute("DELETE FROM questions WHERE id = ?", (qid,))
        self.conn.commit()

    def close(self):
        self.conn.close()


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("错题本 — 记录每一次错误，积累每一份成长")
        self.geometry("1100x700")
        self.minsize(900, 600)
        self.configure(bg=COLORS["bg_white"])

        self.db = Database()
        self.current_page = "add"
        self.current_category_id = None
        self.current_question_id = None
        self._img_refs = {}
        self._add_temp_images = {}

        self._build_ui()
        self.show_page("add")

    def _choose_image_file(self):
        return filedialog.askopenfilename(
            title="选择图片",
            filetypes=[("图片文件", "*.png *.jpg *.jpeg *.bmp *.gif"), ("所有文件", "*.*")]
        )

    def _load_image(self, file_path, max_size=150):
        if not os.path.exists(file_path):
            return None
        try:
            if HAS_PIL:
                img = Image.open(file_path)
                w, h = img.size
                ratio = min(max_size / w, max_size / h, 1.0)
                new_w, new_h = int(w * ratio), int(h * ratio)
                img = img.resize((new_w, new_h), Image.LANCZOS)
                photo = ImageTk.PhotoImage(img)
            else:
                photo = tk.PhotoImage(file=file_path)
                w = photo.width()
                h = photo.height()
                if w > max_size or h > max_size:
                    ratio = min(max_size / w, max_size / h)
                    photo = photo.subsample(int(1 / ratio), int(1 / ratio))
            return photo
        except Exception as e:
            print(f"加载图片失败: {e}")
            return None

    def _add_temp_image(self, field_type, file_path):
        if field_type not in self._add_temp_images:
            self._add_temp_images[field_type] = []
        self._add_temp_images[field_type].append({
            "file_path": file_path,
            "original_name": os.path.basename(file_path)
        })

    def _remove_temp_image(self, field_type, index):
        if field_type in self._add_temp_images and 0 <= index < len(self._add_temp_images[field_type]):
            del self._add_temp_images[field_type][index]

    def _clear_temp_images(self):
        self._add_temp_images = {}

    def _save_temp_images(self, question_id):
        for field_type, images in self._add_temp_images.items():
            for idx, img in enumerate(images):
                self.db.add_image(
                    question_id, field_type, img["file_path"],
                    img["original_name"], idx
                )

    def _render_thumbnails(self, parent, images, field_type, on_remove=None, show_remove=True):
        for w in parent.winfo_children():
            w.destroy()
        if not images:
            if show_remove:
                tk.Label(parent, text="（暂无图片）", font=FONT_SMALL, bg=COLORS["bg_light"],
                         fg=COLORS["text_secondary"]).pack(side=tk.LEFT, padx=5)
            return
        for idx, img_data in enumerate(images):
            img_path = img_data["file_path"] if isinstance(img_data, dict) else img_data
            photo = self._load_image(img_path, max_size=120)
            if photo is None:
                tk.Label(parent, text="无法加载", font=FONT_SMALL, bg=COLORS["bg_light"],
                         fg=COLORS["danger"]).pack(side=tk.LEFT, padx=3)
                continue
            ref_key = f"{field_type}_{idx}_{id(parent)}"
            self._img_refs[ref_key] = photo

            cell = tk.Frame(parent, bg=COLORS["bg_light"], padx=3, pady=3)
            cell.pack(side=tk.LEFT, padx=3)

            lbl = tk.Label(cell, image=photo, bg=COLORS["bg_light"], cursor="hand2")
            lbl.pack()
            lbl.bind("<Button-1>", lambda e, p=img_path: self._show_full_image(p))

            if show_remove and on_remove:
                btn = tk.Button(cell, text="✕", font=FONT_SMALL, bg=COLORS["danger"],
                                fg=COLORS["text_white"], bd=0, cursor="hand2",
                                width=2, command=lambda i=idx: on_remove(i))
                btn.pack(pady=(2, 0))

    def _show_full_image(self, file_path):
        if not os.path.exists(file_path):
            messagebox.showwarning("提示", "图片文件不存在")
            return
        win = tk.Toplevel(self)
        win.title("查看大图")
        win.configure(bg=COLORS["bg_white"])
        win.transient(self)

        try:
            if HAS_PIL:
                img = Image.open(file_path)
                w, h = img.size
                max_w, max_h = 800, 600
                if w > max_w or h > max_h:
                    ratio = min(max_w / w, max_h / h)
                    img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
                photo = ImageTk.PhotoImage(img)
            else:
                photo = tk.PhotoImage(file=file_path)
                w, h = photo.width(), photo.height()
                max_w, max_h = 800, 600
                if w > max_w or h > max_h:
                    ratio = min(max_w / w, max_h / h)
                    photo = photo.subsample(int(1 / ratio), int(1 / ratio))

            win.geometry(f"{photo.width() + 40}x{photo.height() + 60}")

            lbl = tk.Label(win, image=photo, bg=COLORS["bg_white"])
            lbl.pack(expand=True, padx=20, pady=20)

            tk.Button(win, text="关闭", command=win.destroy, font=FONT_BODY,
                      bg=COLORS["primary"], fg=COLORS["text_white"], bd=0, padx=20, pady=6,
                      cursor="hand2").pack(pady=(0, 15))

            lbl._photo = photo
        except Exception as e:
            tk.Label(win, text=f"无法加载图片: {e}", font=FONT_BODY,
                     bg=COLORS["bg_white"], fg=COLORS["danger"]).pack(padx=20, pady=30)

    def _build_ui(self):
        self.main_frame = tk.Frame(self, bg=COLORS["bg_white"])
        self.main_frame.pack(fill=tk.BOTH, expand=True)

        self.sidebar = tk.Frame(self.main_frame, bg=COLORS["primary"], width=200)
        self.sidebar.pack(side=tk.LEFT, fill=tk.Y)
        self.sidebar.pack_propagate(False)
        self._build_sidebar()

        self.content = tk.Frame(self.main_frame, bg=COLORS["bg_white"])
        self.content.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        self.pages = {}
        for name in ("add", "list", "categories", "stats"):
            page = tk.Frame(self.content, bg=COLORS["bg_white"])
            self.pages[name] = page

    def _build_sidebar(self):
        logo_frame = tk.Frame(self.sidebar, bg=COLORS["primary_dark"], height=70)
        logo_frame.pack(fill=tk.X)
        logo_frame.pack_propagate(False)
        tk.Label(logo_frame, text="📝 错题本", font=FONT_TITLE, fg=COLORS["text_white"], bg=COLORS["primary_dark"]).pack(expand=True)

        nav_frame = tk.Frame(self.sidebar, bg=COLORS["primary"])
        nav_frame.pack(fill=tk.BOTH, expand=True, pady=10)

        nav_items = [
            ("add", "➕ 录入错题"),
            ("list", "📋 错题列表"),
            ("categories", "📂 分类管理"),
            ("stats", "📊 统计概览"),
        ]
        self.nav_buttons = {}
        for key, text in nav_items:
            btn = tk.Button(
                nav_frame, text=text, font=FONT_NAV, anchor="w", padx=20, pady=10,
                fg=COLORS["text_white"], bg=COLORS["primary"],
                activebackground=COLORS["primary_light"], activeforeground=COLORS["text_white"],
                bd=0, cursor="hand2", command=lambda k=key: self.show_page(k)
            )
            btn.pack(fill=tk.X, padx=8, pady=2)
            btn.bind("<Enter>", lambda e, b=btn: b.configure(bg=COLORS["primary_light"]) if self.current_page != nav_items[list(self.nav_buttons.keys()).index(key)][0] else None)
            btn.bind("<Leave>", lambda e, b=btn, k=key: self._reset_nav_btn(b, k))
            self.nav_buttons[key] = btn

        footer = tk.Frame(self.sidebar, bg=COLORS["primary_dark"], height=40)
        footer.pack(fill=tk.X, side=tk.BOTTOM)
        footer.pack_propagate(False)
        tk.Label(footer, text="v1.0 · 用心记录", font=FONT_SMALL, fg=COLORS["bg_hover"], bg=COLORS["primary_dark"]).pack(expand=True)

    def _reset_nav_btn(self, btn, key):
        if self.current_page == key:
            btn.configure(bg=COLORS["bg_selected"], fg=COLORS["text_dark"])
        else:
            btn.configure(bg=COLORS["primary"], fg=COLORS["text_white"])

    def show_page(self, name):
        self.current_page = name
        for key, btn in self.nav_buttons.items():
            if key == name:
                btn.configure(bg=COLORS["bg_selected"], fg=COLORS["text_dark"])
            else:
                btn.configure(bg=COLORS["primary"], fg=COLORS["text_white"])

        for p in self.pages.values():
            p.pack_forget()

        builder = {
            "add": self._build_add_page,
            "list": self._build_list_page,
            "categories": self._build_categories_page,
            "stats": self._build_stats_page,
        }
        builder[name]()
        self.pages[name].pack(fill=tk.BOTH, expand=True)

    def _make_entry(self, parent, placeholder="", height=1, **kw):
        if height > 1:
            entry = tk.Text(parent, font=FONT_BODY, height=height, wrap=tk.WORD,
                            bg=COLORS["bg_white"], fg=COLORS["text_dark"],
                            insertbackground=COLORS["primary"], relief=tk.FLAT,
                            highlightthickness=1, highlightcolor=COLORS["primary"],
                            highlightbackground=COLORS["border"], padx=8, pady=6, **kw)
            if placeholder:
                entry.insert("1.0", placeholder)
                entry.configure(fg=COLORS["text_secondary"])
                entry.bind("<FocusIn>", lambda e: self._clear_placeholder(entry, placeholder))
                entry.bind("<FocusOut>", lambda e: self._set_placeholder(entry, placeholder))
        else:
            entry = tk.Entry(parent, font=FONT_BODY,
                             bg=COLORS["bg_white"], fg=COLORS["text_dark"],
                             insertbackground=COLORS["primary"], relief=tk.FLAT,
                             highlightthickness=1, highlightcolor=COLORS["primary"],
                             highlightbackground=COLORS["border"])
            if placeholder:
                entry.insert(0, placeholder)
                entry.configure(fg=COLORS["text_secondary"])
                entry.bind("<FocusIn>", lambda e: self._clear_placeholder_entry(entry, placeholder))
                entry.bind("<FocusOut>", lambda e: self._set_placeholder_entry(entry, placeholder))
        return entry

    def _clear_placeholder(self, widget, placeholder):
        if widget.get("1.0", "end-1c") == placeholder:
            widget.delete("1.0", tk.END)
            widget.configure(fg=COLORS["text_dark"])

    def _set_placeholder(self, widget, placeholder):
        if not widget.get("1.0", "end-1c").strip():
            widget.insert("1.0", placeholder)
            widget.configure(fg=COLORS["text_secondary"])

    def _clear_placeholder_entry(self, widget, placeholder):
        if widget.get() == placeholder:
            widget.delete(0, tk.END)
            widget.configure(fg=COLORS["text_dark"])

    def _set_placeholder_entry(self, widget, placeholder):
        if not widget.get().strip():
            widget.delete(0, tk.END)
            widget.insert(0, placeholder)
            widget.configure(fg=COLORS["text_secondary"])

    def _make_button(self, parent, text, command, color=None, **kw):
        c = color or COLORS["primary"]
        btn = tk.Button(parent, text=text, font=FONT_BODY, command=command,
                        bg=c, fg=COLORS["text_white"],
                        activebackground=COLORS["primary_dark"], activeforeground=COLORS["text_white"],
                        bd=0, padx=20, pady=8, cursor="hand2", **kw)
        btn.bind("<Enter>", lambda e, b=btn, cc=c: b.configure(bg=self._darken(cc)))
        btn.bind("<Leave>", lambda e, b=btn, cc=c: b.configure(bg=cc))
        return btn

    def _darken(self, hex_color):
        hex_color = hex_color.lstrip("#")
        r, g, b = [int(hex_color[i:i+2], 16) for i in (0, 2, 4)]
        factor = 0.85
        r, g, b = int(r * factor), int(g * factor), int(b * factor)
        return f"#{r:02x}{g:02x}{b:02x}"

    def _make_label(self, parent, text, **kw):
        return tk.Label(parent, text=text, font=FONT_BODY, bg=COLORS["bg_white"],
                        fg=COLORS["text_dark"], anchor="w", **kw)

    def _section_header(self, parent, text):
        frame = tk.Frame(parent, bg=COLORS["bg_white"])
        frame.pack(fill=tk.X, padx=30, pady=(20, 5))
        tk.Label(frame, text=text, font=FONT_HEADING, bg=COLORS["bg_white"],
                 fg=COLORS["primary"]).pack(side=tk.LEFT)
        sep = tk.Frame(frame, height=2, bg=COLORS["bg_hover"])
        sep.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(10, 0), pady=2)
        return frame

    def _build_img_upload_row(self, parent, field_type):
        container = tk.Frame(parent, bg=COLORS["bg_white"])
        container.pack(fill=tk.X, padx=30, pady=(0, 8))

        btn_f = tk.Frame(container, bg=COLORS["bg_white"])
        btn_f.pack(fill=tk.X)

        def _upload():
            fpath = self._choose_image_file()
            if fpath:
                self._add_temp_image(field_type, fpath)
                self._refresh_thumbnails(field_type)

        def _remove(idx):
            self._remove_temp_image(field_type, idx)
            self._refresh_thumbnails(field_type)

        def _refresh():
            self._render_thumbnails(
                thumb_f, self._add_temp_images.get(field_type, []),
                field_type, on_remove=_remove
            )

        setattr(self, f"_refresh_thumbnails_{field_type}", _refresh)

        upload_btn = tk.Button(btn_f, text="📷 上传图片", font=FONT_SMALL,
                               bg=COLORS["bg_light"], fg=COLORS["primary"],
                               bd=0, cursor="hand2", padx=12, pady=4,
                               activebackground=COLORS["bg_hover"],
                               activeforeground=COLORS["primary_dark"],
                               command=_upload)
        upload_btn.pack(side=tk.LEFT)

        tk.Label(btn_f, text="（点击缩略图可查看大图，点击✕可删除）", font=FONT_SMALL,
                 bg=COLORS["bg_white"], fg=COLORS["text_secondary"]).pack(side=tk.LEFT, padx=8)

        thumb_f = tk.Frame(container, bg=COLORS["bg_light"], padx=8, pady=8, height=140)
        thumb_f.pack(fill=tk.X, pady=(5, 0))
        thumb_f.pack_propagate(False)

        self._render_thumbnails(thumb_f, [], field_type, on_remove=_remove)
        return container

    def _refresh_thumbnails(self, field_type):
        refresh_fn = getattr(self, f"_refresh_thumbnails_{field_type}", None)
        if refresh_fn:
            refresh_fn()

    def _build_add_page(self):
        for w in self.pages["add"].winfo_children():
            w.destroy()

        canvas = tk.Canvas(self.pages["add"], bg=COLORS["bg_white"], highlightthickness=0)
        scrollbar = ttk.Scrollbar(self.pages["add"], orient=tk.VERTICAL, command=canvas.yview)
        scroll_frame = tk.Frame(canvas, bg=COLORS["bg_white"])

        scroll_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=scroll_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        canvas.bind_all("<MouseWheel>", _on_mousewheel)

        header = tk.Frame(scroll_frame, bg=COLORS["bg_light"], height=60)
        header.pack(fill=tk.X)
        header.pack_propagate(False)
        tk.Label(header, text="➕ 录入新错题", font=FONT_TITLE, bg=COLORS["bg_light"],
                 fg=COLORS["primary"]).pack(side=tk.LEFT, padx=30, expand=True)

        form = tk.Frame(scroll_frame, bg=COLORS["bg_white"])
        form.pack(fill=tk.X, padx=30, pady=10)

        row = 0
        self._make_label(form, "所属分类").grid(row=row, column=0, sticky="w", pady=8)
        cats = self.db.get_categories()
        self.add_cat_var = tk.StringVar()
        cat_names = [c["name"] for c in cats]
        self.add_cat_combo = ttk.Combobox(form, textvariable=self.add_cat_var, values=cat_names,
                                           state="readonly", font=FONT_BODY, width=20)
        if cat_names:
            self.add_cat_combo.current(0)
        self.add_cat_combo.grid(row=row, column=1, sticky="w", pady=8, padx=(10, 0))

        row += 1
        self._make_label(form, "难度等级").grid(row=row, column=0, sticky="w", pady=8)
        diff_frame = tk.Frame(form, bg=COLORS["bg_white"])
        diff_frame.grid(row=row, column=1, sticky="w", pady=8, padx=(10, 0))
        self.add_diff_var = tk.IntVar(value=2)
        for val, label, color in [(1, "简单", COLORS["success"]), (2, "中等", COLORS["accent"]), (3, "困难", COLORS["danger"])]:
            rb = tk.Radiobutton(diff_frame, text=label, variable=self.add_diff_var, value=val,
                                font=FONT_BODY, bg=COLORS["bg_white"], fg=color,
                                selectcolor=COLORS["bg_white"], activebackground=COLORS["bg_white"],
                                activeforeground=color)
            rb.pack(side=tk.LEFT, padx=5)

        row += 1
        self._make_label(form, "题目标题").grid(row=row, column=0, sticky="w", pady=8)
        self.add_title_entry = self._make_entry(form, "例如：二次函数最值问题")
        self.add_title_entry.grid(row=row, column=1, sticky="ew", pady=8, padx=(10, 0))

        row += 1
        self._section_header(scroll_frame, "题目内容")
        self.add_content_text = self._make_entry(scroll_frame, "请输入完整的题目内容...", height=6)
        self.add_content_text.pack(fill=tk.X, padx=30, pady=5)
        self.add_content_img_frame = self._build_img_upload_row(scroll_frame, "content")

        self._section_header(scroll_frame, "我的答案")
        self.add_my_answer_text = self._make_entry(scroll_frame, "记录你当时的解答过程...", height=4)
        self.add_my_answer_text.pack(fill=tk.X, padx=30, pady=5)
        self.add_my_answer_img_frame = self._build_img_upload_row(scroll_frame, "my_answer")

        self._section_header(scroll_frame, "正确答案")
        self.add_correct_answer_text = self._make_entry(scroll_frame, "记录正确的解答过程...", height=4)
        self.add_correct_answer_text.pack(fill=tk.X, padx=30, pady=5)
        self.add_correct_answer_img_frame = self._build_img_upload_row(scroll_frame, "correct_answer")

        self._section_header(scroll_frame, "原题解析")
        self.add_analysis_text = self._make_entry(scroll_frame, "对题目进行解析，总结解题思路和方法...", height=4)
        self.add_analysis_text.pack(fill=tk.X, padx=30, pady=5)
        self.add_analysis_img_frame = self._build_img_upload_row(scroll_frame, "analysis")

        self._section_header(scroll_frame, "心得笔记")
        self.add_notes_text = self._make_entry(scroll_frame, "写下你的感悟、易错点和注意事项...", height=4)
        self.add_notes_text.pack(fill=tk.X, padx=30, pady=5)

        btn_frame = tk.Frame(scroll_frame, bg=COLORS["bg_white"])
        btn_frame.pack(fill=tk.X, padx=30, pady=20)

        self._make_button(btn_frame, "💾 保存错题", self._save_question).pack(side=tk.LEFT)
        self._make_button(btn_frame, "🔄 清空表单", self._clear_add_form, color=COLORS["text_secondary"]).pack(side=tk.LEFT, padx=10)

        form.columnconfigure(1, weight=1)

    def _get_text(self, widget):
        if isinstance(widget, tk.Text):
            return widget.get("1.0", tk.END).strip()
        return widget.get().strip()

    def _save_question(self):
        cat_name = self.add_cat_var.get()
        title = self._get_text(self.add_title_entry)
        content = self._get_text(self.add_content_text)
        my_answer = self._get_text(self.add_my_answer_text)
        correct_answer = self._get_text(self.add_correct_answer_text)
        analysis = self._get_text(self.add_analysis_text)
        notes = self._get_text(self.add_notes_text)
        difficulty = self.add_diff_var.get()

        if not cat_name:
            messagebox.showwarning("提示", "请选择所属分类")
            return
        if not title or title == "例如：二次函数最值问题":
            messagebox.showwarning("提示", "请输入题目标题")
            return
        if not content or content == "请输入完整的题目内容...":
            messagebox.showwarning("提示", "请输入题目内容")
            return

        cats = self.db.get_categories()
        cat_id = None
        for c in cats:
            if c["name"] == cat_name:
                cat_id = c["id"]
                break
        if cat_id is None:
            messagebox.showwarning("提示", "未找到所选分类")
            return

        qid = self.db.add_question(cat_id, title, content, my_answer, correct_answer, analysis, notes, difficulty)
        self._save_temp_images(qid)
        messagebox.showinfo("成功", "错题已保存！")
        self._clear_add_form()

    def _clear_add_form(self):
        self.add_title_entry.delete(0, tk.END)
        self.add_content_text.delete("1.0", tk.END)
        self.add_my_answer_text.delete("1.0", tk.END)
        self.add_correct_answer_text.delete("1.0", tk.END)
        self.add_analysis_text.delete("1.0", tk.END)
        self.add_notes_text.delete("1.0", tk.END)
        self.add_diff_var.set(2)
        self._clear_temp_images()
        for ft in ["content", "my_answer", "correct_answer", "analysis"]:
            self._refresh_thumbnails(ft)

    def _build_list_page(self):
        for w in self.pages["list"].winfo_children():
            w.destroy()

        header = tk.Frame(self.pages["list"], bg=COLORS["bg_light"], height=60)
        header.pack(fill=tk.X)
        header.pack_propagate(False)
        tk.Label(header, text="📋 错题列表", font=FONT_TITLE, bg=COLORS["bg_light"],
                 fg=COLORS["primary"]).pack(side=tk.LEFT, padx=30)

        filter_frame = tk.Frame(self.pages["list"], bg=COLORS["bg_white"])
        filter_frame.pack(fill=tk.X, padx=20, pady=10)

        self._make_label(filter_frame, "分类筛选:").pack(side=tk.LEFT, padx=(10, 5))
        cats = self.db.get_categories()
        self.list_cat_var = tk.StringVar(value="全部分类")
        cat_names = ["全部分类"] + [c["name"] for c in cats]
        self.list_cat_combo = ttk.Combobox(filter_frame, textvariable=self.list_cat_var,
                                            values=cat_names, state="readonly", font=FONT_BODY, width=12)
        self.list_cat_combo.pack(side=tk.LEFT, padx=5)
        self.list_cat_combo.bind("<<ComboboxSelected>>", lambda e: self._refresh_list())

        self._make_label(filter_frame, "搜索:").pack(side=tk.LEFT, padx=(20, 5))
        self.search_var = tk.StringVar()
        search_entry = tk.Entry(filter_frame, textvariable=self.search_var, font=FONT_BODY, width=20,
                                bg=COLORS["bg_white"], fg=COLORS["text_dark"],
                                insertbackground=COLORS["primary"], relief=tk.FLAT,
                                highlightthickness=1, highlightcolor=COLORS["primary"],
                                highlightbackground=COLORS["border"])
        search_entry.pack(side=tk.LEFT, padx=5)
        search_entry.bind("<Return>", lambda e: self._refresh_list())
        self._make_button(filter_frame, "🔍 搜索", self._refresh_list).pack(side=tk.LEFT, padx=5)

        list_container = tk.Frame(self.pages["list"], bg=COLORS["bg_white"])
        list_container.pack(fill=tk.BOTH, expand=True, padx=20, pady=(0, 20))

        self.list_canvas = tk.Canvas(list_container, bg=COLORS["bg_white"], highlightthickness=0)
        self.list_scrollbar = ttk.Scrollbar(list_container, orient=tk.VERTICAL, command=self.list_canvas.yview)
        self.list_scroll_frame = tk.Frame(self.list_canvas, bg=COLORS["bg_white"])

        self.list_scroll_frame.bind("<Configure>",
                                     lambda e: self.list_canvas.configure(scrollregion=self.list_canvas.bbox("all")))
        self.list_canvas.create_window((0, 0), window=self.list_scroll_frame, anchor="nw")
        self.list_canvas.configure(yscrollcommand=self.list_scrollbar.set)

        self.list_canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.list_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        self._refresh_list()

    def _refresh_list(self):
        for w in self.list_scroll_frame.winfo_children():
            w.destroy()

        cat_name = self.list_cat_var.get()
        keyword = self.search_var.get().strip()

        cat_id = None
        if cat_name != "全部分类":
            cats = self.db.get_categories()
            for c in cats:
                if c["name"] == cat_name:
                    cat_id = c["id"]
                    break

        questions = self.db.get_questions(category_id=cat_id, keyword=keyword or None)

        if not questions:
            empty = tk.Frame(self.list_scroll_frame, bg=COLORS["bg_light"], padx=40, pady=30)
            empty.pack(fill=tk.X, pady=20)
            tk.Label(empty, text="📭 暂无错题记录", font=FONT_HEADING, bg=COLORS["bg_light"],
                     fg=COLORS["text_secondary"]).pack()
            tk.Label(empty, text="点击左侧「录入错题」开始添加", font=FONT_SMALL, bg=COLORS["bg_light"],
                     fg=COLORS["text_secondary"]).pack(pady=5)
            return

        diff_map = {1: ("简单", COLORS["success"]), 2: ("中等", COLORS["accent"]), 3: ("困难", COLORS["danger"])}

        for q in questions:
            card = tk.Frame(self.list_scroll_frame, bg=COLORS["bg_white"],
                            highlightbackground=COLORS["border"], highlightthickness=1)
            card.pack(fill=tk.X, pady=4, padx=5)

            top = tk.Frame(card, bg=COLORS["bg_white"])
            top.pack(fill=tk.X, padx=15, pady=(10, 5))

            cat_label = tk.Label(top, text=q["category_name"], font=FONT_SMALL,
                                 bg=q["category_color"], fg=COLORS["text_white"], padx=8, pady=2)
            cat_label.pack(side=tk.LEFT)

            diff_text, diff_color = diff_map.get(q["difficulty"], ("中等", COLORS["accent"]))
            diff_label = tk.Label(top, text=diff_text, font=FONT_SMALL,
                                  bg=COLORS["bg_white"], fg=diff_color, padx=5)
            diff_label.pack(side=tk.LEFT, padx=(8, 0))

            tk.Label(top, text=q["created_at"][:10], font=FONT_SMALL,
                     bg=COLORS["bg_white"], fg=COLORS["text_secondary"]).pack(side=tk.RIGHT)

            all_imgs = self.db.get_images(q["id"])
            if all_imgs:
                img_count = tk.Label(top, text=f"📷 {len(all_imgs)}", font=FONT_SMALL,
                                     bg=COLORS["primary_light"], fg=COLORS["text_white"],
                                     padx=6, pady=1)
                img_count.pack(side=tk.RIGHT, padx=5)

            mid = tk.Frame(card, bg=COLORS["bg_white"])
            mid.pack(fill=tk.X, padx=15, pady=3)
            tk.Label(mid, text=q["title"], font=FONT_HEADING, bg=COLORS["bg_white"],
                     fg=COLORS["text_dark"], anchor="w").pack(fill=tk.X)

            content_preview = q["content"][:80] + ("..." if len(q["content"]) > 80 else "")
            tk.Label(mid, text=content_preview, font=FONT_SMALL, bg=COLORS["bg_white"],
                     fg=COLORS["text_secondary"], anchor="w", wraplength=700, justify=tk.LEFT).pack(fill=tk.X)

            bottom = tk.Frame(card, bg=COLORS["bg_white"])
            bottom.pack(fill=tk.X, padx=15, pady=(3, 10))

            self._make_button(bottom, "📖 查看详情", lambda qid=q["id"]: self._show_question_detail(qid),
                              color=COLORS["primary"]).pack(side=tk.LEFT)
            self._make_button(bottom, "✏️ 编辑", lambda qid=q["id"]: self._edit_question(qid),
                              color=COLORS["accent"]).pack(side=tk.LEFT, padx=5)
            self._make_button(bottom, "🗑 删除", lambda qid=q["id"]: self._delete_question(qid),
                              color=COLORS["danger"]).pack(side=tk.LEFT)

    def _show_question_detail(self, qid):
        q = self.db.get_question(qid)
        if not q:
            return

        win = tk.Toplevel(self)
        win.title(f"错题详情 — {q['title']}")
        win.geometry("700x600")
        win.configure(bg=COLORS["bg_white"])
        win.transient(self)

        canvas = tk.Canvas(win, bg=COLORS["bg_white"], highlightthickness=0)
        scrollbar = ttk.Scrollbar(win, orient=tk.VERTICAL, command=canvas.yview)
        detail_frame = tk.Frame(canvas, bg=COLORS["bg_white"])
        detail_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=detail_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        diff_map = {1: ("简单", COLORS["success"]), 2: ("中等", COLORS["accent"]), 3: ("困难", COLORS["danger"])}
        diff_text, diff_color = diff_map.get(q["difficulty"], ("中等", COLORS["accent"]))

        header_f = tk.Frame(detail_frame, bg=COLORS["bg_light"], padx=20, pady=15)
        header_f.pack(fill=tk.X)
        tk.Label(header_f, text=q["title"], font=FONT_TITLE, bg=COLORS["bg_light"],
                 fg=COLORS["primary"]).pack(side=tk.LEFT)
        tk.Label(header_f, text=f"{q['category_name']} · {diff_text}",
                 font=FONT_SMALL, bg=COLORS["bg_light"], fg=diff_color).pack(side=tk.RIGHT)

        sections = [
            ("📝 题目内容", q["content"], "content"),
            ("❌ 我的答案", q["my_answer"], "my_answer"),
            ("✅ 正确答案", q["correct_answer"], "correct_answer"),
            ("🔍 原题解析", q["analysis"], "analysis"),
            ("💡 心得笔记", q["notes"], None),
        ]
        for label, content, field_type in sections:
            self._section_header(detail_frame, label)
            text_frame = tk.Frame(detail_frame, bg=COLORS["bg_light"], padx=15, pady=10)
            text_frame.pack(fill=tk.X, padx=30, pady=3)
            display_text = content if content and content.strip() else "（暂无内容）"
            fg = COLORS["text_dark"] if content and content.strip() else COLORS["text_secondary"]
            tk.Label(text_frame, text=display_text, font=FONT_BODY, bg=COLORS["bg_light"],
                     fg=fg, wraplength=600, justify=tk.LEFT, anchor="w").pack(fill=tk.X)

            if field_type:
                images = self.db.get_images(q["id"], field_type)
                if images:
                    img_frame = tk.Frame(detail_frame, bg=COLORS["bg_light"], padx=10, pady=8)
                    img_frame.pack(fill=tk.X, padx=30, pady=(0, 3))
                    tk.Label(img_frame, text="📷 相关图片（点击查看大图）:",
                             font=FONT_SMALL, bg=COLORS["bg_light"],
                             fg=COLORS["primary"]).pack(anchor="w")
                    thumb_container = tk.Frame(img_frame, bg=COLORS["bg_light"])
                    thumb_container.pack(fill=tk.X, pady=(5, 0))
                    self._render_thumbnails(thumb_container, images,
                        f"detail_{field_type}_{q['id']}", show_remove=False)

        time_f = tk.Frame(detail_frame, bg=COLORS["bg_white"])
        time_f.pack(fill=tk.X, padx=30, pady=10)
        tk.Label(time_f, text=f"创建时间: {q['created_at']}  |  更新时间: {q['updated_at']}",
                 font=FONT_SMALL, bg=COLORS["bg_white"], fg=COLORS["text_secondary"]).pack()

    def _edit_question(self, qid):
        q = self.db.get_question(qid)
        if not q:
            return

        win = tk.Toplevel(self)
        win.title(f"编辑错题 — {q['title']}")
        win.geometry("700x650")
        win.configure(bg=COLORS["bg_white"])
        win.transient(self)

        canvas = tk.Canvas(win, bg=COLORS["bg_white"], highlightthickness=0)
        scrollbar = ttk.Scrollbar(win, orient=tk.VERTICAL, command=canvas.yview)
        edit_frame = tk.Frame(canvas, bg=COLORS["bg_white"])
        edit_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=edit_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        form = tk.Frame(edit_frame, bg=COLORS["bg_white"])
        form.pack(fill=tk.X, padx=30, pady=10)

        row = 0
        self._make_label(form, "题目标题").grid(row=row, column=0, sticky="w", pady=8)
        title_e = tk.Entry(form, font=FONT_BODY, bg=COLORS["bg_white"], fg=COLORS["text_dark"],
                           insertbackground=COLORS["primary"], relief=tk.FLAT,
                           highlightthickness=1, highlightcolor=COLORS["primary"],
                           highlightbackground=COLORS["border"])
        title_e.insert(0, q["title"])
        title_e.grid(row=row, column=1, sticky="ew", pady=8, padx=(10, 0))

        row += 1
        self._make_label(form, "所属分类").grid(row=row, column=0, sticky="w", pady=8)
        cats = self.db.get_categories()
        cat_var = tk.StringVar(value=q["category_name"])
        cat_combo = ttk.Combobox(form, textvariable=cat_var, values=[c["name"] for c in cats],
                                  state="readonly", font=FONT_BODY, width=15)
        cat_combo.grid(row=row, column=1, sticky="w", pady=8, padx=(10, 0))

        row += 1
        self._make_label(form, "难度等级").grid(row=row, column=0, sticky="w", pady=8)
        diff_var = tk.IntVar(value=q["difficulty"])
        diff_f = tk.Frame(form, bg=COLORS["bg_white"])
        diff_f.grid(row=row, column=1, sticky="w", pady=8, padx=(10, 0))
        for val, label, color in [(1, "简单", COLORS["success"]), (2, "中等", COLORS["accent"]), (3, "困难", COLORS["danger"])]:
            tk.Radiobutton(diff_f, text=label, variable=diff_var, value=val,
                           font=FONT_BODY, bg=COLORS["bg_white"], fg=color,
                           selectcolor=COLORS["bg_white"]).pack(side=tk.LEFT, padx=5)

        row += 1

        edit_temp_images = {}
        edit_existing_images = {}
        edit_deleted_image_ids = []
        thumb_refs = {}

        def _build_edit_img_row(parent, field_type, existing_imgs):
            container = tk.Frame(parent, bg=COLORS["bg_white"])
            container.pack(fill=tk.X, padx=30, pady=(0, 8))

            btn_f = tk.Frame(container, bg=COLORS["bg_white"])
            btn_f.pack(fill=tk.X)

            def _upload():
                fpath = self._choose_image_file()
                if fpath:
                    if field_type not in edit_temp_images:
                        edit_temp_images[field_type] = []
                    edit_temp_images[field_type].append({
                        "file_path": fpath,
                        "original_name": os.path.basename(fpath)
                    })
                    _refresh()

            def _remove_existing(idx):
                img_id = existing_imgs[idx]["id"]
                edit_deleted_image_ids.append(img_id)
                del existing_imgs[idx]
                _refresh()

            def _remove_new(idx):
                del edit_temp_images[field_type][idx]
                _refresh()

            def _refresh():
                all_imgs = []
                for img in existing_imgs:
                    all_imgs.append({**img, "_is_existing": True})
                for i, img in enumerate(edit_temp_images.get(field_type, [])):
                    all_imgs.append({**img, "_is_existing": False, "_idx": i})

                for w in thumb_f.winfo_children():
                    w.destroy()
                if not all_imgs:
                    tk.Label(thumb_f, text="（暂无图片）", font=FONT_SMALL, bg=COLORS["bg_light"],
                             fg=COLORS["text_secondary"]).pack(side=tk.LEFT, padx=5)
                    return

                for idx, img_data in enumerate(all_imgs):
                    img_path = img_data["file_path"]
                    photo = self._load_image(img_path, max_size=120)
                    if photo is None:
                        tk.Label(thumb_f, text="无法加载", font=FONT_SMALL, bg=COLORS["bg_light"],
                                 fg=COLORS["danger"]).pack(side=tk.LEFT, padx=3)
                        continue
                    ref_key = f"edit_{field_type}_{idx}"
                    thumb_refs[ref_key] = photo

                    cell = tk.Frame(thumb_f, bg=COLORS["bg_light"], padx=3, pady=3)
                    cell.pack(side=tk.LEFT, padx=3)

                    lbl = tk.Label(cell, image=photo, bg=COLORS["bg_light"], cursor="hand2")
                    lbl.pack()
                    lbl.bind("<Button-1>", lambda e, p=img_path: self._show_full_image(p))

                    if img_data["_is_existing"]:
                        del_cmd = lambda i=idx: _remove_existing(i)
                    else:
                        del_cmd = lambda i=img_data["_idx"]: _remove_new(i)

                    btn = tk.Button(cell, text="✕", font=FONT_SMALL, bg=COLORS["danger"],
                                    fg=COLORS["text_white"], bd=0, cursor="hand2",
                                    width=2, command=del_cmd)
                    btn.pack(pady=(2, 0))

            upload_btn = tk.Button(btn_f, text="� 上传图片", font=FONT_SMALL,
                                   bg=COLORS["bg_light"], fg=COLORS["primary"],
                                   bd=0, cursor="hand2", padx=12, pady=4,
                                   activebackground=COLORS["bg_hover"],
                                   activeforeground=COLORS["primary_dark"],
                                   command=_upload)
            upload_btn.pack(side=tk.LEFT)

            tk.Label(btn_f, text="（点击缩略图可查看大图，点击✕可删除）", font=FONT_SMALL,
                     bg=COLORS["bg_white"], fg=COLORS["text_secondary"]).pack(side=tk.LEFT, padx=8)

            thumb_f = tk.Frame(container, bg=COLORS["bg_light"], padx=8, pady=8, height=140)
            thumb_f.pack(fill=tk.X, pady=(5, 0))
            thumb_f.pack_propagate(False)

            _refresh()
            return _refresh

        fields = [
            ("�� 题目内容", q["content"], 5, "content"),
            ("❌ 我的答案", q["my_answer"], 3, "my_answer"),
            ("✅ 正确答案", q["correct_answer"], 3, "correct_answer"),
            ("🔍 原题解析", q["analysis"], 3, "analysis"),
            ("💡 心得笔记", q["notes"], 3, None),
        ]
        text_widgets = []
        img_refresh_fns = {}
        for label, content, h, field_type in fields:
            self._section_header(edit_frame, label)
            t = tk.Text(edit_frame, font=FONT_BODY, height=h, wrap=tk.WORD,
                        bg=COLORS["bg_white"], fg=COLORS["text_dark"],
                        insertbackground=COLORS["primary"], relief=tk.FLAT,
                        highlightthickness=1, highlightcolor=COLORS["primary"],
                        highlightbackground=COLORS["border"], padx=8, pady=6)
            t.insert("1.0", content or "")
            t.pack(fill=tk.X, padx=30, pady=3)
            text_widgets.append(t)

            if field_type:
                existing = self.db.get_images(qid, field_type)
                edit_existing_images[field_type] = existing
                img_refresh_fns[field_type] = _build_edit_img_row(edit_frame, field_type, existing)

        def save():
            new_title = title_e.get().strip()
            if not new_title:
                messagebox.showwarning("提示", "题目标题不能为空", parent=win)
                return
            cat_name = cat_var.get()
            cat_id = None
            for c in cats:
                if c["name"] == cat_name:
                    cat_id = c["id"]
                    break
            if cat_id is None:
                messagebox.showwarning("提示", "请选择分类", parent=win)
                return

            for img_id in edit_deleted_image_ids:
                self.db.delete_image(img_id)

            for field_type, images in edit_temp_images.items():
                for idx, img in enumerate(images):
                    self.db.add_image(
                        qid, field_type, img["file_path"],
                        img["original_name"], idx
                    )

            updates = {
                "category_id": cat_id,
                "title": new_title,
                "content": text_widgets[0].get("1.0", tk.END).strip(),
                "my_answer": text_widgets[1].get("1.0", tk.END).strip(),
                "correct_answer": text_widgets[2].get("1.0", tk.END).strip(),
                "analysis": text_widgets[3].get("1.0", tk.END).strip(),
                "notes": text_widgets[4].get("1.0", tk.END).strip(),
                "difficulty": diff_var.get(),
            }
            self.db.update_question(qid, **updates)
            messagebox.showinfo("成功", "错题已更新！", parent=win)
            win.destroy()
            self.show_page("list")

        btn_f = tk.Frame(edit_frame, bg=COLORS["bg_white"])
        btn_f.pack(fill=tk.X, padx=30, pady=15)
        self._make_button(btn_f, "💾 保存修改", save).pack(side=tk.LEFT)
        self._make_button(btn_f, "取消", win.destroy, color=COLORS["text_secondary"]).pack(side=tk.LEFT, padx=10)

        form.columnconfigure(1, weight=1)

    def _delete_question(self, qid):
        if messagebox.askyesno("确认删除", "确定要删除这道错题吗？此操作不可恢复。"):
            self.db.delete_question(qid)
            self._refresh_list()

    def _build_categories_page(self):
        for w in self.pages["categories"].winfo_children():
            w.destroy()

        header = tk.Frame(self.pages["categories"], bg=COLORS["bg_light"], height=60)
        header.pack(fill=tk.X)
        header.pack_propagate(False)
        tk.Label(header, text="📂 分类管理", font=FONT_TITLE, bg=COLORS["bg_light"],
                 fg=COLORS["primary"]).pack(side=tk.LEFT, padx=30)

        add_frame = tk.Frame(self.pages["categories"], bg=COLORS["bg_white"])
        add_frame.pack(fill=tk.X, padx=30, pady=15)
        self._make_label(add_frame, "新分类名称:").pack(side=tk.LEFT)
        self.new_cat_entry = tk.Entry(add_frame, font=FONT_BODY, width=15,
                                       bg=COLORS["bg_white"], fg=COLORS["text_dark"],
                                       insertbackground=COLORS["primary"], relief=tk.FLAT,
                                       highlightthickness=1, highlightcolor=COLORS["primary"],
                                       highlightbackground=COLORS["border"])
        self.new_cat_entry.pack(side=tk.LEFT, padx=8)
        self._make_button(add_frame, "➕ 添加分类", self._add_category).pack(side=tk.LEFT)

        cats = self.db.get_categories()
        grid = tk.Frame(self.pages["categories"], bg=COLORS["bg_white"])
        grid.pack(fill=tk.BOTH, expand=True, padx=30, pady=10)

        for i, cat in enumerate(cats):
            card = tk.Frame(grid, bg=COLORS["bg_white"],
                            highlightbackground=COLORS["border"], highlightthickness=1)
            row, col = divmod(i, 3)
            card.grid(row=row, column=col, padx=8, pady=8, sticky="nsew")

            color_bar = tk.Frame(card, bg=cat["color"], height=4)
            color_bar.pack(fill=tk.X)

            inner = tk.Frame(card, bg=COLORS["bg_white"], padx=15, pady=12)
            inner.pack(fill=tk.BOTH, expand=True)

            tk.Label(inner, text=cat["name"], font=FONT_HEADING, bg=COLORS["bg_white"],
                     fg=COLORS["text_dark"]).pack(anchor="w")

            count = len(self.db.get_questions(category_id=cat["id"]))
            tk.Label(inner, text=f"共 {count} 道错题", font=FONT_SMALL, bg=COLORS["bg_white"],
                     fg=COLORS["text_secondary"]).pack(anchor="w", pady=(3, 0))

            btn_row = tk.Frame(inner, bg=COLORS["bg_white"])
            btn_row.pack(anchor="w", pady=(8, 0))

            rename_btn = tk.Button(btn_row, text="✏️ 重命名", font=FONT_SMALL,
                                   bg=COLORS["bg_white"], fg=COLORS["primary"],
                                   bd=0, cursor="hand2", padx=5,
                                   command=lambda cid=cat["id"], cname=cat["name"]: self._rename_category(cid, cname))
            rename_btn.pack(side=tk.LEFT)

            del_btn = tk.Button(btn_row, text="🗑 删除", font=FONT_SMALL,
                                bg=COLORS["bg_white"], fg=COLORS["danger"],
                                bd=0, cursor="hand2", padx=5,
                                command=lambda cid=cat["id"], cname=cat["name"]: self._delete_category(cid, cname))
            del_btn.pack(side=tk.LEFT, padx=5)

        for c in range(3):
            grid.columnconfigure(c, weight=1)

    def _add_category(self):
        name = self.new_cat_entry.get().strip()
        if not name:
            messagebox.showwarning("提示", "请输入分类名称")
            return
        result = self.db.add_category(name)
        if result is None:
            messagebox.showwarning("提示", "该分类已存在")
            return
        self.new_cat_entry.delete(0, tk.END)
        self.show_page("categories")

    def _rename_category(self, cat_id, old_name):
        new_name = simpledialog.askstring("重命名分类", f"请输入新名称（原: {old_name}）:", parent=self)
        if new_name and new_name.strip():
            if not self.db.rename_category(cat_id, new_name.strip()):
                messagebox.showwarning("提示", "该分类名已存在")
            else:
                self.show_page("categories")

    def _delete_category(self, cat_id, name):
        count = len(self.db.get_questions(category_id=cat_id))
        msg = f"确定要删除分类「{name}」吗？"
        if count > 0:
            msg += f"\n该分类下有 {count} 道错题，将一并删除！"
        if messagebox.askyesno("确认删除", msg):
            self.db.delete_category(cat_id)
            self.show_page("categories")

    def _build_stats_page(self):
        for w in self.pages["stats"].winfo_children():
            w.destroy()

        header = tk.Frame(self.pages["stats"], bg=COLORS["bg_light"], height=60)
        header.pack(fill=tk.X)
        header.pack_propagate(False)
        tk.Label(header, text="📊 统计概览", font=FONT_TITLE, bg=COLORS["bg_light"],
                 fg=COLORS["primary"]).pack(side=tk.LEFT, padx=30)

        stats = self.db.get_stats()

        summary = tk.Frame(self.pages["stats"], bg=COLORS["bg_white"])
        summary.pack(fill=tk.X, padx=30, pady=20)

        cards_data = [
            ("总错题数", str(stats["total"]), COLORS["primary"]),
            ("简单", str(stats["easy"]), COLORS["success"]),
            ("中等", str(stats["medium"]), COLORS["accent"]),
            ("困难", str(stats["hard"]), COLORS["danger"]),
        ]
        for label, value, color in cards_data:
            card = tk.Frame(summary, bg=COLORS["bg_white"],
                            highlightbackground=COLORS["border"], highlightthickness=1)
            card.pack(side=tk.LEFT, expand=True, fill=tk.BOTH, padx=8)

            top_bar = tk.Frame(card, bg=color, height=4)
            top_bar.pack(fill=tk.X)

            inner = tk.Frame(card, bg=COLORS["bg_white"], padx=15, pady=15)
            inner.pack(fill=tk.BOTH, expand=True)
            tk.Label(inner, text=value, font=("Microsoft YaHei UI", 28, "bold"),
                     bg=COLORS["bg_white"], fg=color).pack()
            tk.Label(inner, text=label, font=FONT_SMALL, bg=COLORS["bg_white"],
                     fg=COLORS["text_secondary"]).pack(pady=(5, 0))

        self._section_header(self.pages["stats"], "各分类错题数量")

        if stats["by_category"]:
            max_count = max(c["cnt"] for c in stats["by_category"]) or 1
            chart_frame = tk.Frame(self.pages["stats"], bg=COLORS["bg_white"])
            chart_frame.pack(fill=tk.X, padx=30, pady=10)

            for cat in stats["by_category"]:
                row = tk.Frame(chart_frame, bg=COLORS["bg_white"])
                row.pack(fill=tk.X, pady=4)

                tk.Label(row, text=cat["name"], font=FONT_BODY, bg=COLORS["bg_white"],
                         fg=COLORS["text_dark"], width=8, anchor="e").pack(side=tk.LEFT, padx=(0, 10))

                bar_bg = tk.Frame(row, bg=COLORS["bg_light"], height=28)
                bar_bg.pack(side=tk.LEFT, fill=tk.X, expand=True)
                bar_bg.pack_propagate(False)

                bar_width = max(int(cat["cnt"] / max_count * 100), 5) if cat["cnt"] > 0 else 0
                if bar_width > 0:
                    bar = tk.Frame(bar_bg, bg=cat["color"], width=bar_width)
                    bar.pack(side=tk.LEFT, fill=tk.Y)
                    bar.pack_propagate(False)

                tk.Label(row, text=str(cat["cnt"]), font=FONT_BODY, bg=COLORS["bg_white"],
                         fg=COLORS["text_secondary"], width=5).pack(side=tk.LEFT, padx=(5, 0))
        else:
            tk.Label(self.pages["stats"], text="暂无数据", font=FONT_BODY, bg=COLORS["bg_white"],
                     fg=COLORS["text_secondary"]).pack(pady=20)

    def destroy(self):
        self.db.close()
        super().destroy()


if __name__ == "__main__":
    app = App()
    app.mainloop()
