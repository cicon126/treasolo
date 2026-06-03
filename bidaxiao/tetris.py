import pygame
import random
import json
import os
import sys

CELL_SIZE = 36
COLS = 10
ROWS = 20
SIDEBAR_WIDTH = 220
BOARD_WIDTH = COLS * CELL_SIZE
BOARD_HEIGHT = ROWS * CELL_SIZE
WINDOW_WIDTH = BOARD_WIDTH + SIDEBAR_WIDTH + 40
WINDOW_HEIGHT = BOARD_HEIGHT + 40
BOARD_X = 20
BOARD_Y = 20

BG_COLOR = (30, 30, 46)
BOARD_BG = (24, 24, 37)
GRID_COLOR = (45, 45, 60)
SIDEBAR_BG = (30, 30, 46)
TEXT_COLOR = (205, 214, 244)
ACCENT_COLOR = (137, 180, 250)
SCORE_COLOR = (166, 227, 161)
HIGH_SCORE_COLOR = (249, 226, 175)
LABEL_COLOR = (147, 153, 178)
BORDER_COLOR = (88, 91, 112)
GAME_OVER_OVERLAY = (0, 0, 0, 160)
PREVIEW_BG = (40, 40, 60)

SHAPES = {
    "I": [[1, 1, 1, 1]],
    "O": [[1, 1], [1, 1]],
    "T": [[0, 1, 0], [1, 1, 1]],
    "S": [[0, 1, 1], [1, 1, 0]],
    "Z": [[1, 1, 0], [0, 1, 1]],
    "J": [[1, 0, 0], [1, 1, 1]],
    "L": [[0, 0, 1], [1, 1, 1]],
}

SHAPE_COLORS = {
    "I": (137, 220, 235),
    "O": (249, 226, 175),
    "T": (203, 166, 247),
    "S": (166, 227, 161),
    "Z": (243, 139, 168),
    "J": (137, 180, 250),
    "L": (250, 179, 135),
}

SHAPE_SHADOW_COLORS = {
    "I": (90, 170, 190),
    "O": (200, 180, 130),
    "T": (160, 120, 200),
    "S": (120, 180, 120),
    "Z": (200, 100, 130),
    "J": (90, 130, 200),
    "L": (200, 130, 90),
}

SCORE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tetris_highscore.json")

SCORE_TABLE = {1: 100, 2: 300, 3: 500, 4: 800}


def load_high_score():
    try:
        if os.path.exists(SCORE_FILE):
            with open(SCORE_FILE, "r") as f:
                data = json.load(f)
                return data.get("high_score", 0)
    except (json.JSONDecodeError, IOError):
        pass
    return 0


def save_high_score(score):
    try:
        with open(SCORE_FILE, "w") as f:
            json.dump({"high_score": score}, f)
    except IOError:
        pass


class Piece:
    def __init__(self, shape_name):
        self.shape_name = shape_name
        self.shape = [row[:] for row in SHAPES[shape_name]]
        self.color = SHAPE_COLORS[shape_name]
        self.shadow_color = SHAPE_SHADOW_COLORS[shape_name]
        self.x = COLS // 2 - len(self.shape[0]) // 2
        self.y = 0

    def rotate(self):
        rows = len(self.shape)
        cols = len(self.shape[0])
        rotated = [[self.shape[rows - 1 - r][c] for r in range(rows)] for c in range(cols)]
        return rotated


