# 🛠️ Jump 'n' Run Leveleditor Handbuch

Willkommen beim Leveleditor! Dieses System erlaubt es dir, komplexe Level allein durch das Anordnen von Textzeichen in deinen Level-Dateien (`level_1.js`, `level_2.js`, etc.) zu erstellen.

---

## 🏗️ Das Grundprinzip
Jedes Zeichen in deinem `layout`-Array repräsentiert eine "Kachel" (Tile) von **40x40 Pixeln**. Die Anordnung der Zeichen im Code entspricht direkt dem, was du später im Spiel siehst.

### Die Symbole (Tiles)

| Zeichen | Typ | Funktion |
| :---: | :--- | :--- |
| **`S`** | **Spawn** | Startpunkt des Spielers. (Nur 1x pro Level!) |
| **`#`** | **Boden** | Massiver Block. Basis für Boden und Wände. |
| **`-`** | **Plattform** | Schmalerer Block für schwebende Hindernisse. |
| **`C`** | **Coin** | Sammelbare Münze. Erhöht den Punktestand. |
| **`P`** | **Checkpoint** | Berühren speichert die Position für den Respawn. |
| **`E`** | **Gegner** | Ein Feind, der patrouilliert. Sprung von oben besiegt ihn. |
| **`X`** | **Grenze** | Unsichtbarer Wendepunkt für Gegner. |
| **`F`** | **Flagge** | Das Ziel. Beendet das Level bei Berührung. |
| **` `** | **Luft** | Ein Leerzeichen ist begehbarer Freiraum. |

---

## 👾 Gegner-Mechanik (KI)
Gegner (`E`) laufen automatisch nach rechts, bis sie auf ein Hindernis stoßen. Sie drehen um, wenn sie kollidieren mit:
1. Einem festen Block (**`#`**)
2. Einer Plattform (**`-`**)
3. Einem Wendepunkt (**`X`**)

**Profi-Tipp für Patrouillen:**
Wenn ein Gegner auf einer schwebenden Plattform laufen soll, ohne herunterzufallen, setze die Wendepunkte so:
`X  E  X`  (Der Gegner läuft nur zwischen den unsichtbaren X-Punkten).

---

## 📐 Design-Richtlinien
Damit deine Level Spaß machen und schaffbar sind, beachte diese Maße:

* **Maximale Weitsprung-Distanz:** Ca. 4 bis 5 leere Felder.
* **Maximale Sprunghöhe:** Ca. 3 Felder hoch.
* **Todeszone:** Wenn der Spieler zu tief fällt (unter den Bildschirmrand), verliert er ein Leben und respawnt am letzten Checkpoint (`P`) oder am Start (`S`).

---

## 🚀 Ein neues Level hinzufügen

### Schritt 1: Datei erstellen
Erstelle im Ordner `level/` eine neue Datei namens `level_3.js`.
```javascript
export const layout = [
    "                                     ",
    "       C   C   C                     ",
    "      -------                        ",
    "                                     ",
    "   S      X  E   X      P      F     ",
    "  ####    ########     ###    #######",
    "#####################################",
];
