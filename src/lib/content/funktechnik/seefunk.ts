/**
 * Textbausteine der Seite „Seefunk und GMDSS".
 *
 * Grundlage sind die Vollzugsordnung für den Funkdienst (VO Funk, insbesondere
 * Appendix 15 und 18), das SOLAS-Übereinkommen Kapitel IV, die Empfehlungen
 * ITU-R M.493 und M.541 sowie die Veröffentlichungen des Bundesamtes für
 * Seeschifffahrt und Hydrographie. Zahlenwerte stehen als Daten in
 * `data/maritimeChannels.ts` und werden von den Komponenten dort gelesen.
 *
 * Die Seite ist eine Lernhilfe, kein Betriebsdokument.
 */

import type { ArticleSection } from './types';

export const LEARNING_GOALS = [
  'die vier GMDSS-Seegebiete A1 bis A4 dem jeweils tragenden Funksystem zuordnen',
  'Kanal 16, Kanal 70 und Kanal 13 nach ihrer Aufgabe unterscheiden',
  'Einfrequenz- und Zweifrequenzbetrieb im UKW-Seefunk auseinanderhalten',
  'den Ablauf einer Alarmierung vom digitalen Selektivruf bis zum Sprechverkehr beschreiben',
  'erklären, warum ein Schiff auf dem Atlantik andere Geräte braucht als eines in der Ostsee'
];

