/**
 * Textbausteine der Seite „Quellen & Stand“.
 *
 * Führt die Regelwerke, Normen und Datensätze auf, aus denen die Inhalte
 * dieser Anwendung stammen, und benennt die bekannten Unsicherheiten.
 */

import type { ArticleSection } from './types';

export const SECTIONS: ArticleSection[] = [
  {
    id: 'haftung',
    title: 'Was diese Anwendung ist — und was nicht',
    eyebrow: 'Hinweis',
    blocks: [
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Keine amtliche Quelle, kein Betriebsdokument',
        text: 'Bandbreite ist eine Lern- und Nachschlageanwendung. Frequenzangaben, Bandgrenzen, Leistungsgrenzen und Kanaltabellen sind nach bestem Wissen zusammengetragen, ersetzen aber keine amtliche Veröffentlichung. Für Antragstellung, Funkbetrieb, Navigation, Not- und Sicherheitsfunk sowie jede rechtliche Bewertung gelten ausschließlich die unten genannten Primärquellen in ihrer jeweils gültigen Fassung.'
      },
      {
        kind: 'p',
        text: 'Alle Texte sind eigenständig formuliert. Übernommen sind ausschließlich überprüfbare Tatsachenangaben — Frequenzgrenzen, Kanalraster, Jahreszahlen, Formeln und Normbezeichnungen. Rechenergebnisse der Werkzeuge beruhen auf den jeweils genannten Modellen und geben Größenordnungen wieder; die tatsächlichen Werte einer Funkstrecke hängen von Gelände, Bebauung, Wetter und Gerätetechnik ab.'
      },
      {
        kind: 'p',
        text: 'Wo eine Angabe nicht gesichert werden konnte, ist sie im Datensatz als Annahme gekennzeichnet und in dieser Seite unter „Bekannte Unsicherheiten“ aufgeführt.'
      }
    ]
  },
  {
    id: 'regelwerke',
    title: 'Regulatorische Grundlagen',
    blocks: [
      {
        kind: 'table',
        caption: 'Rechtliche und regulatorische Quellen',
        head: ['Quelle', 'Herausgeber', 'Verwendet für'],
        rows: [
          [
            'Vollzugsordnung für den Funkdienst (VO Funk / Radio Regulations)',
            'Internationale Fernmeldeunion (ITU-R)',
            'Definition der Funkdienste (Art. 1), Zuweisungstabelle (Art. 5), Not- und Sicherheitsfunk (Art. 30–34)'
          ],
          [
            'Frequenzplan nach § 90 TKG',
            'Bundesnetzagentur',
            'Nationale Zuweisungen, Funkanwendungen und Nutzungsbestimmungen'
          ],
          [
            'Allgemeinzuteilungen (PMR446, Freenet, CB-Funk, SRD)',
            'Bundesnetzagentur',
            'Leistungsgrenzen und Kanäle des Jedermannfunks'
          ],
          [
            'ECC-Beschlüsse und European Common Allocation Table',
            'CEPT / ECC',
            'Europaweit harmonisierte Nutzungen'
          ],
          [
            'Amateurfunkgesetz und Amateurfunkverordnung',
            'Bundesrepublik Deutschland',
            'Zeugnisklassen, Bandgrenzen und Leistungsgrenzen im Amateurfunk'
          ],
          [
            'Bandpläne HF und VHF/UHF/Mikrowellen',
            'IARU Region 1',
            'Betriebsartensegmente innerhalb der Amateurfunkbänder'
          ],
          [
            'Genfer Wellenpläne GE75, GE84 und GE06',
            'ITU',
            'Raster und Bereiche für AM-Rundfunk, UKW sowie DAB und DVB-T2'
          ],
          [
            'SOLAS Kapitel IV und GMDSS-Regelwerk',
            'Internationale Seeschifffahrts-Organisation (IMO)',
            'Seenot- und Sicherheitsfunk, Seegebiete A1 bis A4'
          ],
          [
            'Annex 10 zum Abkommen über die internationale Zivilluftfahrt',
            'ICAO',
            'Flugfunk, Notfrequenzen, Navigationsverfahren'
          ]
        ]
      }
    ]
  },
  {
    id: 'normen',
    title: 'Technische Normen und Fachliteratur',
    blocks: [
      {
        kind: 'table',
        caption: 'Technische Quellen der Berechnungen und Datensätze',
        head: ['Quelle', 'Gegenstand', 'Verwendet für'],
        rows: [
          ['ITU-R P.525', 'Freiraumausbreitung', 'Freiraumdämpfung und Reichweitenabschätzung'],
          ['ITU-R P.676', 'Gasförmige Dämpfung', 'Sauerstoff- und Wasserdampflinien der Dämpfungskurven'],
          ['ITU-R P.838', 'Regendämpfung', 'Spezifische Dämpfung durch Niederschlag'],
          ['ITU-R P.840', 'Wolken und Nebel', 'Dämpfung durch Flüssigwasser in der Atmosphäre'],
          ['ITU-R P.372', 'Funkrauschen', 'Einordnung der Rauschbeiträge'],
          ['ITU-R M.493 und M.541', 'Digitaler Selektivruf', 'DSC-Kanäle im Seefunk'],
          ['ITU-R M.2150 und M.2160', 'IMT-2020 und IMT-2030', 'Kennwerte von 5G und der 6G-Ausblick'],
          ['3GPP TS 36.101 und TS 38.101', 'LTE- und NR-Bandtabellen', 'Uplink- und Downlink-Bereiche der Mobilfunkbänder'],
          ['ETSI TS 145 005 sowie EN 300 401', 'GSM-Funkübertragung und DAB', 'Kanalraster und Systemparameter'],
          ['ETSI EN 302 755', 'DVB-T2', 'Kanalbreite und Übertragungsverfahren'],
          ['IEEE Std 521', 'Radarband-Bezeichnungen', 'Buchstabenbänder L bis W'],
          ['Merrill I. Skolnik: Introduction to Radar Systems', 'Radartechnik', 'Radargleichung und Kenngrößen'],
          ['CODATA und SI-Definitionen', 'Naturkonstanten', 'Lichtgeschwindigkeit, Boltzmann-Konstante']
        ]
      },
      {
        kind: 'p',
        text: 'Die Lichtgeschwindigkeit ist seit der Neudefinition des Meters von 1983 keine Messgröße mehr, sondern exakt auf 299 792 458 m/s festgelegt. Alle Umrechnungen zwischen Frequenz und Wellenlänge in dieser Anwendung nutzen diesen Wert.'
      }
    ]
  },
  {
    id: 'datensaetze',
    title: 'Datensätze der Anwendung',
    blocks: [
      {
        kind: 'table',
        caption: 'Wichtigste Datensätze mit ihrer Herkunft',
        head: ['Datensatz', 'Inhalt', 'Hauptquelle'],
        rows: [
          ['Funkdienste', '18 Funkdienste mit Zuweisungen in Region 1', 'VO Funk Art. 1 und 5, BNetzA-Frequenzplan'],
          ['Amateurfunkbänder', '22 Bänder mit Betriebsartensegmenten', 'AFuV Anlage 1, IARU-R1-Bandpläne'],
          ['Mobilfunk', '6 Generationen und 13 Bänder', '3GPP TS 36.101 / 38.101, BNetzA-Vergabeverfahren'],
          ['Rundfunk', 'Bereiche, Kurzwellenbänder, DAB-Blöcke, DVB-T2-Kanäle', 'GE75, GE84, GE06, ETSI'],
          ['Not- und Sicherheitsfrequenzen', 'See, Luft, Land, Satellit, Amateur, Jedermann', 'VO Funk Art. 30–34, GMDSS, ICAO Annex 10, Cospas-Sarsat'],
          ['Frequenzzuweisungen (Anwendungen)', 'Über 100 Funkanwendungen im Spektrum', 'ITU, ETSI, BNetzA'],
          ['Frequenzbänder', 'ITU-, IEEE- und NATO-Bandschemata', 'VO Funk, IEEE Std 521, NATO-Bandsystematik'],
          ['Sender', 'Zeitzeichen-, Rundfunk-, Navigations- und Forschungssender', 'Betreiberangaben und Fachveröffentlichungen'],
          ['Fernmeldegeschichte', 'Meilensteine von der Telegrafie bis 5G', 'Fachliteratur und Betreiberangaben']
        ]
      }
    ]
  },
  {
    id: 'unsicherheiten',
    title: 'Bekannte Unsicherheiten',
    description: 'Diese Angaben sind vor einer praktischen Verwendung gegen die Primärquelle zu prüfen.',
    blocks: [
      {
        kind: 'ul',
        items: [
          'Zuordnung der Amateurfunkbänder zu den Zeugnisklassen A, E und N: gegen AFuV Anlage 1 (BGBl. 2024 I Nr. 175) verifiziert. Unsicher bleiben nur der Status des 4-m-Bands und der Zugang der Klasse E zum 6-m-Band, deren Duldungen am 31.12.2025 ausgelaufen sind.',
          'Sonderregelungen im 160-m-Band mit Zeit- und Leistungsfenstern sind bewusst nicht modelliert.',
          'Das 4-m-Band beruhte auf befristeten Duldungen (zuletzt 70,150 bis 70,210 MHz, ausgelaufen am 31.12.2025); eine Folgeregelung ist zu prüfen.',
          'DAB-Blöcke 13A bis 13F und die Zwischenblöcke 10N, 11N und 12N sind nach EBU-Band-III-Raster aufgenommen, in Deutschland aber nicht in Nutzung und im Kanalumrechner entsprechend gekennzeichnet.',
          'Sendeleistungen einzelner Großsender sind Größenordnungen aus Sekundärquellen, keine Betreiberangaben.',
          'Spektrale Effizienzen, Antennengewinne und typische Datenraten sind konservative Praxiswerte, keine Normwerte.',
          'Koordinaten von Senderstandorten sind gerundete Näherungen und keine Vermessungsdaten.'
        ]
      },
      {
        kind: 'callout',
        tone: 'info',
        title: 'Stand der Daten',
        text: 'Frequenzregulierung ändert sich fortlaufend — nach jeder Weltfunkkonferenz, nach EU-Entscheidungen und nach nationalen Vergabeverfahren. Wer eine Angabe verwendet, sollte sie gegen die aktuelle Fassung der genannten Primärquelle prüfen.'
      }
    ]
  }
];