class Tetris:
    def __init__(self):
        pygame.init()
        pygame.mixer.init()
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption("俄罗斯方块 - Tetris")
        self.clock = pygame.time.Clock()
        self.font_large = self._load_font(36, bold=True)
        self.font_medium = self._load_font(22)
        self.font_small = self._load_font(16)
        self.font_score = self._load_font(28, bold=True)
        self.font_label = self._load_font(15)
        self.sounds = self._load_sounds()
        self.reset_game()

    def _load_font(self, size, bold=False):
        font_dir = os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts")
        font_candidates = [
            ("msyhbd.ttc", "msyh.ttc"),
            ("msyh.ttc",),
            ("simhei.ttf",),
            ("simkai.ttf",),
            ("simsun.ttc",),
            ("simsunb.ttf",),
        ]
        for candidates in font_candidates:
            for font_file in candidates:
                font_path = os.path.join(font_dir, font_file)
                if os.path.exists(font_path):
                    try:
                        font = pygame.font.Font(font_path, size)
                        if bold and (font_file == "msyh.ttc" or font_file == "msyhbd.ttc"):
                            try:
                                bold_path = os.path.join(font_dir, "msyhbd.ttc")
                                if os.path.exists(bold_path):
                                    font = pygame.font.Font(bold_path, size)
                            except Exception:
                                pass
                        test_surface = font.render("测试", True, (255, 255, 255))
                        if test_surface.get_width() > 0:
                            return font
                    except Exception:
                        continue
        default_font = pygame.font.get_default_font()
        return pygame.font.Font(default_font, size)

    def _load_sounds(self):
        sounds = {}
        try:
            sample_rate = 44100
            clear_sound = pygame.mixer.Sound(buffer=self._generate_square_wave(sample_rate, 523.25, 0.1))
            clear_sound.set_volume(0.3)
            sounds["clear"] = clear_sound
            
            drop_sound = pygame.mixer.Sound(buffer=self._generate_square_wave(sample_rate, 261.63, 0.05))
            drop_sound.set_volume(0.2)
            sounds["drop"] = drop_sound
            
            game_over_sound = pygame.mixer.Sound(buffer=self._generate_square_wave(sample_rate, 196.00, 0.3))
            game_over_sound.set_volume(0.4)
            sounds["game_over"] = game_over_sound
        except Exception:
            pass
        return sounds

    def _generate_square_wave(self, sample_rate, frequency, duration):
        import array
        import math
        num_samples = int(sample_rate * duration)
        buf = array.array('h', [0] * num_samples)
        max_amplitude = 2**15 - 1
        for i in range(num_samples):
            t = i / sample_rate
            if math.sin(2 * math.pi * frequency * t) >= 0:
                buf[i] = max_amplitude // 2
            else:
                buf[i] = -max_amplitude // 2
        return buf

    def _play_sound(self, sound_name):
        if hasattr(self, 'sounds') and sound_name in self.sounds:
            try:
                self.sounds[sound_name].play()
            except Exception:
                pass

    def reset_game(self):
        self.board = [[None for _ in range(COLS)] for _ in range(ROWS)]
        self.score = 0
        self.lines = 0
        self.level = 1
        self.high_score = load_high_score()
        self.game_over = False
        self.paused = False
        self.current = self.new_piece()
        self.next_piece = self.new_piece()
        self.drop_timer = 0
        self.drop_interval = 800
        self.lock_delay = 0
        self.lock_delay_max = 500
        self.locking = False
        self.combo = 0

    def new_piece(self):
        shape_name = random.choice(list(SHAPES.keys()))
        return Piece(shape_name)

    def valid_position(self, shape, x, y):
        for r, row in enumerate(shape):
            for c, val in enumerate(row):
                if val:
                    nx, ny = x + c, y + r
                    if nx < 0 or nx >= COLS or ny >= ROWS:
                        return False
                    if ny >= 0 and self.board[ny][nx] is not None:
                        return False
        return True

    def lock_piece(self):
        shape = self.current.shape
        for r, row in enumerate(shape):
            for c, val in enumerate(row):
                if val:
                    ny = self.current.y + r
                    nx = self.current.x + c
                    if 0 <= ny < ROWS and 0 <= nx < COLS:
                        self.board[ny][nx] = self.current.shape_name

        lines_cleared = self.clear_lines()
        if lines_cleared > 0:
            self._play_sound("clear")
            self.combo += 1
            base = SCORE_TABLE.get(lines_cleared, 0)
            combo_bonus = self.combo * 50
            self.score += base * self.level + combo_bonus
            self.lines += lines_cleared
            self.level = self.lines // 10 + 1
            self.drop_interval = max(80, 800 - (self.level - 1) * 70)
        else:
            self.combo = 0
            self._play_sound("drop")

        if self.score > self.high_score:
            self.high_score = self.score
            save_high_score(self.high_score)

        self.current = self.next_piece
        self.next_piece = self.new_piece()
        self.locking = False
        self.lock_delay = 0

        if not self.valid_position(self.current.shape, self.current.x, self.current.y):
            self.game_over = True
            self._play_sound("game_over")

    def clear_lines(self):
        lines_to_clear = []
        for r in range(ROWS):
            if all(self.board[r][c] is not None for c in range(COLS)):
                lines_to_clear.append(r)

        for r in lines_to_clear:
            del self.board[r]
            self.board.insert(0, [None for _ in range(COLS)])

        return len(lines_to_clear)

    def get_ghost_y(self):
        ghost_y = self.current.y
        while self.valid_position(self.current.shape, self.current.x, ghost_y + 1):
            ghost_y += 1
        return ghost_y

    def hard_drop(self):
        drop_distance = 0
        while self.valid_position(self.current.shape, self.current.x, self.current.y + 1):
            self.current.y += 1
            drop_distance += 1
        self.score += drop_distance * 2
        self.lock_piece()

    def move(self, dx):
        if self.valid_position(self.current.shape, self.current.x + dx, self.current.y):
            self.current.x += dx
            if self.locking:
                self.lock_delay = 0
            return True
        return False

    def rotate_piece(self):
        rotated = self.current.rotate()
        kicks = [0, -1, 1, -2, 2]
        for kick in kicks:
            if self.valid_position(rotated, self.current.x + kick, self.current.y):
                self.current.shape = rotated
                self.current.x += kick
                if self.locking:
                    self.lock_delay = 0
                return True
        for kick in kicks:
            if self.valid_position(rotated, self.current.x + kick, self.current.y - 1):
                self.current.shape = rotated
                self.current.x += kick
                self.current.y -= 1
                if self.locking:
                    self.lock_delay = 0
                return True
        return False

    def soft_drop(self):
        if self.valid_position(self.current.shape, self.current.x, self.current.y + 1):
            self.current.y += 1
            self.score += 1
            return True
        return False

    def draw_cell(self, surface, x, y, color, shadow_color, size=CELL_SIZE):
        rect = pygame.Rect(x, y, size, size)
        pygame.draw.rect(surface, color, rect, border_radius=4)
        highlight = tuple(min(255, c + 50) for c in color)
        shadow = shadow_color
        pygame.draw.line(surface, highlight, (x + 2, y + 2), (x + size - 3, y + 2), 2)
        pygame.draw.line(surface, highlight, (x + 2, y + 2), (x + 2, y + size - 3), 2)
        pygame.draw.line(surface, shadow, (x + size - 2, y + 2), (x + size - 2, y + size - 2), 2)
        pygame.draw.line(surface, shadow, (x + 2, y + size - 2), (x + size - 2, y + size - 2), 2)
        inner = pygame.Rect(x + 5, y + 5, size - 10, size - 10)
        inner_color = tuple(min(255, c + 20) for c in color)
        pygame.draw.rect(surface, inner_color, inner, border_radius=2)

    def draw_board(self):
        board_rect = pygame.Rect(BOARD_X, BOARD_Y, BOARD_WIDTH, BOARD_HEIGHT)
        pygame.draw.rect(self.screen, BOARD_BG, board_rect, border_radius=8)
        for r in range(ROWS + 1):
            y = BOARD_Y + r * CELL_SIZE
            pygame.draw.line(self.screen, GRID_COLOR, (BOARD_X, y), (BOARD_X + BOARD_WIDTH, y))
        for c in range(COLS + 1):
            x = BOARD_X + c * CELL_SIZE
            pygame.draw.line(self.screen, GRID_COLOR, (x, BOARD_Y), (x, BOARD_Y + BOARD_HEIGHT))

        for r in range(ROWS):
            for c in range(COLS):
                if self.board[r][c] is not None:
                    shape_name = self.board[r][c]
                    color = SHAPE_COLORS[shape_name]
                    shadow = SHAPE_SHADOW_COLORS[shape_name]
                    self.draw_cell(
                        self.screen,
                        BOARD_X + c * CELL_SIZE,
                        BOARD_Y + r * CELL_SIZE,
                        color,
                        shadow,
                    )

    def draw_current_piece(self):
        if self.game_over or self.current is None:
            return

        ghost_y = self.get_ghost_y()
        shape = self.current.shape
        for r, row in enumerate(shape):
            for c, val in enumerate(row):
                if val:
                    gx = BOARD_X + (self.current.x + c) * CELL_SIZE
                    gy = BOARD_Y + ghost_y * CELL_SIZE + r * CELL_SIZE
                    if ghost_y + r >= 0:
                        s = pygame.Surface((CELL_SIZE, CELL_SIZE), pygame.SRCALPHA)
                        s.fill((*self.current.color, 40))
                        self.screen.blit(s, (gx, gy))
                        pygame.draw.rect(
                            self.screen,
                            (*self.current.color, 80),
                            (gx, gy, CELL_SIZE, CELL_SIZE),
                            width=2,
                            border_radius=4,
                        )

        for r, row in enumerate(shape):
            for c, val in enumerate(row):
                if val and self.current.y + r >= 0:
                    self.draw_cell(
                        self.screen,
                        BOARD_X + (self.current.x + c) * CELL_SIZE,
                        BOARD_Y + (self.current.y + r) * CELL_SIZE,
                        self.current.color,
                        self.current.shadow_color,
                    )

    def draw_sidebar(self):
        sx = BOARD_X + BOARD_WIDTH + 20
        sy = BOARD_Y

        panel_rect = pygame.Rect(sx - 10, sy - 10, SIDEBAR_WIDTH, BOARD_HEIGHT + 20)
        pygame.draw.rect(self.screen, SIDEBAR_BG, panel_rect, border_radius=8)
        pygame.draw.rect(self.screen, BORDER_COLOR, panel_rect, width=1, border_radius=8)

        title_surf = self.font_large.render("俄罗斯方块", True, ACCENT_COLOR)
        title_rect = title_surf.get_rect(centerx=sx + SIDEBAR_WIDTH // 2 - 10, top=sy + 5)
        self.screen.blit(title_surf, title_rect)

        y = sy + 60

        next_label = self.font_label.render("下一个", True, LABEL_COLOR)
        self.screen.blit(next_label, (sx + 5, y))
        y += 25
        preview_rect = pygame.Rect(sx, y, 120, 80)
        pygame.draw.rect(self.screen, PREVIEW_BG, preview_rect, border_radius=6)

        if self.next_piece:
            shape = self.next_piece.shape
            piece_w = len(shape[0]) * (CELL_SIZE - 10)
            piece_h = len(shape) * (CELL_SIZE - 10)
            offset_x = preview_rect.x + (preview_rect.width - piece_w) // 2
            offset_y = preview_rect.y + (preview_rect.height - piece_h) // 2
            for r, row in enumerate(shape):
                for c, val in enumerate(row):
                    if val:
                        self.draw_cell(
                            self.screen,
                            offset_x + c * (CELL_SIZE - 10),
                            offset_y + r * (CELL_SIZE - 10),
                            self.next_piece.color,
                            self.next_piece.shadow_color,
                            CELL_SIZE - 10,
                        )
        y += 95

        self._draw_info_block(sx, y, "得分", f"{self.score:,}", SCORE_COLOR)
        y += 65
        self._draw_info_block(sx, y, "最高分", f"{self.high_score:,}", HIGH_SCORE_COLOR)
        y += 65
        self._draw_info_block(sx, y, "等级", str(self.level), ACCENT_COLOR)
        y += 65
        self._draw_info_block(sx, y, "消除行数", str(self.lines), TEXT_COLOR)
        y += 80

        pygame.draw.line(self.screen, BORDER_COLOR, (sx, y), (sx + SIDEBAR_WIDTH - 20, y))
        y += 15

        controls = [
            ("← →", "左右移动"),
            ("↑", "旋转"),
            ("↓", "加速下落"),
            ("空格", "直接落底"),
            ("P", "暂停"),
            ("R", "重新开始"),
        ]
        ctrl_label = self.font_label.render("操作说明", True, LABEL_COLOR)
        self.screen.blit(ctrl_label, (sx + 5, y))
        y += 25
        for key, desc in controls:
            key_surf = self.font_small.render(key, True, ACCENT_COLOR)
            desc_surf = self.font_small.render(desc, True, LABEL_COLOR)
            self.screen.blit(key_surf, (sx + 5, y))
            self.screen.blit(desc_surf, (sx + 55, y))
            y += 22

    def _draw_info_block(self, x, y, label, value, value_color):
        label_surf = self.font_label.render(label, True, LABEL_COLOR)
        self.screen.blit(label_surf, (x + 5, y))
        value_surf = self.font_score.render(value, True, value_color)
        self.screen.blit(value_surf, (x + 5, y + 22))

    def draw_game_over(self):
        overlay = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT), pygame.SRCALPHA)
        overlay.fill(GAME_OVER_OVERLAY)
        self.screen.blit(overlay, (0, 0))

        box_w, box_h = 300, 200
        box_x = (WINDOW_WIDTH - box_w) // 2
        box_y = (WINDOW_HEIGHT - box_h) // 2
        box_rect = pygame.Rect(box_x, box_y, box_w, box_h)
        pygame.draw.rect(self.screen, (40, 40, 60), box_rect, border_radius=12)
        pygame.draw.rect(self.screen, ACCENT_COLOR, box_rect, width=2, border_radius=12)

        go_surf = self.font_large.render("游戏结束", True, (243, 139, 168))
        go_rect = go_surf.get_rect(centerx=WINDOW_WIDTH // 2, top=box_y + 25)
        self.screen.blit(go_surf, go_rect)

        score_surf = self.font_medium.render(f"最终得分: {self.score:,}", True, SCORE_COLOR)
        score_rect = score_surf.get_rect(centerx=WINDOW_WIDTH // 2, top=box_y + 80)
        self.screen.blit(score_surf, score_rect)

        high_surf = self.font_medium.render(f"最高记录: {self.high_score:,}", True, HIGH_SCORE_COLOR)
        high_rect = high_surf.get_rect(centerx=WINDOW_WIDTH // 2, top=box_y + 115)
        self.screen.blit(high_surf, high_rect)

        restart_surf = self.font_small.render("按 R 重新开始", True, TEXT_COLOR)
        restart_rect = restart_surf.get_rect(centerx=WINDOW_WIDTH // 2, top=box_y + 160)
        self.screen.blit(restart_surf, restart_rect)

    def draw_pause(self):
        overlay = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 120))
        self.screen.blit(overlay, (0, 0))

        pause_surf = self.font_large.render("已暂停", True, ACCENT_COLOR)
        pause_rect = pause_surf.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 - 15))
        self.screen.blit(pause_surf, pause_rect)

        hint_surf = self.font_small.render("按 P 继续", True, TEXT_COLOR)
        hint_rect = hint_surf.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 + 25))
        self.screen.blit(hint_surf, hint_rect)

    def draw(self):
        self.screen.fill(BG_COLOR)
        self.draw_board()
        self.draw_current_piece()
        self.draw_sidebar()

        border_rect = pygame.Rect(BOARD_X - 2, BOARD_Y - 2, BOARD_WIDTH + 4, BOARD_HEIGHT + 4)
        pygame.draw.rect(self.screen, BORDER_COLOR, border_rect, width=2, border_radius=8)

        if self.game_over:
            self.draw_game_over()
        elif self.paused:
            self.draw_pause()

        pygame.display.flip()

    def run(self):
        running = True
        das_timer = 0
        das_direction = 0
        das_delay = 170
        das_repeat = 50
        das_active = False

        while running:
            dt = self.clock.tick(60)

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False

                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_r:
                        self.reset_game()
                        continue

                    if self.game_over:
                        continue

                    if event.key == pygame.K_p:
                        self.paused = not self.paused
                        continue

                    if self.paused:
                        continue

                    if event.key == pygame.K_LEFT:
                        self.move(-1)
                        das_direction = -1
                        das_timer = 0
                        das_active = False
                    elif event.key == pygame.K_RIGHT:
                        self.move(1)
                        das_direction = 1
                        das_timer = 0
                        das_active = False
                    elif event.key == pygame.K_UP:
                        self.rotate_piece()
                    elif event.key == pygame.K_DOWN:
                        self.soft_drop()
                    elif event.key == pygame.K_SPACE:
                        self.hard_drop()

                if event.type == pygame.KEYUP:
                    if event.key in (pygame.K_LEFT, pygame.K_RIGHT):
                        das_direction = 0
                        das_timer = 0
                        das_active = False

            if not self.game_over and not self.paused:
                if das_direction != 0:
                    das_timer += dt
                    if not das_active and das_timer >= das_delay:
                        das_active = True
                        das_timer = 0
                        self.move(das_direction)
                    elif das_active and das_timer >= das_repeat:
                        das_timer = 0
                        self.move(das_direction)

                keys = pygame.key.get_pressed()
                if keys[pygame.K_DOWN]:
                    self.drop_timer += dt * 8
                else:
                    self.drop_timer += dt

                if self.drop_timer >= self.drop_interval:
                    self.drop_timer = 0
                    if not self.soft_drop():
                        if not self.locking:
                            self.locking = True
                            self.lock_delay = 0
                        else:
                            self.lock_delay += self.drop_interval
                            if self.lock_delay >= self.lock_delay_max:
                                self.lock_piece()

                if self.locking:
                    self.lock_delay += dt
                    if self.valid_position(self.current.shape, self.current.x, self.current.y + 1):
                        self.locking = False
                        self.lock_delay = 0
                    elif self.lock_delay >= self.lock_delay_max:
                        self.lock_piece()

            self.draw()

        pygame.quit()
        sys.exit()


if __name__ == "__main__":
    game = Tetris()
    game.run()
