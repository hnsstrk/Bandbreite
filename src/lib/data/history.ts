/**
 * Historical milestones in radio and wireless communications
 *
 * This file contains significant events in the development of radio technology,
 * from Maxwell's theoretical predictions to modern 5G networks.
 */

/**
 * Historical event category
 */
export type HistoryCategory =
  | 'theory'       // Theoretical foundations
  | 'invention'    // Key inventions
  | 'broadcast'    // Broadcasting milestones
  | 'mobile'       // Mobile communications
  | 'satellite'    // Satellite communications
  | 'digital'      // Digital revolution
  | 'telegraphy'   // Draht- und Funktelegrafie, Telefonie
  | 'navigation';  // Funknavigation, Radar und Ortung

/**
 * Historical event definition
 */
export interface HistoricalEvent {
  id: string;
  year: number;
  yearEnd?: number;
  title: string;
  titleDE: string;
  description: string;
  descriptionDE: string;
  category: HistoryCategory;
  frequencyHz?: number;
  frequencyHzMax?: number;
  person?: string;
  location?: string;
  significance: 'major' | 'moderate' | 'minor';
}

/**
 * Historical events in radio communications
 */
export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  // Theory
  {
    id: 'maxwell-equations',
    year: 1865,
    title: 'Maxwell\'s Equations',
    titleDE: 'Maxwellsche Gleichungen',
    description: 'James Clerk Maxwell publishes his theory predicting electromagnetic waves',
    descriptionDE: 'James Clerk Maxwell veröffentlicht seine Theorie der elektromagnetischen Wellen',
    category: 'theory',
    person: 'James Clerk Maxwell',
    location: 'United Kingdom',
    significance: 'major'
  },
  {
    id: 'hertz-experiments',
    // Die entscheidenden Versuche fanden ab November 1886 in Karlsruhe statt,
    // die Veröffentlichungen erschienen 1887/1888.
    year: 1886,
    yearEnd: 1888,
    title: 'Hertz Experiments',
    titleDE: 'Hertzsche Versuche',
    description: 'Heinrich Hertz demonstrates existence of electromagnetic waves',
    descriptionDE: 'Heinrich Hertz weist elektromagnetische Wellen experimentell nach',
    category: 'theory',
    frequencyHz: 50e6,
    frequencyHzMax: 500e6,
    person: 'Heinrich Hertz',
    location: 'Karlsruhe, Germany',
    significance: 'major'
  },

  // Early inventions
  {
    id: 'marconi-patent',
    year: 1896,
    title: 'Marconi\'s Radio Patent',
    titleDE: 'Marconis Funkpatent',
    description: 'Marconi files the provisional patent application on 2 June 1896; British patent 12039 is granted in July 1897',
    descriptionDE: 'Guglielmo Marconi meldet am 2. Juni 1896 vorläufig zum Patent an; das britische Patent 12039 wird im Juli 1897 erteilt',
    category: 'invention',
    person: 'Guglielmo Marconi',
    location: 'United Kingdom',
    significance: 'major'
  },
  {
    id: 'marconi-atlantic',
    year: 1901,
    title: 'First Transatlantic Transmission',
    titleDE: 'Erste transatlantische Übertragung',
    description: 'Marconi transmits letter "S" across the Atlantic Ocean',
    descriptionDE: 'Marconi überträgt den Buchstaben "S" über den Atlantik',
    category: 'invention',
    frequencyHz: 850e3,
    person: 'Guglielmo Marconi',
    location: 'Poldhu, UK to Newfoundland',
    significance: 'major'
  },
  {
    id: 'titanic',
    year: 1912,
    title: 'Titanic Disaster',
    titleDE: 'Titanic-Katastrophe',
    description: 'The Carpathia rescues 712 people after a radio distress call; SOLAS 1914 makes radio watch mandatory',
    descriptionDE: 'Nach dem Funknotruf rettet die Carpathia 712 Menschen. Die Folge ist die Funkwachpflicht nach SOLAS 1914.',
    category: 'invention',
    frequencyHz: 500e3,
    significance: 'major'
  },
  {
    id: 'first-vacuum-tube',
    year: 1906,
    title: 'Audion Tube',
    titleDE: 'Audionröhre',
    description: 'Lee de Forest invents the Audion, first amplifying vacuum tube',
    descriptionDE: 'Lee de Forest erfindet die Audionröhre, erste Verstärkerröhre',
    category: 'invention',
    person: 'Lee de Forest',
    location: 'USA',
    significance: 'major'
  },

  // Broadcasting
  {
    id: 'first-broadcast',
    year: 1920,
    title: 'First Commercial Radio Broadcast',
    titleDE: 'Erste kommerzielle Radiosendung',
    description: 'KDKA Pittsburgh begins regular radio broadcasts',
    descriptionDE: 'KDKA Pittsburgh beginnt regelmäßigen Rundfunk. Gesendet wurde zunächst auf 360 m Wellenlänge, also rund 833 kHz.',
    category: 'broadcast',
    frequencyHz: 833e3,
    location: 'Pittsburgh, USA',
    significance: 'major'
  },
  {
    id: 'fm-invention',
    year: 1933,
    title: 'FM Radio Invented',
    titleDE: 'UKW-Rundfunk erfunden',
    description: 'Edwin Armstrong develops frequency modulation',
    descriptionDE: 'Edwin Armstrong entwickelt Frequenzmodulation',
    category: 'broadcast',
    frequencyHz: 42e6,
    frequencyHzMax: 50e6,
    person: 'Edwin Armstrong',
    location: 'USA',
    significance: 'major'
  },
  {
    id: 'television-broadcast',
    year: 1936,
    title: 'Regular Television Broadcasts',
    titleDE: 'Regelmäßiges Fernsehen',
    description: 'BBC begins first regular television service',
    descriptionDE: 'BBC startet ersten regelmäßigen Fernsehbetrieb',
    category: 'broadcast',
    frequencyHz: 45e6,
    location: 'London, UK',
    significance: 'moderate'
  },
  {
    id: 'dab-start',
    year: 1995,
    title: 'DAB Radio Launch',
    titleDE: 'DAB-Start',
    description: 'First DAB digital radio broadcasts in Europe',
    descriptionDE: 'Erste DAB Digitalradio-Sendungen in Europa',
    category: 'broadcast',
    frequencyHz: 174e6,
    // In Europa genutztes VHF-Band III: 174-230 MHz (Blöcke 5A bis 12D)
    frequencyHzMax: 230e6,
    location: 'Europe',
    significance: 'moderate'
  },

  // Mobile Communications
  {
    id: 'first-mobile-phone',
    year: 1973,
    title: 'First Mobile Phone Call',
    titleDE: 'Erster Mobilfunkanruf',
    description: 'Martin Cooper makes first handheld mobile phone call',
    descriptionDE: 'Martin Cooper führt erstes Gespräch mit Handy',
    category: 'mobile',
    frequencyHz: 850e6,
    person: 'Martin Cooper (Motorola)',
    location: 'New York, USA',
    significance: 'major'
  },
  {
    id: 'gsm-launch',
    year: 1991,
    title: 'GSM Network Launch',
    titleDE: 'GSM-Start',
    description: 'First GSM network goes live in Finland',
    descriptionDE: 'Erstes GSM-Netz geht in Finnland in Betrieb',
    category: 'mobile',
    frequencyHz: 900e6,
    location: 'Finland',
    significance: 'major'
  },
  {
    id: 'umts-3g',
    year: 2001,
    title: '3G UMTS Launch',
    titleDE: '3G UMTS Start',
    description: 'First 3G UMTS networks launch in Japan',
    descriptionDE: 'Erste 3G UMTS-Netze starten in Japan',
    category: 'mobile',
    frequencyHz: 2.1e9,
    location: 'Japan',
    significance: 'moderate'
  },
  {
    id: 'lte-4g',
    year: 2009,
    title: '4G LTE Launch',
    titleDE: '4G LTE Start',
    description: 'First commercial LTE networks',
    descriptionDE: 'Erste kommerzielle LTE-Netze',
    category: 'mobile',
    frequencyHz: 2.6e9,
    location: 'Scandinavia',
    significance: 'moderate'
  },
  {
    id: '5g-launch',
    year: 2019,
    title: '5G Network Launch',
    titleDE: '5G-Netzstart',
    description: 'First commercial 5G networks go live',
    descriptionDE: 'Erste kommerzielle 5G-Netze gehen in Betrieb',
    category: 'mobile',
    frequencyHz: 3.5e9,
    frequencyHzMax: 28e9,
    location: 'South Korea, USA',
    significance: 'major'
  },

  // Satellite
  {
    id: 'sputnik',
    year: 1957,
    title: 'Sputnik 1',
    titleDE: 'Sputnik 1',
    description: 'First artificial satellite transmits radio beacon',
    descriptionDE: 'Erster künstlicher Satellit sendet Funksignal',
    category: 'satellite',
    frequencyHz: 20.005e6,
    frequencyHzMax: 40.002e6,
    location: 'USSR',
    significance: 'major'
  },
  {
    id: 'telstar',
    year: 1962,
    title: 'Telstar 1',
    titleDE: 'Telstar 1',
    description: 'First active communications satellite',
    descriptionDE: 'Erster aktiver Kommunikationssatellit',
    category: 'satellite',
    frequencyHz: 4e9,
    frequencyHzMax: 6e9,
    location: 'USA/Europe',
    significance: 'major'
  },
  {
    id: 'gps-operational',
    year: 1995,
    title: 'GPS Fully Operational',
    titleDE: 'GPS voll betriebsbereit',
    description: 'Global Positioning System declared fully operational',
    descriptionDE: 'GPS-System wird für voll betriebsbereit erklärt',
    category: 'satellite',
    frequencyHz: 1.57542e9,
    location: 'Worldwide',
    significance: 'major'
  },
  {
    id: 'starlink',
    year: 2019,
    title: 'Starlink Constellation',
    titleDE: 'Starlink-Konstellation',
    description: 'SpaceX begins deploying Starlink satellite internet',
    descriptionDE: 'SpaceX beginnt Starlink Satelliten-Internet Aufbau',
    category: 'satellite',
    frequencyHz: 12e9,
    frequencyHzMax: 40e9,
    location: 'Worldwide',
    significance: 'moderate'
  },

  // Digital Revolution
  {
    id: 'wifi-standard',
    year: 1997,
    title: 'WiFi Standard (802.11)',
    titleDE: 'WLAN-Standard (802.11)',
    description: 'IEEE 802.11 wireless LAN standard published',
    descriptionDE: 'IEEE 802.11 WLAN-Standard veröffentlicht',
    category: 'digital',
    frequencyHz: 2.4e9,
    significance: 'major'
  },
  {
    id: 'bluetooth',
    // 1998 wurde die Bluetooth SIG gegründet; die Spezifikation 1.0/1.0a
    // erschien im Juli 1999, Version 1.0b im Dezember 1999.
    year: 1999,
    title: 'Bluetooth 1.0 Specification',
    titleDE: 'Bluetooth-Spezifikation 1.0',
    description: 'Bluetooth 1.0 specification released; the Bluetooth SIG had been founded in 1998',
    descriptionDE: 'Die Bluetooth-Spezifikation 1.0 erscheint; die Bluetooth SIG war 1998 gegründet worden',
    category: 'digital',
    frequencyHz: 2.4e9,
    significance: 'moderate'
  },
  {
    id: 'lora',
    year: 2015,
    title: 'LoRa/LoRaWAN',
    titleDE: 'LoRa/LoRaWAN',
    description: 'LoRaWAN for IoT standardized',
    descriptionDE: 'LoRaWAN für IoT standardisiert',
    category: 'digital',
    frequencyHz: 868e6,
    significance: 'moderate'
  },

  // ==========================================================================
  // Ergänzungen: Fernmelde- und Funkgeschichte
  //
  // Quellen: Patentschriften, Betreiber- und Behördenangaben, ITU-Konferenzakten.
  // Jahreszahlen bezeichnen, sofern nicht anders vermerkt, das Jahr der ersten
  // praktischen Umsetzung bzw. des Regelbetriebs.
  // ==========================================================================

  {
    id: 'electric-telegraph',
    year: 1837,
    title: 'Electric Telegraph',
    titleDE: 'Elektrischer Telegraf',
    description: 'Morse in the USA and Cooke/Wheatstone in Britain patent working telegraph systems',
    descriptionDE:
      'Samuel Morse in den USA sowie Cooke und Wheatstone in Großbritannien melden im ' +
      'selben Jahr betriebsfähige Telegrafensysteme zum Patent an. Nachrichten überholen ' +
      'erstmals den Boten.',
    category: 'telegraphy',
    person: 'Samuel Morse; William Cooke und Charles Wheatstone',
    location: 'USA und Großbritannien',
    significance: 'major',
  },
  {
    id: 'transatlantic-cable',
    year: 1866,
    title: 'Permanent Transatlantic Telegraph Cable',
    titleDE: 'Dauerhaftes Transatlantik-Telegrafenkabel',
    description: 'The first reliably working telegraph cable links Europe and North America',
    descriptionDE:
      'Nach mehreren gescheiterten Versuchen ab 1858 verbindet ein dauerhaft ' +
      'funktionierendes Seekabel Irland mit Neufundland. Die Übertragungszeit für eine ' +
      'Nachricht über den Atlantik sinkt von Wochen auf Minuten.',
    category: 'telegraphy',
    location: 'Valentia (Irland) — Heart\'s Content (Neufundland)',
    significance: 'moderate',
  },
  {
    id: 'telephone-bell',
    year: 1876,
    title: 'Telephone Patent',
    titleDE: 'Telefonpatent',
    description: 'Alexander Graham Bell patents the telephone; Philipp Reis had demonstrated a precursor in 1861',
    descriptionDE:
      'Alexander Graham Bell erhält das Patent auf den Fernsprecher. Einen Vorläufer ' +
      'hatte Philipp Reis bereits 1861 vorgeführt. Damit wird erstmals Sprache ' +
      'elektrisch über größere Entfernungen übertragen.',
    category: 'telegraphy',
    person: 'Alexander Graham Bell',
    location: 'USA',
    significance: 'major',
  },
  {
    id: 'marconi-first-transmission',
    year: 1895,
    title: 'Marconi\'s First Wireless Transmission',
    titleDE: 'Marconis erste Funkübertragung',
    description: 'Marconi transmits signals over about two kilometres, including over a hill',
    descriptionDE:
      'Guglielmo Marconi überbrückt auf dem Familiengut bei Bologna rund zwei Kilometer ' +
      'und sendet dabei erstmals über eine Anhöhe hinweg. Damit ist gezeigt, dass Funk ' +
      'nicht auf Sichtverbindung angewiesen ist.',
    category: 'invention',
    person: 'Guglielmo Marconi',
    location: 'Villa Griffone, Italien',
    significance: 'major',
  },
  {
    id: 'huelsmeyer-telemobiloskop',
    year: 1904,
    title: 'Hülsmeyer\'s Telemobiloscope',
    titleDE: 'Hülsmeyers Telemobiloskop',
    description: 'First patented device detecting ships by reflected radio waves',
    descriptionDE:
      'Christian Hülsmeyer lässt ein Gerät patentieren, das Schiffe anhand reflektierter ' +
      'Funkwellen erkennt und vor Kollisionen warnt. Der Vorläufer des Radars fand ' +
      'damals keinen Abnehmer.',
    category: 'navigation',
    person: 'Christian Hülsmeyer',
    location: 'Köln und Rotterdam',
    significance: 'moderate',
  },
  {
    id: 'sos-berlin-conference',
    year: 1906,
    yearEnd: 1908,
    title: 'SOS Adopted as Distress Signal',
    titleDE: 'SOS als Notzeichen eingeführt',
    description: 'The Berlin radiotelegraph conference adopts SOS; it takes effect in 1908',
    descriptionDE:
      'Die Internationale Funktelegrafenkonferenz in Berlin einigt sich auf das ' +
      'unverwechselbare Morsezeichen SOS als weltweites Notzeichen. Es tritt 1908 in ' +
      'Kraft und löst uneinheitliche nationale Rufe ab.',
    category: 'telegraphy',
    frequencyHz: 500e3,
    location: 'Berlin',
    significance: 'major',
  },
  {
    id: 'fessenden-voice',
    year: 1906,
    title: 'First Voice and Music Broadcast',
    titleDE: 'Erste Sprach- und Musikübertragung',
    description: 'Reginald Fessenden is credited with transmitting speech and music to ships at sea',
    descriptionDE:
      'Reginald Fessenden soll an Heiligabend von Brant Rock aus Sprache und Musik zu ' +
      'Schiffen im Atlantik übertragen haben. Die Überlieferung stützt sich auf spätere ' +
      'Berichte und ist historisch umstritten.',
    category: 'broadcast',
    person: 'Reginald Fessenden',
    location: 'Brant Rock, USA',
    significance: 'moderate',
  },
  {
    id: 'first-broadcast-germany',
    year: 1923,
    title: 'First Regular Radio Broadcast in Germany',
    titleDE: 'Erste deutsche Rundfunksendung',
    description: 'Regular broadcasting starts from the Vox-Haus in Berlin on 29 October 1923',
    descriptionDE:
      'Am 29. Oktober 1923 beginnt im Vox-Haus in Berlin der regelmäßige deutsche ' +
      'Rundfunk. Gesendet wird auf rund 400 Metern Wellenlänge; der Empfang ist ' +
      'zunächst gebührenpflichtig und genehmigungsbedürftig.',
    category: 'broadcast',
    frequencyHz: 750e3,
    location: 'Berlin',
    significance: 'major',
  },
  {
    id: 'radar-watson-watt',
    year: 1935,
    title: 'Practical Radar Demonstrated',
    titleDE: 'Radar praktisch vorgeführt',
    description: 'Watson-Watt demonstrates aircraft detection by radio; independent German developments follow',
    descriptionDE:
      'Robert Watson-Watt weist bei Daventry nach, dass sich Flugzeuge anhand ' +
      'reflektierter Funkwellen orten lassen. Parallel entstehen in Deutschland ' +
      'eigene Anlagen. Innerhalb weniger Jahre entstehen daraus ganze Frühwarnketten.',
    category: 'navigation',
    frequencyHz: 6e6,
    person: 'Robert Watson-Watt',
    location: 'Daventry, Großbritannien',
    significance: 'major',
  },
  {
    id: 'transistor',
    year: 1947,
    title: 'Invention of the Transistor',
    titleDE: 'Erfindung des Transistors',
    description: 'Bardeen, Brattain and Shockley demonstrate the point-contact transistor at Bell Labs',
    descriptionDE:
      'In den Bell-Laboratorien gelingt der erste funktionierende Transistor. Er ' +
      'ersetzt die Elektronenröhre, macht Funkgeräte klein, sparsam und robust und ' +
      'ist die Voraussetzung für tragbare Empfänger und später für Mobiltelefone.',
    category: 'invention',
    person: 'John Bardeen, Walter Brattain, William Shockley',
    location: 'Murray Hill, USA',
    significance: 'major',
  },
  {
    id: 'ukw-germany',
    year: 1949,
    title: 'FM Broadcasting Starts in Germany',
    titleDE: 'UKW-Rundfunk in Deutschland',
    description: 'The first German FM transmitter goes on air in Munich on 28 February 1949',
    descriptionDE:
      'Am 28. Februar 1949 nimmt in München der erste deutsche UKW-Sender den Betrieb ' +
      'auf. Der Wechsel war auch politisch bedingt: im Kopenhagener Wellenplan waren ' +
      'Deutschland kaum noch Mittelwellenfrequenzen zugeteilt worden. UKW brachte ' +
      'zugleich eine deutlich bessere Klangqualität.',
    category: 'broadcast',
    frequencyHz: 87.5e6,
    frequencyHzMax: 100e6,
    location: 'München',
    significance: 'major',
  },
  {
    id: 'echo-1',
    year: 1960,
    title: 'Echo 1 Passive Relay Satellite',
    titleDE: 'Echo 1 — passiver Reflektorsatellit',
    description: 'A metallised balloon reflects radio signals between distant ground stations',
    descriptionDE:
      'Ein 30 Meter großer, metallisierter Ballon im Orbit reflektiert Funksignale ' +
      'zwischen weit auseinanderliegenden Bodenstationen. Der Satellit besitzt keinerlei ' +
      'Elektronik und beweist dennoch, dass Satellitenverbindungen möglich sind.',
    category: 'satellite',
    frequencyHz: 960e6,
    frequencyHzMax: 2.39e9,
    location: 'USA',
    significance: 'moderate',
  },
  {
    id: 'intelsat-early-bird',
    year: 1965,
    title: 'Intelsat I "Early Bird"',
    titleDE: 'Intelsat I „Early Bird"',
    description: 'First commercial geostationary communications satellite enters service',
    descriptionDE:
      'Der erste kommerzielle geostationäre Nachrichtensatellit nimmt den Betrieb auf ' +
      'und verbindet Europa und Nordamerika mit 240 Telefonkanälen oder einem ' +
      'Fernsehkanal. Weil er scheinbar stillsteht, genügen fest ausgerichtete Antennen.',
    category: 'satellite',
    frequencyHz: 4e9,
    frequencyHzMax: 6e9,
    location: 'Atlantikregion',
    significance: 'major',
  },
  {
    id: 'arpanet',
    year: 1969,
    title: 'ARPANET First Message',
    titleDE: 'ARPANET — erste Nachricht',
    description: 'The first packet-switched message is sent between two nodes on 29 October 1969',
    descriptionDE:
      'Am 29. Oktober 1969 wird die erste Nachricht zwischen zwei Rechnerknoten des ' +
      'ARPANET übertragen. Die Paketvermittlung, bei der Nachrichten in einzeln ' +
      'geleitete Teile zerfallen, wird zur Grundlage aller heutigen Datennetze ' +
      'einschließlich des Mobilfunks.',
    category: 'digital',
    location: 'Kalifornien, USA',
    significance: 'major',
  },
  {
    id: 'alohanet',
    year: 1971,
    title: 'ALOHAnet — First Wireless Packet Network',
    titleDE: 'ALOHAnet — erstes drahtloses Paketnetz',
    description: 'Radio packet network linking the Hawaiian islands; origin of random access protocols',
    descriptionDE:
      'Ein Funknetz verbindet die Rechner der hawaiianischen Inseln über ' +
      'Paketübertragung. Das dabei entwickelte Zugriffsverfahren, bei dem Stationen ' +
      'einfach senden und Kollisionen durch Wiederholung auflösen, ist der Vorfahr ' +
      'von Ethernet und WLAN.',
    category: 'digital',
    frequencyHz: 407.35e6,
    location: 'Hawaii, USA',
    significance: 'moderate',
  },
  {
    id: 'gps-first-satellite',
    year: 1978,
    title: 'First GPS Satellite Launched',
    titleDE: 'Erster GPS-Satellit gestartet',
    description: 'Navstar 1 begins the build-up of the Global Positioning System',
    descriptionDE:
      'Mit dem ersten Satelliten des Blocks I beginnt der Aufbau des Global ' +
      'Positioning System. Bis zur vollen Betriebsbereitschaft vergehen noch 17 Jahre.',
    category: 'satellite',
    frequencyHz: 1.57542e9,
    location: 'USA',
    significance: 'moderate',
  },
  {
    id: 'nmt-1g',
    year: 1981,
    title: 'NMT — First Automatic Mobile Network',
    titleDE: 'NMT — erstes automatisches Mobilfunknetz',
    description: 'Nordic Mobile Telephone starts in Scandinavia with automatic handover and roaming',
    descriptionDE:
      'In Skandinavien startet das erste automatische zellulare Mobilfunknetz mit ' +
      'Übergabe zwischen Funkzellen und länderübergreifender Nutzung. Es arbeitet ' +
      'analog bei 450 MHz.',
    category: 'mobile',
    frequencyHz: 450e6,
    location: 'Skandinavien',
    significance: 'moderate',
  },
  {
    id: 'c-netz-germany',
    year: 1985,
    title: 'C-Netz Launched in Germany',
    titleDE: 'C-Netz-Start in Deutschland',
    description: 'Germany\'s third-generation analogue mobile network introduces automatic handover',
    descriptionDE:
      'Das C-Netz löst die Vorläufer A-Netz (ab 1958) und B-Netz (ab 1972) ab. Erstmals ' +
      'ist in Deutschland automatische Übergabe zwischen Funkzellen möglich und der ' +
      'Teilnehmer ist unter einer eigenen Rufnummer erreichbar.',
    category: 'mobile',
    frequencyHz: 450e6,
    location: 'Deutschland',
    significance: 'moderate',
  },
  {
    id: 'gsm-germany',
    year: 1992,
    title: 'GSM Networks Launch in Germany',
    titleDE: 'GSM-Start in Deutschland',
    description: 'The D1 and D2 networks begin commercial service in mid-1992',
    descriptionDE:
      'Zur Jahresmitte 1992 nehmen die beiden deutschen GSM-Netze den kommerziellen ' +
      'Betrieb auf. Erstmals gibt es Wettbewerb im Mobilfunk, digitale Sprachqualität ' +
      'und mit der Kurznachricht einen Dienst, dessen Erfolg niemand vorhergesehen hatte.',
    category: 'mobile',
    frequencyHz: 900e6,
    location: 'Deutschland',
    significance: 'major',
  },
  {
    id: 'dvb-t-germany',
    year: 2002,
    title: 'DVB-T Starts in Germany',
    titleDE: 'DVB-T-Start in Deutschland',
    description: 'Digital terrestrial television begins in Berlin; analogue TV is switched off in 2003',
    descriptionDE:
      'Im November 2002 startet in Berlin und Brandenburg das digitale Antennenfernsehen. ' +
      'Im August 2003 wird dort als weltweit erster Region die analoge terrestrische ' +
      'Fernsehausstrahlung vollständig abgeschaltet.',
    category: 'broadcast',
    frequencyHz: 470e6,
    frequencyHzMax: 862e6,
    location: 'Berlin-Brandenburg',
    significance: 'moderate',
  },
  {
    id: 'umts-germany',
    year: 2004,
    title: 'UMTS Commercial Launch in Germany',
    titleDE: 'UMTS-Start in Deutschland',
    description: 'Commercial 3G service starts four years after the record-priced licence auction',
    descriptionDE:
      'Vier Jahre nach der Versteigerung der Lizenzen für rund 50 Milliarden Euro geht ' +
      'UMTS in Deutschland in den kommerziellen Betrieb. Mobiles Internet wird damit ' +
      'erstmals alltagstauglich.',
    category: 'mobile',
    frequencyHz: 2.1e9,
    location: 'Deutschland',
    significance: 'moderate',
  },
  {
    id: 'lte-germany',
    year: 2010,
    title: 'LTE Launch in Germany',
    titleDE: 'LTE-Start in Deutschland',
    description: 'LTE service begins in December 2010, initially in underserved rural areas',
    descriptionDE:
      'Im Dezember 2010 startet LTE in Deutschland. Die Zuteilung der 800-MHz-Frequenzen ' +
      'war mit der Auflage verknüpft, zuerst unterversorgte ländliche Gebiete zu ' +
      'erschließen, bevor Städte ausgebaut werden durften.',
    category: 'mobile',
    frequencyHz: 800e6,
    location: 'Deutschland',
    significance: 'moderate',
  },
  {
    id: 'galileo-initial-services',
    year: 2016,
    title: 'Galileo Initial Services',
    titleDE: 'Galileo — Beginn der Dienste',
    description: 'Europe\'s satellite navigation system starts initial operational service',
    descriptionDE:
      'Das europäische Satellitennavigationssystem nimmt im Dezember 2016 den ' +
      'Anfangsbetrieb auf. Es steht unter ziviler Kontrolle und liefert in Kombination ' +
      'mit GPS deutlich genauere und ausfallsicherere Positionen.',
    category: 'satellite',
    frequencyHz: 1.1764e9,
    frequencyHzMax: 1.57542e9,
    location: 'Europa',
    significance: 'major',
  },
  {
    id: 'dvbt2-germany',
    year: 2017,
    title: 'DVB-T2 HD Regular Service in Germany',
    titleDE: 'DVB-T2 HD Regelbetrieb in Deutschland',
    description: 'Terrestrial television switches to DVB-T2 HD in March 2017',
    descriptionDE:
      'Ende März 2017 wechselt das deutsche Antennenfernsehen auf DVB-T2 HD. Der ' +
      'Umstieg macht den Weg frei, den Bereich oberhalb 694 MHz an den Mobilfunk ' +
      'abzugeben.',
    category: 'broadcast',
    frequencyHz: 470e6,
    frequencyHzMax: 694e6,
    location: 'Deutschland',
    significance: 'moderate',
  },
  {
    id: '5g-germany',
    year: 2019,
    title: '5G Launch in Germany',
    titleDE: '5G-Start in Deutschland',
    description: 'After the June 2019 auction the first commercial 5G networks go live in July 2019',
    descriptionDE:
      'Nach der Versteigerung der Frequenzen im Juni 2019 gehen im Juli 2019 die ersten ' +
      'kommerziellen 5G-Netze in Betrieb, überwiegend im Bereich um 3,6 GHz.',
    category: 'mobile',
    frequencyHz: 3.6e9,
    location: 'Deutschland',
    significance: 'major',
  },
  {
    id: 'umts-shutdown-germany',
    year: 2021,
    title: 'UMTS Switch-off in Germany',
    titleDE: 'UMTS-Abschaltung in Deutschland',
    description: 'All German operators shut down their 3G networks during 2021',
    descriptionDE:
      'Im Laufe des Jahres 2021 schalten alle deutschen Netzbetreiber ihre ' +
      'UMTS-Netze ab. Die frei werdenden Frequenzen um 2,1 GHz gehen an LTE und 5G; ' +
      'GSM bleibt als Rückfallebene für Sprache und Maschinenkommunikation bestehen.',
    category: 'mobile',
    frequencyHz: 2.1e9,
    location: 'Deutschland',
    significance: 'moderate',
  },
];

