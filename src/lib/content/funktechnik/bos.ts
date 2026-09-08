/**
 * Textbausteine der Seite „BOS- und Behördenfunk".
 *
 * Grundlage sind ausschließlich öffentlich veröffentlichte Angaben: der
 * Frequenzplan der Bundesnetzagentur, die Veröffentlichungen der Bundesanstalt
 * für den Digitalfunk der BOS, die ETSI-Normen EN 300 392 und EN 300 396 sowie
 * die Verordnungen zu eCall und zur Notrufortung.
 *
 * Bewusst NICHT enthalten: Rufgruppenpläne, Kanalbelegungen einzelner
 * Behörden, Schlüsselmaterial, Betriebsverfahren im Einsatz. Diese Seite
 * erklärt Technik und Geschichte, sie ist kein Betriebsdokument.
 */

import type { ArticleSection } from './types';

export const LEARNING_GOALS = [
  'die analogen BOS-Bänder im 4-m- und 2-m-Bereich nach Aufgabe und Reichweite unterscheiden',
  'den Aufbau des TETRA-Digitalfunks mit Netzbetrieb und Direktbetrieb beschreiben',
  'begründen, warum der Wechsel von analog zu digital mehr war als ein Frequenzwechsel',
  'die Alarmierungswege vom Fünftonruf über POCSAG bis zum Digitalfunk einordnen',
  'erklären, wie ein Notruf über 112 heute seinen Standort mitbringt',
  'die Rechtslage zum Abhören von Funkanlagen richtig einschätzen'
];