export const SECTIONS: ArticleSection[] = [
  {
    id: 'gmdss',
    title: 'Das GMDSS und seine vier Seegebiete',
    eyebrow: 'Systematik',
    description:
      'Warum die Ausrüstungspflicht eines Schiffes davon abhängt, wie weit es von der Küste entfernt fährt.',
    blocks: [
      {
        kind: 'p',
        text: 'Bis in die 1990er Jahre beruhte der Seenotfunk auf dem menschlichen Ohr: Ein Funkoffizier hörte die Not- und Anruffrequenzen ab, und ob ein Notruf ankam, hing davon ab, ob gerade jemand zuhörte. Das Weltweite Seenot- und Sicherheitsfunksystem GMDSS kehrt das Prinzip um. Nicht mehr der Mensch wacht, sondern das Gerät: Ein digitaler Selektivruf löst an Bord jeder Empfangsstation einen Alarm aus, überträgt Kennung, Notfallart und Position — und erst danach beginnt das Gespräch.'
      },
      {
        kind: 'p',
        text: 'Damit die Ausrüstung zum Fahrtgebiet passt, teilt das SOLAS-Übereinkommen die Weltmeere in vier Seegebiete ein. Die Einteilung folgt nicht der Entfernung in Seemeilen, sondern der Frage, welches Funksystem an dieser Stelle noch eine Rettungsleitstelle erreicht. Wer nur in Sichtweite der Küste fährt, kommt mit einer UKW-Anlage aus; wer den Atlantik quert, braucht Satellitenfunk oder Kurzwelle.'
      },
      {
        kind: 'ol',
        items: [
          'A1 — in Reichweite einer UKW-Küstenfunkstelle mit Dauerwache auf Kanal 70.',
          'A2 — außerhalb von A1, aber in Reichweite einer Grenzwellen-Küstenfunkstelle auf 2187,5 kHz.',
          'A3 — außerhalb von A1 und A2 unter der Ausleuchtzone geostationärer Satelliten, etwa zwischen 76° Nord und 76° Süd.',
          'A4 — die Polargebiete, in denen kein geostationärer Satellit mehr über dem Horizont steht; dort trägt die Kurzwelle allein.'
        ]
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Die Gebiete bauen aufeinander auf',
        text: 'Ein Schiff im Gebiet A3 führt die Ausrüstung für A1 und A2 mit. Die Einteilung sagt also nicht, welches System benutzt wird, sondern welches zusätzlich an Bord sein muss.',
        source: 'SOLAS Kapitel IV; IMO Res. A.801(19)'
      }
    ]
  },
  {
    id: 'ukw-seefunk',
    title: 'UKW-Seefunk: Kanäle, Raster und Betriebsarten',
    blocks: [
      {
        kind: 'p',
        text: 'Der UKW-Seefunk arbeitet zwischen 156 und 162 MHz mit Frequenzmodulation und einem Kanalraster von 25 kHz. Die Kanalnummern wirken auf den ersten Blick unsortiert: Auf Kanal 60 folgt Kanal 1, dann 61, dann 2. Der Grund ist historisch — ursprünglich lagen die Kanäle 1 bis 28 im Abstand von 50 kHz. Als das Raster halbiert wurde, bekamen die neuen Kanäle dazwischen die Nummern 60 bis 88. Wer das weiß, liest die Tabelle sofort richtig.'
      },
      {
        kind: 'dl',
        items: [
          {
            term: 'Kanal 16 (156,800 MHz)',
            def: 'Not-, Dringlichkeits- und Sicherheitsverkehr sowie Anruf. Küstenfunkstellen hören ständig mit; Gespräche werden nach der Verkehrsaufnahme auf einen Arbeitskanal verlegt.'
          },
          {
            term: 'Kanal 70 (156,525 MHz)',
            def: 'Ausschließlich digitaler Selektivruf. Auf diesem Kanal wird nicht gesprochen — er trägt nur die Alarmierung und den Verbindungsaufbau.'
          },
          {
            term: 'Kanal 13 (156,650 MHz)',
            def: 'Verkehr zur Sicherheit der Schifffahrt von Brücke zu Brücke, weltweit einheitlich. Hier wird abgesprochen, wer wem ausweicht.'
          },
          {
            term: 'Kanal 6 (156,300 MHz)',
            def: 'Schiff–Schiff; zusätzlich für den Verkehr mit Luftfahrzeugen bei Such- und Rettungseinsätzen vorgesehen.'
          }
        ]
      },
      {
        kind: 'p',
        text: 'Ein Teil der Kanäle arbeitet im Einfrequenzbetrieb: Schiff und Gegenstelle senden auf derselben Frequenz und müssen sich abwechseln. Die übrigen sind Zweifrequenzkanäle, bei denen die Küstenfunkstelle exakt 4,6 MHz höher sendet als das Schiff. Das erlaubt gleichzeitiges Sprechen in beide Richtungen und war die technische Grundlage des früheren öffentlichen Telefonverkehrs über Küstenfunkstellen.'
      },
      {
        kind: 'p',
        text: 'Die Sendeleistung einer Schiffsfunkstelle beträgt höchstens 25 W. Auf einigen Kanälen ist sie auf 1 W begrenzt: bei den Bordverkehrskanälen 15 und 17, damit das Gespräch an Deck nicht halbe Reviere belegt, und bei den Kanälen 75 und 76, die als Schutzabstand unmittelbar neben dem Notkanal 16 liegen.'
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'ATIS auf den Binnenwasserstraßen',
        text: 'Auf Rhein, Donau und den übrigen europäischen Binnenwasserstraßen verlangt die Regionale Vereinbarung über den Binnenschifffahrtsfunk zusätzlich ATIS: Am Ende jeder Aussendung sendet das Gerät automatisch eine aus der MMSI abgeleitete Kennung. Damit ist jede Aussendung eindeutig einem Fahrzeug zuzuordnen — ein Seefunkgerät ohne ATIS darf auf diesen Wasserstraßen nicht betrieben werden.',
        source: 'RAINWAT (Basel 2000, Fassung Bukarest 2012)'
      }
    ]
  },
  {
    id: 'dsc',
    title: 'Digitaler Selektivruf und MMSI',
    blocks: [
      {
        kind: 'p',
        text: 'Der digitale Selektivruf ist das Nervensystem des GMDSS. Ein Tastendruck erzeugt ein kurzes, fehlergesichertes Datentelegramm mit der eigenen Kennung, der Art des Notfalls und der Position aus dem Navigationsempfänger. Es wird auf Kanal 70 mehrfach ausgesendet; jede Station in Reichweite gibt Alarm, und die Leitstelle weiß, wer wo in Not ist, bevor ein Wort gesprochen wurde.'
      },
      {
        kind: 'ol',
        items: [
          'Alarmierung: Das Schiff sendet den Notalarm als digitalen Selektivruf auf Kanal 70 oder auf der zuständigen Grenz- bzw. Kurzwellenfrequenz.',
          'Bestätigung: Die Küstenfunkstelle quittiert den Alarm — nicht jedes Schiff, das mithört, denn eine Flut von Quittungen würde die Frequenz blockieren.',
          'Verkehrsaufnahme: Der eigentliche Notverkehr läuft anschließend im Sprechfunk auf Kanal 16 beziehungsweise 2182 kHz.'
        ]
      },
      {
        kind: 'p',
        text: 'Die Kennung ist die MMSI, eine neunstellige Nummer. Ihre ersten drei Ziffern sind die Seefunkstellenkennzahl des Flaggenstaates — 211 und 218 stehen für Deutschland. Küstenfunkstellen tragen eine MMSI, die mit zwei Nullen beginnt, Gruppenrufe eine mit einer Null. Dieselbe Nummer verwenden auch AIS, Seenotfunkbaken und die Satellitenanlagen an Bord, sodass alle Meldungen eines Schiffes derselben Kennung zugeordnet werden können.'
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Fehlalarme sind das Hauptproblem',
        text: 'Ein erheblicher Teil aller DSC-Notalarme wird versehentlich ausgelöst — durch eine ungesicherte Taste, eine falsch programmierte MMSI oder eine Prüfung ohne Kenntnis der Wirkung. Ein versehentlicher Alarm wird nicht ignoriert, sondern auf Kanal 16 unverzüglich zurückgenommen.'
      }
    ]
  },
  {
    id: 'grenzwelle-kurzwelle',
    title: 'Grenzwelle und Kurzwelle',
    blocks: [
      {
        kind: 'p',
        text: 'Jenseits der UKW-Reichweite übernimmt der Bereich um 2 MHz. Die Bodenwelle folgt hier der Meeresoberfläche, die als guter Leiter wirkt, und trägt bei ausreichender Leistung über hundert Seemeilen weit. Die Not- und Anruffrequenz 2182 kHz ist die älteste noch genutzte Sprechfunkfrequenz des Seefunks; der digitale Selektivruf liegt dicht daneben auf 2187,5 kHz.'
      },
      {
        kind: 'p',
        text: 'Für größere Entfernungen bleibt die Kurzwelle. Der Seefunk nutzt Bandsegmente bei 4, 6, 8, 12 und 16 MHz, und in jedem dieser Bänder wiederholt sich dieselbe Dreiteilung: eine Frequenz für den digitalen Selektivruf, eine für den anschließenden Sprechverkehr und eine für das Funkfernschreiben. Welches Band trägt, entscheidet die Ionosphäre: nachts die niedrigen Bänder, tagsüber die höheren.'
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Warum fünf Bänder statt eines',
        text: 'Eine einzige Kurzwellenfrequenz wäre nutzlos, weil ihre Reichweite mit Tageszeit, Jahreszeit und Sonnenaktivität um Größenordnungen schwankt. Erst die Staffelung über fünf Bänder macht die Erreichbarkeit rund um die Uhr wahrscheinlich.'
      }
    ]
  },
  {
    id: 'navtex-ais',
    title: 'NAVTEX und AIS: Information ohne Anruf',
    blocks: [
      {
        kind: 'p',
        text: 'Nicht jede sicherheitsrelevante Nachricht braucht einen Gesprächspartner. NAVTEX sendet Navigationswarnungen, Wettermeldungen und Suchmeldungen als Funkfernschreiben auf 518 kHz in englischer Sprache aus; 490 kHz trägt dieselben Meldungen in der Landessprache, 4209,5 kHz versorgt tropische Seegebiete. Der Empfänger an Bord läuft unbeaufsichtigt, sortiert Doppelmeldungen aus und druckt oder zeigt nur, was neu ist.'
      },
      {
        kind: 'p',
        text: 'Das automatische Identifikationssystem AIS arbeitet auf 161,975 und 162,025 MHz — den beiden Frequenzen, die früher als Küstenkanäle 87B und 88B geführt wurden. Jedes ausgerüstete Fahrzeug meldet fortlaufend Kennung, Position, Kurs und Geschwindigkeit. Die Stationen teilen sich die Kanäle in Zeitschlitzen und stimmen sich dabei selbst ab, ohne dass eine Zentrale den Zugriff steuert.'
      },
      {
        kind: 'ul',
        items: [
          'AIS ersetzt keinen Ausguck und kein Radar: Nicht jedes Fahrzeug sendet, und die gemeldete Position ist nur so gut wie die Navigationsanlage an Bord.',
          'AIS-SART sind Seenotbaken, die statt eines eigenen Funkrufs eine auffällige AIS-Meldung erzeugen und damit auf jedem Kartenplotter der Umgebung erscheinen.',
          'Weil AIS-Meldungen unverschlüsselt gesendet werden, kann sie jeder empfangen — daraus sind die öffentlichen Schiffsverfolgungsdienste im Internet entstanden.'
        ]
      }
    ]
  },
  {
    id: 'satellit',
    title: 'Seenotfunkbaken und Satellitenfunk',
    blocks: [
      {
        kind: 'p',
        text: 'Die Seenotfunkbake EPIRB ist die letzte Rückfallebene. Sie löst sich beim Sinken selbsttätig aus dem Halter, schwimmt auf und sendet zwischen 406,0 und 406,1 MHz ein kodiertes Telegramm mit ihrer weltweit eindeutigen Kennung — bei modernen Baken zusammen mit der Position aus dem eigenen Navigationsempfänger. Satelliten des Systems Cospas-Sarsat nehmen die Aussendung auf und leiten sie an die zuständige Rettungsleitstelle weiter.'
      },
      {
        kind: 'p',
        text: 'Ein schwaches Zusatzsignal auf 121,5 MHz dient nur noch der Feinpeilung durch das anfliegende Rettungsmittel. Die Auswertung von Notrufen auf 121,5 MHz durch Satelliten wurde 2009 eingestellt, weil das analoge Signal keine Kennung trug und die überwiegende Mehrheit der Alarme Fehlauslösungen waren.'
      },
      {
        kind: 'p',
        text: 'Für den laufenden Betrieb im Seegebiet A3 sorgen die Satellitensysteme. Inmarsat mit seinen geostationären Satelliten trägt das GMDSS seit Jahrzehnten; seit 2020 ist mit Iridium ein zweites System anerkannt, dessen niedrige polnahe Umlaufbahnen auch die Gebiete A4 abdecken. Beide bieten eine Notruftaste, die unmittelbar eine Rettungsleitstelle erreicht, und einen Rundsendedienst für Sicherheitsmeldungen an alle Schiffe eines Seegebiets.'
      }
    ]
  },
  {
    id: 'betrieb',
    title: 'Funkzeugnisse und Rechtsrahmen',
    blocks: [
      {
        kind: 'p',
        text: 'Eine Seefunkstelle darf nur bedienen, wer ein passendes Zeugnis besitzt. In der Sportschifffahrt sind das das UKW-Sprechfunkzeugnis SRC für den Betrieb im Seegebiet A1 und das Allgemeine Sprechfunkzeugnis LRC für Grenz- und Kurzwelle sowie Satellitenanlagen; auf Binnenwasserstraßen tritt das UBI hinzu. In der Berufsschifffahrt gelten die Zeugnisse nach dem STCW-Übereinkommen.'
      },
      {
        kind: 'p',
        text: 'Jede Seefunkstelle braucht außerdem eine Frequenzzuteilung mit Rufzeichen und MMSI. In Deutschland erteilt sie die Bundesnetzagentur. Wer ein Schiff verkauft oder außer Dienst stellt, muss die Zuteilung zurückgeben — sonst bleibt eine MMSI im Umlauf, hinter der niemand mehr steht.'
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Keine amtliche Quelle',
        text: 'Diese Seite dient dem Lernen. Verbindlich sind allein die amtlichen Veröffentlichungen: die Vollzugsordnung für den Funkdienst, die Nachrichten für Seefahrer, die ITU-Listen der Küsten- und Schiffsfunkstellen sowie die Verfügungen der Bundesnetzagentur. Missbräuchliche Aussendungen auf Not- und Anruffrequenzen sind strafbar.'
      }
    ]
  }
];
