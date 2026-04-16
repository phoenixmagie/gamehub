# Level erstellen Anleitung

Um ein neues Level hinzuzufügen, folge diesen 3 Schritten:

1. **Datei erstellen**: Erstelle im Ordner `level/` eine Datei namens `level_3.js`.
2. **Design zeichnen**: Kopiere den Inhalt von Level 1 und ändere das `layout` Array.
   - `#` : Fester Bodenblock
   - `-` : Schwebende Plattform
   - `F` : Zielflagge (Nur eine pro Level!)
   - Leerzeichen: Luft
3. **Registrieren**: Öffne `level/levels.js` und füge `'level_3'` zum Array hinzu.

Das Spiel schaltet das Level automatisch in der Auswahl frei, sobald das vorherige geschafft wurde.
