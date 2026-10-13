
// Elemente aus dem HTML holen
const formular = document.getElementById("zeitFormular");
const ergebnisBereich = document.getElementById("ergebnisBereich");
const eintragsListe = document.getElementById("eintragsListe");
const loeschenButton = document.getElementById("loeschenButton");

// Gespeicherte Einträge aus dem Browser laden
let eintraege = JSON.parse(localStorage.getItem("arbeitszeiten")) || [];

// Einträge anzeigen, wenn die Seite geöffnet wird
zeigeEintraege();

// Formular wird abgeschickt
formular.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("mitarbeiter").value.trim();
    const datum = document.getElementById("datum").value;
    const beginn = document.getElementById("beginn").value;
    const ende = document.getElementById("ende").value;
    const pause = Number(document.getElementById("pause").value);

    // Prüfen, ob die Eingaben sinnvoll sind
    if (name === "") {
        zeigeFehler("Bitte gib einen Namen ein.");
        return;
    }

    if (beginn === "" || ende === "" || datum === "") {
        zeigeFehler("Bitte fülle alle Felder aus.");
        return;
    }

    if (pause < 0 || !Number.isFinite(pause)) {
        zeigeFehler("Die Pause darf nicht negativ sein.");
        return;
    }

    // Uhrzeiten in Minuten umrechnen
    const beginnTeile = beginn.split(":");
    const endeTeile = ende.split(":");

    const beginnMinuten =
        Number(beginnTeile[0]) * 60 + Number(beginnTeile[1]);

    const endeMinuten =
        Number(endeTeile[0]) * 60 + Number(endeTeile[1]);

    if (endeMinuten <= beginnMinuten) {
        zeigeFehler(
            "Das Arbeitsende muss nach dem Arbeitsbeginn liegen."
        );
        return;
    }

    const dauerMinuten = endeMinuten - beginnMinuten - pause;

    if (dauerMinuten <= 0) {
        zeigeFehler("Die Pause ist länger als die Arbeitszeit.");
        return;
    }

    const stunden = Math.floor(dauerMinuten / 60);
    const minuten = dauerMinuten % 60;

    const stundenAnzeige = stunden + " Std. " + minuten + " Min.";

    const neuerEintrag = {
        name: name,
        datum: datum,
        beginn: beginn,
        ende: ende,
        pause: pause,
        arbeitszeit: dauerMinuten,
        anzeige: stundenAnzeige
    };

    eintraege.push(neuerEintrag);

    // Einträge im Browser speichern
    localStorage.setItem("arbeitszeiten", JSON.stringify(eintraege));

    ergebnisBereich.className = "karte ergebnis ergebnis-erfolg";

    ergebnisBereich.innerHTML = `
        <h2>Dein Ergebnis</h2>
        <p><strong>${sichererText(name)}</strong> · ${datum}</p>
        <p>Arbeitsbeginn: ${beginn} Uhr</p>
        <p>Arbeitsende: ${ende} Uhr</p>
        <p>Pause: ${pause} Minuten</p>
        <p>Effektive Arbeitszeit:</p>
        <p class="grosse-zeit">${stundenAnzeige}</p>
    `;

    zeigeEintraege();
    formular.reset();

    document.getElementById("pause").value = 60;
});

function zeigeFehler(text) {
    ergebnisBereich.className = "karte ergebnis";

    ergebnisBereich.innerHTML = `
        <h2>Dein Ergebnis</h2>
        <p class="fehlermeldung">${text}</p>
    `;
}

function zeigeEintraege() {
    if (eintraege.length === 0) {
        eintragsListe.innerHTML =
            "<p>Noch keine Einträge vorhanden.</p>";
        return;
    }

    eintragsListe.innerHTML = "";

    for (let i = eintraege.length - 1; i >= 0; i--) {
        const eintrag = eintraege[i];
        const zeile = document.createElement("div");

        zeile.className = "eintrag";

        const nameZeile = document.createElement("p");
        nameZeile.textContent = eintrag.name + " · " + eintrag.datum;

        const zeitZeile = document.createElement("p");
        zeitZeile.textContent =
            eintrag.beginn + "–" + eintrag.ende
            + " Uhr · Pause: " + eintrag.pause + " Min.";

        const dauerZeile = document.createElement("p");
        dauerZeile.textContent =
            "Arbeitszeit: " + eintrag.anzeige;

        zeile.appendChild(nameZeile);
        zeile.appendChild(zeitZeile);
        zeile.appendChild(dauerZeile);

        eintragsListe.appendChild(zeile);
    }
}

loeschenButton.addEventListener("click", function () {
    eintraege = [];

    localStorage.removeItem("arbeitszeiten");
    zeigeEintraege();

    ergebnisBereich.className = "karte ergebnis";

    ergebnisBereich.innerHTML = `
        <h2>Dein Ergebnis</h2>
        <p>Alle gespeicherten Einträge wurden gelöscht.</p>
    `;
});

// Sonderzeichen im Namen sicher als Text anzeigen
function sichererText(text) {
    const element = document.createElement("span");
    element.textContent = text;

    return element.innerHTML;
}
