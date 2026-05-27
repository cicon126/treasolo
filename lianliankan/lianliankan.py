import tkinter as tk
from tkinter import messagebox
import random
from PIL import Image, ImageDraw, ImageFont, ImageTk

ANIMALS = [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
    "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔",
    "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺"
]

PLANTS = [
    "🌵", "🎄", "🌲", "🌳", "🌴", "🌱", "🌿", "☘️",
    "🍀", "🎍", "🎋", "🍃", "🌾", "🌺", "🌻", "🌹",
    "🌷", "🌸", "💐", "🍄", "🌼", "🌞", "🌈", "🍎"
]

ALL_ICONS = ANIMALS + PLANTS

DIFFICULTY_CONFIG = {
    "简单": {"rows": 4, "cols": 6, "icon_count": 6},
    "中等": {"rows": 6, "cols": 8, "icon_count": 12},
    "困难": {"rows": 8, "cols": 10, "icon_count": 20},
}

TILE_SIZE = 60
PADDING = 40
TOP_BAR_HEIGHT = 70


def create_emoji_image(emoji, size=48):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("seguiemj.ttf", size - 8)
    except:
        try:
            font = ImageFont.truetype("C:/Windows/Fonts/seguiemj.ttf", size - 8)
        except:
            font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), emoji, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) // 2 - bbox[0]
    y = (size - text_height) // 2 - bbox[1]
    
    if hasattr(draw, "text"):
        try:
            draw.text((x, y), emoji, font=font, embedded_color=True)
        except:
            draw.text((x, y), emoji, font=font, fill=(0, 0, 0, 255))
    else:
        draw.text((x, y), emoji, font=font, fill=(0, 0, 0, 255))
    
    return img


