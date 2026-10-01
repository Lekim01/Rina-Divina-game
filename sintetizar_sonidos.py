#!/usr/bin/env python3
"""Riña Divina — sintetiza desde cero los efectos de sonido nuevos (sin
grabaciones de nadie). MP3 mono a 44,1 kHz, en la carpeta indicada (por
defecto, esta misma). Uso: python3 sintetizar_sonidos.py [carpeta]
  tablero-real.mp3      Real extingue un espacio (retumbar, el blanco que borra, polvo)
  nivel-destellos.mp3   destellos que acompañan a la subida de nivel
  card-reveal.mp3       una carta boca abajo se da la vuelta
  mazo-agregar.mp3      añadir una carta al mazo
  mazo-quitar.mp3       quitar una carta del mazo
  mazo-rechazar.mp3     no se puede añadir (mazo lleno, repetida…)
  gota-realidad.mp3     una Realidad cae como una esfera en un espacio y lo tiñe
  reki-huella.mp3       una pisada de Reki sobre el blanco de Real"""
import os, sys, subprocess, wave
import numpy as np
from scipy import signal

SR = 44100
rng = np.random.default_rng(11)
SALIDA = sys.argv[1] if len(sys.argv) > 1 else '.'
os.makedirs(SALIDA, exist_ok=True)

def tt(d): return np.arange(int(SR * d)) / SR
def ruido(n): return rng.normal(0, 1, n)
def filtro(x, tipo, f, orden=2): return signal.sosfilt(signal.butter(orden, f, btype=tipo, fs=SR, output='sos'), x)
def tono(frec): return np.sin(2 * np.pi * np.cumsum(np.asarray(frec, float)) / SR)
def poner(dest, x, t0):
    i = int(t0 * SR); m = min(len(x), len(dest) - i)
    if m > 0: dest[i:i + m] += x[:m]
def guardar(nombre, x, rms_db, pico=.9):
    x = x - np.mean(x)
    x = x * (10 ** (rms_db / 20) / (np.sqrt(np.mean(x ** 2)) + 1e-12))
    if np.max(np.abs(x)) > pico: x = x / np.max(np.abs(x)) * pico
    m = int(SR * .012); x[-m:] *= np.linspace(1, 0, m)
    wav = os.path.join(SALIDA, nombre + '.wav')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-codec:a', 'libmp3lame', '-qscale:a', '3', os.path.join(SALIDA, nombre + '.mp3')], check=True)
    os.remove(wav); print(f'{nombre}.mp3  {len(x) / SR:.2f} s')

def tablero_real():   # golpe hondo, el blanco que lo borra todo (soplo que crece y se va) y polvo que se deshace
    d = 3.0; n = int(SR * d); t = tt(d); x = np.zeros(n)
    tq = tt(1.6); poner(x, (np.sin(2 * np.pi * (48 + 30 * np.exp(-tq * 6)) * tq) * np.exp(-tq * 2.8)) * 1.0, 0)          # retumbar
    tq = tt(.25); poner(x, filtro(ruido(len(tq)), 'low', 900) * np.exp(-tq * 18) * .8, 0)                                  # el golpe
    u = t / d; e = np.interp(u, [0, .08, .38, .7, 1], [0, .35, 1, .45, 0])
    soplo = filtro(ruido(n), 'band', [1800, 9000]) * e * .55 + filtro(ruido(n), 'band', [300, 1200]) * e * .35              # el blanco
    x += soplo
    for k in range(70):   # el polvo de las cartas: granitos agudos que caen
        t0 = .35 + rng.random() * 1.9; tq = tt(.03)
        poner(x, filtro(ruido(len(tq)), 'band', [3000, 11000]) * np.exp(-tq * 160) * (.25 + rng.random() * .3), t0)
    tq = tt(d); x += np.sin(2 * np.pi * 1318.5 * tq) * np.exp(-((tq - 1.1) / .6) ** 2) * .05 + np.sin(2 * np.pi * 1975.5 * tq) * np.exp(-((tq - 1.3) / .7) ** 2) * .035   # un brillo helado
    return x

