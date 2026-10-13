// ===== 1. Elemente aus dem HTML holen =====
var formular = document.getElementById("zeitFormular");
var ergebnisBereich = document.getElementById("ergebnisBereich");
var eintragsListe = document.getElementById("eintragsListe");
var loeschenButton = document.getElementById("loeschenButton");


// ===== 2. Gespeicherte Einträge laden =====
// Alle Einträge sind in dieser Liste (Array)
var eintraege = [];

var gespeichert = localStorage.getItem("arbeitszeiten");
if (gespeichert !== null) {
    eintraege = JSON.parse(gespeichert);
}

// Beim Öffnen der Seite die Einträge anzeigen
zeigeEintraege();


// ===== 3. Wenn das Formular abgeschickt wird =====
formular.addEventListener("submit", function (event) {
    // Verhindert, dass die Seite neu lädt
    event.preventDefault();

    // Werte aus dem Formular lesen
    var name = document.getElementById("mitarbeiter").value;
    var datum = document.getElementById("datum").value;
    var beginn = document.getElementById("beginn").value;
    var ende = document.getElementById("ende").value;
    var pause = Number(document.getElementById("pause").value);

    // Eingaben prüfen
    if (name.trim() === "") {
        zeigeFehler("Bitte gib einen Namen ein.");
        return;
    }

    if (datum === "" || beginn === "" || ende === "") {
        zeigeFehler("Bitte fülle alle Felder aus.");
        return;
    }

    if (isNaN(pause) || pause < 0) {
        zeigeFehler("Die Pause darf nicht negativ sein.");
        return;
    }

    // Uhrzeiten in Minuten umrechnen
    var beginnMinuten = zeitInMinuten(beginn);
    var endeMinuten = zeitInMinuten(ende);

    if (endeMinuten <= beginnMinuten) {
        zeigeFehler("Das Arbeitsende muss nach dem Arbeitsbeginn liegen.");
        return;
    }

    // Arbeitszeit berechnen
    var dauer = endeMinuten - beginnMinuten - pause;

    if (dauer <= 0) {
        zeigeFehler("Die Pause ist länger als die Arbeitszeit.");
        return;
    }

    var stunden = Math.floor(dauer / 60);
    var minuten = dauer % 60;
    var anzeige = stunden + " Std. " + minuten + " Min.";

    // Neuen Eintrag erstellen und speichern
    var neuerEintrag = {
        name: name.trim(),
        datum: datum,
        beginn: beginn,
        ende: ende,
        pause: pause,
        anzeige: anzeige
    };

    eintraege.push(neuerEintrag);
    localStorage.setItem("arbeitszeiten", JSON.stringify(eintraege));

    // Ergebnis anzeigen
    zeigeErgebnis(neuerEintrag);

    // Liste neu anzeigen und Formular leeren
    zeigeEintraege();
    formular.reset();
    document.getElementById("pause").value = 60;
});


// ===== 4. Button "Alle löschen" =====
loeschenButton.addEventListener("click", function () {
    eintraege = [];
    localStorage.removeItem("arbeitszeiten");
    zeigeEintraege();

    ergebnisBereich.className = "karte ergebnis";
    ergebnisBereich.innerHTML = "<h2>Dein Ergebnis</h2>";
    ergebnisBereich.appendChild(
        neuerAbsatz("Alle gespeicherten Einträge wurden gelöscht.", "")
    );
});


// ===== 5. Hilfsfunktionen =====

// Rechnet "08:30" in Minuten um (= 510)
function zeitInMinuten(zeit) {
    var teile = zeit.split(":");
    var stunden = Number(teile[0]);
    var minuten = Number(teile[1]);
    return stunden * 60 + minuten;
}

// Erstellt einen Absatz <p> mit Text und optionaler Klasse
function neuerAbsatz(text, klasse) {
    var p = document.createElement("p");
    p.textContent = text;
    if (klasse !== "") {
        p.className = klasse;
    }
    return p;
}

// Zeigt eine Fehlermeldung im Ergebnis-Bereich
function zeigeFehler(text) {
    ergebnisBereich.className = "karte ergebnis";
    ergebnisBereich.innerHTML = "<h2>Dein Ergebnis</h2>";
    ergebnisBereich.appendChild(neuerAbsatz(text, "fehlermeldung"));
}

// Zeigt das Ergebnis im Ergebnis-Bereich
function zeigeErgebnis(eintrag) {
    ergebnisBereich.className = "karte ergebnis ergebnis-erfolg";
    ergebnisBereich.innerHTML = "<h2>Dein Ergebnis</h2>";

    ergebnisBereich.appendChild(neuerAbsatz(eintrag.name + " · " + eintrag.datum, ""));
    ergebnisBereich.appendChild(neuerAbsatz("Arbeitsbeginn: " + eintrag.beginn + " Uhr", ""));
    ergebnisBereich.appendChild(neuerAbsatz("Arbeitsende: " + eintrag.ende + " Uhr", ""));
    ergebnisBereich.appendChild(neuerAbsatz("Pause: " + eintrag.pause + " Minuten", ""));
    ergebnisBereich.appendChild(neuerAbsatz("Effektive Arbeitszeit:", ""));
    ergebnisBereich.appendChild(neuerAbsatz(eintrag.anzeige, "grosse-zeit"));
}

// Zeigt alle gespeicherten Einträge (neuester zuerst)
function zeigeEintraege() {
    if (eintraege.length === 0) {
        eintragsListe.innerHTML = "<p>Noch keine Einträge vorhanden.</p>";
        return;
    }

    // Liste leeren
    eintragsListe.innerHTML = "";

    // Von hinten nach vorne durchgehen
    for (var i = eintraege.length - 1; i >= 0; i--) {
        var eintrag = eintraege[i];

        var zeile = document.createElement("div");
        zeile.className = "eintrag";

        zeile.appendChild(neuerAbsatz(eintrag.name + " · " + eintrag.datum, ""));
        zeile.appendChild(neuerAbsatz(
            eintrag.beginn + "–" + eintrag.ende + " Uhr · Pause: " + eintrag.pause + " Min.", ""
        ));
        zeile.appendChild(neuerAbsatz("Arbeitszeit: " + eintrag.anzeige, ""));

        eintragsListe.appendChild(zeile);
    }
}