/**
 * Category display configuration
 */
export const CATEGORY_CONFIG: Record<HistoryCategory, { name: string; nameDE: string; color: string }> = {
  theory: { name: 'Theory', nameDE: 'Theorie', color: '#8b5cf6' },
  invention: { name: 'Inventions', nameDE: 'Erfindungen', color: '#3b82f6' },
  broadcast: { name: 'Broadcasting', nameDE: 'Rundfunk', color: '#ef4444' },
  mobile: { name: 'Mobile', nameDE: 'Mobilfunk', color: '#22c55e' },
  satellite: { name: 'Satellite', nameDE: 'Satellit', color: '#f97316' },
  digital: { name: 'Digital', nameDE: 'Digital', color: '#06b6d4' },
  telegraphy: { name: 'Telegraphy', nameDE: 'Telegrafie und Telefonie', color: '#a16207' },
  navigation: { name: 'Navigation', nameDE: 'Navigation', color: '#0d9488' }
};

/**
 * Get events by category
 */
export function getEventsByCategory(category: HistoryCategory): HistoricalEvent[] {
  return HISTORICAL_EVENTS.filter(e => e.category === category);
}

/**
 * Get events in year range
 */
export function getEventsByYearRange(startYear: number, endYear: number): HistoricalEvent[] {
  return HISTORICAL_EVENTS.filter(e => e.year >= startYear && e.year <= endYear);
}

/**
 * Get major events only
 */
export function getMajorEvents(): HistoricalEvent[] {
  return HISTORICAL_EVENTS.filter(e => e.significance === 'major');
}
