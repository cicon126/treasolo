import pygame
import random
import sys
import os
import math

pygame.init()

WIDTH = 480
HEIGHT = 600
FPS = 60
ROUND_TIME = 30
MAX_BOMB_HITS = 3

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GOLD = (255, 215, 0)
RED = (255, 0, 0)
BLUE = (0, 100, 255)
GREEN = (0, 255, 0)
GRAY = (128, 128, 128)
DARK_GRAY = (60, 60, 60)

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("打飞机 - 收集金币")
pygame.display.set_allow_screensaver(False)
clock = pygame.time.Clock()


def get_chinese_font(size):
    font_paths = [
        "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/simhei.ttf",
        "C:/Windows/Fonts/simsun.ttc",
        "/System/Library/Fonts/PingFang.ttc",
        "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                return pygame.font.Font(path, size)
            except:
                continue
    return pygame.font.SysFont("arial", size)


font_big = get_chinese_font(48)
font_medium = get_chinese_font(36)
font_small = get_chinese_font(24)


def draw_airplane(surface, cx, cy):
    body_color = (50, 130, 220)
    body_dark = (30, 90, 180)
    wing_color = (40, 110, 200)
    wing_dark = (25, 75, 160)
    cockpit_color = (150, 220, 255)
    tail_color = (40, 100, 190)
    flame_yellow = (255, 200, 50)
    flame_orange = (255, 130, 30)
    flame_red = (255, 60, 20)

    nose = (cx, cy - 22)
    body_top_l = (cx - 6, cy - 10)
    body_top_r = (cx + 6, cy - 10)
    body_mid_l = (cx - 8, cy + 2)
    body_mid_r = (cx + 8, cy + 2)
    body_bot_l = (cx - 6, cy + 18)
    body_bot_r = (cx + 6, cy + 18)
    tail_top = (cx, cy + 14)

    pygame.draw.polygon(surface, body_color, [
        nose, body_top_r, body_mid_r, body_bot_r, body_bot_l, body_mid_l, body_top_l
    ])
    pygame.draw.polygon(surface, body_dark, [
        body_top_r, body_mid_r, body_bot_r, body_bot_l, body_mid_l, body_top_l
    ], 2)

    left_wing = [
        (cx - 8, cy - 2),
        (cx - 28, cy + 8),
        (cx - 26, cy + 12),
        (cx - 6, cy + 6),
    ]
    right_wing = [
        (cx + 8, cy - 2),
        (cx + 28, cy + 8),
        (cx + 26, cy + 12),
        (cx + 6, cy + 6),
    ]
    pygame.draw.polygon(surface, wing_color, left_wing)
    pygame.draw.polygon(surface, wing_dark, left_wing, 2)
    pygame.draw.polygon(surface, wing_color, right_wing)
    pygame.draw.polygon(surface, wing_dark, right_wing, 2)

    pygame.draw.polygon(surface, (30, 70, 150), [
        (cx - 3, cy + 14),
        (cx - 14, cy + 20),
        (cx - 12, cy + 23),
        (cx - 3, cy + 18),
    ])
    pygame.draw.polygon(surface, (30, 70, 150), [
        (cx + 3, cy + 14),
        (cx + 14, cy + 20),
        (cx + 12, cy + 23),
        (cx + 3, cy + 18),
    ])

    pygame.draw.ellipse(surface, cockpit_color, (cx - 4, cy - 14, 8, 10))
    pygame.draw.ellipse(surface, (100, 190, 255), (cx - 3, cy - 13, 6, 6))

    pygame.draw.polygon(surface, flame_orange, [
        (cx - 4, cy + 18),
        (cx, cy + 28),
        (cx + 4, cy + 18),
    ])
    pygame.draw.polygon(surface, flame_yellow, [
        (cx - 2, cy + 18),
        (cx, cy + 24),
        (cx + 2, cy + 18),
    ])
    pygame.draw.polygon(surface, flame_red, [
        (cx - 1, cy + 18),
        (cx, cy + 21),
        (cx + 1, cy + 18),
    ])


class Player(pygame.sprite.Sprite):
    def __init__(self):
        pygame.sprite.Sprite.__init__(self)
        self.width = 60
        self.height = 55
        self.image = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
        draw_airplane(self.image, self.width // 2, self.height // 2 - 4)
        self.rect = self.image.get_rect()
        self.rect.centerx = WIDTH // 2
        self.rect.bottom = HEIGHT - 20
        self.speed = 7
        self.invincible = False
        self.invincible_timer = 0
        self.visible = True
        self.flicker_timer = 0

    def update(self):
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            self.rect.x -= self.speed
        if keys[pygame.K_RIGHT]:
            self.rect.x += self.speed
        if self.rect.left < 0:
            self.rect.left = 0
        if self.rect.right > WIDTH:
            self.rect.right = WIDTH

        if self.invincible:
            self.flicker_timer += 1
            if self.flicker_timer % 6 < 3:
                self.visible = True
            else:
                self.visible = False
            self.invincible_timer -= 1
            if self.invincible_timer <= 0:
                self.invincible = False
                self.visible = True
        else:
            self.visible = True

    def draw(self, surface):
        if self.visible:
            surface.blit(self.image, self.rect)

    def start_invincible(self, frames=90):
        self.invincible = True
        self.invincible_timer = frames
        self.flicker_timer = 0


class Explosion(pygame.sprite.Sprite):
    def __init__(self, x, y):
        pygame.sprite.Sprite.__init__(self)
        self.x = x
        self.y = y
        self.frame = 0
        self.max_frames = 30
        self.particles = []
        for _ in range(20):
            angle = random.uniform(0, 2 * math.pi)
            speed = random.uniform(1, 5)
            size = random.randint(3, 8)
            color = random.choice([
                (255, 255, 100),
                (255, 200, 50),
                (255, 150, 30),
                (255, 80, 20),
                (255, 40, 10),
            ])
            self.particles.append({
                'x': float(x),
                'y': float(y),
                'vx': math.cos(angle) * speed,
                'vy': math.sin(angle) * speed,
                'size': size,
                'color': color,
                'life': random.randint(10, 25),
            })
        self.ring_radius = 5
        self.ring_alpha = 255
        self.update_image()

    def update_image(self):
        size = 80
        self.image = pygame.Surface((size, size), pygame.SRCALPHA)
        cx, cy = size // 2, size // 2

        for p in self.particles:
            if p['life'] > 0:
                px = int(p['x'] - self.x + cx)
                py = int(p['y'] - self.y + cy)
                s = max(1, int(p['size'] * (p['life'] / 25)))
                pygame.draw.circle(self.image, p['color'], (px, py), s)

        if self.ring_alpha > 0:
            ring_surf = pygame.Surface((size, size), pygame.SRCALPHA)
            ring_color = (255, 200, 100, max(0, min(255, int(self.ring_alpha))))
            r = int(self.ring_radius)
            if r > 2:
                pygame.draw.circle(ring_surf, ring_color, (cx, cy), r, max(1, r // 4))
                inner_color = (255, 255, 200, max(0, min(255, int(self.ring_alpha * 0.5))))
                pygame.draw.circle(ring_surf, inner_color, (cx, cy), max(1, r // 2))
            self.image.blit(ring_surf, (0, 0))

        self.rect = self.image.get_rect()
        self.rect.center = (int(self.x), int(self.y))

    def update(self):
        self.frame += 1

        for p in self.particles:
            if p['life'] > 0:
                p['x'] += p['vx']
                p['y'] += p['vy']
                p['vy'] += 0.1
                p['life'] -= 1
                p['size'] *= 0.95

        self.ring_radius += 3
        self.ring_alpha -= 12

        self.update_image()

        if self.frame >= self.max_frames:
            self.kill()


class Coin(pygame.sprite.Sprite):
    def __init__(self, speed):
        pygame.sprite.Sprite.__init__(self)
        self.radius = 15
        self.image = pygame.Surface((self.radius * 2, self.radius * 2), pygame.SRCALPHA)
        pygame.draw.circle(self.image, GOLD, (self.radius, self.radius), self.radius)
        pygame.draw.circle(self.image, (200, 170, 0), (self.radius, self.radius), self.radius, 3)
        text = font_small.render("$", True, (150, 100, 0))
        text_rect = text.get_rect(center=(self.radius, self.radius))
        self.image.blit(text, text_rect)
        self.rect = self.image.get_rect()
        self.rect.x = random.randint(0, WIDTH - self.radius * 2)
        self.rect.y = -self.radius * 2
        self.speed = speed

    def update(self):
        self.rect.y += self.speed


class Bomb(pygame.sprite.Sprite):
    def __init__(self, speed):
        pygame.sprite.Sprite.__init__(self)
        self.size = 30
        self.image = pygame.Surface((self.size, self.size), pygame.SRCALPHA)
        cx, cy = self.size // 2, self.size // 2 + 2

        pygame.draw.circle(self.image, (40, 40, 40), (cx, cy), 12)
        pygame.draw.circle(self.image, (70, 70, 70), (cx - 3, cy - 3), 4)
        pygame.draw.circle(self.image, (90, 90, 90), (cx, cy), 12, 2)

        pygame.draw.line(self.image, (120, 70, 20), (cx, cy - 12), (cx + 2, cy - 17), 3)

        spark_x = cx + 2
        spark_y = cy - 17
        pygame.draw.circle(self.image, (255, 200, 50), (spark_x, spark_y), 4)
        pygame.draw.circle(self.image, (255, 100, 30), (spark_x, spark_y), 2)

        pts = [
            (cx - 12, cy),
            (cx - 8, cy - 4),
            (cx - 12, cy - 8),
            (cx - 6, cy - 4),
            (cx, cy - 12),
        ]
        pygame.draw.lines(self.image, (200, 200, 200), False, pts, 2)

        self.rect = self.image.get_rect()
        self.rect.x = random.randint(0, WIDTH - self.size)
        self.rect.y = -self.size
        self.speed = speed

    def update(self):
        self.rect.y += self.speed


class Game:
    def __init__(self):
        self.level = 1
        self.score = 0
        self.bomb_hits = 0
        self.round_time = ROUND_TIME
        self.start_ticks = 0
        self.spawn_timer = 0
        self.state = "start"
        self.running = True
        self.explosions = pygame.sprite.Group()
        self.shake_timer = 0
        self.shake_offset = (0, 0)

    def get_spawn_interval(self):
        return max(15, 60 - self.level * 8)

    def get_fall_speed(self):
        return 2 + self.level * 0.5

    def reset_round(self):
        self.bomb_hits = 0
        self.round_time = ROUND_TIME
        self.start_ticks = pygame.time.get_ticks()
        self.spawn_timer = 0
        self.all_sprites.empty()
        self.coins.empty()
        self.bombs.empty()
        self.explosions.empty()
        self.player = Player()
        self.all_sprites.add(self.player)
        self.shake_timer = 0
        self.shake_offset = (0, 0)

    def start_new_level(self):
        self.level += 1
        self.reset_round()
        self.state = "playing"

    def start_game(self):
        self.level = 1
        self.score = 0
        self.reset_round()
        self.state = "playing"

    def run(self):
        self.all_sprites = pygame.sprite.Group()
        self.coins = pygame.sprite.Group()
        self.bombs = pygame.sprite.Group()
        self.player = Player()
        self.all_sprites.add(self.player)

        while self.running:
            self.handle_events()
            if self.state == "playing":
                self.update_playing()
            elif self.state == "start":
                self.update_start()
            elif self.state == "level_complete":
                self.update_level_complete()
            elif self.state == "game_over":
                self.update_game_over()
            elif self.state == "win":
                self.update_win()

            pygame.display.flip()
            clock.tick(FPS)

        pygame.quit()
        sys.exit()

    def update_playing(self):
        current_ticks = pygame.time.get_ticks()
        elapsed = (current_ticks - self.start_ticks) // 1000
        remaining = max(0, self.round_time - elapsed)

        if remaining <= 0 and len(self.explosions) == 0:
            if self.bomb_hits < MAX_BOMB_HITS:
                if self.level >= 5:
                    self.state = "win"
                else:
                    self.state = "level_complete"
            else:
                self.state = "game_over"
            return

        self.spawn_timer += 1
        if self.spawn_timer >= self.get_spawn_interval():
            self.spawn_timer = 0
            speed = self.get_fall_speed()
            if random.random() < 0.4:
                bomb = Bomb(speed)
                self.bombs.add(bomb)
                self.all_sprites.add(bomb)
            else:
                coin = Coin(speed)
                self.coins.add(coin)
                self.all_sprites.add(coin)

        self.all_sprites.update()
        self.explosions.update()

        for coin in self.coins:
            if coin.rect.top > HEIGHT:
                coin.kill()

        for bomb in self.bombs:
            if bomb.rect.top > HEIGHT:
                bomb.kill()

        coin_hits = pygame.sprite.spritecollide(self.player, self.coins, True)
        for hit in coin_hits:
            self.score += 10

        if not self.player.invincible:
            bomb_hits = pygame.sprite.spritecollide(self.player, self.bombs, True)
            for hit in bomb_hits:
                self.bomb_hits += 1
                ex = self.player.rect.centerx
                ey = self.player.rect.centery
                explosion = Explosion(ex, ey)
                self.explosions.add(explosion)
                self.shake_timer = 15
                if self.bomb_hits < MAX_BOMB_HITS:
                    self.player.start_invincible(90)

        if self.shake_timer > 0:
            self.shake_timer -= 1
            intensity = self.shake_timer
            self.shake_offset = (
                random.randint(-intensity, intensity),
                random.randint(-intensity, intensity)
            )
        else:
            self.shake_offset = (0, 0)

        if self.bomb_hits >= MAX_BOMB_HITS and len(self.explosions) == 0:
            self.state = "game_over"
            return

        self.draw_playing(remaining)

    def draw_playing(self, remaining):
        render_surface = pygame.Surface((WIDTH, HEIGHT))
        render_surface.fill(BLACK)

        for sprite in self.all_sprites:
            if isinstance(sprite, Player):
                sprite.draw(render_surface)
            else:
                render_surface.blit(sprite.image, sprite.rect)

        for exp in self.explosions:
            render_surface.blit(exp.image, exp.rect)

        score_text = font_medium.render(f"得分: {self.score}", True, WHITE)
        render_surface.blit(score_text, (10, 10))

        level_text = font_medium.render(f"第 {self.level} 关", True, WHITE)
        render_surface.blit(level_text, (WIDTH - 120, 10))

        time_text = font_medium.render(f"时间: {remaining}秒", True, GREEN if remaining > 10 else RED)
        render_surface.blit(time_text, (WIDTH // 2 - 60, 10))

        for i in range(MAX_BOMB_HITS):
            color = RED if i < self.bomb_hits else GRAY
            pygame.draw.circle(render_surface, color, (30 + i * 35, HEIGHT - 30), 12)
            if i < self.bomb_hits:
                pygame.draw.line(render_surface, WHITE, (22 + i * 35, HEIGHT - 38),
                                 (38 + i * 35, HEIGHT - 22), 3)
                pygame.draw.line(render_surface, WHITE, (38 + i * 35, HEIGHT - 38),
                                 (22 + i * 35, HEIGHT - 22), 3)

        bomb_label = font_small.render("生命:", True, WHITE)
        render_surface.blit(bomb_label, (10, HEIGHT - 55))

        screen.blit(render_surface, self.shake_offset)

    def update_start(self):
        screen.fill(BLACK)

        title = font_big.render("打飞机", True, BLUE)
        title_rect = title.get_rect(center=(WIDTH // 2, 120))
        screen.blit(title, title_rect)

        subtitle = font_medium.render("收集金币 躲避炸弹", True, GOLD)
        subtitle_rect = subtitle.get_rect(center=(WIDTH // 2, 180))
        screen.blit(subtitle, subtitle_rect)

        instructions = [
            "← → 方向键控制飞机移动",
            "收集金币 +10分",
            "碰到炸弹 3次游戏结束",
            "每关 30 秒",
            "每关速度逐渐加快",
            "",
            "按 空格键 开始游戏"
        ]

        y = 250
        for line in instructions:
            text = font_small.render(line, True, WHITE)
            text_rect = text.get_rect(center=(WIDTH // 2, y))
            screen.blit(text, text_rect)
            y += 30

    def update_level_complete(self):
        screen.fill(BLACK)

        title = font_big.render(f"第 {self.level} 关 通过!", True, GREEN)
        title_rect = title.get_rect(center=(WIDTH // 2, 180))
        screen.blit(title, title_rect)

        score_text = font_medium.render(f"当前得分: {self.score}", True, WHITE)
        score_rect = score_text.get_rect(center=(WIDTH // 2, 260))
        screen.blit(score_text, score_rect)

        level_text = font_small.render(f"第 {self.level + 1} 关速度更快!", True, GOLD)
        level_rect = level_text.get_rect(center=(WIDTH // 2, 320))
        screen.blit(level_text, level_rect)

        hint = font_medium.render("按 空格键 进入下一关", True, WHITE)
        hint_rect = hint.get_rect(center=(WIDTH // 2, 420))
        screen.blit(hint, hint_rect)

    def update_game_over(self):
        screen.fill(BLACK)

        title = font_big.render("游戏结束!", True, RED)
        title_rect = title.get_rect(center=(WIDTH // 2, 200))
        screen.blit(title, title_rect)

        score_text = font_medium.render(f"最终得分: {self.score}", True, WHITE)
        score_rect = score_text.get_rect(center=(WIDTH // 2, 280))
        screen.blit(score_text, score_rect)

        level_text = font_small.render(f"到达第 {self.level} 关", True, GOLD)
        level_rect = level_text.get_rect(center=(WIDTH // 2, 340))
        screen.blit(level_text, level_rect)

        hint = font_medium.render("按 空格键 重新开始", True, WHITE)
        hint_rect = hint.get_rect(center=(WIDTH // 2, 420))
        screen.blit(hint, hint_rect)

    def update_win(self):
        screen.fill(BLACK)

        title = font_big.render("恭喜通关!", True, GOLD)
        title_rect = title.get_rect(center=(WIDTH // 2, 180))
        screen.blit(title, title_rect)

        score_text = font_medium.render(f"最终得分: {self.score}", True, WHITE)
        score_rect = score_text.get_rect(center=(WIDTH // 2, 260))
        screen.blit(score_text, score_rect)

        stars = font_big.render("★ ★ ★", True, GOLD)
        stars_rect = stars.get_rect(center=(WIDTH // 2, 340))
        screen.blit(stars, stars_rect)

        hint = font_medium.render("按 空格键 再玩一次", True, WHITE)
        hint_rect = hint.get_rect(center=(WIDTH // 2, 440))
        screen.blit(hint, hint_rect)

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False
                if event.key == pygame.K_SPACE:
                    if self.state == "start":
                        self.start_game()
                    elif self.state == "level_complete":
                        self.start_new_level()
                    elif self.state == "game_over" or self.state == "win":
                        self.start_game()


if __name__ == "__main__":
    game = Game()
    game.run()
