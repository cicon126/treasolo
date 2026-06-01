import pygame
import random
import sys

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

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("打飞机 - 收集金币")
clock = pygame.time.Clock()

font_big = pygame.font.Font(None, 48)
font_medium = pygame.font.Font(None, 36)
font_small = pygame.font.Font(None, 24)


class Player(pygame.sprite.Sprite):
    def __init__(self):
        pygame.sprite.Sprite.__init__(self)
        self.width = 60
        self.height = 40
        self.image = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
        pygame.draw.polygon(self.image, BLUE, [
            (self.width // 2, 0),
            (0, self.height),
            (self.width, self.height)
        ])
        pygame.draw.rect(self.image, (0, 150, 255),
                         (self.width // 2 - 8, self.height - 10, 16, 15))
        self.rect = self.image.get_rect()
        self.rect.centerx = WIDTH // 2
        self.rect.bottom = HEIGHT - 20
        self.speed = 5

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
        self.size = 28
        self.image = pygame.Surface((self.size, self.size), pygame.SRCALPHA)
        pygame.draw.circle(self.image, (50, 50, 50), (self.size // 2, self.size // 2), self.size // 2)
        pygame.draw.rect(self.image, (100, 50, 0), (self.size // 2 - 3, 0, 6, 8))
        pygame.draw.circle(self.image, RED, (self.size // 2, 3), 4)
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
        self.player = Player()
        self.all_sprites.add(self.player)

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
        self.handle_events()

        current_ticks = pygame.time.get_ticks()
        elapsed = (current_ticks - self.start_ticks) // 1000
        remaining = max(0, self.round_time - elapsed)

        if remaining <= 0:
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

        for coin in self.coins:
            if coin.rect.top > HEIGHT:
                coin.kill()

        for bomb in self.bombs:
            if bomb.rect.top > HEIGHT:
                bomb.kill()

        coin_hits = pygame.sprite.spritecollide(self.player, self.coins, True)
        for hit in coin_hits:
            self.score += 10

        bomb_hits = pygame.sprite.spritecollide(self.player, self.bombs, True)
        for hit in bomb_hits:
            self.bomb_hits += 1
            if self.bomb_hits >= MAX_BOMB_HITS:
                self.state = "game_over"
                return

        self.draw_playing(remaining)

    def draw_playing(self, remaining):
        screen.fill(BLACK)
        self.all_sprites.draw(screen)

        score_text = font_medium.render(f"得分: {self.score}", True, WHITE)
        screen.blit(score_text, (10, 10))

        level_text = font_medium.render(f"第 {self.level} 关", True, WHITE)
        screen.blit(level_text, (WIDTH - 120, 10))

        time_text = font_medium.render(f"时间: {remaining}秒", True, GREEN if remaining > 10 else RED)
        screen.blit(time_text, (WIDTH // 2 - 60, 10))

        for i in range(MAX_BOMB_HITS):
            color = RED if i < self.bomb_hits else GRAY
            pygame.draw.circle(screen, color, (30 + i * 35, HEIGHT - 30), 12)
            if i < self.bomb_hits:
                pygame.draw.line(screen, WHITE, (22 + i * 35, HEIGHT - 38),
                                 (38 + i * 35, HEIGHT - 22), 3)
                pygame.draw.line(screen, WHITE, (38 + i * 35, HEIGHT - 38),
                                 (22 + i * 35, HEIGHT - 22), 3)

        bomb_label = font_small.render("生命:", True, WHITE)
        screen.blit(bomb_label, (10, HEIGHT - 55))

    def update_start(self):
        self.handle_events()
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
        self.handle_events()
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
        self.handle_events()
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
        self.handle_events()
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
