# Jump 'n' Run Level Creator

### Symbole im Raster:
- `S` : **Spawnpunkt** (Hier startet der Spieler).
- `#` : **Bodenblock** (Massiv).
- `-` : **Plattform** (Massiv, anderes Design).
- `F` : **Zielflagge** (Beendet das Level und schaltet das nächste frei).
- ` ` : **Leerraum** (Luft).

### Neues Level hinzufügen:
1. Neue Datei `level_X.js` im Ordner `level/` erstellen.
2. Code exportieren: `export const layout = [ ... ];`
3. Die Datei in `level/levels.js` in die Liste eintragen.

**Wichtig:** Jedes Level muss ein `S` (Start) und ein `F` (Ziel) haben!
