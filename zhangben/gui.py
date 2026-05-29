import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from datetime import datetime, date
import calendar
import csv
import os

import db

try:
    import matplotlib
    matplotlib.use("TkAgg")
    from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
    from matplotlib.figure import Figure
    from matplotlib import font_manager
    import matplotlib.pyplot as plt

    font_paths = [
        "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/msyh.ttf",
        "C:/Windows/Fonts/simhei.ttf",
        "C:/Windows/Fonts/simsun.ttc",
    ]
    font_prop = None
    for fp in font_paths:
        if os.path.exists(fp):
            font_prop = font_manager.FontProperties(fname=fp)
            plt.rcParams["font.family"] = font_prop.get_name()
            break

    plt.rcParams["axes.unicode_minus"] = False
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False


class DatePicker(ttk.Frame):
    def __init__(self, master, initial_date=None, compact=False, allow_empty=False, **kwargs):
        super().__init__(master, **kwargs)
        self.allow_empty = allow_empty
        self._empty = False

        if initial_date is None:
            initial_date = date.today()
        elif isinstance(initial_date, str):
            if initial_date == "" and allow_empty:
                self._empty = True
                initial_date = date.today()
            else:
                initial_date = datetime.strptime(initial_date, "%Y-%m-%d").date()

        self.year_var = tk.StringVar(value=str(initial_date.year))
        self.month_var = tk.StringVar(value=str(initial_date.month))
        self.day_var = tk.StringVar(value=str(initial_date.day))

        current_year = date.today().year
        years = [str(y) for y in range(current_year - 10, current_year + 5)]
        months = [str(m) for m in range(1, 13)]

        year_width = 5 if compact else 6
        month_width = 3 if compact else 4
        day_width = 3 if compact else 4
        pad = 1 if compact else 2

        if allow_empty:
            self.empty_var = tk.BooleanVar(value=self._empty)
            ttk.Checkbutton(self, variable=self.empty_var, command=self._on_empty_toggle).pack(side=tk.LEFT, padx=(0, 3))

        ttk.Combobox(self, textvariable=self.year_var, values=years, state="readonly", width=year_width).pack(side=tk.LEFT)
        ttk.Label(self, text="年").pack(side=tk.LEFT, padx=pad)
        ttk.Combobox(self, textvariable=self.month_var, values=months, state="readonly", width=month_width).pack(side=tk.LEFT, padx=(3, 0))
        ttk.Label(self, text="月").pack(side=tk.LEFT, padx=pad)

        self.day_combo = ttk.Combobox(self, textvariable=self.day_var, values=self._get_days(), state="readonly", width=day_width)
        self.day_combo.pack(side=tk.LEFT, padx=(3, 0))
        ttk.Label(self, text="日").pack(side=tk.LEFT, padx=pad)

        self.year_var.trace_add("write", self._on_date_change)
        self.month_var.trace_add("write", self._on_date_change)

        if allow_empty and self._empty:
            self._set_enabled(False)

    def _on_empty_toggle(self):
        self._empty = self.empty_var.get()
        self._set_enabled(not self._empty)

    def _set_enabled(self, enabled):
        state = "readonly" if enabled else "disabled"
        for child in self.winfo_children():
            if isinstance(child, ttk.Combobox):
                child.configure(state=state)

    def _get_days(self):
        try:
            year = int(self.year_var.get())
            month = int(self.month_var.get())
            _, last_day = calendar.monthrange(year, month)
            return [str(d) for d in range(1, last_day + 1)]
        except (ValueError, tk.TclError):
            return [str(d) for d in range(1, 32)]

    def _on_date_change(self, *args):
        current_day = self.day_var.get()
        days = self._get_days()
        self.day_combo["values"] = days
        if current_day not in days:
            self.day_var.set(days[-1] if days else "1")

    def get_date(self):
        if self.allow_empty and self._empty:
            return ""
        return f"{int(self.year_var.get()):04d}-{int(self.month_var.get()):02d}-{int(self.day_var.get()):02d}"

    def set_date(self, date_str):
        if date_str == "" and self.allow_empty:
            self._empty = True
            self.empty_var.set(True)
            self._set_enabled(False)
            return
        if self.allow_empty:
            self._empty = False
            self.empty_var.set(False)
            self._set_enabled(True)
        d = datetime.strptime(date_str, "%Y-%m-%d").date()
        self.year_var.set(str(d.year))
        self.month_var.set(str(d.month))
        self.day_var.set(str(d.day))