def nivel_destellos():   # lluvia de destellos que sube de tono y se apaga
    d = 1.5; x = np.zeros(int(SR * d))
    for k in range(26):
        t0 = (k / 26) ** 1.4 * 1.05 + rng.random() * .05
        f = rng.choice([2093, 2349.3, 2637, 3136, 3520, 4186]) * (1 + k / 90)
        tq = tt(.35); poner(x, np.sin(2 * np.pi * f * tq) * np.exp(-tq * (14 + rng.random() * 10)) * (1 - k / 34) * .5, t0)
    tq = tt(1.2); poner(x, filtro(ruido(len(tq)), 'band', [6000, 12000]) * np.exp(-tq * 3) * np.minimum(1, tq / .1) * .08, .02)
    return x

def card_reveal():   # la carta gira: roce corto de papel y un «tic» suave al quedar boca arriba
    d = .32; x = np.zeros(int(SR * d)); tq = tt(.16)
    poner(x, filtro(ruido(len(tq)), 'band', [1500, 6000]) * np.sin(np.pi * tq / .16) ** 2 * .6, 0)
    tq = tt(.12); poner(x, np.sin(2 * np.pi * 1760 * tq) * np.exp(-tq * 45) * .35 + np.sin(2 * np.pi * 2637 * tq) * np.exp(-tq * 60) * .15, .15)
    return x

def pulso(f, dur=.18, caida=22):
    tq = tt(dur); return (np.sin(2 * np.pi * f * tq) + .35 * np.sin(2 * np.pi * 2 * f * tq)) * np.exp(-tq * caida) * np.minimum(1, tq / .003)

def mazo_agregar():   # dos notas que suben
    x = np.zeros(int(SR * .32)); poner(x, pulso(784), 0); poner(x, pulso(1175), .075); return x
def mazo_quitar():    # dos notas que bajan
    x = np.zeros(int(SR * .32)); poner(x, pulso(1046.5), 0); poner(x, pulso(659.3), .075); return x
def mazo_rechazar():  # «no» sordo: dos golpecitos graves y apagados
    x = np.zeros(int(SR * .3)); p = filtro(pulso(196, .12, 30) + pulso(207.7, .12, 30), 'low', 1500)
    poner(x, p, 0); poner(x, p * .8, .1); return x

def gota_realidad():   # «plic» de gota (tono que sube muy rápido), chapoteo breve y un eco de ondas
    d = 1.3; n = int(SR * d); x = np.zeros(n)
    def plic(f0, f1, dur, amp):
        t = tt(dur); f = f0 * (f1 / f0) ** (t / dur)
        return tono(f) * np.exp(-t * 26) * amp
    poner(x, plic(520, 1650, .12, 1.0), .0)
    ch = filtro(ruido(int(SR * .35)), 'bandpass', [900, 5200]) * np.exp(-tt(.35) * 14) * .35
    poner(x, ch, .015)
    for k, (f0, f1, t0) in enumerate([(700, 1900, .16), (900, 2300, .27), (640, 1500, .41)]):
        poner(x, plic(f0, f1, .1, .45 / (k + 1)), t0)
    lav = filtro(ruido(n), 'lowpass', 700) * np.exp(-tt(d) * 4) * .12
    x += lav
    return x

def reki_huella():   # pisada suave: golpecito sordo y un roce corto
    d = .35; n = int(SR * d); x = np.zeros(n)
    t = tt(.12); golpe = np.sin(2 * np.pi * (95 + 40 * np.exp(-t * 40)) * t) * np.exp(-t * 38)
    poner(x, golpe, 0)
    roce = filtro(ruido(int(SR * .09)), 'bandpass', [1200, 4200]) * np.exp(-tt(.09) * 45) * .25
    poner(x, roce, .008)
    return x

SONIDOS = [('tablero-real', tablero_real, -18), ('nivel-destellos', nivel_destellos, -27), ('card-reveal', card_reveal, -28),
           ('mazo-agregar', mazo_agregar, -24), ('mazo-quitar', mazo_quitar, -25), ('mazo-rechazar', mazo_rechazar, -23),
           ('gota-realidad', gota_realidad, -24), ('reki-huella', reki_huella, -26)]
if __name__ == '__main__':
    for nombre, fn, db in SONIDOS: guardar(nombre, fn(), db)