export const SECTIONS: ArticleSection[] = [
  {
    id: 'grundlagen',
    title: 'Wer sind die BOS und warum ein eigener Funk',
    eyebrow: 'Einordnung',
    blocks: [
      {
        kind: 'p',
        text: 'Behörden und Organisationen mit Sicherheitsaufgaben — kurz BOS — ist der Sammelbegriff für Polizeien des Bundes und der Länder, Feuerwehren, Rettungsdienste, Katastrophenschutz, Technisches Hilfswerk und Zoll. Sie brauchen ein Funknetz, das drei Eigenschaften gleichzeitig erfüllt: Es muss auch dann arbeiten, wenn das öffentliche Netz überlastet oder ausgefallen ist, es muss Gruppen statt Einzelverbindungen bedienen, und es muss vertraulich sein.'
      },
      {
        kind: 'p',
        text: 'Der Gruppenruf ist dabei die eigentliche Besonderheit. Im Mobilfunk spricht einer mit einem; im Einsatzfunk spricht einer mit allen, die zu diesem Einsatz gehören. Wer mithört, weiß, was die anderen tun — genau wie im Flugfunk entsteht daraus ein gemeinsames Lagebild. Ein Telefonnetz kann das nicht ersetzen, auch mit beliebig viel Bandbreite nicht.'
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Diese Seite ist eine Lernhilfe, kein Betriebsdokument',
        text: 'Hier stehen nur öffentlich veröffentlichte Systemeigenschaften: Frequenzbereiche, Raster, Verfahren, Geschichte. Kanal- und Rufgruppenpläne einzelner Behörden, Schlüsselmaterial und Einsatzverfahren gehören nicht hierher und finden sich hier auch nicht.'
      }
    ]
  },
  {
    id: 'analog',
    title: 'Der analoge BOS-Funk im 4-m- und 2-m-Band',
    description: 'Zwei Bänder, zwei Aufgaben — und ein Kanalraster von 20 kHz.',
    blocks: [
      {
        kind: 'p',
        text: 'Über Jahrzehnte trug der analoge Sprechfunk den gesamten Einsatzverkehr. Er nutzte zwei Bereiche mit klarer Arbeitsteilung. Das 4-m-Band zwischen 74 und 87 MHz verband Fahrzeuge und Leitstellen: Die niedrige Frequenz reicht weit, kommt mit Bebauung und Bewuchs vergleichsweise gut zurecht und ließ sich mit einer Fahrzeugantenne gut nutzen. Das 2-m-Band zwischen 167 und 174 MHz war der Handsprechfunk an der Einsatzstelle — kürzere Reichweite, dafür handliche Geräte und kleine Antennen.'
      },
      {
        kind: 'p',
        text: 'Beide Bänder sind in ein Unterband und ein Oberband geteilt. Im 4-m-Band liegen sie 9,8 MHz auseinander, im 2-m-Band 4,6 MHz. Der Kanalabstand beträgt in beiden Fällen 20 kHz, und die Kanäle sind fortlaufend durchnummeriert — im 4-m-Band von 347 bis 510, im 2-m-Band von 201 bis 292. Aus Kanalnummer und Bandanfang lässt sich jede Frequenz unmittelbar ausrechnen.'
      },
      {
        kind: 'formula',
        formula: 'f_U(K) = f_0 + (K − K_0) · 20 kHz',
        alt: 'f Unterband von K gleich f null plus K minus K null mal 20 Kilohertz',
        label: 'Kanalfrequenz im analogen BOS-Funk',
        variables: [
          { symbol: 'f_U', meaning: 'Frequenz im Unterband', unit: 'Hz' },
          { symbol: 'f_0', meaning: 'Bandanfang, 74,215 MHz im 4-m-Band', unit: 'Hz' },
          { symbol: 'K', meaning: 'Kanalnummer' },
          { symbol: 'K_0', meaning: 'erste Kanalnummer des Bandes, 347 im 4-m-Band' }
        ]
      },
      {
        kind: 'p',
        text: 'Zum analogen Funk gehörten zwei Zusatzverfahren. Das Funkmeldesystem FMS übertrug kurze Datenblöcke — Statusmeldungen wie „Einsatz übernommen" oder „am Einsatzort", die in der Leitstelle automatisch verbucht wurden. Und die Alarmierung lief über Funkmeldeempfänger im 2-m-Band: zunächst mit einer Folge von fünf Tönen, die den richtigen Empfänger ansprachen, später digital mit POCSAG, das statt eines Melderufs eine Textmeldung mit Stichwort und Adresse übertrug.'
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Analog heißt: mithörbar',
        text: 'Der analoge BOS-Funk war unverschlüsselt. Jeder Empfänger im richtigen Bereich konnte den Verkehr hören — das war jahrzehntelang ein bekanntes und ungelöstes Problem des Systems und einer der Gründe für die Umstellung.'
      }
    ]
  },
  {
    id: 'digitalfunk',
    title: 'Der BOS-Digitalfunk auf TETRA-Basis',
    blocks: [
      {
        kind: 'p',
        text: 'Der heutige BOS-Digitalfunk arbeitet nach dem europäischen TETRA-Standard zwischen 380 und 395 MHz: Die Endgeräte senden im Bereich 380 bis 385 MHz, die Basisstationen 10 MHz höher zwischen 390 und 395 MHz. Jeder Träger belegt 25 kHz und wird im Zeitmultiplex in vier Zeitschlitze geteilt — vier Gespräche teilen sich also einen Kanal, was die Frequenzausnutzung gegenüber dem analogen Betrieb deutlich verbessert.'
      },
      {
        kind: 'dl',
        items: [
          {
            term: 'Netzbetrieb (TMO)',
            def: 'Die Geräte arbeiten über Basisstationen. Rufgruppen lassen sich landesweit schalten, Leitstellen sind eingebunden, und die Reichweite ist die des Netzes — nicht die des einzelnen Geräts.'
          },
          {
            term: 'Direktbetrieb (DMO)',
            def: 'Gerät zu Gerät ohne Netz, wie beim klassischen Sprechfunk. Das ist die Rückfallebene bei Netzausfall und der Weg für den Nahbereich an der Einsatzstelle, etwa im Gebäudeinneren.'
          },
          {
            term: 'Rufgruppe',
            def: 'Die logische Zusammenfassung der Teilnehmer eines Einsatzes. Anders als beim festen Kanal wird sie im Netz verwaltet und lässt sich im laufenden Einsatz ändern.'
          },
          {
            term: 'Verschlüsselung',
            def: 'Die Luftschnittstelle ist verschlüsselt; zusätzlich gibt es eine Ende-zu-Ende-Verschlüsselung über eine Sicherheitskarte im Gerät. Ein Mithören mit handelsüblichen Empfängern ist damit ausgeschlossen.'
          }
        ]
      },
      {
        kind: 'p',
        text: 'Getragen wird das Netz von der Bundesanstalt für den Digitalfunk der BOS, die 2007 gegründet wurde. 2016 ging der letzte Netzabschnitt in den Wirkbetrieb; seither arbeitet ein bundesweit einheitliches Netz, in dem Polizei, Feuerwehr und Rettungsdienste aller Länder dieselbe Technik nutzen und im Bedarfsfall miteinander sprechen können. Genau das war im analogen Betrieb der Schwachpunkt: Jede Behörde hatte ihre Kanäle, und über Ländergrenzen hinweg passte oft nichts zusammen.'
      },
      {
        kind: 'p',
        text: 'Digital heißt hier nicht schneller: TETRA überträgt Sprache in guter Verständlichkeit, aber Daten nur in bescheidenem Umfang. Für Bilder, Karten und Videoströme reicht es nicht. Deshalb wird seit Jahren an einer Ergänzung durch Breitbandtechnik gearbeitet — die Sprachgruppenkommunikation bleibt dabei die Grundfunktion, die auch bei Netzstörungen tragen muss.'
      }
    ]
  },
  {
    id: 'alarmierung',
    title: 'Alarmierung und Notruf',
    blocks: [
      {
        kind: 'p',
        text: 'Die Alarmierung ist ein eigener Weg neben dem Sprechfunk. Sie muss Menschen erreichen, die gerade nicht am Funkgerät sitzen — Angehörige der Freiwilligen Feuerwehr im Betrieb, Bereitschaftsdienste zu Hause. Die klassische Lösung ist der Funkmeldeempfänger im 2-m-Band, der jahrzehntelang mit dem Fünftonruf und später mit POCSAG angesprochen wurde. POCSAG überträgt eine Textzeile, ist außerordentlich robust und wird vielerorts bis heute parallel zum Digitalfunk betrieben, weil ein zweiter, unabhängiger Weg im Ernstfall Gold wert ist.'
      },
      {
        kind: 'p',
        text: 'In der Gegenrichtung steht der Notruf. In Deutschland führen 112 zur Feuerwehr- und Rettungsleitstelle und 110 zur Polizei; 112 ist zugleich der europaweit einheitliche Notruf und in jedem Mobilfunknetz erreichbar. Zwei Erweiterungen haben die Ortung entscheidend verbessert: Advanced Mobile Location übermittelt seit Oktober 2019 beim Wählen der 112 automatisch die Position des Mobiltelefons an die Leitstelle — deutlich genauer als die Funkzelle allein. Und eCall setzt seit dem 31. März 2018 in neu typgenehmigten Pkw bei einem Unfall selbsttätig einen 112-Anruf ab und überträgt dabei Ort, Fahrtrichtung und Fahrzeugdaten.'
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Der zuverlässigste Notrufweg im Inland',
        text: 'Für die allermeisten Lagen an Land ist der Anruf bei 112 über das Mobilfunknetz der schnellste und genaueste Weg. Funkwege sind dort sinnvoll, wo kein Netz verfügbar ist — auf See, in der Luft und bei großflächigen Ausfällen.'
      }
    ]
  },
  {
    id: 'recht',
    title: 'Was man hören darf und was nicht',
    blocks: [
      {
        kind: 'p',
        text: 'Für den Empfang von Funkaussendungen gilt in Deutschland ein Abhörverbot. Es stand früher in § 89 des Telekommunikationsgesetzes und wurde zum 1. Dezember 2021 in das damalige TTDSG überführt, das seit Mai 2024 TDDDG heißt. Nach § 5 TDDDG darf mit einer Funkanlage nur abgehört werden, was für den Betreiber der Anlage, für Funkamateure, für die Allgemeinheit oder für einen unbestimmten Personenkreis bestimmt ist.'
      },
      {
        kind: 'p',
        text: 'Behördenfunk fällt ausdrücklich nicht darunter. Wer ihn abhört oder Inhalte weitergibt, macht sich strafbar: § 27 TDDDG sieht dafür Freiheitsstrafe bis zu zwei Jahren oder Geldstrafe vor. Das gilt unabhängig davon, ob eine Verschlüsselung überwunden wurde — allein das Zurkenntnisnehmen ist untersagt. Erlaubt bleibt der Empfang dessen, was für die Allgemeinheit bestimmt ist: Rundfunk, Amateurfunk, AIS, ADS-B, Wettersatelliten.'
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Kein Rechtsrat',
        text: 'Diese Zusammenfassung dient der Orientierung und ersetzt keine Rechtsberatung. Maßgeblich sind der Gesetzestext in der jeweils geltenden Fassung sowie die Rechtsprechung.',
        source: '§ 5 und § 27 TDDDG (zuvor TTDSG, davor § 89 TKG)'
      }
    ]
  }
];