class ZhangBenApp:
    def __init__(self, root):
        self.root = root
        self.root.title("家庭账本 - 收支管理")
        self.root.geometry("1000x700")
        self.root.minsize(900, 600)

        self._configure_styles()
        self._create_menu()
        self._create_notebook()
        self._create_add_tab()
        self._create_query_tab()
        self._create_stats_tab()

        self._refresh_add_summary()

    def _configure_styles(self):
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("Title.TLabel", font=("Microsoft YaHei UI", 14, "bold"))
        style.configure("Header.TLabel", font=("Microsoft YaHei UI", 10, "bold"))
        style.configure("Income.TLabel", foreground="#2e7d32", font=("Microsoft YaHei UI", 10, "bold"))
        style.configure("Expense.TLabel", foreground="#c62828", font=("Microsoft YaHei UI", 10, "bold"))
        style.configure("Summary.TLabel", font=("Microsoft YaHei UI", 11, "bold"))
        style.configure("Required.TLabel", foreground="#ff0000", font=("Microsoft YaHei UI", 10, "bold"))

    def _create_menu(self):
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)

        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="文件", menu=file_menu)
        file_menu.add_command(label="导入CSV...", command=self._import_csv)
        file_menu.add_command(label="导出CSV...", command=self._export_csv)
        file_menu.add_separator()
        file_menu.add_command(label="退出", command=self.root.quit)

        help_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="帮助", menu=help_menu)
        help_menu.add_command(label="关于", command=self._show_about)

    def _create_notebook(self):
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        self.add_frame = ttk.Frame(self.notebook)
        self.query_frame = ttk.Frame(self.notebook)
        self.stats_frame = ttk.Frame(self.notebook)

        self.notebook.add(self.add_frame, text="  新增记录  ")
        self.notebook.add(self.query_frame, text="  查询记录  ")
        self.notebook.add(self.stats_frame, text="  统计报表  ")

    # ==================== 新增记录 Tab ====================
    def _create_add_tab(self):
        left_frame = ttk.LabelFrame(self.add_frame, text="录入收支信息", padding=15)
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)

        right_frame = ttk.LabelFrame(self.add_frame, text="当月概览", padding=15)
        right_frame.pack(side=tk.RIGHT, fill=tk.Y, padx=10, pady=10)

        row = 0
        type_label_frame = ttk.Frame(left_frame)
        type_label_frame.grid(row=row, column=0, sticky=tk.W, pady=8)
        tk.Label(type_label_frame, text="收支类型", font=("Microsoft YaHei UI", 10, "bold"), fg="#333333").pack(side=tk.LEFT)
        tk.Label(type_label_frame, text="*", font=("Microsoft YaHei UI", 10, "bold"), fg="#ff0000").pack(side=tk.LEFT)
        tk.Label(type_label_frame, text="：", font=("Microsoft YaHei UI", 10, "bold"), fg="#333333").pack(side=tk.LEFT)
        self.add_type_var = tk.StringVar(value="支出")
        type_frame = ttk.Frame(left_frame)
        type_frame.grid(row=row, column=1, sticky=tk.W, pady=8)
        ttk.Radiobutton(type_frame, text="收入", variable=self.add_type_var, value="收入").pack(side=tk.LEFT, padx=5)
        ttk.Radiobutton(type_frame, text="支出", variable=self.add_type_var, value="支出").pack(side=tk.LEFT, padx=5)

        row += 1
        amount_label_frame = ttk.Frame(left_frame)
        amount_label_frame.grid(row=row, column=0, sticky=tk.W, pady=8)
        tk.Label(amount_label_frame, text="金额", font=("Microsoft YaHei UI", 10, "bold"), fg="#333333").pack(side=tk.LEFT)
        tk.Label(amount_label_frame, text="*", font=("Microsoft YaHei UI", 10, "bold"), fg="#ff0000").pack(side=tk.LEFT)
        tk.Label(amount_label_frame, text="：", font=("Microsoft YaHei UI", 10, "bold"), fg="#333333").pack(side=tk.LEFT)
        self.add_amount_var = tk.StringVar()
        amount_entry = ttk.Entry(left_frame, textvariable=self.add_amount_var, width=20, font=("Microsoft YaHei UI", 11))
        amount_entry.grid(row=row, column=1, sticky=tk.W, pady=8)

        row += 1
        date_label_frame = ttk.Frame(left_frame)
        date_label_frame.grid(row=row, column=0, sticky=tk.W, pady=8)
        tk.Label(date_label_frame, text="发生日期", font=("Microsoft YaHei UI", 10, "bold"), fg="#333333").pack(side=tk.LEFT)
        tk.Label(date_label_frame, text="*", font=("Microsoft YaHei UI", 10, "bold"), fg="#ff0000").pack(side=tk.LEFT)
        tk.Label(date_label_frame, text="：", font=("Microsoft YaHei UI", 10, "bold"), fg="#333333").pack(side=tk.LEFT)
        self.add_date_picker = DatePicker(left_frame, initial_date=date.today())
        self.add_date_picker.grid(row=row, column=1, sticky=tk.W, pady=8)

        row += 1
        cat_label_frame = ttk.Frame(left_frame)
        cat_label_frame.grid(row=row, column=0, sticky=tk.W, pady=8)
        tk.Label(cat_label_frame, text="类型", font=("Microsoft YaHei UI", 10, "bold"), fg="#333333").pack(side=tk.LEFT)
        tk.Label(cat_label_frame, text="*", font=("Microsoft YaHei UI", 10, "bold"), fg="#ff0000").pack(side=tk.LEFT)
        tk.Label(cat_label_frame, text="：", font=("Microsoft YaHei UI", 10, "bold"), fg="#333333").pack(side=tk.LEFT)
        self.add_category_var = tk.StringVar(value="餐费")
        category_combo = ttk.Combobox(left_frame, textvariable=self.add_category_var, values=db.CATEGORIES, state="readonly", width=18, font=("Microsoft YaHei UI", 11))
        category_combo.grid(row=row, column=1, sticky=tk.W, pady=8)

        row += 1
        ttk.Label(left_frame, text="备注说明：", style="Header.TLabel").grid(row=row, column=0, sticky=tk.W, pady=8)
        self.add_note_var = tk.StringVar()
        note_entry = ttk.Entry(left_frame, textvariable=self.add_note_var, width=35, font=("Microsoft YaHei UI", 11))
        note_entry.grid(row=row, column=1, sticky=tk.W, pady=8)

        row += 1
        ttk.Label(left_frame, text="注：带 * 号的为必填项", foreground="#666666").grid(row=row, column=0, columnspan=2, sticky=tk.W, pady=(5, 0))

        row += 1
        btn_frame = ttk.Frame(left_frame)
        btn_frame.grid(row=row, column=0, columnspan=2, pady=10)
        ttk.Button(btn_frame, text="保  存", command=self._save_record, width=12).pack(side=tk.LEFT, padx=15)
        ttk.Button(btn_frame, text="清  空", command=self._clear_add_form, width=12).pack(side=tk.LEFT, padx=15)

        ttk.Label(right_frame, text="本月收支汇总", style="Title.TLabel").pack(pady=10)
        self.add_summary_label = ttk.Label(right_frame, text="", justify=tk.LEFT)
        self.add_summary_label.pack(pady=10, padx=20, anchor=tk.W)

        ttk.Label(right_frame, text="最近5笔记录", style="Title.TLabel").pack(pady=(20, 10))
        self.recent_listbox = tk.Listbox(right_frame, width=35, height=10, font=("Microsoft YaHei UI", 9))
        self.recent_listbox.pack(padx=10, pady=5)

    def _save_record(self):
        record_type = self.add_type_var.get()
        amount_str = self.add_amount_var.get().strip()
        date_str = self.add_date_picker.get_date()
        category = self.add_category_var.get()
        note = self.add_note_var.get().strip()

        if not amount_str:
            messagebox.showwarning("提示", "请输入金额！")
            return
        try:
            amount = float(amount_str)
            if amount <= 0:
                raise ValueError
        except ValueError:
            messagebox.showwarning("提示", "请输入有效的正数金额！")
            return

        db.add_record(record_type, amount, date_str, category, note)
        messagebox.showinfo("成功", "记录已保存！")
        self._clear_add_form()
        self._refresh_add_summary()

    def _clear_add_form(self):
        self.add_amount_var.set("")
        self.add_date_picker.set_date(date.today().strftime("%Y-%m-%d"))
        self.add_category_var.set("餐费")
        self.add_note_var.set("")
        self.add_type_var.set("支出")

    def _refresh_add_summary(self):
        today = date.today()
        summary = db.get_monthly_summary(today.year, today.month)
        text = (
            f"本月收入：¥{summary['收入']:,.2f}\n\n"
            f"本月支出：¥{summary['支出']:,.2f}\n\n"
            f"本月结余：¥{summary['结余']:,.2f}"
        )
        self.add_summary_label.config(text=text)

        self.recent_listbox.delete(0, tk.END)
        records = db.get_records()[:5]
        for r in records:
            sign = "+" if r["record_type"] == "收入" else "-"
            self.recent_listbox.insert(tk.END, f"{r['date']}  {r['category']}  {sign}¥{r['amount']:.2f}")

    # ==================== 查询记录 Tab ====================
    def _create_query_tab(self):
        filter_frame = ttk.LabelFrame(self.query_frame, text="筛选条件", padding=10)
        filter_frame.pack(fill=tk.X, padx=10, pady=5)

        ttk.Label(filter_frame, text="收支类型：").grid(row=0, column=0, padx=5, pady=5)
        self.query_type_var = tk.StringVar(value="全部")
        ttk.Combobox(filter_frame, textvariable=self.query_type_var, values=["全部", "收入", "支出"], state="readonly", width=8).grid(row=0, column=1, padx=5, pady=5)

        ttk.Label(filter_frame, text="类型：").grid(row=0, column=2, padx=5, pady=5)
        self.query_category_var = tk.StringVar(value="全部")
        ttk.Combobox(filter_frame, textvariable=self.query_category_var, values=["全部"] + db.CATEGORIES, state="readonly", width=10).grid(row=0, column=3, padx=5, pady=5)

        ttk.Label(filter_frame, text="开始日期：").grid(row=0, column=4, padx=5, pady=5)
        self.query_start_picker = DatePicker(filter_frame, initial_date="", compact=True, allow_empty=True)
        self.query_start_picker.grid(row=0, column=5, padx=5, pady=5)

        ttk.Label(filter_frame, text="结束日期：").grid(row=1, column=0, padx=5, pady=5)
        self.query_end_picker = DatePicker(filter_frame, initial_date="", compact=True, allow_empty=True)
        self.query_end_picker.grid(row=1, column=1, padx=5, pady=5)

        ttk.Label(filter_frame, text="备注关键词：").grid(row=1, column=2, padx=5, pady=5)
        self.query_keyword_var = tk.StringVar()
        ttk.Entry(filter_frame, textvariable=self.query_keyword_var, width=15).grid(row=1, column=3, padx=5, pady=5)

        btn_frame = ttk.Frame(filter_frame)
        btn_frame.grid(row=1, column=4, columnspan=2, padx=5, pady=5)
        ttk.Button(btn_frame, text="查  询", command=self._query_records, width=8).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="重  置", command=self._reset_query, width=8).pack(side=tk.LEFT, padx=5)

        result_frame = ttk.Frame(self.query_frame)
        result_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        columns = ("id", "record_type", "amount", "date", "category", "note")
        self.query_tree = ttk.Treeview(result_frame, columns=columns, show="headings", selectmode="browse")
        self.query_tree.heading("id", text="ID")
        self.query_tree.heading("record_type", text="收支类型")
        self.query_tree.heading("amount", text="金额")
        self.query_tree.heading("date", text="日期")
        self.query_tree.heading("category", text="类型")
        self.query_tree.heading("note", text="备注")

        self.query_tree.column("id", width=50, anchor=tk.CENTER)
        self.query_tree.column("record_type", width=80, anchor=tk.CENTER)
        self.query_tree.column("amount", width=100, anchor=tk.E)
        self.query_tree.column("date", width=110, anchor=tk.CENTER)
        self.query_tree.column("category", width=80, anchor=tk.CENTER)
        self.query_tree.column("note", width=250, anchor=tk.W)

        scrollbar_y = ttk.Scrollbar(result_frame, orient=tk.VERTICAL, command=self.query_tree.yview)
        self.query_tree.configure(yscrollcommand=scrollbar_y.set)

        self.query_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar_y.pack(side=tk.RIGHT, fill=tk.Y)

        bottom_frame = ttk.Frame(self.query_frame)
        bottom_frame.pack(fill=tk.X, padx=10, pady=5)

        self.query_result_label = ttk.Label(bottom_frame, text="共 0 条记录", style="Header.TLabel")
        self.query_result_label.pack(side=tk.LEFT, padx=10)

        ttk.Button(bottom_frame, text="编辑", command=self._edit_record, width=8).pack(side=tk.RIGHT, padx=5)
        ttk.Button(bottom_frame, text="删除", command=self._delete_record, width=8).pack(side=tk.RIGHT, padx=5)

    def _query_records(self):
        record_type = self.query_type_var.get()
        if record_type == "全部":
            record_type = None

        category = self.query_category_var.get()
        if category == "全部":
            category = None

        start_date = self.query_start_picker.get_date().strip() or None
        end_date = self.query_end_picker.get_date().strip() or None
        keyword = self.query_keyword_var.get().strip() or None

        records = db.get_records(record_type, category, start_date, end_date, keyword)
        self._populate_query_tree(records)

    def _reset_query(self):
        self.query_type_var.set("全部")
        self.query_category_var.set("全部")
        self.query_start_picker.set_date("")
        self.query_end_picker.set_date("")
        self.query_keyword_var.set("")
        for item in self.query_tree.get_children():
            self.query_tree.delete(item)
        self.query_result_label.config(text="共 0 条记录")

    def _populate_query_tree(self, records):
        for item in self.query_tree.get_children():
            self.query_tree.delete(item)

        total_income = 0.0
        total_expense = 0.0
        for r in records:
            self.query_tree.insert("", tk.END, values=(
                r["id"],
                r["record_type"],
                f"¥{r['amount']:.2f}",
                r["date"],
                r["category"],
                r["note"],
            ))
            if r["record_type"] == "收入":
                total_income += r["amount"]
            else:
                total_expense += r["amount"]

        self.query_result_label.config(
            text=f"共 {len(records)} 条记录 | 收入：¥{total_income:,.2f} | 支出：¥{total_expense:,.2f} | 结余：¥{total_income - total_expense:,.2f}"
        )

    def _get_selected_record_id(self):
        selected = self.query_tree.selection()
        if not selected:
            messagebox.showwarning("提示", "请先选择一条记录！")
            return None
        values = self.query_tree.item(selected[0], "values")
        return int(values[0])

    def _edit_record(self):
        record_id = self._get_selected_record_id()
        if record_id is None:
            return

        record = db.get_record_by_id(record_id)
        if not record:
            messagebox.showerror("错误", "记录不存在！")
            return

        dialog = tk.Toplevel(self.root)
        dialog.title("编辑记录")
        dialog.geometry("400x350")
        dialog.resizable(False, False)
        dialog.transient(self.root)
        dialog.grab_set()

        frame = ttk.Frame(dialog, padding=20)
        frame.pack(fill=tk.BOTH, expand=True)

        row = 0
        ttk.Label(frame, text="收支类型：").grid(row=row, column=0, sticky=tk.W, pady=8)
        edit_type_var = tk.StringVar(value=record["record_type"])
        type_frame = ttk.Frame(frame)
        type_frame.grid(row=row, column=1, sticky=tk.W, pady=8)
        ttk.Radiobutton(type_frame, text="收入", variable=edit_type_var, value="收入").pack(side=tk.LEFT, padx=5)
        ttk.Radiobutton(type_frame, text="支出", variable=edit_type_var, value="支出").pack(side=tk.LEFT, padx=5)

        row += 1
        ttk.Label(frame, text="金额：").grid(row=row, column=0, sticky=tk.W, pady=8)
        edit_amount_var = tk.StringVar(value=str(record["amount"]))
        ttk.Entry(frame, textvariable=edit_amount_var, width=20).grid(row=row, column=1, sticky=tk.W, pady=8)

        row += 1
        ttk.Label(frame, text="发生日期：").grid(row=row, column=0, sticky=tk.W, pady=8)
        edit_date_picker = DatePicker(frame, initial_date=record["date"])
        edit_date_picker.grid(row=row, column=1, sticky=tk.W, pady=8)

        row += 1
        ttk.Label(frame, text="类型：").grid(row=row, column=0, sticky=tk.W, pady=8)
        edit_category_var = tk.StringVar(value=record["category"])
        ttk.Combobox(frame, textvariable=edit_category_var, values=db.CATEGORIES, state="readonly", width=18).grid(row=row, column=1, sticky=tk.W, pady=8)

        row += 1
        ttk.Label(frame, text="备注说明：").grid(row=row, column=0, sticky=tk.W, pady=8)
        edit_note_var = tk.StringVar(value=record["note"])
        ttk.Entry(frame, textvariable=edit_note_var, width=25).grid(row=row, column=1, sticky=tk.W, pady=8)

        def save_edit():
            try:
                amount = float(edit_amount_var.get())
                if amount <= 0:
                    raise ValueError
            except ValueError:
                messagebox.showwarning("提示", "请输入有效的正数金额！")
                return
            date_str = edit_date_picker.get_date()
            db.update_record(record_id, edit_type_var.get(), amount, date_str, edit_category_var.get(), edit_note_var.get())
            messagebox.showinfo("成功", "记录已更新！")
            dialog.destroy()
            self._query_records()
            self._refresh_add_summary()

        row += 1
        btn_frame = ttk.Frame(frame)
        btn_frame.grid(row=row, column=0, columnspan=2, pady=15)
        ttk.Button(btn_frame, text="保存", command=save_edit, width=10).pack(side=tk.LEFT, padx=10)
        ttk.Button(btn_frame, text="取消", command=dialog.destroy, width=10).pack(side=tk.LEFT, padx=10)

    def _delete_record(self):
        record_id = self._get_selected_record_id()
        if record_id is None:
            return
        if messagebox.askyesno("确认删除", "确定要删除该记录吗？此操作不可恢复。"):
            db.delete_record(record_id)
            self._query_records()
            self._refresh_add_summary()

    # ==================== 统计报表 Tab ====================
    def _create_stats_tab(self):
        ctrl_frame = ttk.LabelFrame(self.stats_frame, text="统计条件", padding=10)
        ctrl_frame.pack(fill=tk.X, padx=10, pady=5)

        ttk.Label(ctrl_frame, text="年份：").pack(side=tk.LEFT, padx=5)
        current_year = date.today().year
        self.stats_year_var = tk.StringVar(value=str(current_year))
        year_combo = ttk.Combobox(ctrl_frame, textvariable=self.stats_year_var, values=[str(y) for y in range(current_year - 5, current_year + 2)], state="readonly", width=8)
        year_combo.pack(side=tk.LEFT, padx=5)

        ttk.Label(ctrl_frame, text="月份：").pack(side=tk.LEFT, padx=5)
        self.stats_month_var = tk.StringVar(value=str(date.today().month))
        month_combo = ttk.Combobox(ctrl_frame, textvariable=self.stats_month_var, values=[str(m) for m in range(1, 13)], state="readonly", width=5)
        month_combo.pack(side=tk.LEFT, padx=5)

        ttk.Button(ctrl_frame, text="月度统计", command=self._show_monthly_stats, width=10).pack(side=tk.LEFT, padx=10)
        ttk.Button(ctrl_frame, text="年度趋势", command=self._show_yearly_stats, width=10).pack(side=tk.LEFT, padx=5)

        self.stats_content = ttk.Frame(self.stats_frame)
        self.stats_content.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        self.stats_summary_label = ttk.Label(self.stats_content, text="请选择统计条件后点击查询", style="Title.TLabel")
        self.stats_summary_label.pack(pady=10)

        self.chart_frame = ttk.Frame(self.stats_content)
        self.chart_frame.pack(fill=tk.BOTH, expand=True)

    def _clear_chart_frame(self):
        for widget in self.chart_frame.winfo_children():
            widget.destroy()

    def _show_monthly_stats(self):
        year = int(self.stats_year_var.get())
        month = int(self.stats_month_var.get())

        summary = db.get_monthly_summary(year, month)
        cat_summary = db.get_category_summary(year, month)
        cat_income = db.get_category_summary(year, month, "收入")
        cat_expense = db.get_category_summary(year, month, "支出")

        self.stats_summary_label.config(
            text=f"{year}年{month}月  |  收入：¥{summary['收入']:,.2f}  |  支出：¥{summary['支出']:,.2f}  |  结余：¥{summary['结余']:,.2f}"
        )

        self._clear_chart_frame()

        if not HAS_MATPLOTLIB:
            self._show_stats_table(cat_income, cat_expense)
            return

        fig = Figure(figsize=(9, 4.5), dpi=100)
        fig.set_facecolor("#f5f5f5")

        if cat_expense:
            ax1 = fig.add_subplot(121)
            labels = [c["category"] for c in cat_expense]
            sizes = [c["total"] for c in cat_expense]
            colors = self._get_pie_colors(len(labels))
            wedges, texts, autotexts = ax1.pie(sizes, labels=labels, colors=colors, autopct="%1.1f%%", startangle=90, textprops={"fontsize": 8})
            ax1.set_title("支出分类", fontsize=11, fontweight="bold")

        if cat_income:
            ax2 = fig.add_subplot(122)
            labels = [c["category"] for c in cat_income]
            sizes = [c["total"] for c in cat_income]
            colors = self._get_pie_colors(len(labels))
            wedges, texts, autotexts = ax2.pie(sizes, labels=labels, colors=colors, autopct="%1.1f%%", startangle=90, textprops={"fontsize": 8})
            ax2.set_title("收入分类", fontsize=11, fontweight="bold")

        if not cat_expense and not cat_income:
            ax = fig.add_subplot(111)
            ax.text(0.5, 0.5, "暂无数据", ha="center", va="center", fontsize=16, color="gray")
            ax.axis("off")

        fig.tight_layout()
        canvas = FigureCanvasTkAgg(fig, master=self.chart_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

    def _show_yearly_stats(self):
        year = int(self.stats_year_var.get())
        month_data = db.get_yearly_month_summary(year)

        total_income = sum(m["收入"] for m in month_data.values())
        total_expense = sum(m["支出"] for m in month_data.values())
        total_balance = total_income - total_expense

        self.stats_summary_label.config(
            text=f"{year}年度  |  总收入：¥{total_income:,.2f}  |  总支出：¥{total_expense:,.2f}  |  总结余：¥{total_balance:,.2f}"
        )

        self._clear_chart_frame()

        if not HAS_MATPLOTLIB:
            self._show_yearly_table(month_data, year)
            return

        fig = Figure(figsize=(9, 4.5), dpi=100)
        fig.set_facecolor("#f5f5f5")
        ax = fig.add_subplot(111)

        months = [f"{m}" for m in sorted(month_data.keys())]
        income_vals = [month_data[m]["收入"] for m in sorted(month_data.keys())]
        expense_vals = [month_data[m]["支出"] for m in sorted(month_data.keys())]

        x = range(len(months))
        width = 0.35
        bars1 = ax.bar([i - width / 2 for i in x], income_vals, width, label="收入", color="#4caf50", alpha=0.85)
        bars2 = ax.bar([i + width / 2 for i in x], expense_vals, width, label="支出", color="#f44336", alpha=0.85)

        ax.set_xlabel("月份", fontsize=10)
        ax.set_ylabel("金额 (元)", fontsize=10)
        ax.set_title(f"{year}年月度收支趋势", fontsize=12, fontweight="bold")
        ax.set_xticks(list(x))
        ax.set_xticklabels(months, fontsize=8)
        ax.legend(fontsize=9)
        ax.grid(axis="y", alpha=0.3)

        for bar in bars1:
            h = bar.get_height()
            if h > 0:
                ax.text(bar.get_x() + bar.get_width() / 2., h, f"¥{h:.0f}", ha="center", va="bottom", fontsize=7)
        for bar in bars2:
            h = bar.get_height()
            if h > 0:
                ax.text(bar.get_x() + bar.get_width() / 2., h, f"¥{h:.0f}", ha="center", va="bottom", fontsize=7)

        fig.tight_layout()
        canvas = FigureCanvasTkAgg(fig, master=self.chart_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

    def _show_stats_table(self, cat_income, cat_expense):
        table_frame = ttk.Frame(self.chart_frame)
        table_frame.pack(fill=tk.BOTH, expand=True)

        left = ttk.LabelFrame(table_frame, text="支出分类明细", padding=5)
        left.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)
        tree_exp = ttk.Treeview(left, columns=("category", "total"), show="headings", height=8)
        tree_exp.heading("category", text="类型")
        tree_exp.heading("total", text="金额")
        tree_exp.column("category", width=100, anchor=tk.CENTER)
        tree_exp.column("total", width=120, anchor=tk.E)
        for c in cat_expense:
            tree_exp.insert("", tk.END, values=(c["category"], f"¥{c['total']:.2f}"))
        tree_exp.pack(fill=tk.BOTH, expand=True)

        right = ttk.LabelFrame(table_frame, text="收入分类明细", padding=5)
        right.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=5)
        tree_inc = ttk.Treeview(right, columns=("category", "total"), show="headings", height=8)
        tree_inc.heading("category", text="类型")
        tree_inc.heading("total", text="金额")
        tree_inc.column("category", width=100, anchor=tk.CENTER)
        tree_inc.column("total", width=120, anchor=tk.E)
        for c in cat_income:
            tree_inc.insert("", tk.END, values=(c["category"], f"¥{c['total']:.2f}"))
        tree_inc.pack(fill=tk.BOTH, expand=True)

    def _show_yearly_table(self, month_data, year):
        table_frame = ttk.Frame(self.chart_frame)
        table_frame.pack(fill=tk.BOTH, expand=True)

        tree = ttk.Treeview(table_frame, columns=("month", "income", "expense", "balance"), show="headings", height=12)
        tree.heading("month", text="月份")
        tree.heading("income", text="收入")
        tree.heading("expense", text="支出")
        tree.heading("balance", text="结余")
        tree.column("month", width=100, anchor=tk.CENTER)
        tree.column("income", width=120, anchor=tk.E)
        tree.column("expense", width=120, anchor=tk.E)
        tree.column("balance", width=120, anchor=tk.E)

        for m in sorted(month_data.keys()):
            d = month_data[m]
            tree.insert("", tk.END, values=(m, f"¥{d['收入']:.2f}", f"¥{d['支出']:.2f}", f"¥{d['结余']:.2f}"))

        tree.pack(fill=tk.BOTH, expand=True)

    def _get_pie_colors(self, count):
        base_colors = [
            "#4caf50", "#f44336", "#2196f3", "#ff9800", "#9c27b0",
            "#00bcd4", "#ff5722", "#607d8b", "#795548", "#cddc39", "#e91e63",
        ]
        return base_colors[:count] if count <= len(base_colors) else base_colors * (count // len(base_colors) + 1)

    # ==================== 导入导出 ====================
    def _import_csv(self):
        filepath = filedialog.askopenfilename(
            title="选择CSV文件",
            filetypes=[("CSV文件", "*.csv"), ("所有文件", "*.*")],
        )
        if not filepath:
            return

        records = []
        try:
            with open(filepath, "r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    record = {}
                    for key in ["record_type", "amount", "date", "category", "note"]:
                        record[key] = row.get(key, row.get(key.strip(), ""))
                    records.append(record)
        except Exception as e:
            messagebox.showerror("导入失败", f"读取文件失败：{e}")
            return

        if not records:
            messagebox.showwarning("提示", "文件中没有数据！")
            return

        success, fail = db.import_records(records)
        messagebox.showinfo("导入完成", f"成功导入 {success} 条记录\n失败 {fail} 条")
        self._refresh_add_summary()

    def _export_csv(self):
        filepath = filedialog.asksaveasfilename(
            title="导出CSV文件",
            defaultextension=".csv",
            filetypes=[("CSV文件", "*.csv")],
            initialfile=f"账本导出_{date.today().strftime('%Y%m%d')}.csv",
        )
        if not filepath:
            return

        export_dialog = tk.Toplevel(self.root)
        export_dialog.title("导出选项")
        export_dialog.geometry("300x200")
        export_dialog.resizable(False, False)
        export_dialog.transient(self.root)
        export_dialog.grab_set()

        frame = ttk.Frame(export_dialog, padding=15)
        frame.pack(fill=tk.BOTH, expand=True)

        ttk.Label(frame, text="导出范围：", style="Header.TLabel").pack(anchor=tk.W, pady=5)
        export_type_var = tk.StringVar(value="全部")
        ttk.Radiobutton(frame, text="全部记录", variable=export_type_var, value="全部").pack(anchor=tk.W, padx=20)
        ttk.Radiobutton(frame, text="仅收入", variable=export_type_var, value="收入").pack(anchor=tk.W, padx=20)
        ttk.Radiobutton(frame, text="仅支出", variable=export_type_var, value="支出").pack(anchor=tk.W, padx=20)

        date_frame = ttk.Frame(frame)
        date_frame.pack(fill=tk.X, pady=5)
        ttk.Label(date_frame, text="日期范围：").pack(side=tk.LEFT)
        export_start_picker = DatePicker(date_frame, initial_date="", compact=True, allow_empty=True)
        export_start_picker.pack(side=tk.LEFT, padx=2)
        ttk.Label(date_frame, text="至").pack(side=tk.LEFT)
        export_end_picker = DatePicker(date_frame, initial_date="", compact=True, allow_empty=True)
        export_end_picker.pack(side=tk.LEFT, padx=2)

        def do_export():
            record_type = export_type_var.get()
            if record_type == "全部":
                record_type = None
            start_date = export_start_picker.get_date().strip() or None
            end_date = export_end_picker.get_date().strip() or None

            records = db.get_all_records_for_export(record_type, start_date, end_date)
            if not records:
                messagebox.showwarning("提示", "没有符合条件的记录！")
                export_dialog.destroy()
                return

            try:
                with open(filepath, "w", encoding="utf-8-sig", newline="") as f:
                    writer = csv.DictWriter(f, fieldnames=["id", "record_type", "amount", "date", "category", "note"])
                    writer.writeheader()
                    writer.writerows(records)
                messagebox.showinfo("导出成功", f"已导出 {len(records)} 条记录到：\n{filepath}")
            except Exception as e:
                messagebox.showerror("导出失败", f"写入文件失败：{e}")
            export_dialog.destroy()

        ttk.Button(frame, text="导出", command=do_export, width=10).pack(pady=10)

    # ==================== 关于 ====================
    def _show_about(self):
        messagebox.showinfo(
            "关于家庭账本",
            "家庭账本 v1.0\n\n"
            "一款简洁实用的家庭收支管理工具\n\n"
            "功能：新增、查询、编辑、删除收支记录\n"
            "      月度/年度统计报表\n"
            "      CSV导入导出\n\n"
            "技术栈：Python + SQLite + Tkinter",
        )
