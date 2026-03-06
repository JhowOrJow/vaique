import tkinter as tk
from tkinter import ttk
import pyautogui
import keyboard
import threading
import time
import random

# Configurações do PyAutoGUI
pyautogui.PAUSE = 0
pyautogui.FAILSAFE = True

class BotProfissional:
    def __init__(self, root):
        self.root = root
        self.root.title("Game of Grass Bot Pro")
        self.root.geometry("400x550")
        self.root.attributes("-topmost", True) # Janela sempre no topo

        # Variáveis de Controle
        self.pontos = []
        self.x_min = self.x_max = self.y_min = self.y_max = 0
        self.velocidade = tk.IntVar(value=20)
        self.espacamento = tk.IntVar(value=40)
        self.running = False
        self.paused = False
        self.status = tk.StringVar(value="Aguardando Mapeamento (K)")

        self.setup_ui()
        self.iniciar_atalhos()

    def setup_ui(self):
        # Estilo
        style = ttk.Style()
        style.configure("TButton", padding=5, font=('Helvetica', 10))
        
        # Painel de Coordenadas
        frame_coords = ttk.LabelFrame(self.root, text=" Coordenadas Mapeadas ", padding=10)
        frame_coords.pack(fill="x", padx=10, pady=5)

        self.lbl_x = ttk.Label(frame_coords, text="X: [ 0 - 0 ]")
        self.lbl_x.pack()
        self.lbl_y = ttk.Label(frame_coords, text="Y: [ 0 - 0 ]")
        self.lbl_y.pack()

        # Controle de Velocidade
        frame_ctrl = ttk.LabelFrame(self.root, text=" Controles de Movimento ", padding=10)
        frame_ctrl.pack(fill="x", padx=10, pady=5)

        ttk.Label(frame_ctrl, text="Velocidade (Passo):").pack()
        ttk.Scale(frame_ctrl, from_=5, to=100, variable=self.velocidade, orient="horizontal").pack(fill="x")
        
        ttk.Label(frame_ctrl, text="Espaçamento entre linhas:").pack()
        ttk.Scale(frame_ctrl, from_=10, to=100, variable=self.espacamento, orient="horizontal").pack(fill="x")

        # Botões Principais
        self.btn_start = ttk.Button(self.root, text="START (L)", command=self.toggle_start)
        self.btn_start.pack(fill="x", padx=20, pady=5)

        # Status
        self.lbl_status = tk.Label(self.root, textvariable=self.status, fg="blue", font=('Helvetica', 10, 'bold'))
        self.lbl_status.pack(pady=10)

        # Legenda de Atalhos
        frame_legenda = ttk.LabelFrame(self.root, text=" Legenda de Atalhos ", padding=10)
        frame_legenda.pack(fill="both", expand=True, padx=10, pady=5)

        legendas = [
            ("K", "Mapear Canto (aperte 4 vezes)"),
            ("L", "Iniciar / Parar Ciclo"),
            ("P", "Pausar / Retomar"),
            ("R", "Resetar Configurações"),
            ("M", "Encerrar Programa"),
            ("SETAS", "Ajustar Velocidade em tempo real")
        ]

        for tecla, desc in legendas:
            row = ttk.Frame(frame_legenda)
            row.pack(fill="x")
            ttk.Label(row, text=f"{tecla}:", width=8, font=('Helvetica', 9, 'bold')).pack(side="left")
            ttk.Label(row, text=desc, font=('Helvetica', 9)).pack(side="left")

    def atualizar_coords_ui(self):
        if len(self.pontos) >= 2:
            x_coords = [p[0] for p in self.pontos]
            y_coords = [p[1] for p in self.pontos]
            self.x_min, self.x_max = min(x_coords), max(x_coords)
            self.y_min, self.y_max = min(y_coords), max(y_coords)
            self.lbl_x.config(text=f"X: [ {self.x_min} - {self.x_max} ]")
            self.lbl_y.config(text=f"Y: [ {self.y_min} - {self.y_max} ]")

    def logica_bot(self):
        try:
            while self.running:
                # FASE HORIZONTAL
                self.status.set("Varredura Horizontal...")
                y = self.y_min
                direcao = 1
                while y <= self.y_max and self.running:
                    self.verificar_pausa()
                    range_x = range(self.x_min, self.x_max, self.velocidade.get()) if direcao == 1 else range(self.x_max, self.x_min, -self.velocidade.get())
                    for x in range_x:
                        if not self.running: break
                        self.verificar_pausa()
                        pyautogui.moveTo(x, y)
                    y += self.espacamento.get()
                    direcao *= -1

                # FASE VERTICAL
                self.status.set("Varredura Vertical...")
                x = self.x_min
                direcao = 1
                while x <= self.x_max and self.running:
                    self.verificar_pausa()
                    range_y = range(self.y_min, self.y_max, self.velocidade.get()) if direcao == 1 else range(self.y_max, self.y_min, -self.velocidade.get())
                    for y in range_y:
                        if not self.running: break
                        self.verificar_pausa()
                        pyautogui.moveTo(x, y)
                    x += self.espacamento.get()
                    direcao *= -1

        except Exception as e:
            self.status.set(f"Erro: {e}")
            self.running = False

    def verificar_pausa(self):
        while self.paused and self.running:
            self.status.set("PAUSADO (P para retomar)")
            time.sleep(0.1)

    # --- Funções de Atalho ---
    def mapear(self):
        pos = pyautogui.position()
        self.pontos.append(pos)
        self.status.set(f"Ponto {len(self.pontos)}/4 salvo!")
        self.atualizar_coords_ui()
        if len(self.pontos) == 4:
            self.status.set("Mapeamento Completo! Pronto para Iniciar (L)")

    def toggle_start(self):
        if not self.running:
            if len(self.pontos) < 2:
                self.status.set("Erro: Mapeie os cantos primeiro!")
                return
            self.running = True
            self.paused = False
            self.btn_start.config(text="STOP (L)")
            threading.Thread(target=self.logica_bot, daemon=True).start()
        else:
            self.running = False
            self.btn_start.config(text="START (L)")
            self.status.set("Bot parado.")

    def toggle_pause(self):
        self.paused = not self.paused
        if not self.paused: self.status.set("Bot em Execução...")

    def reset(self):
        self.running = False
        self.pontos = []
        self.btn_start.config(text="START (L)")
        self.status.set("Configurações resetadas. Use 'K'.")
        self.lbl_x.config(text="X: [ 0 - 0 ]")
        self.lbl_y.config(text="Y: [ 0 - 0 ]")

    def encerrar(self):
        self.running = False
        self.root.quit()

    def iniciar_atalhos(self):
        keyboard.add_hotkey('k', self.mapear)
        keyboard.add_hotkey('l', self.toggle_start)
        keyboard.add_hotkey('p', self.toggle_pause)
        keyboard.add_hotkey('r', self.reset)
        keyboard.add_hotkey('m', self.encerrar)
        keyboard.add_hotkey('up', lambda: self.velocidade.set(self.velocidade.get() + 2))
        keyboard.add_hotkey('down', lambda: self.velocidade.set(max(5, self.velocidade.get() - 2)))

if __name__ == "__main__":
    root = tk.Tk()
    app = BotProfissional(root)
    root.mainloop()
