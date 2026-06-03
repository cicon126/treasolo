import os
import json
import shutil
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, simpledialog
from PIL import Image, ImageTk
import uuid


class PhotoAlbumApp:
    def __init__(self, root):
        self.root = root
        self.root.title("电子相册")
        self.root.geometry("1000x700")
        self.root.minsize(800, 600)

        self.base_dir = os.path.join(os.path.expanduser("~"), "PhotoAlbum")
        self.photos_dir = os.path.join(self.base_dir, "photos")
        self.data_file = os.path.join(self.base_dir, "album_data.json")

        self.ensure_directories()
        self.load_data()

        self.current_category = None
        self.thumbnails = []
        self.preview_images = []

        self.setup_ui()
        self.load_categories()

    def ensure_directories(self):
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir)
        if not os.path.exists(self.photos_dir):
            os.makedirs(self.photos_dir)

    def load_data(self):
        if os.path.exists(self.data_file):
            with open(self.data_file, "r", encoding="utf-8") as f:
                self.data = json.load(f)
        else:
            self.data = {"categories": []}
            self.save_data()

    def save_data(self):
        with open(self.data_file, "w", encoding="utf-8") as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

    def setup_ui(self):
        main_paned = ttk.PanedWindow(self.root, orient=tk.HORIZONTAL)
        main_paned.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        left_frame = ttk.Frame(main_paned, width=200)
        main_paned.add(left_frame, weight=1)

        ttk.Label(left_frame, text="相册分类", font=("Arial", 12, "bold")).pack(pady=(0, 10))

        btn_frame = ttk.Frame(left_frame)
        btn_frame.pack(fill=tk.X, pady=5)
        ttk.Button(btn_frame, text="新建分类", command=self.create_category).pack(side=tk.LEFT, padx=2, expand=True, fill=tk.X)
        ttk.Button(btn_frame, text="编辑分类", command=self.rename_category).pack(side=tk.LEFT, padx=2, expand=True, fill=tk.X)
        ttk.Button(btn_frame, text="删除分类", command=self.delete_category).pack(side=tk.LEFT, padx=2, expand=True, fill=tk.X)

        self.category_listbox = tk.Listbox(left_frame, font=("Arial", 10))
        self.category_listbox.pack(fill=tk.BOTH, expand=True, pady=5)
        self.category_listbox.bind("<<ListboxSelect>>", self.on_category_select)

        right_frame = ttk.Frame(main_paned)
        main_paned.add(right_frame, weight=4)

        top_bar = ttk.Frame(right_frame)
        top_bar.pack(fill=tk.X, pady=(0, 10))

        self.category_title = ttk.Label(top_bar, text="请选择或创建一个分类", font=("Arial", 14, "bold"))
        self.category_title.pack(side=tk.LEFT)

        btn_bar = ttk.Frame(top_bar)
        btn_bar.pack(side=tk.RIGHT)
        ttk.Button(btn_bar, text="上传照片", command=self.upload_photos).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_bar, text="删除照片", command=self.delete_photo).pack(side=tk.LEFT, padx=5)

        self.canvas = tk.Canvas(right_frame, bg="white")
        self.scrollbar = ttk.Scrollbar(right_frame, orient=tk.VERTICAL, command=self.canvas.yview)
        self.thumbnails_frame = ttk.Frame(self.canvas)

        self.thumbnails_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )

        self.canvas.create_window((0, 0), window=self.thumbnails_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=self.scrollbar.set)

        self.canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        self.canvas.bind("<Configure>", self.on_canvas_configure)

        self.status_var = tk.StringVar()
        self.status_var.set("就绪")
        status_bar = ttk.Label(self.root, textvariable=self.status_var, relief=tk.SUNKEN, anchor=tk.W)
        status_bar.pack(side=tk.BOTTOM, fill=tk.X)

        self.root.bind("<Configure>", self.on_window_resize)

    def on_window_resize(self, event):
        if event.widget == self.root:
            self.root.after(100, self.refresh_thumbnails)

    def on_canvas_configure(self, event):
        self.refresh_thumbnails()

    def load_categories(self):
        self.category_listbox.delete(0, tk.END)
        for cat in self.data["categories"]:
            self.category_listbox.insert(tk.END, f"{cat['name']} ({len(cat['photos'])})")

    def create_category(self):
        name = simpledialog.askstring("新建分类", "请输入分类名称:", parent=self.root)
        if name:
            name = name.strip()
            if not name:
                messagebox.showwarning("提示", "分类名称不能为空！")
                return
            for cat in self.data["categories"]:
                if cat["name"] == name:
                    messagebox.showwarning("提示", "该分类已存在！")
                    return
            self.data["categories"].append({"name": name, "photos": []})
            self.save_data()
            self.load_categories()
            self.status_var.set(f"已创建分类: {name}")

    def rename_category(self):
        selection = self.category_listbox.curselection()
        if not selection:
            messagebox.showwarning("提示", "请先选择要编辑的分类！")
            return
        index = selection[0]
        category = self.data["categories"][index]
        new_name = simpledialog.askstring(
            "编辑分类",
            f"请输入新的分类名称:",
            initialvalue=category["name"],
            parent=self.root
        )
        if new_name:
            new_name = new_name.strip()
            if not new_name:
                messagebox.showwarning("提示", "分类名称不能为空！")
                return
            if new_name == category["name"]:
                return
            for cat in self.data["categories"]:
                if cat["name"] == new_name:
                    messagebox.showwarning("提示", "该分类名已存在！")
                    return
            old_name = category["name"]
            category["name"] = new_name
            self.save_data()
            self.load_categories()
            self.category_listbox.selection_set(index)
            self.current_category = category
            self.category_title.config(text=f"{category['name']} ({len(category['photos'])} 张照片)")
            self.status_var.set(f"分类 '{old_name}' 已重命名为 '{new_name}'")

    def delete_category(self):
        selection = self.category_listbox.curselection()
        if not selection:
            messagebox.showwarning("提示", "请先选择要删除的分类！")
            return
        index = selection[0]
        category = self.data["categories"][index]
        if messagebox.askyesno("确认删除", f"确定要删除分类 '{category['name']}' 吗？\n该分类下的所有照片也会被删除！"):
            for photo in category["photos"]:
                photo_path = os.path.join(self.photos_dir, photo["filename"])
                if os.path.exists(photo_path):
                    os.remove(photo_path)
            del self.data["categories"][index]
            self.save_data()
            self.current_category = None
            self.category_title.config(text="请选择或创建一个分类")
            self.load_categories()
            self.clear_thumbnails()
            self.status_var.set("分类已删除")

    def on_category_select(self, event):
        selection = self.category_listbox.curselection()
        if selection:
            index = selection[0]
            self.current_category = self.data["categories"][index]
            self.category_title.config(text=f"{self.current_category['name']} ({len(self.current_category['photos'])} 张照片)")
            self.refresh_thumbnails()
            self.status_var.set(f"已选择分类: {self.current_category['name']}")

    def upload_photos(self):
        if not self.current_category:
            messagebox.showwarning("提示", "请先选择一个分类！")
            return
        file_paths = filedialog.askopenfilenames(
            title="选择照片",
            filetypes=[("Image Files", "*.jpg *.jpeg *.png *.gif *.bmp *.tiff"), ("All Files", "*.*")]
        )
        if not file_paths:
            return
        count = 0
        for file_path in file_paths:
            try:
                ext = os.path.splitext(file_path)[1].lower()
                new_filename = f"{uuid.uuid4().hex}{ext}"
                dest_path = os.path.join(self.photos_dir, new_filename)
                shutil.copy2(file_path, dest_path)
                with Image.open(file_path) as img:
                    width, height = img.size
                self.current_category["photos"].append({
                    "id": uuid.uuid4().hex,
                    "filename": new_filename,
                    "original_name": os.path.basename(file_path),
                    "width": width,
                    "height": height
                })
                count += 1
            except Exception as e:
                messagebox.showerror("错误", f"上传 {os.path.basename(file_path)} 失败: {str(e)}")
        if count > 0:
            self.save_data()
            self.load_categories()
            self.category_title.config(text=f"{self.current_category['name']} ({len(self.current_category['photos'])} 张照片)")
            self.refresh_thumbnails()
            self.status_var.set(f"已上传 {count} 张照片")

    def _do_delete_photo(self, photo):
        if not self.current_category:
            return
        photos = self.current_category["photos"]
        photo_index = None
        for i, p in enumerate(photos):
            if p["id"] == photo["id"]:
                photo_index = i
                break
        if photo_index is not None:
            photo_path = os.path.join(self.photos_dir, photos[photo_index]["filename"])
            if os.path.exists(photo_path):
                os.remove(photo_path)
            del photos[photo_index]
            self.save_data()
            self.load_categories()
            if self.current_category and self.current_category in self.data["categories"]:
                idx = self.data["categories"].index(self.current_category)
                self.category_listbox.selection_set(idx)
            self.category_title.config(text=f"{self.current_category['name']} ({len(self.current_category['photos'])} 张照片)")
            self.selected_photo_id = None
            self.refresh_thumbnails()
            self.status_var.set("照片已删除")

    def delete_photo(self):
        if not self.current_category:
            messagebox.showwarning("提示", "请先选择一个分类！")
            return
        if not hasattr(self, 'selected_photo_id') or not self.selected_photo_id:
            messagebox.showwarning("提示", "请先选择要删除的照片！")
            return
        photos = self.current_category["photos"]
        photo = None
        for p in photos:
            if p["id"] == self.selected_photo_id:
                photo = p
                break
        if photo and messagebox.askyesno("确认删除", f"确定要删除照片 '{photo['original_name']}' 吗？"):
            self._do_delete_photo(photo)

    def clear_thumbnails(self):
        for widget in self.thumbnails_frame.winfo_children():
            widget.destroy()
        self.thumbnails = []
        self.preview_images = []

    def refresh_thumbnails(self):
        self.clear_thumbnails()
        if not self.current_category or not self.current_category["photos"]:
            return
        photos = self.current_category["photos"]
        canvas_width = self.canvas.winfo_width()
        if canvas_width < 200:
            canvas_width = 700
        thumb_size = 180
        padding = 15
        cols = max(1, (canvas_width - padding) // (thumb_size + padding))
        for i, photo in enumerate(photos):
            row = i // cols
            col = i % cols
            frame = tk.Frame(self.thumbnails_frame, bg="white", padx=5, pady=5)
            frame.grid(row=row, column=col, padx=padding // 2, pady=padding // 2)
            try:
                img_path = os.path.join(self.photos_dir, photo["filename"])
                img = Image.open(img_path)
                img.thumbnail((thumb_size, thumb_size), Image.LANCZOS)
                photo_image = ImageTk.PhotoImage(img)
                self.thumbnails.append(photo_image)
                lbl = tk.Label(frame, image=photo_image, bg="white", cursor="hand2")
                lbl.pack()
                lbl.bind("<Button-1>", lambda e, p=photo: self.preview_photo(p))
                lbl.bind("<Button-3>", lambda e, p=photo: self.select_photo(p, frame))
                name_label = tk.Label(frame, text=photo["original_name"], bg="white", font=("Arial", 8), wraplength=thumb_size)
                name_label.pack()
            except Exception as e:
                tk.Label(frame, text="加载失败", bg="white", fg="red", width=20, height=10).pack()
                tk.Label(frame, text=photo["original_name"], bg="white", font=("Arial", 8), wraplength=thumb_size).pack()

    def select_photo(self, photo, frame):
        self.selected_photo_id = photo["id"]
        for widget in self.thumbnails_frame.winfo_children():
            widget.configure(bg="white")
        frame.configure(bg="#4A90E2")
        for child in frame.winfo_children():
            if isinstance(child, tk.Label):
                child.configure(bg="#4A90E2")
        self.status_var.set(f"已选择: {photo['original_name']}")

    def preview_photo(self, photo):
        preview_window = tk.Toplevel(self.root)
        preview_window.title(f"预览 - {photo['original_name']}")
        preview_window.geometry("900x700")
        preview_window.minsize(400, 300)
        img_path = os.path.join(self.photos_dir, photo["filename"])
        img = Image.open(img_path)
        screen_width = preview_window.winfo_screenwidth()
        screen_height = preview_window.winfo_screenheight()
        max_width = min(screen_width - 100, 900)
        max_height = min(screen_height - 100, 700)
        ratio = min(max_width / img.width, max_height / img.height)
        new_width = int(img.width * ratio)
        new_height = int(img.height * ratio)
        img = img.resize((new_width, new_height), Image.LANCZOS)
        photo_image = ImageTk.PhotoImage(img)
        self.preview_images.append(photo_image)
        canvas = tk.Canvas(preview_window, width=new_width, height=new_height, bg="black")
        canvas.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        canvas.create_image(new_width // 2, new_height // 2, image=photo_image)
        info_frame = ttk.Frame(preview_window)
        info_frame.pack(fill=tk.X, padx=10, pady=(0, 10))
        ttk.Label(info_frame, text=f"文件名: {photo['original_name']}").pack(anchor=tk.W)
        ttk.Label(info_frame, text=f"原始尺寸: {photo['width']} x {photo['height']}").pack(anchor=tk.W)
        ttk.Label(info_frame, text=f"显示尺寸: {new_width} x {new_height}").pack(anchor=tk.W)
        btn_frame = ttk.Frame(preview_window)
        btn_frame.pack(fill=tk.X, padx=10, pady=(0, 10))

        def delete_from_preview():
            if messagebox.askyesno("确认删除", f"确定要删除照片 '{photo['original_name']}' 吗？", parent=preview_window):
                self._do_delete_photo(photo)
                preview_window.destroy()

        ttk.Button(btn_frame, text="删除照片", command=delete_from_preview).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="关闭", command=preview_window.destroy).pack(side=tk.RIGHT)
        preview_window.bind("<Escape>", lambda e: preview_window.destroy())

        def on_resize(event):
            try:
                original_img = Image.open(img_path)
                w = event.width - 20
                h = event.height - 120
                if w > 50 and h > 50:
                    ratio = min(w / original_img.width, h / original_img.height)
                    nw = int(original_img.width * ratio)
                    nh = int(original_img.height * ratio)
                    resized = original_img.resize((nw, nh), Image.LANCZOS)
                    new_img = ImageTk.PhotoImage(resized)
                    self.preview_images[-1] = new_img
                    canvas.delete("all")
                    canvas.configure(width=nw, height=nh)
                    canvas.create_image(nw // 2, nh // 2, image=new_img)
            except Exception:
                pass

        preview_window.bind("<Configure>", on_resize)


def main():
    root = tk.Tk()
    try:
        style = ttk.Style()
        if "vista" in style.theme_names():
            style.theme_use("vista")
        elif "clam" in style.theme_names():
            style.theme_use("clam")
    except Exception:
        pass
    app = PhotoAlbumApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