class LianliankanGame:
    def __init__(self, root):
        self.root = root
        self.root.title("连连看 - 动物植物篇")
        self.root.configure(bg="#2c3e50")

        self.difficulty = "简单"
        self.score = 0
        self.board = []
        self.rows = 0
        self.cols = 0
        self.selected = None
        self.game_over = False
        self.icon_images = {}
        self.tile_images = {}

        self.top_frame = tk.Frame(root, bg="#34495e", height=TOP_BAR_HEIGHT)
        self.top_frame.pack(fill=tk.X, side=tk.TOP)

        self.score_label = tk.Label(
            self.top_frame,
            text="积分: 0",
            font=("Microsoft YaHei", 18, "bold"),
            fg="#f1c40f",
            bg="#34495e"
        )
        self.score_label.pack(side=tk.LEFT, padx=20, pady=10)

        self.difficulty_label = tk.Label(
            self.top_frame,
            text=f"难度: {self.difficulty}",
            font=("Microsoft YaHei", 14),
            fg="#ecf0f1",
            bg="#34495e"
        )
        self.difficulty_label.pack(side=tk.LEFT, padx=10, pady=10)

        self.new_game_btn = tk.Button(
            self.top_frame,
            text="新游戏",
            font=("Microsoft YaHei", 12, "bold"),
            bg="#27ae60",
            fg="white",
            activebackground="#2ecc71",
            activeforeground="white",
            relief=tk.FLAT,
            padx=15,
            pady=5,
            cursor="hand2",
            command=self.new_game
        )
        self.new_game_btn.pack(side=tk.RIGHT, padx=10, pady=10)

        diff_frame = tk.Frame(self.top_frame, bg="#34495e")
        diff_frame.pack(side=tk.RIGHT, padx=10)

        for d in ["简单", "中等", "困难"]:
            btn = tk.Button(
                diff_frame,
                text=d,
                font=("Microsoft YaHei", 10),
                bg="#3498db" if d == "简单" else "#95a5a6",
                fg="white",
                activebackground="#3498db",
                activeforeground="white",
                relief=tk.FLAT,
                padx=10,
                pady=3,
                cursor="hand2",
                command=lambda d=d: self.set_difficulty(d)
            )
            btn.pack(side=tk.LEFT, padx=2)

        canvas_width = DIFFICULTY_CONFIG["困难"]["cols"] * TILE_SIZE + PADDING * 2
        canvas_height = DIFFICULTY_CONFIG["困难"]["rows"] * TILE_SIZE + PADDING * 2

        self.canvas = tk.Canvas(
            root,
            width=canvas_width,
            height=canvas_height,
            bg="#2c3e50",
            highlightthickness=0
        )
        self.canvas.pack(pady=10)

        self.canvas.bind("<Button-1>", self.on_click)

        self.root.update_idletasks()
        self.new_game()

    def set_difficulty(self, difficulty):
        self.difficulty = difficulty
        self.difficulty_label.config(text=f"难度: {difficulty}")
        for child in self.top_frame.winfo_children():
            if isinstance(child, tk.Frame):
                for btn in child.winfo_children():
                    if isinstance(btn, tk.Button):
                        if btn.cget("text") == difficulty:
                            btn.config(bg="#3498db")
                        else:
                            btn.config(bg="#95a5a6")
        self.new_game()

    def new_game(self):
        config = DIFFICULTY_CONFIG[self.difficulty]
        self.rows = config["rows"]
        self.cols = config["cols"]
        self.icon_count = config["icon_count"]
        self.score = 0
        self.selected = None
        self.game_over = False
        self.update_score()

        icons = ALL_ICONS[:self.icon_count]
        self.icon_images = {}
        for icon in icons:
            img = create_emoji_image(icon, TILE_SIZE - 12)
            self.icon_images[icon] = ImageTk.PhotoImage(img)

        total_tiles = self.rows * self.cols
        pairs_needed = total_tiles // 2

        tile_icons = []
        for _ in range(pairs_needed):
            icon = icons[_ % len(icons)]
            tile_icons.extend([icon, icon])

        random.shuffle(tile_icons)

        self.board = []
        idx = 0
        for r in range(self.rows):
            row = []
            for c in range(self.cols):
                row.append(tile_icons[idx])
                idx += 1
            self.board.append(row)

        self.tile_images = {}
        self.draw_board()

    def update_score(self):
        self.score_label.config(text=f"积分: {self.score}")

    def draw_board(self):
        self.canvas.delete("all")
        self.tile_images = {}

        board_width = self.cols * TILE_SIZE
        board_height = self.rows * TILE_SIZE
        canvas_width = self.canvas.winfo_width()
        canvas_height = self.canvas.winfo_height()

        if canvas_width <= 1:
            canvas_width = DIFFICULTY_CONFIG["困难"]["cols"] * TILE_SIZE + PADDING * 2
        if canvas_height <= 1:
            canvas_height = DIFFICULTY_CONFIG["困难"]["rows"] * TILE_SIZE + PADDING * 2

        offset_x = (canvas_width - board_width) // 2
        offset_y = (canvas_height - board_height) // 2

        if offset_x <= 0:
            offset_x = PADDING
        if offset_y <= 0:
            offset_y = PADDING

        self.offset_x = offset_x
        self.offset_y = offset_y

        for r in range(self.rows):
            for c in range(self.cols):
                icon = self.board[r][c]
                if icon is not None:
                    x1 = offset_x + c * TILE_SIZE
                    y1 = offset_y + r * TILE_SIZE
                    x2 = x1 + TILE_SIZE
                    y2 = y1 + TILE_SIZE

                    rect_id = self.canvas.create_rectangle(
                        x1, y1, x2, y2,
                        fill="#ecf0f1",
                        outline="#bdc3c7",
                        width=2,
                        tags=f"tile_{r}_{c}"
                    )

                    if icon in self.icon_images:
                        img_id = self.canvas.create_image(
                            x1 + TILE_SIZE // 2,
                            y1 + TILE_SIZE // 2,
                            image=self.icon_images[icon],
                            tags=f"tile_{r}_{c}"
                        )
                        self.tile_images[(r, c)] = img_id

    def get_tile_center(self, r, c):
        x = self.offset_x + c * TILE_SIZE + TILE_SIZE // 2
        y = self.offset_y + r * TILE_SIZE + TILE_SIZE // 2
        return x, y

    def on_click(self, event):
        if self.game_over:
            return

        x = event.x
        y = event.y

        r = (y - self.offset_y) // TILE_SIZE
        c = (x - self.offset_x) // TILE_SIZE

        if 0 <= r < self.rows and 0 <= c < self.cols:
            if self.board[r][c] is not None:
                self.handle_click(r, c)

    def handle_click(self, r, c):
        if self.selected is None:
            self.selected = (r, c)
            self.highlight_tile(r, c, "#f39c12")
        else:
            sr, sc = self.selected

            if (sr, sc) == (r, c):
                self.highlight_tile(sr, sc, "#ecf0f1")
                self.selected = None
                return

            if self.board[sr][sc] == self.board[r][c]:
                path = self.find_path(sr, sc, r, c)
                if path is not None:
                    self.draw_path(path)
                    self.root.after(300, lambda: self.eliminate(sr, sc, r, c))
                else:
                    self.flash_tile(sr, sc, "#e74c3c")
                    self.flash_tile(r, c, "#e74c3c")
                    self.root.after(300, lambda: self.highlight_tile(sr, sc, "#ecf0f1"))
                    self.root.after(300, lambda: self.highlight_tile(r, c, "#ecf0f1"))
                    self.selected = None
            else:
                self.flash_tile(sr, sc, "#e74c3c")
                self.flash_tile(r, c, "#e74c3c")
                self.root.after(300, lambda: self.highlight_tile(sr, sc, "#ecf0f1"))
                self.root.after(300, lambda: self.highlight_tile(r, c, "#ecf0f1"))
                self.selected = None

    def highlight_tile(self, r, c, color):
        tag = f"tile_{r}_{c}"
        items = self.canvas.find_withtag(tag)
        for item in items:
            if self.canvas.type(item) == "rectangle":
                self.canvas.itemconfig(item, fill=color)

    def flash_tile(self, r, c, color):
        tag = f"tile_{r}_{c}"
        items = self.canvas.find_withtag(tag)
        for item in items:
            if self.canvas.type(item) == "rectangle":
                self.canvas.itemconfig(item, fill=color)

    def draw_path(self, path):
        self.canvas.delete("path")
        points = []
        for r, c in path:
            x, y = self.get_tile_center(r, c)
            points.extend([x, y])
        if len(points) >= 4:
            self.canvas.create_line(
                *points,
                fill="#e67e22",
                width=4,
                capstyle=tk.ROUND,
                joinstyle=tk.ROUND,
                tags="path",
                smooth=False
            )

    def eliminate(self, r1, c1, r2, c2):
        self.canvas.delete("path")
        self.canvas.delete(f"tile_{r1}_{c1}")
        self.canvas.delete(f"tile_{r2}_{c2}")
        self.board[r1][c1] = None
        self.board[r2][c2] = None
        if (r1, c1) in self.tile_images:
            del self.tile_images[(r1, c1)]
        if (r2, c2) in self.tile_images:
            del self.tile_images[(r2, c2)]
        self.selected = None
        self.score += 1
        self.update_score()

        if self.is_game_over():
            self.game_over = True
            self.root.after(100, self.show_win_message)

    def is_game_over(self):
        for r in range(self.rows):
            for c in range(self.cols):
                if self.board[r][c] is not None:
                    return False
        return True

    def show_win_message(self):
        result = messagebox.askyesno(
            "恭喜通关！",
            f"🎉 恭喜你完成了 {self.difficulty} 难度！\n最终积分: {self.score}\n\n是否开始新游戏？"
        )
        if result:
            self.new_game()

    def is_blocked(self, r, c, exclude=None):
        if r < -1 or r > self.rows or c < -1 or c > self.cols:
            return True
        if r == -1 or r == self.rows or c == -1 or c == self.cols:
            return False
        if exclude and (r, c) in exclude:
            return False
        return self.board[r][c] is not None

    def find_path(self, r1, c1, r2, c2):
        if r1 == r2 and c1 == c2:
            return None

        if self.is_straight_line(r1, c1, r2, c2):
            return [(r1, c1), (r2, c2)]

        result = self.check_one_turn(r1, c1, r2, c2)
        if result:
            return result

        result = self.check_two_turns(r1, c1, r2, c2)
        if result:
            return result

        return None

    def is_straight_line(self, r1, c1, r2, c2):
        if r1 == r2:
            min_c, max_c = min(c1, c2), max(c1, c2)
            for c in range(min_c + 1, max_c):
                if self.board[r1][c] is not None:
                    return False
            return True
        if c1 == c2:
            min_r, max_r = min(r1, r2), max(r1, r2)
            for r in range(min_r + 1, max_r):
                if self.board[r][c1] is not None:
                    return False
            return True
        return False

    def can_straight_connect(self, r1, c1, r2, c2):
        if not (-1 <= r1 <= self.rows and -1 <= c1 <= self.cols):
            return False
        if not (-1 <= r2 <= self.rows and -1 <= c2 <= self.cols):
            return False

        if r1 == r2:
            min_c, max_c = min(c1, c2), max(c1, c2)
            for c in range(min_c + 1, max_c):
                if 0 <= r1 < self.rows and 0 <= c < self.cols:
                    if self.board[r1][c] is not None:
                        return False
            return True
        if c1 == c2:
            min_r, max_r = min(r1, r2), max(r1, r2)
            for r in range(min_r + 1, max_r):
                if 0 <= r < self.rows and 0 <= c1 < self.cols:
                    if self.board[r][c1] is not None:
                        return False
            return True
        return False

    def check_one_turn(self, r1, c1, r2, c2):
        corner1 = (r1, c2)
        corner2 = (r2, c1)

        if self.is_empty(corner1[0], corner1[1]):
            if self.can_straight_connect(r1, c1, corner1[0], corner1[1]) and \
               self.can_straight_connect(corner1[0], corner1[1], r2, c2):
                return [(r1, c1), corner1, (r2, c2)]

        if self.is_empty(corner2[0], corner2[1]):
            if self.can_straight_connect(r1, c1, corner2[0], corner2[1]) and \
               self.can_straight_connect(corner2[0], corner2[1], r2, c2):
                return [(r1, c1), corner2, (r2, c2)]

        return None

    def check_two_turns(self, r1, c1, r2, c2):
        for c in range(-1, self.cols + 1):
            if c == c1 or c == c2:
                continue
            if self.is_empty(r1, c) and self.is_empty(r2, c):
                if self.can_straight_connect(r1, c1, r1, c) and \
                   self.can_straight_connect(r1, c, r2, c) and \
                   self.can_straight_connect(r2, c, r2, c2):
                    return [(r1, c1), (r1, c), (r2, c), (r2, c2)]

        for r in range(-1, self.rows + 1):
            if r == r1 or r == r2:
                continue
            if self.is_empty(r, c1) and self.is_empty(r, c2):
                if self.can_straight_connect(r1, c1, r, c1) and \
                   self.can_straight_connect(r, c1, r, c2) and \
                   self.can_straight_connect(r, c2, r2, c2):
                    return [(r1, c1), (r, c1), (r, c2), (r2, c2)]

        return None

    def is_empty(self, r, c):
        if r < 0 or r >= self.rows or c < 0 or c >= self.cols:
            return True
        return self.board[r][c] is None


def main():
    root = tk.Tk()
    root.resizable(False, False)
    game = LianliankanGame(root)
    root.mainloop()


if __name__ == "__main__":
    main()