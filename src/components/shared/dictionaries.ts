import { Language } from './languages';

type Dictionary = {
  nav: {
    choosePath: string;
    constellation: string;
    book: string;
    author: string;
    publisher: string;
    taglineBook: string;
    taglineAuthor: string;
    taglinePublisher: string;
  };
  hero: {
    headlinePart1: string;
    headlinePart2: string;
    subheadlinePart1: string;
    subheadlinePart2: string;
    cta: string;
    scroll: string;
  };
  mirror: {
    label: string;
    text1Part1: string;
    text1Part2: string;
    text1Part3: string;
    text2Part1: string;
    text2Part2: string;
    text2Part3: string;
    quote: string;
  };
  confrontation: {
    questionPart1: string;
    questionPart2: string;
    text1Part1: string;
    text1Part2: string;
    text1Part3: string;
    text2Part1: string;
    text2Part2: string;
  };
  scrollSection: {
    headlinePart1: string;
    headlinePart2: string;
    text1Part1: string;
    text1Part2: string;
    text2: string;
    features: {
      title: string;
      description: string;
    }[];
    cta: string;
  };
  witnesses: {
    label: string;
    headlinePart1: string;
    headlinePart2: string;
    testimonials: {
      quote: string;
      author: string;
    }[];
  };
  altar: {
    headlinePart1: string;
    headlinePart2: string;
    textPart1: string;
    textPart2: string;
    textPart3: string;
    cta: string;
    linkPublisher: string;
    linkAuthor: string;
    sovereignty: string;
  };
  purchase: {
    title: string;
    subtitle: string;
    digitalTitle: string;
    digitalDesc: string;
    instantAccess: string;
    physicalTitle: string;
    physicalDesc: string;
    back: string;
    readerTitle: string;
    readerDesc: string;
    feature1: string;
    feature2: string;
    feature3: string;
    feature4: string;
    buyDigital: string;
    amazon: string;
    amazonDesc: string;
    direct: string;
    directDesc: string;
    secure: string;
  };
  audio: {
    mute: string;
    play: string;
  };
  authorHero: {
    name: string;
    title: string;
    descriptionPart1: string;
    descriptionPart2: string;
    cta: string;
  };
  publisherHero: {
    est: string;
    headlinePart1: string;
    headlinePart2: string;
    subheadlineName: string;
    subheadlineText1: string;
    subheadlineText2: string;
    cta: string;
  };
  dispatch: {
    label: string;
    headline: string;
    text1Part1: string;
    text1Part2: string;
    text1Part3: string;
    text2: string;
    text3Part1: string;
    text3Part2: string;
    text3Part3: string;
    text4: string;
    quotePart1: string;
    quotePart2: string;
    mission: string;
  };
  frequency: {
    label: string;
    headline: string;
    description: string;
    tracks: { title: string; duration: string; playable?: boolean }[];
    comingSoon: string;
  };
  gathering: {
    label: string;
    headlinePart1: string;
    headlinePart2: string;
    description: string;
    waitlistTitle: string;
    waitlistDesc: string;
    cityPlaceholder: string;
    emailPlaceholder: string;
    notifyButton: string;
    requestTitle: string;
    requestDesc: string;
    requestButton: string;
    cityRequestPlaceholder: string;
    stateRequestPlaceholder: string;
    cancelButton: string;
    submitButton: string;
    successMessage: string;
    modalTitle: string;
    modalDesc: string;
    closeButton: string;
    upcomingStatus: string;
    requestedCitiesTitle: string;
    requestedCitiesDesc: string;
    pendingStatus: string;
  };
  remnant: {
    headlinePart1: string;
    headlinePart2: string;
    description: string;
    emailPlaceholder: string;
    button: string;
    privacy: string;
    successTitle: string;
    successDesc: string;
    footerText: string;
  };
  mandate: {
    label: string;
    headlinePart1: string;
    headlinePart2: string;
    description: string;
    sealTitle: string;
    sealSubtitle: string;
    pillars: { title: string; description: string }[];
  };
  archive: {
    label: string;
    headline: string;
    catalog: {
      title: string;
      author: string;
      description: string;
      status: string;
      viewBook: string;
    }[];
    comingSoon: string;
  };
  gate: {
    label: string;
    headline: string;
    status: string;
    description: string;
    notice: string;
  };
  ledger: {
    label: string;
    headline: string;
    inquiries: string;
    links: { book: string; author: string; amazon: string };
    copyright: string;
    slogan: string;
  };
  footer: {
    taglinePart1: string;
    taglinePart2: string;
    constellation: string;
    connect: string;
    rights: string;
    slogan: string;
  };
};

const dictionaries: Record<Language, Dictionary> = {
  en: {
    nav: {
      choosePath: 'Choose Your Path',
      constellation: 'The Constellation',
      book: 'The Crowded Bed & The Empty Throne',
      author: 'EOLLES',
      publisher: 'Throne Light Publishing',
      taglineBook: 'The Book',
      taglineAuthor: 'The Author',
      taglinePublisher: 'The Publisher',
    },
    hero: {
      headlinePart1: 'The Bed Is Crowded.',
      headlinePart2: 'But The Throne Remains Empty.',
      subheadlinePart1: 'Stop auditioning for a man who only offers you rotation.',
      subheadlinePart2: 'It is your time to reign.',
      cta: 'Claim Your Throne',
      scroll: 'Scroll',
    },
    mirror: {
      label: 'The Rotation Trap',
      text1Part1: "You've been giving ",
      text1Part2: "throne-level loyalty",
      text1Part3: " to a man operating on bed-level interest. You've poured covenant energy into a casual connection, hoping that if you just loved harder, served better, or waited longer, he would finally see your worth.",
      text2Part1: "But here is the prophetic truth: ",
      text2Part2: "Men are loyal to vision, not effort.",
      text2Part3: " If you are not part of his vision, your presence is optional. Your body becomes accessible, but your throne remains unoccupied.",
      quote: "You are chosen for appetite, not crowned for purpose.",
    },
    confrontation: {
      questionPart1: "Does he forget you when",
      questionPart2: "you are not in front of him?",
      text1Part1: 'Not "does he text back." Does he ',
      text1Part2: "remember you",
      text1Part3: " when you are not physically present? Because queens do not have to remind kings of their existence.",
      text2Part1: "If you are constantly re-introducing yourself to his attention, you are not on his throne. ",
      text2Part2: "You are on his roster.",
    },
    scrollSection: {
      headlinePart1: "This Is Not A Dating Guide.",
      headlinePart2: "It Is A Royal Decree.",
      text1Part1: "The Crowded Bed & The Empty Throne",
      text1Part2: " is a prophetic gift for women who are done competing for a man's attention and are ready to reclaim their crown.",
      text2: 'With piercing clarity and poetic fire, EOLLES dismantles the counterfeit promise of being "chosen" in a world where access is mistaken for authority. From crowded mattresses to vacant kingdoms, this book exposes the appetite-driven dynamics that keep powerful women in emotional bondage and illuminates the path back to throne-alignment.',
      features: [
        { title: 'Recognize the Trap', description: 'Distinguish between when you are in rotation vs. when you are reigning.' },
        { title: 'Dismantle the Lie', description: 'Learn why chemistry is not covenant.' },
        { title: 'Occupy the Throne', description: 'Stop auditioning and start occupying the throne you were born for.' },
      ],
      cta: 'Order Your Ascension',
    },
    witnesses: {
      label: 'The Witnesses',
      headlinePart1: 'Voices of the ',
      headlinePart2: 'Liberated',
      testimonials: [
        { quote: "I didn't know I was still bleeding until I read this book. The mattress of confusion? That was my entire 20s. This message woke me up.", author: "Anonymous Early Reader" },
        { quote: "The Crowded Bed & The Empty Throne is a mirror, a sword, and a crown all in one. It didn't just call me out; it called me UP. This is not a book. It is a divine intervention.", author: "Reader Review" },
        { quote: "I have never seen my situationships, soul ties, and emotional confusion called out with so much spiritual fire. I feel free. I feel seen. I feel sovereign.", author: "Beta Reader" },
      ],
    },
    altar: {
      headlinePart1: 'The Crown Is Not For Sale.',
      headlinePart2: 'But It Is Available.',
      textPart1: 'To the woman tired of rotation.',
      textPart2: 'To the woman done with auditioning.',
      textPart3: 'To the woman ready to reign.',
      cta: 'Order Your Ascension',
      linkPublisher: 'Visit Throne Light Publishing',
      linkAuthor: 'Meet Author',
      sovereignty: 'Sovereignty Awaits',
    },
    purchase: {
      title: 'Seize Your Destiny',
      subtitle: 'Choose how you want to receive your royal decree',
      digitalTitle: 'Digital Edition',
      digitalDesc: 'Read on the Throne Light Reader app. Secure, beautiful, yours forever.',
      instantAccess: 'Instant',
      physicalTitle: 'Physical Book',
      physicalDesc: 'Premium paperback delivered to your throne. Perfect for your royal library.',
      back: 'Back to options',
      readerTitle: 'Throne Light Reader',
      readerDesc: 'Your purchase includes lifetime access to the secure Throne Light Reader app with:',
      feature1: 'Beautiful dark & light reading modes',
      feature2: 'Offline access on your device',
      feature3: 'Synced progress & bookmarks',
      feature4: 'Exclusive bonus content',
      buyDigital: 'Purchase Now',
      amazon: 'Buy on Amazon',
      amazonDesc: 'Prime shipping available',
      direct: 'Buy Direct',
      directDesc: 'Support the author directly',
      secure: '🔒 Secure checkout powered by Stripe',
    },
    audio: {
      mute: 'Mute audio',
      play: 'Play ambient audio',
    },
    authorHero: {
      name: 'EOLLES',
      title: 'Prophetic Visionary. Sovereign Entity.',
      descriptionPart1: 'Appointed by assignment. Forged in silence.',
      descriptionPart2: 'A voice for the women ready to reign.',
      cta: 'Message From Above',
    },
    publisherHero: {
      est: 'Est. 2025',
      headlinePart1: "We Don't Just Publish Books.",
      headlinePart2: "We Deliver Purpose.",
      subheadlineName: 'Throne Light Publishing',
      subheadlineText1: 'Exists to enthrone voices, not just print them.',
      subheadlineText2: 'Awakening royalty through revelation.',
      cta: 'Enter The Light',
    },
    dispatch: {
      label: 'The Origin',
      headline: 'Heavenly Instruction',
      text1Part1: 'EOLLES is a sovereign voice forged in the fire of silence. She carries the ancestral roar of bold women and the sacred stillness of divine downloads. A soul appointed not by algorithms, but by assignment.',
      text1Part2: '',
      text1Part3: '',
      text2: 'Her name means "light," but her work is thunder: poetic, prophetic, and unapologetically throne-bound.',
      text3Part1: 'She writes not for entertainment but for ',
      text3Part2: 'enthronement',
      text3Part3: '. Her debut work, The Crowded Bed & The Empty Throne, is more than a book, it is a spiritual awakening.',
      text4: 'With the cadence of scripture and the punch of protest, EOLLES exposes the counterfeit of being "chosen" and calls women into alignment with destiny, not desire.',
      quotePart1: 'This is not an author page.',
      quotePart2: 'It is a sacred dispatch.',
      mission: 'Whether writing, speaking, or creating kingdom art, EOLLES is not chasing fame; she is building a legacy. The heartbeat behind a growing movement of women who refuse to be rotated, hidden, or silenced.',
    },
    frequency: {
      label: 'The Soundtrack of Sovereignty',
      headline: 'The Frequency',
      description: 'The journey to the throne has a frequency. Tune into the sound of your divine right.',
      tracks: [
        { title: 'Rise', duration: '2:14', playable: true },
        { title: 'The Coronation', duration: '3:45' },
        { title: 'Sovereign Ground', duration: '5:12' },
      ],
      comingSoon: 'Coming soon to streaming platforms',
    },
    gathering: {
      label: 'The Gathering',
      headlinePart1: 'We Do Not Just Tour.',
      headlinePart2: 'We Assemble.',
      description: 'Throne Light events are not concerts or conferences. They are convocations. When we move, we move with purpose.',
      waitlistTitle: 'Join Waitlist',
      waitlistDesc: 'Where should we bring the throne room next?',
      cityPlaceholder: 'Select a city...',
      emailPlaceholder: 'Your email address',
      notifyButton: 'Notify Me',
      requestTitle: 'Request a City',
      requestDesc: 'Don\'t see your city? Summon us.',
      requestButton: 'Request City',
      cityRequestPlaceholder: 'City',
      stateRequestPlaceholder: 'State / Country',
      cancelButton: 'Cancel',
      submitButton: 'Submit Request',
      successMessage: '✨ Your request has been submitted! Spread the word to gather more votes.',
      modalTitle: 'Get Notified',
      modalDesc: 'Be the first to know when we gather in',
      closeButton: 'Close',
      upcomingStatus: 'Upcoming',
      requestedCitiesTitle: 'Requested Cities',
      requestedCitiesDesc: 'Click 👍 if you would like EOLLES to visit this city.',
      pendingStatus: 'Pending sufficient votes',
    },
    remnant: {
      headlinePart1: 'Receive The ',
      headlinePart2: 'Message',
      description: 'The goal of this creation is not about selling, it is about summoning. Enter your email to receive revelations that free you from the traps you\'ve been captured in and call you to the throne you were born to occupy.',
      emailPlaceholder: 'Your best email address...',
      button: 'Enter The Gates',
      privacy: 'Your journey is sacred. We never sell your information, no matter the price.',
      successTitle: 'Welcome to the Reign',
      successDesc: 'Check your inbox for The Recognition.',
      footerText: 'your throne awaits',
    },
    mandate: {
      label: 'The Mission',
      headlinePart1: 'We are not here to fill shelves.',
      headlinePart2: 'We are here to build altars in the shape of your highest self.',
      description: 'Every title we publish must serve the throne, carry light, and shift atmospheres. In a world of noise, we publish thunder. We look for the voices that carry the ancestral roar and the sacred silence.',
      sealTitle: 'Throne Light Publishing',
      sealSubtitle: 'Sovereignty In Every Word',
      pillars: [
        { title: 'Enthrone', description: 'We elevate voices that carry divine authority.' },
        { title: 'Illuminate', description: 'We publish words that bring revelation and clarity.' },
        { title: 'Transform', description: 'We release scrolls that shift atmospheres.' },
      ],
    },
    archive: {
      label: 'Current Releases',
      headline: 'The Archive',
      catalog: [
        { title: 'The Crowded Bed & The Empty Throne', author: 'EOLLES', description: 'A prophetic gift for women ready to reclaim their crown.', status: 'Available Now', viewBook: 'View Book' },
      ],
      comingSoon: 'More Enlightenment Coming Soon',
    },
    gate: {
      label: 'Submissions',
      headline: 'Gated Community',
      status: 'The Altar Is Currently Full.',
      description: 'We are presently focused on launching the works already within our light. You are welcome to submit your manuscript; it will be held in the order received and we will notify you when we begin active reviews again.',
      notice: 'Thank you for your patience as submissions are reviewed in divine order.',
    },
    ledger: {
      label: 'Inquiries',
      headline: 'The Ledger',
      inquiries: 'For media, rights, and partnership inquiries:',
      links: { book: 'The Book', author: 'The Author', amazon: 'The Store' },
      copyright: 'Throne Light Publishing LLC. All Rights Reserved.',
      slogan: 'Sovereignty in every word.',
    },
    footer: {
      taglinePart1: "We don't just distribute books.",
      taglinePart2: "We bring forth light.",
      constellation: "The Constellation",
      connect: "Connect",
      rights: "Throne Light Publishing LLC. All Rights Reserved.",
      slogan: "Sovereignty in every word.",
    },
  },
  fr: {
    nav: {
      choosePath: 'Choisissez Votre Chemin',
      constellation: 'La Constellation',
      book: 'Le Lit Bondé & Le Trône Vide',
      author: 'EOLLES',
      publisher: 'Éditions Lumière du Trône',
      taglineBook: 'Le Livre',
      taglineAuthor: 'L\'Auteur',
      taglinePublisher: 'L\'Éditeur',
    },
    hero: {
      headlinePart1: 'Le Lit Est Bondé.',
      headlinePart2: 'Mais Le Trône Reste Vide.',
      subheadlinePart1: 'Arrêtez d\'auditionner pour un homme qui ne vous offre que la rotation.',
      subheadlinePart2: 'Il est temps pour vous de régner.',
      cta: 'Réclamez Votre Couronne',
      scroll: 'Défiler',
    },
    mirror: {
      label: 'Le Piège de la Rotation',
      text1Part1: "Vous avez donné une ",
      text1Part2: "loyauté digne d'un trône",
      text1Part3: " à un homme opérant sur un intérêt de niveau lit. Vous avez versé une énergie d'alliance dans une connexion occasionnelle, espérant que si vous aimiez plus fort, serviez mieux ou attendiez plus longtemps, il verrait enfin votre valeur.",
      text2Part1: "Mais voici la vérité prophétique : ",
      text2Part2: "Les hommes sont fidèles à la vision, pas à l'effort.",
      text2Part3: " Si vous n'êtes pas dans sa vision, votre présence est facultative. Votre corps devient accessible, mais votre trône reste vacant.",
      quote: "Vous êtes choisie pour l'appétit, pas couronnée pour le but.",
    },
    confrontation: {
      questionPart1: "Vous oublie-t-il quand",
      questionPart2: "vous n'êtes pas devant lui ?",
      text1Part1: 'Pas "does he text back." Est-ce qu\'il ',
      text1Part2: "se souvient de vous",
      text1Part3: " quand vous n'êtes pas physiquement présente ? Parce que les reines n'ont pas à rappeler leur existence aux rois.",
      text2Part1: "Si vous vous réintroduisez constamment à son attention, vous n'êtes pas sur son trône. ",
      text2Part2: "Vous êtes sur sa liste.",
    },
    scrollSection: {
      headlinePart1: "Ce N'est Pas Un Guide De Rencontres.",
      headlinePart2: "C'est Un Décret Royal.",
      text1Part1: "Le Lit Bondé & Le Trône Vide",
      text1Part2: " est un parchemin prophétique pour les femmes qui ont fini de rivaliser pour l'attention d'un homme et sont prêtes à réclamer leur couronne.",
      text2: 'Avec une clarté perçante et un feu poétique, EOLLES démantèle la fausse promesse d\'être "choisie" dans un monde où l\'accès est confondu avec l\'autorité. Des matelas bondés aux royaumes vacants, ce livre expose les dynamiques motivées par l\'appétit qui maintiennent les femmes puissantes dans un esclavage émotionnel et illumine le chemin du retour vers l\'alignement du trône.',
      features: [
        { title: 'Reconnaître le Piège', description: 'Distinguez quand vous êtes en rotation vs quand vous régnez.' },
        { title: 'Démanteler le Mensonge', description: "Apprenez pourquoi l'alchimie n'est pas l'alliance." },
        { title: 'Occuper le Trône', description: 'Arrêtez d\'auditionner et commencez à occuper le trône pour lequel vous êtes née.' },
      ],
      cta: 'Lire l\'Aperçu',
    },
    witnesses: {
      label: 'Les Témoins',
      headlinePart1: 'Voix des ',
      headlinePart2: 'Libérées',
      testimonials: [
        { quote: "Je ne savais pas que je saignais encore jusqu'à ce que je lise ce livre. Le matelas de la confusion ? C'était toute ma vingtaine. Ce message m'a réveillée.", author: "Lectrice Anonyme" },
        { quote: "Le Lit Bondé & Le Trône Vide est un miroir, une épée et une couronne tout-en-un. Il ne m'a pas seulement interpellée ; il m'a élevée. Ce n'est pas un livre. C'est une intervention divine.", author: "Avis de Lectrice" },
        { quote: "Je n'ai jamais vu mes relations floues, mes liens d'âme et ma confusion émotionnelle dénoncés avec autant de feu spirituel. Je me sens libre. Je me sens vue. Je me sens souveraine.", author: "Lectrice Bêta" },
      ],
    },
    altar: {
      headlinePart1: 'La Couronne N\'est Pas À Vendre.',
      headlinePart2: 'Mais Elle Est Disponible.',
      textPart1: 'À la femme fatiguée de la rotation.',
      textPart2: 'À la femme qui a fini d\'auditionner.',
      textPart3: 'À la femme prête à régner.',
      cta: 'Commandez Votre Ascension',
      linkPublisher: 'Visitez Éditions Lumière du Trône',
      linkAuthor: 'Rencontrer l\'Auteur',
      sovereignty: 'La Souveraineté Attend',
    },
    purchase: {
      title: 'Réclamez Votre Couronne',
      subtitle: 'Choisissez comment recevoir votre décret royal',
      digitalTitle: 'Édition Numérique',
      digitalDesc: 'Lisez sur l\'application Throne Light Reader. Sécurisé, beau, à vous pour toujours.',
      instantAccess: 'Instantané',
      physicalTitle: 'Livre Physique',
      physicalDesc: 'Livre broché premium livré à votre trône. Parfait pour votre bibliothèque royale.',
      back: 'Retour aux options',
      readerTitle: 'Throne Light Reader',
      readerDesc: 'Votre achat comprend un accès à vie à l\'application sécurisée Throne Light Reader avec:',
      feature1: 'Beaux modes de lecture sombre et clair',
      feature2: 'Accès hors ligne sur votre appareil',
      feature3: 'Progression et signets synchronisés',
      feature4: 'Contenu bonus exclusif',
      buyDigital: 'Acheter Numérique — 9,99 $',
      amazon: 'Acheter sur Amazon',
      amazonDesc: 'Livraison Prime disponible',
      direct: 'Acheter Direct',
      directDesc: 'Soutenez l\'auteur directement',
      secure: '🔒 Paiement sécurisé par Stripe',
    },
    audio: {
      mute: 'Couper le son',
      play: 'Jouer le son ambiant',
    },
    authorHero: {
      name: 'EOLLES',
      title: 'Visionnaire Prophétique. Entité Souveraine.',
      descriptionPart1: 'Nommée par assignation. Forgée dans le silence.',
      descriptionPart2: 'Une voix pour les femmes prêtes à régner.',
      cta: 'Message D\'En Haut',
    },
    publisherHero: {
      est: 'Fondé en 2025',
      headlinePart1: "Nous Ne Distribuons Pas De Livres.",
      headlinePart2: "Nous Livrons Un But.",
      subheadlineName: 'Éditions Lumière du Trône',
      subheadlineText1: 'Existe pour introniser des voix, pas seulement les imprimer.',
      subheadlineText2: 'Éveiller la royauté par la révélation.',
      cta: 'Entrez Dans La Lumière',
    },
    dispatch: {
      label: 'L\'Origine',
      headline: 'Instruction Céleste',
      text1Part1: 'EOLLES est une voix souveraine forgée dans le feu du silence. Elle porte le rugissement ancestral des femmes audacieuses et le calme sacré des téléchargements divins. Une âme nommée non par des algorithmes, mais par assignation.',
      text1Part2: '',
      text1Part3: '',
      text2: 'Son nom signifie "lumière", mais son œuvre est le tonnerre : poétique, prophétique et sans excuse liée au trône.',
      text3Part1: 'Elle n\'écrit pas pour le divertissement mais pour l\'',
      text3Part2: 'intronisation',
      text3Part3: '. Son premier ouvrage, Le Lit Bondé & Le Trône Vide, est plus qu\'un livre, c\'est un éveil spirituel.',
      text4: 'Avec la cadence de l\'écriture et le punch de la protestation, EOLLES expose la contrefaçon d\'être "choisie" et appelle les femmes à s\'aligner avec le destin, pas le désir.',
      quotePart1: 'Ceci n\'est pas une page d\'auteur.',
      quotePart2: 'C\'est une dépêche sacrée.',
      mission: 'Qu\'elle écrive, parle ou crée de l\'art du royaume, EOLLES ne court pas après la gloire ; elle construit un héritage. Le battement de cœur derrière un mouvement croissant de femmes qui refusent d\'être tournées, cachées ou réduites au silence.',
    },
    frequency: {
      label: 'La Bande Son de la Souveraineté',
      headline: 'La Fréquence',
      description: 'Le voyage vers le trône a une fréquence. Accordez-vous au son de votre droit divin.',
      tracks: [
        { title: 'Salle du Trône', duration: '4:32' },
        { title: 'Le Couronnement', duration: '3:45' },
        { title: 'Terre Souveraine', duration: '5:12' },
      ],
      comingSoon: 'Bientôt sur les plateformes de streaming',
    },
    gathering: {
      label: 'Le Rassemblement',
      headlinePart1: 'Nous Ne Faisons Pas Que Tournée.',
      headlinePart2: 'Nous Nous Rassemblons.',
      description: 'Les événements Lumière du Trône ne sont pas des concerts ou des conférences. Ce sont des convocations. Quand nous bougeons, nous bougeons avec un but.',
      waitlistTitle: 'Rejoindre la Liste d\'Attente',
      waitlistDesc: 'Où devrions-nous apporter la salle du trône ensuite ?',
      cityPlaceholder: 'Sélectionnez une ville...',
      emailPlaceholder: 'Votre adresse e-mail',
      notifyButton: 'Prévenez-moi',
      requestTitle: 'Demander une Ville',
      requestDesc: 'Vous ne voyez pas votre ville ? Invoquez-nous.',
      requestButton: 'Demander une Ville',
      cityRequestPlaceholder: 'Ville',
      stateRequestPlaceholder: 'État / Pays',
      cancelButton: 'Annuler',
      submitButton: 'Envoyer la Demande',
      successMessage: '✨ Votre demande a été soumise ! Faites passer le mot pour recueillir plus de votes.',
      modalTitle: 'Être Notifiée',
      modalDesc: 'Soyez la première à savoir quand nous nous rassemblons à',
      closeButton: 'Fermer',
      upcomingStatus: 'À Venir',
      requestedCitiesTitle: 'Villes Demandées',
      requestedCitiesDesc: 'Cliquez sur 👍 si vous souhaitez que EOLLES visite cette ville.',
      pendingStatus: 'En attente de votes suffisants',
    },
    remnant: {
      headlinePart1: 'Rejoignez La ',
      headlinePart2: 'Salle du Trône',
      description: 'Le but de cette création n\'est pas de vendre, c\'est d\'invoquer. Entrez votre e-mail pour recevoir des révélations qui vous libèrent des pièges dans lesquels vous avez été capturée et vous appellent au trône que vous êtes née pour occuper.',
      emailPlaceholder: 'Votre meilleure adresse e-mail...',
      button: 'Entrez Par Les Portes',
      privacy: 'Votre voyage est sacré. Nous ne vendons jamais vos informations, peu importe le prix.',
      successTitle: 'Bienvenue dans le Règne',
      successDesc: 'Vérifiez votre boîte de réception pour La Reconnaissance.',
      footerText: 'La Salle du Trône Attend',
    },
    mandate: {
      label: 'La Mission',
      headlinePart1: 'Nous ne sommes pas là pour remplir des étagères.',
      headlinePart2: 'Nous sommes là pour construire des autels sous forme de mots.',
      description: 'Chaque titre que nous publions doit servir le trône, porter la lumière et changer les atmosphères. Dans un monde de bruit, nous publions le tonnerre. Nous recherchons les voix qui portent le rugissement ancestral et le silence sacré.',
      sealTitle: 'Éditions Lumière du Trône',
      sealSubtitle: 'Souveraineté Dans Chaque Mot',
      pillars: [
        { title: 'Introniser', description: 'Nous élevons les voix qui portent une autorité divine.' },
        { title: 'Illuminer', description: 'Nous publions des mots qui apportent révélation et clarté.' },
        { title: 'Transformer', description: 'Nous relâchons des parchemins qui changent les atmosphères.' },
      ],
    },
    archive: {
      label: 'Sorties Actuelles',
      headline: 'L\'Archive',
      catalog: [
        { title: 'Le Lit Bondé & Le Trône Vide', author: 'EOLLES', description: 'Un parchemin prophétique pour les femmes prêtes à réclamer leur couronne.', status: 'Disponible Maintenant', viewBook: 'Voir le Livre' },
      ],
      comingSoon: 'Plus de Parchemins Bientôt',
    },
    gate: {
      label: 'Soumissions',
      headline: 'La Porte',
      status: 'L\'Autel Est Actuellement Plein.',
      description: 'Nous n\'acceptons pas de soumissions de manuscrits pour le moment. Nous nous concentrons actuellement sur l\'intendance des voix déjà présentes dans la maison.',
      notice: 'Veuillez ne pas envoyer de requêtes.',
    },
    ledger: {
      label: 'Demandes',
      headline: 'Le Grand Livre',
      inquiries: 'Pour les demandes médias, droits et partenariats :',
      links: { book: 'Le Livre', author: 'L\'Auteur', amazon: 'Commander sur Amazon' },
      copyright: 'Éditions Lumière du Trône. Tous droits réservés.',
      slogan: 'Souveraineté dans chaque mot.',
    },
    footer: {
      taglinePart1: "Nous ne faisons pas que distribuer des livres.",
      taglinePart2: "Nous distribuons la lumière.",
      constellation: "La Constellation",
      connect: "Connecter",
      rights: "Éditions Lumière du Trône. Tous droits réservés.",
      slogan: "Souveraineté dans chaque mot.",
    },
  },
  es: {
    nav: {
      choosePath: 'Elige Tu Camino',
      constellation: 'La Constelación',
      book: 'La Cama Abarrotada y El Trono Vacío',
      author: 'EOLLES',
      publisher: 'Editorial Trono de Luz',
      taglineBook: 'El Libro',
      taglineAuthor: 'La Autora',
      taglinePublisher: 'La Editorial',
    },
    hero: {
      headlinePart1: 'La Cama Está Abarrotada.',
      headlinePart2: 'Pero El Trono Permanece Vacío.',
      subheadlinePart1: 'Deja de audicionar para un hombre que solo te ofrece rotación.',
      subheadlinePart2: 'Es tu momento de reinar.',
      cta: 'Reclama Tu Corona',
      scroll: 'Desplazarse',
    },
    mirror: {
      label: 'La Trampa de la Rotación',
      text1Part1: "Has estado dando ",
      text1Part2: "lealtad nivel trono",
      text1Part3: " a un hombre que opera con interés nivel cama. Has vertido energía de pacto en una conexión casual, esperando que si amaras más fuerte, sirvieras mejor o esperaras más, él finalmente vería tu valor.",
      text2Part1: "Pero aquí está la verdad profética: ",
      text2Part2: "Los hombres son leales a la visión, no al esfuerzo.",
      text2Part3: " Si no eres parte de su visión, tu presencia es opcional. Tu cuerpo se vuelve accesible, pero tu trono permanece desocupado.",
      quote: "Eres elegida por apetito, no coronada por propósito.",
    },
    confrontation: {
      questionPart1: "¿Él te olvida cuando",
      questionPart2: "no estás frente a él?",
      text1Part1: 'No "¿responde los mensajes?". ¿Él ',
      text1Part2: "te recuerda",
      text1Part3: " cuando no estás físicamente presente? Porque las reinas no tienen que recordarles a los reyes su existencia.",
      text2Part1: "Si te estás reintroduciendo constantemente a su atención, no estás en su trono. ",
      text2Part2: "Estás en su lista.",
    },
    scrollSection: {
      headlinePart1: "Esta No es una Guía de Relaciones.",
      headlinePart2: "Es un Decreto Real.",
      text1Part1: "La Cama Abarrotada y El Trono Vacío",
      text1Part2: " es un pergamino profético para mujeres que han terminado de competir por la atención de un hombre y están listas para reclamar su corona.",
      text2: 'Con claridad penetrante y fuego poético, EOLLES desmantela la falsa promesa de ser "elegida" en un mundo donde el acceso se confunde con autoridad. Desde colchones abarrotados hasta reinos vacantes, este libro expone las dinámicas impulsadas por el apetito que mantienen a mujeres poderosas en esclavitud emocional e ilumina el camino de regreso a la alineación del trono.',
      features: [
        { title: 'Reconoce la Trampa', description: 'Distingue entre cuando estás en rotación vs. cuando estás en reinado.' },
        { title: 'Desmantela la Mentira', description: 'Aprende por qué la química no es pacto.' },
        { title: 'Ocupa el Trono', description: 'Deja de audicionar y comienza a ocupar el trono para el que naciste.' },
      ],
      cta: 'Leer la Vista Previa',
    },
    witnesses: {
      label: 'Los Testigos',
      headlinePart1: 'Voces de las ',
      headlinePart2: 'Liberadas',
      testimonials: [
        { quote: "No sabía que todavía estaba sangrando hasta que leí este libro. ¿El colchón de la confusión? Esos fueron mis 20 años. Este mensaje me despertó.", author: "Lectora Anónima" },
        { quote: "La Cama Abarrotada y El Trono Vacío es un espejo, una espada y una corona, todo a la vez. No solo me llamó la atención; me elevó. Esto no es un libro. Es una intervención divina.", author: "Reseña de Lectora" },
        { quote: "Nunca he visto mis situaciones, lazos del alma y confusión emocional expuestos con tanto fuego espiritual. Me siento libre. Me siento vista. Me siento soberana.", author: "Lectora Beta" },
      ],
    },
    altar: {
      headlinePart1: 'La Corona No Está a la Venta.',
      headlinePart2: 'Pero Está Disponible.',
      textPart1: 'A la mujer cansada de la rotación.',
      textPart2: 'A la mujer que terminó de audicionar.',
      textPart3: 'A la mujer lista para reinar.',
      cta: 'Ordena Tu Ascensión',
      linkPublisher: 'Visitar Editorial Trono de Luz',
      linkAuthor: 'Conocer al Autor',
      sovereignty: 'La Soberanía Espera',
    },
    purchase: {
      title: 'Reclama Tu Corona',
      subtitle: 'Elige cómo quieres recibir tu decreto real',
      digitalTitle: 'Edición Digital',
      digitalDesc: 'Lee en la app Throne Light Reader. Segura, hermosa, tuya para siempre.',
      instantAccess: 'Instantáneo',
      physicalTitle: 'Libro Físico',
      physicalDesc: 'Libro de tapa blanda premium entregado a tu trono. Perfecto para tu biblioteca real.',
      back: 'Volver a opciones',
      readerTitle: 'Throne Light Reader',
      readerDesc: 'Tu compra incluye acceso de por vida a la app segura Throne Light Reader con:',
      feature1: 'Hermosos modos de lectura claro y oscuro',
      feature2: 'Acceso sin conexión en tu dispositivo',
      feature3: 'Progreso y marcadores sincronizados',
      feature4: 'Contenido bonus exclusivo',
      buyDigital: 'Comprar Digital — $29.99',
      amazon: 'Comprar en Amazon',
      amazonDesc: 'Envío Prime disponible',
      direct: 'Comprar Directo',
      directDesc: 'Apoya al autor directamente',
      secure: '🔒 Pago seguro con Stripe',
    },
    audio: {
      mute: 'Silenciar audio',
      play: 'Reproducir audio ambiental',
    },
    authorHero: {
      name: 'EOLLES',
      title: 'Visionaria Profética. Entidad Soberana.',
      descriptionPart1: 'Designada por asignación. Forjada en silencio.',
      descriptionPart2: 'Una voz para las mujeres que están preparadas para reinar.',
      cta: 'Mensaje Desde Arriba',
    },
    publisherHero: {
      est: 'Est. 2025',
      headlinePart1: "No Distribuimos Libros.",
      headlinePart2: "Entregamos Propósito.",
      subheadlineName: 'Editorial Trono de Luz',
      subheadlineText1: 'Existe para entronizar voces, no solo imprimirlas.',
      subheadlineText2: 'Despertando la realeza a través de la revelación.',
      cta: 'Entra En La Luz',
    },
    dispatch: {
      label: 'El Origen',
      headline: 'Instrucción Celestial',
      text1Part1: 'EOLLES es una voz soberana forjada en el fuego del silencio. Lleva el rugido ancestral de mujeres audaces y el silencio sagrado de descargas divinas. Un alma designada no por algoritmos, sino por asignación.',
      text1Part2: '',
      text1Part3: '',
      text2: 'Su nombre significa "luz", pero su obra es trueno: poética, profética y sin disculpas dirigida al trono.',
      text3Part1: 'Ella escribe no para el entretenimiento sino para la ',
      text3Part2: 'entronización',
      text3Part3: '. Su debut, La Cama Abarrotada y El Trono Vacío, es más que un libro, es un despertar espiritual.',
      text4: 'Con la cadencia de la escritura y el golpe de la protesta, EOLLES expone la falsificación de ser "elegida" y llama a las mujeres a alinearse con el destino, no con el deseo.',
      quotePart1: 'Esta no es una página de autor.',
      quotePart2: 'Es un despacho sagrado.',
      mission: 'Ya sea escribiendo, hablando o creando arte del reino, EOLLES no persigue la fama; está construyendo un legado. El latido detrás de un movimiento creciente de mujeres que se niegan a ser rotadas, ocultas o silenciadas.',
    },
    frequency: {
      label: 'La Banda Sonora de la Soberanía',
      headline: 'La Frecuencia',
      description: 'El viaje al trono tiene una frecuencia. Sintonízate con el sonido de tu derecho divino.',
      tracks: [
        { title: 'Sala del Trono', duration: '4:32' },
        { title: 'La Coronación', duration: '3:45' },
        { title: 'Tierra Soberana', duration: '5:12' },
      ],
      comingSoon: 'Próximamente en plataformas de streaming',
    },
    gathering: {
      label: 'La Reunión',
      headlinePart1: 'No Hacemos Giras.',
      headlinePart2: 'Nos Reunimos.',
      description: 'Los eventos de Trono de Luz no son conciertos ni conferencias. Son convocatorias. Cuando nos movemos, nos movemos con propósito.',
      waitlistTitle: 'Únete a la Lista de Espera',
      waitlistDesc: '¿A dónde deberíamos llevar la sala del trono a continuación?',
      cityPlaceholder: 'Selecciona una ciudad...',
      emailPlaceholder: 'Tu dirección de correo electrónico',
      notifyButton: 'Notificarme',
      requestTitle: 'Solicitar una Ciudad',
      requestDesc: '¿No ves tu ciudad? Invócanos.',
      requestButton: 'Solicitar Ciudad',
      cityRequestPlaceholder: 'Ciudad',
      stateRequestPlaceholder: 'Estado / País',
      cancelButton: 'Cancelar',
      submitButton: 'Enviar Solicitud',
      successMessage: '✨ ¡Tu solicitud ha sido enviada! Corre la voz para reunir más votos.',
      modalTitle: 'Recibir Notificación',
      modalDesc: 'Sé la primera en saber cuándo nos reunimos en',
      closeButton: 'Cerrar',
      upcomingStatus: 'Próximamente',
      requestedCitiesTitle: 'Ciudades Solicitadas',
      requestedCitiesDesc: 'Haz clic en 👍 si te gustaría que EOLLES visitara esta ciudad.',
      pendingStatus: 'Pendiente de suficientes votos',
    },
    remnant: {
      headlinePart1: 'Únete A La ',
      headlinePart2: 'Sala del Trono',
      description: 'El objetivo de esta creación no es vender, es convocar. Ingresa tu correo electrónico para recibir revelaciones que te liberen de las trampas en las que has sido capturada y te llamen al trono que naciste para ocupar.',
      emailPlaceholder: 'Tu mejor correo electrónico...',
      button: 'Entrar Por Las Puertas',
      privacy: 'Tu viaje es sagrado. Nunca vendemos tu información, sin importar el precio.',
      successTitle: 'Bienvenida al Reinado',
      successDesc: 'Revisa tu bandeja de entrada para El Reconocimiento.',
      footerText: 'La Sala del Trono Espera',
    },
    mandate: {
      label: 'La Misión',
      headlinePart1: 'No estamos aquí para llenar estanterías.',
      headlinePart2: 'Estamos aquí para construir altares en forma de palabras.',
      description: 'Cada título que publicamos debe servir al trono, portar luz y cambiar atmósferas. En un mundo de ruido, publicamos el trueno. Buscamos las voces que llevan el rugido ancestral y el silencio sagrado.',
      sealTitle: 'Editorial Trono de Luz',
      sealSubtitle: 'Soberanía en Cada Palabra',
      pillars: [
        { title: 'Entronizar', description: 'Elevamos voces que portan autoridad divina.' },
        { title: 'Iluminar', description: 'Publicamos palabras que traen revelación y claridad.' },
        { title: 'Transformar', description: 'Lanzamos pergaminos que cambian atmósferas.' },
      ],
    },
    archive: {
      label: 'Lanzamientos Actuales',
      headline: 'El Archivo',
      catalog: [
        { title: 'La Cama Abarrotada y El Trono Vacío', author: 'EOLLES', description: 'Un pergamino profético para mujeres listas para reclamar su corona.', status: 'Disponible Ahora', viewBook: 'Ver Libro' },
      ],
      comingSoon: 'Más Pergaminos Próximamente',
    },
    gate: {
      label: 'Envíos',
      headline: 'La Puerta',
      status: 'El Altar Está Actualmente Lleno.',
      description: 'No estamos aceptando envíos de manuscritos en este momento. Actualmente estamos enfocados en administrar las voces que ya están dentro de la casa.',
      notice: 'Por favor, no envíen consultas.',
    },
    ledger: {
      label: 'Consultas',
      headline: 'El Libro Mayor',
      inquiries: 'Para consultas de medios, derechos y asociaciones:',
      links: { book: 'El Libro', author: 'La Autora', amazon: 'Ordenar en Amazon' },
      copyright: 'Editorial Trono de Luz. Todos los derechos reservados.',
      slogan: 'Soberanía en cada palabra.',
    },
    footer: {
      taglinePart1: "No distribuimos libros.",
      taglinePart2: "Distribuimos luz.",
      constellation: "La Constelación",
      connect: "Conectar",
      rights: "Editorial Trono de Luz. Todos los derechos reservados.",
      slogan: "Soberanía en cada palabra.",
    },
  },
  zh: {
    nav: {
      choosePath: '选择你的道路',
      constellation: '星座',
      book: '拥挤的床与空虚的王座',
      author: '埃奥莱斯之光',
      publisher: '王座之光出版社',
      taglineBook: '书',
      taglineAuthor: '作者',
      taglinePublisher: '出版社',
    },
    hero: {
      headlinePart1: '床拥挤不堪。',
      headlinePart2: '但王座依然空虚。',
      subheadlinePart1: '停止为一个只提供轮换的男人试镜。',
      subheadlinePart2: '是你统治的时候了。',
      cta: '夺回你的皇冠',
      scroll: '滚动',
    },
    mirror: {
      label: '轮换陷阱',
      text1Part1: "你一直在给予一个只对你有床笫之趣的男人",
      text1Part2: "王座级的忠诚",
      text1Part3: "。你把盟约的能量倾注到一段随意的关系中，希望只要你爱得更深、服务得更好或等待得更久，他最终会看到你的价值。",
      text2Part1: "但这是预言性的真理：",
      text2Part2: "男人忠于愿景，而非努力。",
      text2Part3: " 如果你不是他愿景的一部分，你的存在就是可有可无的。你的身体变得触手可及，但你的王座依然空置。",
      quote: "你因欲望被选中，而非因使命被加冕。",
    },
    confrontation: {
      questionPart1: "当你不在他面前时",
      questionPart2: "他会忘记你吗？",
      text1Part1: '不是“他回短信了吗”。而是当你不在场时，他是否',
      text1Part2: "记得你",
      text1Part3: "？因为女王不需要提醒国王她们的存在。",
      text2Part1: "如果你不断地重新向他介绍自己以博取关注，你就不在他的王座上。",
      text2Part2: "你在他的名单上。",
    },
    scrollSection: {
      headlinePart1: "这不是一本恋爱指南。",
      headlinePart2: "这是一道皇家法令。",
      text1Part1: "拥挤的床与空虚的王座",
      text1Part2: " 是为那些不再为男人的关注而竞争并准备夺回皇冠的女性准备的预言卷轴。",
      text2: '凭借敏锐的清晰度和诗意的火焰，埃奥莱斯拆穿了在这个将通过误认为权威的世界中被“选中”的虚假承诺。从拥挤的床垫到空缺的王国，这本书揭露了那些让有权势的女性处于情感奴役状态的欲望驱动的动态，并照亮了回归王座级对齐的道路。',
      features: [
        { title: '识别陷阱', description: '区分你在轮换中还是在统治中。' },
        { title: '拆穿谎言', description: '了解为什么化学反应不是盟约。' },
        { title: '占据王座', description: '停止试镜，开始占据你生来就该拥有的王座。' },
      ],
      cta: '阅读预览',
    },
    witnesses: {
      label: '见证人',
      headlinePart1: '获救者的',
      headlinePart2: '声音',
      testimonials: [
        { quote: "直到读了这本书，我才知道自己还在流血。困惑的床垫？那就是我整个20多岁的时光。这个信息唤醒了我。", author: "匿名早期读者" },
        { quote: "拥挤的床与空虚的王座同时是一面镜子、一把剑和一顶皇冠。它不仅指出了我的问题；它提升了我。这不是一本书。这是神圣的干预。", author: "读者评论" },
        { quote: "我从未见过我的暧昧关系、灵魂纽带和情感困惑被如此强烈的精神之火所揭露。我感到自由。我感到被看见。我感到拥有主权。", author: "测试读者" },
      ],
    },
    altar: {
      headlinePart1: '皇冠非卖品。',
      headlinePart2: '但它可得。',
      textPart1: '致厌倦了轮换的女人。',
      textPart2: '致结束试镜的女人。',
      textPart3: '致准备统治的女人。',
      cta: '预订你的提升',
      linkPublisher: '访问王座之光出版社',
      linkAuthor: '认识作者',
      sovereignty: '主权在等待',
    },
    purchase: {
      title: '夺回你的皇冠',
      subtitle: '选择如何接收你的皇家法令',
      digitalTitle: '数字版',
      digitalDesc: '在王座之光阅读器应用上阅读。安全、美观、永远属于你。',
      instantAccess: '即时',
      physicalTitle: '实体书',
      physicalDesc: '高级平装本送到你的王座。完美适合你的皇家书房。',
      back: '返回选项',
      readerTitle: '王座之光阅读器',
      readerDesc: '您的购买包括终身访问安全的王座之光阅读器应用：',
      feature1: '精美的深色和浅色阅读模式',
      feature2: '设备离线访问',
      feature3: '同步进度和书签',
      feature4: '独家奖励内容',
      buyDigital: '购买数字版 — $29.99',
      amazon: '在亚马逊购买',
      amazonDesc: 'Prime配送可用',
      direct: '直接购买',
      directDesc: '直接支持作者',
      secure: '🔒 Stripe安全支付',
    },
    audio: {
      mute: '静音',
      play: '播放环境音频',
    },
    authorHero: {
      name: '埃奥莱斯之光',
      title: '预言性梦想家。主权实体。',
      descriptionPart1: '因使命而被任命。在沉默中锻造。',
      descriptionPart2: '为准备统治的女性发声。',
      cta: '来自上方的讯息',
    },
    publisherHero: {
      est: '建于 2025',
      headlinePart1: "我们不分发书籍。",
      headlinePart2: "我们传递目标。",
      subheadlineName: '王座之光出版社',
      subheadlineText1: '存在的目的是为了推崇声音，而不仅仅是印刷它们。',
      subheadlineText2: '通过启示唤醒皇室血统。',
      cta: '进入光中',
    },
    dispatch: {
      label: '起源',
      headline: '天上的指示',
      text1Part1: '埃奥莱斯是在沉默之火中锻造的主权之声。她承载着大胆女性的祖先咆哮和神圣下载的神圣静默。一个不是由算法任命，而是由使命任命的灵魂。',
      text1Part2: '',
      text1Part3: '',
      text2: '她的名字意为“光”，但她的作品是雷霆：诗意的、预言性的，并且毫无歉意地通向王座。',
      text3Part1: '她写作不是为了娱乐，而是为了',
      text3Part2: '登基',
      text3Part3: '。她的处女作《拥挤的床与空虚的王座》不仅仅是一本书，它是一次精神觉醒。',
      text4: '凭借经文的韵律和抗议的力量，埃奥莱斯揭露了被“选中”的赝品，并呼吁女性与命运而非欲望保持一致。',
      quotePart1: '这不是一个作者页面。',
      quotePart2: '这是一份神圣的急件。',
      mission: '无论是写作、演讲还是创作王国艺术，埃奥莱斯都不是在追逐名声；她是在建立遗产。这是一个不断壮大的女性运动背后的心跳，她们拒绝被轮换、被隐藏或被压制。',
    },
    frequency: {
      label: '主权的原声带',
      headline: '频率',
      description: '通往王座的旅程有一个频率。调整到你神圣权利的声音。',
      tracks: [
        { title: '王座室', duration: '4:32' },
        { title: '加冕', duration: '3:45' },
        { title: '主权之地', duration: '5:12' },
      ],
      comingSoon: '即将登陆流媒体平台',
    },
    gathering: {
      label: '聚会',
      headlinePart1: '我们不巡演。',
      headlinePart2: '我们聚会。',
      description: '王座之光活动不是音乐会或会议。它们是召集。当我们行动时，我们带着目的行动。',
      waitlistTitle: '加入候补名单',
      waitlistDesc: '我们接下来应该把王座室带到哪里？',
      cityPlaceholder: '选择一个城市...',
      emailPlaceholder: '你的电子邮件地址',
      notifyButton: '通知我',
      requestTitle: '请求一个城市',
      requestDesc: '没看到你的城市？召唤我们。',
      requestButton: '请求城市',
      cityRequestPlaceholder: '城市',
      stateRequestPlaceholder: '州 / 国家',
      cancelButton: '取消',
      submitButton: '提交请求',
      successMessage: '✨ 你的请求已提交！传播消息以收集更多赞成票。',
      modalTitle: '获得通知',
      modalDesc: '第一时间知道我们在哪里聚会',
      closeButton: '关闭',
      upcomingStatus: '即将推出',
      requestedCitiesTitle: '请求的城市',
      requestedCitiesDesc: '如果你希望 EOLLES 访问这个城市，请点击 👍。',
      pendingStatus: '等待足够的赞成票',
    },
    remnant: {
      headlinePart1: '加入',
      headlinePart2: '王座室',
      description: '这个创作的目标不是为了销售，而是为了召唤。输入你的电子邮件以接收启示，这些启示将把你从被困的陷阱中解放出来，并呼唤你走向你生来就该占据的王座。',
      emailPlaceholder: '你最好的电子邮件地址...',
      button: '进入大门',
      privacy: '你的旅程是神圣的。无论价格如何，我们绝不出售你的信息。',
      successTitle: '欢迎来到统治',
      successDesc: '检查你的收件箱以获取“认可”。',
      footerText: '王座室在等待',
    },
    mandate: {
      label: '使命',
      headlinePart1: '我们不在这里填满书架。',
      headlinePart2: '我们在这里以文字的形式建立祭坛。',
      description: '我们出版的每一本书都必须服务于王座，承载光芒，并改变氛围。在喧嚣的世界中，我们出版雷霆。我们寻找那些承载着祖先咆哮和神圣静默的声音。',
      sealTitle: '王座之光出版社',
      sealSubtitle: '字字珠玑，尽显主权',
      pillars: [
        { title: '登基', description: '我们提升承载神圣权威的声音。' },
        { title: '照亮', description: '我们出版带来启示和清晰的文字。' },
        { title: '转化', description: '我们发布改变氛围的卷轴。' },
      ],
    },
    archive: {
      label: '当前发布',
      headline: '档案',
      catalog: [
        { title: '拥挤的床与空虚的王座', author: '埃奥莱斯', description: '为准备夺回皇冠的女性准备的预言卷轴。', status: '现已上市', viewBook: '查看书籍' },
      ],
      comingSoon: '更多卷轴即将推出',
    },
    gate: {
      label: '投稿',
      headline: '大门',
      status: '祭坛目前已满。',
      description: '我们目前不接受手稿投稿。我们目前专注于管理已经在家中的声音。',
      notice: '请不要发送查询。',
    },
    ledger: {
      label: '咨询',
      headline: '账本',
      inquiries: '媒体、版权和合作伙伴咨询：',
      links: { book: '书', author: '作者', amazon: '在亚马逊上订购' },
      copyright: '王座之光出版社。保留所有权利。',
      slogan: '字字珠玑，尽显主权。',
    },
    footer: {
      taglinePart1: "我们不分发书籍。",
      taglinePart2: "我们分发光明。",
      constellation: "星座",
      connect: "连接",
      rights: "王座之光出版社。保留所有权利。",
      slogan: "字字珠玑，尽显主权。",
    },
  },
  it: {
    nav: {
      choosePath: 'Scegli Il Tuo Percorso',
      constellation: 'La Costellazione',
      book: 'Il Letto Affollato e Il Trono Vuoto',
      author: 'EOLLES',
      publisher: 'Edizioni Luce del Trono',
      taglineBook: 'Il Libro',
      taglineAuthor: 'L\'Autore',
      taglinePublisher: 'L\'Editore',
    },
    hero: {
      headlinePart1: 'Il Letto È Affollato.',
      headlinePart2: 'Ma Il Trono Rimane Vuoto.',
      subheadlinePart1: 'Smetti di fare audizioni per un uomo che ti offre solo rotazione.',
      subheadlinePart2: 'È il tuo momento di regnare.',
      cta: 'Reclama La Tua Corona',
      scroll: 'Scorri',
    },
    mirror: {
      label: 'La Trappola della Rotazione',
      text1Part1: "Hai dato ",
      text1Part2: "lealtà da trono",
      text1Part3: " a un uomo che opera con interesse da letto. Hai versato energia di alleanza in una connessione casuale, sperando che se avessi amato di più, servito meglio o aspettato più a lungo, lui avrebbe finalmente visto il tuo valore.",
      text2Part1: "Ma ecco la verità profetica: ",
      text2Part2: "Gli uomini sono fedeli alla visione, non allo sforzo.",
      text2Part3: " Se non fai parte della sua visione, la tua presenza è facoltativa. Il tuo corpo diventa accessibile, ma il tuo trono rimane vuoto.",
      quote: "Sei scelta per appetito, non incoronata per scopo.",
    },
    confrontation: {
      questionPart1: "Lui ti dimentica quando",
      questionPart2: "non sei davanti a lui?",
      text1Part1: 'Non "risponde ai messaggi". Lui ',
      text1Part2: "si ricorda di te",
      text1Part3: " quando non sei fisicamente presente? Perché le regine non devono ricordare ai re la loro esistenza.",
      text2Part1: "Se ti stai costantemente reintroducendo alla sua attenzione, non sei sul suo trono. ",
      text2Part2: "Sei sulla sua lista.",
    },
    scrollSection: {
      headlinePart1: "Questa Non è una Guida alle Relazioni.",
      headlinePart2: "È un Decreto Reale.",
      text1Part1: "Il Letto Affollato e Il Trono Vuoto",
      text1Part2: " è una pergamena profetica per le donne che hanno smesso di competere per l'attenzione di un uomo e sono pronte a reclamare la loro corona.",
      text2: 'Con chiarezza penetrante e fuoco poetico, EOLLES smantella la falsa promessa di essere "scelta" in un mondo in cui l\'accesso viene scambiato per autorità. Dai materassi affollati ai regni vacanti, questo libro espone le dinamiche guidate dall\'appetito che tengono donne potenti in schiavitù emotiva e illumina il percorso verso l\'allineamento del trono.',
      features: [
        { title: 'Riconosci la Trappola', description: 'Distingui tra quando sei in rotazione e quando sei nel regno.' },
        { title: 'Smantella la Bugia', description: "Impara perché la chimica non è alleanza." },
        { title: 'Occupa il Trono', description: 'Smetti di fare audizioni e inizia a occupare il trono per cui sei nata.' },
      ],
      cta: 'Leggi l\'Anteprima',
    },
    witnesses: {
      label: 'I Testimoni',
      headlinePart1: 'Voci delle ',
      headlinePart2: 'Liberate',
      testimonials: [
        { quote: "Non sapevo di stare ancora sanguinando finché non ho letto questo libro. Il materasso della confusione? Quelli sono stati i miei 20 anni. Questo messaggio mi ha svegliato.", author: "Lettrice Anonima" },
        { quote: "Il Letto Affollato e Il Trono Vuoto è uno specchio, una spada e una corona tutto in uno. Non mi ha solo richiamato; mi ha elevato. Questo non è un libro. È un intervento divino.", author: "Recensione Lettrice" },
        { quote: "Non ho mai visto le mie situazioni, legami dell'anima e confusione emotiva chiamati fuori con così tanto fuoco spirituale. Mi sento libera. Mi sento vista. Mi sento sovrana.", author: "Lettrice Beta" },
      ],
    },
    altar: {
      headlinePart1: 'La Corona Non È in Vendita.',
      headlinePart2: 'Ma È Disponibile.',
      textPart1: 'Alla donna stanca della rotazione.',
      textPart2: 'Alla donna che ha finito di fare audizioni.',
      textPart3: 'Alla donna pronta a regnare.',
      cta: 'Ordina La Tua Ascensione',
      linkPublisher: 'Visita Edizioni Luce del Trono',
      linkAuthor: 'Incontra l\'Autore',
      sovereignty: 'La Sovranità Attende',
    },
    purchase: {
      title: 'Reclama La Tua Corona',
      subtitle: 'Scegli come vuoi ricevere il tuo decreto reale',
      digitalTitle: 'Edizione Digitale',
      digitalDesc: 'Leggi sull\'app Throne Light Reader. Sicura, bella, tua per sempre.',
      instantAccess: 'Istantaneo',
      physicalTitle: 'Libro Fisico',
      physicalDesc: 'Libro tascabile premium consegnato al tuo trono. Perfetto per la tua biblioteca reale.',
      back: 'Torna alle opzioni',
      readerTitle: 'Throne Light Reader',
      readerDesc: 'Il tuo acquisto include accesso a vita all\'app sicura Throne Light Reader con:',
      feature1: 'Belle modalità di lettura chiara e scura',
      feature2: 'Accesso offline sul tuo dispositivo',
      feature3: 'Progressi e segnalibri sincronizzati',
      feature4: 'Contenuti bonus esclusivi',
      buyDigital: 'Acquista Digitale — $29.99',
      amazon: 'Compra su Amazon',
      amazonDesc: 'Spedizione Prime disponibile',
      direct: 'Compra Diretto',
      directDesc: 'Supporta l\'autore direttamente',
      secure: '🔒 Pagamento sicuro con Stripe',
    },
    audio: {
      mute: 'Disattiva audio',
      play: 'Riproduci audio ambientale',
    },
    authorHero: {
      name: 'EOLLES',
      title: 'Visionaria Profetica. Entità Sovrana.',
      descriptionPart1: 'Nominata per assegnazione. Forgiata nel silenzio.',
      descriptionPart2: 'Una voce per le donne pronte a regnare.',
      cta: 'Messaggio Dall\'Alto',
    },
    publisherHero: {
      est: 'Est. 2025',
      headlinePart1: "Non Distribuiamo Libri.",
      headlinePart2: "Consegniamo Scopo.",
      subheadlineName: 'Edizioni Luce del Trono',
      subheadlineText1: 'Esiste per intronizzare voci, non solo stamparle.',
      subheadlineText2: 'Risvegliare la regalità attraverso la rivelazione.',
      cta: 'Entra Nella Luce',
    },
    dispatch: {
      label: 'L\'Origine',
      headline: 'Istruzione Celeste',
      text1Part1: 'EOLLES è una voce sovrana forgiata nel fuoco del silenzio. Porta il ruggito ancestrale di donne audaci e il sacro silenzio dei download divini. Un\'anima nominata non da algoritmi, ma per assegnazione.',
      text1Part2: '',
      text1Part3: '',
      text2: 'Il suo nome significa "luce", ma la sua opera è tuono: poetica, profetica e senza scuse diretta al trono.',
      text3Part1: 'Lei scrive non per intrattenimento ma per l\'',
      text3Part2: 'intronizzazione',
      text3Part3: '. Il suo debutto, Il Letto Affollato e Il Trono Vuoto, è più di un libro, è un risveglio spirituale.',
      text4: 'Con la cadenza della scrittura e il pugno della protesta, EOLLES espone la contraffazione dell\'essere "scelta" e chiama le donne all\'allineamento con il destino, non con il desiderio.',
      quotePart1: 'Questa non è una pagina d\'autore.',
      quotePart2: 'È un dispaccio sacro.',
      mission: 'Che scriva, parli o crei arte del regno, EOLLES non insegue la fama; sta costruendo un\'eredità. Il battito cardiaco dietro un movimento crescente de donne che rifiutano di essere ruotate, nascoste o messe a tacere.',
    },
    frequency: {
      label: 'La Colonna Sonora della Sovranità',
      headline: 'La Frequenza',
      description: 'Il viaggio verso il trono ha una frequenza. Sintonizzati sul suono del tuo diritto divino.',
      tracks: [
        { title: 'Sala del Trono', duration: '4:32' },
        { title: 'L\'Incoronazione', duration: '3:45' },
        { title: 'Terra Sovrana', duration: '5:12' },
      ],
      comingSoon: 'Presto su piattaforme di streaming',
    },
    gathering: {
      label: 'Il Raduno',
      headlinePart1: 'Non Facciamo Tour.',
      headlinePart2: 'Ci Raduniamo.',
      description: 'Gli eventi Luce del Trono non sono concerti o conferenze. Sono convocazioni. Quando ci muoviamo, ci muoviamo con scopo.',
      waitlistTitle: 'Unisciti alla Lista d\'Attesa',
      waitlistDesc: 'Dove dovremmo portare la sala del trono dopo?',
      cityPlaceholder: 'Seleziona una città...',
      emailPlaceholder: 'Il tuo indirizzo email',
      notifyButton: 'Avvisami',
      requestTitle: 'Richiedi una Città',
      requestDesc: 'Non vedi la tua città? Evocaci.',
      requestButton: 'Richiedi Città',
      cityRequestPlaceholder: 'Città',
      stateRequestPlaceholder: 'Stato / Paese',
      cancelButton: 'Annulla',
      submitButton: 'Invia Richiesta',
      successMessage: '✨ La tua richiesta è stata inviata! Diffondi la voce per raccogliere più voti.',
      modalTitle: 'Ricevi Notifica',
      modalDesc: 'Sii la prima a sapere quando ci raduniamo a',
      closeButton: 'Chiudi',
      upcomingStatus: 'In Arrivo',
      requestedCitiesTitle: 'Città Richieste',
      requestedCitiesDesc: 'Clicca 👍 se vorresti che EOLLES visitasse questa città.',
      pendingStatus: 'In attesa di voti sufficienti',
    },
    remnant: {
      headlinePart1: 'Unisciti Alla ',
      headlinePart2: 'Sala del Trono',
      description: 'L\'obiettivo di questa creazione non è vendere, è convocare. Inserisci la tua email per ricevere rivelazioni che ti liberino dalle trappole in cui sei stata catturata e ti chiamino al trono che sei nata per occupare.',
      emailPlaceholder: 'La tua migliore email...',
      button: 'Entra Nei Cancelli',
      privacy: 'Il tuo viaggio è sacro. Non vendiamo mai le tue informazioni, indipendentemente dal prezzo.',
      successTitle: 'Benvenuta nel Regno',
      successDesc: 'Controlla la tua casella di posta per Il Riconoscimento.',
      footerText: 'La Sala del Trono Attende',
    },
    mandate: {
      label: 'La Missione',
      headlinePart1: 'Non siamo qui per riempire scaffali.',
      headlinePart2: 'Siamo qui per costruire altari sotto forma di parole.',
      description: 'Ogni titolo che pubblichiamo deve servire al trono, portare luce e cambiare atmosfere. In un mondo di rumore, pubblichiamo il tuono. Cerchiamo le voci che portano il ruggito ancestrale e il sacro silenzio.',
      sealTitle: 'Edizioni Luce del Trono',
      sealSubtitle: 'Sovranità in Ogni Parola',
      pillars: [
        { title: 'Intronizzare', description: 'Eleviamo voci che portano autorità divina.' },
        { title: 'Illuminare', description: 'Pubblichiamo parole che portano rivelazione e chiarezza.' },
        { title: 'Trasformare', description: 'Rilasciamo pergamene che cambiano atmosfere.' },
      ],
    },
    archive: {
      label: 'Uscite Attuali',
      headline: 'L\'Archivio',
      catalog: [
        { title: 'Il Letto Affollato e Il Trono Vuoto', author: 'EOLLES', description: 'Una pergamena profetica per le donne pronte a reclamare la loro corona.', status: 'Disponibile Ora', viewBook: 'Vedi Libro' },
      ],
      comingSoon: 'Altre Pergamene Presto',
    },
    gate: {
      label: 'Invii',
      headline: 'Il Cancello',
      status: 'L\'Altare È Attualmente Pieno.',
      description: 'Non accettiamo invii di manoscritti in questo momento. Attualmente siamo concentrati sull\'amministrazione delle voci già all\'interno della casa.',
      notice: 'Si prega di non inviare richieste.',
    },
    ledger: {
      label: 'Richieste',
      headline: 'Il Mastro',
      inquiries: 'Per richieste di media, diritti e partnership:',
      links: { book: 'Il Libro', author: 'L\'Autore', amazon: 'Ordina su Amazon' },
      copyright: 'Edizioni Luce del Trono. Tutti i diritti riservati.',
      slogan: 'Sovranità in ogni parola.',
    },
    footer: {
      taglinePart1: "Non distribuiamo libri.",
      taglinePart2: "Distribuiamo luce.",
      constellation: "La Costellazione",
      connect: "Connetti",
      rights: "Edizioni Luce del Trono. Tutti i diritti riservati.",
      slogan: "Sovranità in ogni parola.",
    },
  },
  de: {
    nav: {
      choosePath: 'Wähle Deinen Pfad',
      constellation: 'Die Konstellation',
      book: 'Das Überfüllte Bett & Der Leere Thron',
      author: 'EOLLES',
      publisher: 'Thronlicht Verlag',
      taglineBook: 'Das Buch',
      taglineAuthor: 'Der Autor',
      taglinePublisher: 'Der Verlag',
    },
    hero: {
      headlinePart1: 'Das Bett Ist Überfüllt.',
      headlinePart2: 'Doch Der Thron Bleibt Leer.',
      subheadlinePart1: 'Hör auf, für einen Mann vorzusprechen, der dir nur Rotation bietet.',
      subheadlinePart2: 'Es ist deine Zeit zu herrschen.',
      cta: 'Fordere Deine Krone',
      scroll: 'Scrollen',
    },
    mirror: {
      label: 'Die Rotationsfalle',
      text1Part1: "Du hast einem Mann ",
      text1Part2: "thronwürdige Treue",
      text1Part3: " gegeben, der nur auf bettwürdigem Interesse operiert. Du hast Bundesenergie in eine unverbindliche Verbindung gesteckt, in der Hoffnung, dass er deinen Wert endlich sehen würde, wenn du nur härter liebst, besser dienst oder länger wartest.",
      text2Part1: "Aber hier ist die prophetische Wahrheit: ",
      text2Part2: "Männer sind Visionen treu, nicht Bemühungen.",
      text2Part3: " Wenn du nicht Teil seiner Vision bist, ist deine Anwesenheit optional. Dein Körper wird zugänglich, aber dein Thron bleibt unbesetzt.",
      quote: "Du wurdest für Appetit ausgewählt, nicht für Bestimmung gekrönt.",
    },
    confrontation: {
      questionPart1: "Vergisst er dich, wenn",
      questionPart2: "du nicht vor ihm bist?",
      text1Part1: 'Nicht "schreibt er zurück". ',
      text1Part2: "Erinnert er sich an dich",
      text1Part3: ", wenn du nicht physisch anwesend bist? Denn Königinnen müssen Könige nicht an ihre Existenz erinnern.",
      text2Part1: "Wenn du dich ständig neu um seine Aufmerksamkeit bewerben musst, sitzt du nicht auf seinem Thron. ",
      text2Part2: "Du stehst auf seiner Liste.",
    },
    scrollSection: {
      headlinePart1: "Dies ist kein Beziehungsratgeber.",
      headlinePart2: "Es ist ein Königliches Dekret.",
      text1Part1: "Das Überfüllte Bett & Der Leere Thron",
      text1Part2: " ist eine prophetische Schriftrolle für Frauen, die es leid sind, um die Aufmerksamkeit eines Mannes zu konkurrieren, und bereit sind, ihre Krone zurückzufordern.",
      text2: 'Mit durchdringender Klarheit und poetischem Feuer demontiert EOLLES das falsche Versprechen, "auserwählt" zu sein in einer Welt, in der Zugang mit Autorität verwechselt wird. Von überfüllten Matratzen bis zu leeren Königreichen enthüllt dieses Buch die triebgesteuerten Dynamiken, die mächtige Frauen in emotionaler Sklaverei halten, und beleuchtet den Weg zurück zur Thronausrichtung.',
      features: [
        { title: 'Erkenne die Falle', description: 'Unterscheide, wann du in Rotation bist vs. wann du herrschst.' },
        { title: 'Demontiere die Lüge', description: 'Lerne, warum Chemie kein Bund ist.' },
        { title: 'Besetze den Thron', description: 'Hör auf vorzusprechen und fang an, den Thron zu besetzen, für den du geboren wurdest.' },
      ],
      cta: 'Leseprobe lesen',
    },
    witnesses: {
      label: 'Die Zeugen',
      headlinePart1: 'Stimmen der ',
      headlinePart2: 'Befreiten',
      testimonials: [
        { quote: "Ich wusste nicht, dass ich noch blute, bis ich dieses Buch gelesen habe. Die Matratze der Verwirrung? Das waren meine ganzen 20er. Diese Botschaft hat mich geweckt.", author: "Anonyme Erstleserin" },
        { quote: "Das Überfüllte Bett & Der Leere Thron ist Spiegel, Schwert und Krone zugleich. Es hat mich nicht nur zurechtgewiesen; es hat mich erhoben. Das ist kein Buch. Es ist eine göttliche Intervention.", author: "Leserrezension" },
        { quote: "Ich habe noch nie gesehen, dass meine Situationen, Seelenverbindungen und emotionale Verwirrung mit so viel geistlichem Feuer angesprochen wurden. Ich fühle mich frei. Ich fühle mich gesehen. Ich fühle mich souverän.", author: "Beta-Leserin" },
      ],
    },
    altar: {
      headlinePart1: 'Die Krone Ist Nicht Käuflich.',
      headlinePart2: 'Aber Sie Ist Verfügbar.',
      textPart1: 'An die Frau, die der Rotation müde ist.',
      textPart2: 'An die Frau, die mit dem Vorsprechen fertig ist.',
      textPart3: 'An die Frau, die bereit ist zu herrschen.',
      cta: 'Bestelle Deinen Aufstieg',
      linkPublisher: 'Besuche Thronlicht Verlag',
      linkAuthor: 'Triff den Autor',
      sovereignty: 'Souveränität Erwartet Dich',
    },
    purchase: {
      title: 'Beanspruche Deine Krone',
      subtitle: 'Wähle, wie du dein königliches Dekret erhalten möchtest',
      digitalTitle: 'Digitale Ausgabe',
      digitalDesc: 'Lies in der Throne Light Reader App. Sicher, schön, für immer deins.',
      instantAccess: 'Sofort',
      physicalTitle: 'Physisches Buch',
      physicalDesc: 'Premium-Taschenbuch zu deinem Thron geliefert. Perfekt für deine königliche Bibliothek.',
      back: 'Zurück zu Optionen',
      readerTitle: 'Throne Light Reader',
      readerDesc: 'Dein Kauf beinhaltet lebenslangen Zugang zur sicheren Throne Light Reader App mit:',
      feature1: 'Schöne Dunkel- und Hellmodi',
      feature2: 'Offline-Zugang auf deinem Gerät',
      feature3: 'Synchronisierter Fortschritt und Lesezeichen',
      feature4: 'Exklusive Bonusinhalte',
      buyDigital: 'Digital kaufen — 9,99 $',
      amazon: 'Auf Amazon kaufen',
      amazonDesc: 'Prime-Versand verfügbar',
      direct: 'Direkt kaufen',
      directDesc: 'Den Autor direkt unterstützen',
      secure: '🔒 Sichere Zahlung mit Stripe',
    },
    audio: {
      mute: 'Audio stummschalten',
      play: 'Hintergrundmusik abspielen',
    },
    authorHero: {
      name: 'EOLLES',
      title: 'Prophetische Visionärin. Souveräne Entität.',
      descriptionPart1: 'Durch Auftrag ernannt. In der Stille geschmiedet.',
      descriptionPart2: 'Eine Stimme für die Frauen, die bereit sind zu herrschen.',
      cta: 'Botschaft Von Oben',
    },
    publisherHero: {
      est: 'Gegr. 2025',
      headlinePart1: "Wir Vertreiben Keine Bücher.",
      headlinePart2: "Wir Liefern Bestimmung.",
      subheadlineName: 'Thronlicht Verlag',
      subheadlineText1: 'Existiert, um Stimmen zu inthronisieren, nicht nur zu drucken.',
      subheadlineText2: 'Erweckung der Königlichkeit durch Offenbarung.',
      cta: 'Tritt Ein In Das Licht',
    },
    dispatch: {
      label: 'Der Ursprung',
      headline: 'Himmlische Anweisung',
      text1Part1: 'EOLLES ist eine souveräne Stimme, die im Feuer der Stille geschmiedet wurde. Sie trägt das angestammte Gebrüll mutiger Frauen und die heilige Stille göttlicher Downloads. Eine Seele, die nicht durch Algorithmen, sondern durch Auftrag ernannt wurde.',
      text1Part2: '',
      text1Part3: '',
      text2: 'Ihr Name bedeutet "Licht", aber ihre Arbeit ist Donner: poetisch, prophetisch und unapologetisch auf den Thron ausgerichtet.',
      text3Part1: 'Sie schreibt nicht zur Unterhaltung, sondern zur ',
      text3Part2: 'Inthronisierung',
      text3Part3: '. Ihr Debüt, Das Überfüllte Bett & Der Leere Thron, ist mehr als ein Buch, es ist ein spirituelles Erwachen.',
      text4: 'Mit dem Rhythmus der Schrift und der Wucht des Protests entlarvt EOLLES die Fälschung des "Auserwähltseins" und ruft Frauen dazu auf, sich mit dem Schicksal und nicht mit dem Verlangen in Einklang zu bringen.',
      quotePart1: 'Dies ist keine Autorenseite.',
      quotePart2: 'Es ist eine heilige Depesche.',
      mission: 'Ob sie schreibt, spricht oder Königreichskunst schafft, EOLLES jagt keinem Ruhm nach; sie baut ein Vermächtnis. Der Herzschlag hinter einer wachsenden Bewegung von Frauen, die sich weigern, rotiert, versteckt oder zum Schweigen gebracht zu werden.',
    },
    frequency: {
      label: 'Der Soundtrack der Souveränität',
      headline: 'Die Frequenz',
      description: 'Die Reise zum Thron hat eine Frequenz. Stimme dich auf den Klang deines göttlichen Rechts ein.',
      tracks: [
        { title: 'Thronsaal', duration: '4:32' },
        { title: 'Die Krönung', duration: '3:45' },
        { title: 'Souveräner Boden', duration: '5:12' },
      ],
      comingSoon: 'Bald auf Streaming-Plattformen',
    },
    gathering: {
      label: 'Die Versammlung',
      headlinePart1: 'Wir Touren Nicht.',
      headlinePart2: 'Wir Versammeln Uns.',
      description: 'Thronlicht-Veranstaltungen sind keine Konzerte oder Konferenzen. Es sind Einberufungen. Wenn wir uns bewegen, bewegen wir uns mit Absicht.',
      waitlistTitle: 'Warteliste beitreten',
      waitlistDesc: 'Wohin sollen wir den Thronsaal als nächstes bringen?',
      cityPlaceholder: 'Wähle eine Stadt...',
      emailPlaceholder: 'Deine E-Mail-Adresse',
      notifyButton: 'Benachrichtige Mich',
      requestTitle: 'Stadt anfragen',
      requestDesc: 'Siehst du deine Stadt nicht? Rufe uns.',
      requestButton: 'Stadt anfragen',
      cityRequestPlaceholder: 'Stadt',
      stateRequestPlaceholder: 'Staat / Land',
      cancelButton: 'Abbrechen',
      submitButton: 'Anfrage Senden',
      successMessage: '✨ Deine Anfrage wurde gesendet! Verbreite die Nachricht, um mehr Stimmen zu sammeln.',
      modalTitle: 'Benachrichtigung erhalten',
      modalDesc: 'Sei die Erste, die erfährt, wann wir uns versammeln in',
      closeButton: 'Schließen',
      upcomingStatus: 'Demnächst',
      requestedCitiesTitle: 'Angefragte Städte',
      requestedCitiesDesc: 'Klicke auf 👍, wenn du möchtest, dass EOLLES diese Stadt besucht.',
      pendingStatus: 'Ausstehende ausreichende Stimmen',
    },
    remnant: {
      headlinePart1: 'Tritt Dem ',
      headlinePart2: 'Thronsaal Bei',
      description: 'Das Ziel dieser Schöpfung ist nicht der Verkauf, sondern die Einberufung. Gib deine E-Mail-Adresse ein, um Offenbarungen zu erhalten, die dich aus den Fallen befreien, in denen du gefangen warst, und dich auf den Thron rufen, für den du geboren wurdest.',
      emailPlaceholder: 'Deine beste E-Mail-Adresse...',
      button: 'Tritt Durch Die Tore',
      privacy: 'Deine Reise ist heilig. Wir verkaufen deine Informationen niemals, egal zu welchem Preis.',
      successTitle: 'Willkommen im Reich',
      successDesc: 'Überprüfe deinen Posteingang auf Die Anerkennung.',
      footerText: 'Der Thronsaal Erwartet Dich',
    },
    mandate: {
      label: 'Die Mission',
      headlinePart1: 'Wir sind nicht hier, um Regale zu füllen.',
      headlinePart2: 'Wir sind hier, um Altäre in Form von Worten zu bauen.',
      description: 'Jeder Titel, den wir veröffentlichen, muss dem Thron dienen, Licht tragen und Atmosphären verändern. In einer Welt voller Lärm veröffentlichen wir den Donner. Wir suchen die Stimmen, die das angestammte Gebrüll und die heilige Stille tragen.',
      sealTitle: 'Thronlicht Verlag',
      sealSubtitle: 'Souveränität in Jedem Wort',
      pillars: [
        { title: 'Inthronisieren', description: 'Wir erheben Stimmen, die göttliche Autorität tragen.' },
        { title: 'Erleuchten', description: 'Wir veröffentlichen Worte, die Offenbarung und Klarheit bringen.' },
        { title: 'Transformieren', description: 'Wir veröffentlichen Schriftrollen, die Atmosphären verändern.' },
      ],
    },
    archive: {
      label: 'Aktuelle Veröffentlichungen',
      headline: 'Das Archiv',
      catalog: [
        { title: 'Das Überfüllte Bett & Der Leere Thron', author: 'EOLLES', description: 'Eine prophetische Schriftrolle für Frauen, die bereit sind, ihre Krone zurückzufordern.', status: 'Jetzt Erhältlich', viewBook: 'Buch Ansehen' },
      ],
      comingSoon: 'Weitere Schriftrollen Folgen Bald',
    },
    gate: {
      label: 'Einsendungen',
      headline: 'Das Tor',
      status: 'Der Altar Ist Derzeit Voll.',
      description: 'Wir nehmen derzeit keine Manuskripteinsendungen an. Wir konzentrieren uns derzeit darauf, die Stimmen zu verwalten, die bereits im Haus sind.',
      notice: 'Bitte keine Anfragen senden.',
    },
    ledger: {
      label: 'Anfragen',
      headline: 'Das Hauptbuch',
      inquiries: 'Für Medien-, Rechte- und Partnerschaftsanfragen:',
      links: { book: 'Das Buch', author: 'Der Autor', amazon: 'Auf Amazon Bestellen' },
      copyright: 'Thronlicht Verlag. Alle Rechte vorbehalten.',
      slogan: 'Souveränität in jedem Wort.',
    },
    footer: {
      taglinePart1: "Wir vertreiben keine Bücher.",
      taglinePart2: "Wir vertreiben Licht.",
      constellation: "Die Konstellation",
      connect: "Verbinden",
      rights: "Thronlicht Verlag. Alle Rechte vorbehalten.",
      slogan: "Souveränität in jedem Wort.",
    },
  },
  ko: {
    nav: {
      choosePath: '당신의 길을 선택하세요',
      constellation: '별자리',
      book: '붐비는 침대와 빈 왕좌',
      author: '에올레스의 빛',
      publisher: '왕좌의 빛 출판사',
      taglineBook: '책',
      taglineAuthor: '저자',
      taglinePublisher: '출판사',
    },
    hero: {
      headlinePart1: '침대는 붐빕니다.',
      headlinePart2: '그러나 왕좌는 비어 있습니다.',
      subheadlinePart1: '당신에게 회전만을 제공하는 남자를 위해 오디션을 보지 마세요.',
      subheadlinePart2: '당신이 통치할 때입니다.',
      cta: '당신의 왕관을 차지하세요',
      scroll: '스크롤',
    },
    mirror: {
      label: '회전의 덫',
      text1Part1: "당신은 침대 수준의 관심으로 행동하는 남자에게 ",
      text1Part2: "왕좌 수준의 충성",
      text1Part3: "을 바치고 있었습니다. 당신은 더 사랑하고, 더 잘 섬기고, 더 오래 기다리면 그가 마침내 당신의 가치를 알아줄 것이라고 희망하며 가벼운 관계에 언약의 에너지를 쏟아부었습니다.",
      text2Part1: "하지만 예언적인 진실은 이렇습니다: ",
      text2Part2: "남자는 노력이 아닌 비전에 충성합니다.",
      text2Part3: " 당신이 그의 비전의 일부가 아니라면, 당신의 존재는 선택 사항입니다. 당신의 몸은 접근 가능해지지만, 당신의 왕좌는 비어 있습니다.",
      quote: "당신은 식욕을 위해 선택되었지, 목적을 위해 왕관을 쓴 것이 아닙니다.",
    },
    confrontation: {
      questionPart1: "당신이 그의 앞에 없을 때",
      questionPart2: "그가 당신을 잊나요?",
      text1Part1: '"문자에 답장하는가"가 아닙니다. 당신이 물리적으로 존재하지 않을 때 그가 ',
      text1Part2: "당신을 기억합니까",
      text1Part3: "? 여왕은 왕에게 자신의 존재를 상기시킬 필요가 없기 때문입니다.",
      text2Part1: "만약 당신이 끊임없이 그의 관심을 끌기 위해 자신을 다시 소개하고 있다면, 당신은 그의 왕좌에 있는 것이 아닙니다. ",
      text2Part2: "당신은 그의 명단에 있습니다.",
    },
    scrollSection: {
      headlinePart1: "이것은 연애 가이드가 아닙니다.",
      headlinePart2: "이것은 왕실 칙령입니다.",
      text1Part1: "붐비는 침대와 빈 왕좌",
      text1Part2: "는 남자의 관심을 끌기 위한 경쟁을 끝내고 왕관을 되찾을 준비가 된 여성들을 위한 예언적 두루마리입니다.",
      text2: '에올레스는 접근이 권위로 오인되는 세상에서 "선택받았다"는 거짓 약속을 꿰뚫는 명확성과 시적인 불로 해체합니다. 붐비는 매트리스에서 빈 왕국에 이르기까지, 이 책은 강력한 여성들을 정서적 노예 상태로 유지하는 식욕 주도 역학을 폭로하고 왕좌 정렬로 돌아가는 길을 비춥니다.',
      features: [
        { title: '덫을 인식하라', description: '당신이 회전 중일 때와 통치 중일 때를 구별하십시오.' },
        { title: '거짓말을 해체하라', description: '케미스트리가 언약이 아닌 이유를 배우십시오.' },
        { title: '왕좌를 차지하라', description: '오디션을 멈추고 당신이 태어난 왕좌를 차지하십시오.' },
      ],
      cta: '미리보기 읽기',
    },
    witnesses: {
      label: '증인들',
      headlinePart1: '해방된 자들의 ',
      headlinePart2: '목소리',
      testimonials: [
        { quote: "이 책을 읽기 전까지는 제가 아직 피를 흘리고 있다는 것을 몰랐습니다. 혼란의 매트리스? 그것이 제 20대 전부였습니다. 이 메시지가 저를 깨웠습니다.", author: "익명의 초기 독자" },
        { quote: "붐비는 침대와 빈 왕좌는 거울이자 칼이며 왕관입니다. 그것은 저를 지적하는 데 그치지 않고 저를 일으켜 세웠습니다. 이것은 책이 아닙니다. 신성한 개입입니다.", author: "독자 리뷰" },
        { quote: "제 상황, 영적 유대, 정서적 혼란이 이렇게 큰 영적 불로 지적되는 것을 본 적이 없습니다. 저는 자유를 느낍니다. 저는 보여짐을 느낍니다. 저는 주권을 느낍니다.", author: "베타 독자" },
      ],
    },
    altar: {
      headlinePart1: '왕관은 판매용이 아닙니다.',
      headlinePart2: '하지만 얻을 수 있습니다.',
      textPart1: '회전에 지친 여성에게.',
      textPart2: '오디션을 끝낸 여성에게.',
      textPart3: '통치할 준비가 된 여성에게.',
      cta: '당신의 승천을 주문하세요',
      linkPublisher: '왕좌의 빛 출판사 방문',
      linkAuthor: '저자 만나기',
      sovereignty: '주권이 기다립니다',
    },
    purchase: {
      title: '왕관을 되찾으세요',
      subtitle: '왕실 칙령을 받을 방법을 선택하세요',
      digitalTitle: '디지털 에디션',
      digitalDesc: 'Throne Light Reader 앱에서 읽으세요. 안전하고, 아름답고, 영원히 당신의 것.',
      instantAccess: '즉시',
      physicalTitle: '실물 책',
      physicalDesc: '프리미엄 페이퍼백이 왕좌로 배달됩니다. 왕실 서재에 완벽합니다.',
      back: '옵션으로 돌아가기',
      readerTitle: 'Throne Light Reader',
      readerDesc: '구매에는 안전한 Throne Light Reader 앱에 대한 평생 액세스가 포함됩니다:',
      feature1: '아름다운 다크 및 라이트 읽기 모드',
      feature2: '장치에서 오프라인 액세스',
      feature3: '동기화된 진행률 및 북마크',
      feature4: '독점 보너스 콘텐츠',
      buyDigital: '디지털 구매 — $29.99',
      amazon: '아마존에서 구매',
      amazonDesc: 'Prime 배송 가능',
      direct: '직접 구매',
      directDesc: '저자를 직접 지원',
      secure: '🔒 Stripe로 안전한 결제',
    },
    audio: {
      mute: '오디오 음소거',
      play: '배경 오디오 재생',
    },
    authorHero: {
      name: '에올레스의 빛',
      title: '예언적 비전가. 주권적 존재.',
      descriptionPart1: '사명으로 임명됨. 침묵 속에서 단련됨.',
      descriptionPart2: '통치할 준비가 된 여성들을 위한 목소리.',
      cta: '위로부터의 메시지',
    },
    publisherHero: {
      est: '2025년 설립',
      headlinePart1: "우리는 책을 배포하지 않습니다.",
      headlinePart2: "우리는 목적을 전달합니다.",
      subheadlineName: '왕좌의 빛 출판사',
      subheadlineText1: '목소리를 단순히 인쇄하는 것이 아니라 왕좌에 앉히기 위해 존재합니다.',
      subheadlineText2: '계시를 통한 왕족의 각성.',
      cta: '빛으로 들어가기',
    },
    dispatch: {
      label: '기원',
      headline: '하늘의 지시',
      text1Part1: '에올레스의 빛은 침묵의 불 속에서 단련된 주권적인 목소리입니다. 그녀는 대담한 여성들의 조상적 포효와 신성한 다운로드의 신성한 침묵을 지니고 있습니다. 알고리즘이 아닌 사명에 의해 임명된 영혼.',
      text1Part2: '',
      text1Part3: '',
      text2: '그녀의 이름은 "빛"을 의미하지만, 그녀의 작업은 천둥입니다: 시적이고 예언적이며 사과 없이 왕좌를 향합니다.',
      text3Part1: '그녀는 오락을 위해서가 아니라 ',
      text3Part2: '즉위',
      text3Part3: '를 위해 글을 씁니다. 그녀의 데뷔작, 붐비는 침대와 빈 왕좌는 단순한 책이 아니라 영적 각성입니다.',
      text4: '경전의 억양과 저항의 펀치로, 에올레스는 "선택받았다"는 위조품을 폭로하고 여성들을 욕망이 아닌 운명과 일치하도록 부릅니다.',
      quotePart1: '이것은 저자 페이지가 아닙니다.',
      quotePart2: '이것은 신성한 파송입니다.',
      mission: '글을 쓰든, 연설하든, 왕국 예술을 창조하든, 에올레스는 명성을 쫓는 것이 아니라 유산을 건설하고 있습니다. 회전되거나, 숨겨지거나, 침묵당하기를 거부하는 점점 커지는 여성 운동 뒤의 심장 박동.',
    },
    frequency: {
      label: '주권의 사운드트랙',
      headline: '주파수',
      description: '왕좌로 가는 여정에는 주파수가 있습니다. 당신의 신성한 권리의 소리에 조율하십시오.',
      tracks: [
        { title: '왕좌의 방', duration: '4:32' },
        { title: '대관식', duration: '3:45' },
        { title: '주권적 땅', duration: '5:12' },
      ],
      comingSoon: '스트리밍 플랫폼 곧 출시',
    },
    gathering: {
      label: '모임',
      headlinePart1: '우리는 투어하지 않습니다.',
      headlinePart2: '우리는 모입니다.',
      description: '왕좌의 빛 이벤트는 콘서트나 컨퍼런스가 아닙니다. 소집입니다. 우리가 움직일 때, 우리는 목적을 가지고 움직입니다.',
      waitlistTitle: '대기자 명단 가입',
      waitlistDesc: '다음에는 어디로 왕좌의 방을 가져가야 할까요?',
      cityPlaceholder: '도시 선택...',
      emailPlaceholder: '이메일 주소',
      notifyButton: '알림 받기',
      requestTitle: '도시 요청',
      requestDesc: '당신의 도시가 보이지 않나요? 우리를 소환하십시오.',
      requestButton: '도시 요청',
      cityRequestPlaceholder: '도시',
      stateRequestPlaceholder: '주 / 국가',
      cancelButton: '취소',
      submitButton: '요청 제출',
      successMessage: '✨ 요청이 제출되었습니다! 더 많은 찬성표를 모으기 위해 소문을 퍼뜨리십시오.',
      modalTitle: '알림 받기',
      modalDesc: '우리가 모일 때 가장 먼저 알게 됩니다',
      closeButton: '닫기',
      upcomingStatus: '곧 출시',
      requestedCitiesTitle: '요청된 도시',
      requestedCitiesDesc: 'EOLLES가 이 도시를 방문하기를 원하시면 👍를 클릭하세요.',
      pendingStatus: '충분한 찬성표 대기 중',
    },
    remnant: {
      headlinePart1: '가입 ',
      headlinePart2: '왕좌의 방',
      description: '이 창조의 목표는 판매가 아니라 소환입니다. 이메일을 입력하여 당신이 갇혀 있던 덫에서 당신을 해방시키고 당신이 차지하기 위해 태어난 왕좌로 당신을 부르는 계시를 받으십시오.',
      emailPlaceholder: '최고의 이메일 주소...',
      button: '문으로 들어가기',
      privacy: '당신의 여정은 신성합니다. 우리는 가격에 상관없이 당신의 정보를 절대 판매하지 않습니다.',
      successTitle: '통치에 오신 것을 환영합니다',
      successDesc: '인정을 위해 받은 편지함을 확인하십시오.',
      footerText: '왕좌의 방이 기다립니다',
    },
    mandate: {
      label: '사명',
      headlinePart1: '우리는 선반을 채우기 위해 여기 있는 것이 아닙니다.',
      headlinePart2: '우리는 단어의 형태로 제단을 쌓기 위해 여기 있습니다.',
      description: '우리가 출판하는 모든 제목은 왕좌를 섬기고, 빛을 나르고, 분위기를 바꿔야 합니다. 소음의 세상에서 우리는 천둥을 출판합니다. 우리는 조상적 포효와 신성한 침묵을 지닌 목소리를 찾습니다.',
      sealTitle: '왕좌의 빛 출판사',
      sealSubtitle: '모든 단어에 주권',
      pillars: [
        { title: '즉위', description: '우리는 신성한 권위를 지닌 목소리를 높입니다.' },
        { title: '조명', description: '우리는 계시와 명확성을 가져오는 단어를 출판합니다.' },
        { title: '변형', description: '우리는 분위기를 바꾸는 두루마리를 발표합니다.' },
      ],
    },
    archive: {
      label: '현재 출시',
      headline: '아카이브',
      catalog: [
        { title: '붐비는 침대와 빈 왕좌', author: '에올레스의 빛', description: '왕관을 되찾을 준비가 된 여성들을 위한 예언적 두루마리.', status: '지금 사용 가능', viewBook: '책 보기' },
      ],
      comingSoon: '더 많은 두루마리 곧 출시',
    },
    gate: {
      label: '제출',
      headline: '문',
      status: '제단은 현재 가득 찼습니다.',
      description: '우리는 현재 원고 제출을 받지 않습니다. 우리는 현재 집 안에 이미 있는 목소리를 관리하는 데 집중하고 있습니다.',
      notice: '문의를 보내지 마십시오.',
    },
    ledger: {
      label: '문의',
      headline: '원장',
      inquiries: '미디어, 권리 및 파트너십 문의:',
      links: { book: '책', author: '저자', amazon: 'Amazon에서 주문' },
      copyright: '왕좌의 빛 출판사. 판권 소유.',
      slogan: '모든 단어에 주권.',
    },
    footer: {
      taglinePart1: "우리는 책을 배포하지 않습니다.",
      taglinePart2: "우리는 빛을 배포합니다.",
      constellation: "별자리",
      connect: "연결",
      rights: "왕좌의 빛 출판사. 판권 소유.",
      slogan: "모든 단어에 주권이 있습니다.",
    },
  },
  yo: {
    nav: {
      choosePath: 'Yan Ọna Rẹ',
      constellation: 'Àwọn Ìràwọ̀',
      book: 'Ibùsùn Tí Ó Kún & Ìtẹ́ Tí Ó Òfo',
      author: 'EOLLES',
      publisher: 'Ile-iṣẹ Atẹjade Imọlẹ Ìtẹ́',
      taglineBook: 'Iwe Naa',
      taglineAuthor: 'Onkọwe Naa',
      taglinePublisher: 'Oludasile Naa',
    },
    hero: {
      headlinePart1: 'Ibùsùn Kún.',
      headlinePart2: 'Ṣùgbọ́n Ìtẹ́ Wà Lásán.',
      subheadlinePart1: 'Dáwọ́ dúró fún ọkùnrin tí ó n fún ọ ní àyíká nìkan.',
      subheadlinePart2: 'Àkókò rẹ láti jọba ni.',
      cta: 'Gba Adé Rẹ',
      scroll: 'Yi lọ',
    },
    mirror: {
      label: 'Ìdẹkùn Yípo',
      text1Part1: "O ti n funni ni ",
      text1Part2: "ifọkansin ipele-itẹ",
      text1Part3: " fun ọkùnrin ti o n ṣiṣẹ lori iwulo ipele-ibusun. O ti da agbara majẹmu sinu asopọ lasan, ni ireti pe ti o ba kan nifẹ sii, ṣiṣẹ dara julọ, tabi duro pẹ, yoo rii iye rẹ nikẹhin.",
      text2Part1: "Ṣugbọn eyi ni otitọ asọtẹlẹ: ",
      text2Part2: "Awọn ọkunrin jẹ oluṣootọ si iran, kii ṣe igbiyanju.",
      text2Part3: " Ti o ko ba si ninu iran rẹ, wiwa rẹ jẹ aṣayan. Ara rẹ di iraye si, ṣugbọn itẹ rẹ wa ni ofo.",
      quote: "A yàn ọ fún ìfẹ́kúfẹ̀ẹ́, a kò dé ọ ládé fún èrò.",
    },
    confrontation: {
      questionPart1: "Ṣe o gbagbe rẹ nigbati",
      questionPart2: "o ko si niwaju rẹ?",
      text1Part1: 'Kii ṣe "ṣe o dahun ifiranṣẹ." Ṣe o ',
      text1Part2: "ranti rẹ",
      text1Part3: " nigbati o ko si ni ara? Nitori awọn ayaba ko nilo lati leti awọn ọba ti aye wọn.",
      text2Part1: "Ti o ba n ṣafihan ararẹ nigbagbogbo si akiyesi rẹ, o ko si lori itẹ rẹ. ",
      text2Part2: "O wa lori atokọ rẹ.",
    },
    scrollSection: {
      headlinePart1: "Eyi Kii Ṣe Itọsọna Ibaṣepọ.",
      headlinePart2: "O jẹ Aṣẹ Ọba.",
      text1Part1: "Ibùsùn Tí Ó Kún & Ìtẹ́ Tí Ó Òfo",
      text1Part2: " jẹ iwe-kika asọtẹlẹ fun awọn obinrin ti o ti pari idije fun akiyesi ọkunrin kan ati pe o ṣetan lati gba ade wọn pada.",
      text2: 'Pẹlu asọye ti o han gbangba ati ina ewi, EOLLES tu ileri eke ti "yiyan" ka ni agbaye nibiti iraye si ti ṣe aṣiṣe fun aṣẹ. Lati awọn matiresi ti o kun si awọn ijọba ti o ṣofo, iwe yii ṣafihan awọn agbara ti a nṣakoso nipasẹ ifẹkufẹ ti o tọju awọn obinrin alagbara ni oko ẹrú ti ẹdun ati tan imọlẹ ọna pada si isọdọkan ipele-itẹ.',
      features: [
        { title: 'Da Ìdẹkùn Mọ', description: 'Ṣe iyatọ laarin igba ti o wa ni yiyi vs. nigba ti o wa ni ijọba.' },
        { title: 'Tu Irọ Naa Ka', description: 'Kọ ẹkọ idi ti kemistri kii ṣe majẹmu.' },
        { title: 'Gba Itẹ Naa', description: 'Duro idanwo ki o bẹrẹ gbigba itẹ ti a bi ọ fun.' },
      ],
      cta: 'Ka Awotẹlẹ',
    },
    witnesses: {
      label: 'Awọn Ẹlẹri',
      headlinePart1: 'Awọn ohun ti ',
      headlinePart2: 'Awọn ti a gbala',
      testimonials: [
        { quote: "Emi ko mọ pe mo tun n ẹjẹ titi mo fi ka iwe yii. Matiresi ti idamu? Iyẹn ni gbogbo awọn ọdun 20 mi. Ifiranṣẹ yii ji mi dide.", author: "Oluka Tete Ailorukọ" },
        { quote: "Ibùsùn Tí Ó Kún & Ìtẹ́ Tí Ó Òfo jẹ digi, idà, ati ade ni ẹẹkan. Kii ṣe pe o pe mi jade nikan; o pe mi SOKE. Eyi kii ṣe iwe. O jẹ idasi atọrunwa.", author: "Atunwo Oluka" },
        { quote: "Emi ko rii awọn ipo mi, awọn asopọ ẹmi, ati idamu ẹdun ti a pe jade pẹlu ina ẹmi pupọ yii. Mo ni ominira. Mo lero pe a ri mi. Mo lero ọba-ara.", author: "Oluka Beta" },
      ],
    },
    altar: {
      headlinePart1: 'Ade Kii Ṣe Fun Tita.',
      headlinePart2: 'Ṣugbọn O Wa.',
      textPart1: 'Si obinrin ti o rẹwẹsi yiyi.',
      textPart2: 'Si obinrin ti o ti pari idanwo.',
      textPart3: 'Si obinrin ti o ṣetan lati jọba.',
      cta: 'Paṣẹ Igbega Rẹ',
      linkPublisher: 'Ṣabẹwo Ile-iṣẹ Atẹjade Imọlẹ Ìtẹ́',
      linkAuthor: 'Pade Onkọwe',
      sovereignty: 'Ọba-ara Nduro',
    },
    purchase: {
      title: 'Gba Ade Rẹ Pada',
      subtitle: 'Yan bii o ṣe fẹ gba aṣẹ ọba rẹ',
      digitalTitle: 'Ẹ̀dà Dijitali',
      digitalDesc: 'Ka lori app Throne Light Reader. Ailewu, ẹwa, tirẹ lailai.',
      instantAccess: 'Lẹsẹkẹsẹ',
      physicalTitle: 'Iwe Ti ara',
      physicalDesc: 'Iwe asọ premium ti a fi ranṣẹ si itẹ rẹ. Pipe fun ile-ikawe ọba rẹ.',
      back: 'Pada si awọn aṣayan',
      readerTitle: 'Throne Light Reader',
      readerDesc: 'Rira rẹ pẹlu iwọle ayeraye si app Throne Light Reader ti o ni aabo pẹlu:',
      feature1: 'Awọn ipo kika dudu ati funfun ti o dara',
      feature2: 'Iwọle laisi intanẹẹti lori ẹrọ rẹ',
      feature3: 'Ilọsiwaju ati awọn ami-iwe ti o ṣọkan',
      feature4: 'Akoonu bonus pataki',
      buyDigital: 'Ra Dijitali — $29.99',
      amazon: 'Ra lori Amazon',
      amazonDesc: 'Fifiranṣẹ Prime wa',
      direct: 'Ra Taara',
      directDesc: 'Ṣe atilẹyin onkọwe taara',
      secure: '🔒 Sisanwo ailewu pẹlu Stripe',
    },
    audio: {
      mute: 'Pa ohun',
      play: 'Mu ohun ṣiṣẹ',
    },
    authorHero: {
      name: 'EOLLES',
      title: 'Iranran Asọtẹlẹ. Ẹda Ọba.',
      descriptionPart1: 'A yan nipasẹ iṣẹ-ṣiṣe. A ṣe e ninu idakẹjẹ.',
      descriptionPart2: 'Ohùn fun awọn obinrin ti o ti ṣetan lati jọba.',
      cta: 'Ifiranṣẹ Lati Oke',
    },
    publisherHero: {
      est: 'Est. 2025',
      headlinePart1: "A Kii Pin Awọn Iwe.",
      headlinePart2: "A Nfi Idi Ranṣẹ.",
      subheadlineName: 'Ile-iṣẹ Atẹjade Imọlẹ Ìtẹ́',
      subheadlineText1: 'Wa lati gbe awọn ohun ga, kii ṣe lati tẹ wọn nikan.',
      subheadlineText2: 'Ji ọba-ara dide nipasẹ ifihan.',
      cta: 'Wọle Si Imọlẹ',
    },
    dispatch: {
      label: 'Orisun',
      headline: 'Ilana Ọrun',
      text1Part1: 'EOLLES jẹ ohun ọba-ara ti a ṣe ninu ina ti idakẹjẹ. O gbe ariwo ti awọn obinrin onigboya ati idakẹjẹ mimọ ti awọn gbigba lati ọrun wá. Ọkan ti a yan kii ṣe nipasẹ awọn algoridimu, ṣugbọn nipasẹ iṣẹ-ṣiṣe.',
      text1Part2: '',
      text1Part3: '',
      text2: 'Orukọ rẹ tumọ si "imọlẹ," ṣugbọn iṣẹ rẹ jẹ ãrá: ewi, asọtẹlẹ, ati laisi aforiji ti a dè mọ itẹ.',
      text3Part1: 'O kọwe kii ṣe fun ere idaraya ṣugbọn fun ',
      text3Part2: 'gbigbe ga si itẹ',
      text3Part3: '. Iṣẹ akọkọ rẹ, Ibùsùn Tí Ó Kún & Ìtẹ́ Tí Ó Òfo, jẹ diẹ sii ju iwe kan lọ, o jẹ jiji ẹmi.',
      text4: 'Pẹlu ariwo ti iwe mimọ ati ikọlu ti ehonu, EOLLES ṣafihan ayederu ti jijẹ "yiyan" ati pe awọn obinrin sinu isọdọkan pẹlu ayanmọ, kii ṣe ifẹ.',
      quotePart1: 'Eyi kii ṣe oju-iwe onkọwe.',
      quotePart2: 'O jẹ ifiranṣẹ mimọ.',
      mission: 'Boya kikọ, sisọ, tabi ṣiṣẹda aworan ijọba, EOLLES kii ṣe lepa okiki; o n kọ ogún. Ọkàn lẹhin iṣipopada ti ndagba ti awọn obinrin ti o kọ lati yiyi, farapamọ, tabi dakẹ.',
    },
    frequency: {
      label: 'Orin ti Ọba-ara',
      headline: 'Igbohunsafẹfẹ',
      description: 'Irin-ajo si itẹ ni igbohunsafẹfẹ. Darapọ mọ ohun ti ẹtọ atọrunwa rẹ.',
      tracks: [
        { title: 'Yàrá Ìtẹ́', duration: '4:32' },
        { title: 'Ifisilẹ Ade', duration: '3:45' },
        { title: 'Ilẹ̀ Ọba', duration: '5:12' },
      ],
      comingSoon: 'Nbọ laipẹ si awọn iru ẹrọ ṣiṣanwọle',
    },
    gathering: {
      label: 'Apejọ',
      headlinePart1: 'A Ko Rin Irin-ajo.',
      headlinePart2: 'A Npéjọpọ.',
      description: 'Awọn iṣẹlẹ Imọlẹ Ìtẹ́ kii ṣe ere orin tabi apejọ. Wọn jẹ awọn apejọ mimọ. Nigba ti a ba gbe, a gbe pẹlu idi.',
      waitlistTitle: 'Darapọ mọ Atokọ Idaduro',
      waitlistDesc: 'Nibo ni o yẹ ki a mu yàrá ìtẹ́ lọ si atẹle?',
      cityPlaceholder: 'Yan ilu kan...',
      emailPlaceholder: 'Imeeli rẹ',
      notifyButton: 'Fi to Mi leti',
      requestTitle: 'Beere Ilu kan',
      requestDesc: 'Ko ri ilu rẹ? Pè wa.',
      requestButton: 'Beere Ilu',
      cityRequestPlaceholder: 'Ilu',
      stateRequestPlaceholder: 'Ipinle / Orilẹ-ede',
      cancelButton: 'Fagilee',
      submitButton: 'Fi Ibeere Silẹ',
      successMessage: '✨ Ibeere rẹ ti fi silẹ! Tan ọrọ naa lati kojọ awọn ibo diẹ sii.',
      modalTitle: 'Gba Ifitonileti',
      modalDesc: 'Jẹ ẹni akọkọ lati mọ nigba ti a ba pejọ ni',
      closeButton: 'Paade',
      upcomingStatus: 'Nbo Laipẹ',
      requestedCitiesTitle: 'Awọn Ilu Ti A Beere',
      requestedCitiesDesc: 'Tẹ 👍 ti o ba fẹ ki EOLLES ṣabẹwo si ilu yii.',
      pendingStatus: 'Ni isunmọtosi awọn ibo to peye',
    },
    remnant: {
      headlinePart1: 'Darapọ Mọ ',
      headlinePart2: 'Yàrá Ìtẹ́',
      description: 'Ero ti ẹda yii kii ṣe nipa tita, o jẹ nipa pipepe. Tẹ imeeli rẹ sii lati gba awọn ifihan ti o gba ọ laaye kuro ninu awọn ẹgẹ ti o ti mu ọ ninu ati pe ọ si itẹ ti a bi ọ lati gbe.',
      emailPlaceholder: 'Imeeli rẹ ti o dara julọ...',
      button: 'Wọle Si Awọn Ẹnu-bode',
      privacy: 'Irin-ajo rẹ jẹ mimọ. A ko ta alaye rẹ rara, laibikita idiyele naa.',
      successTitle: 'Kaabo si Ijọba',
      successDesc: 'Ṣayẹwo apo-iwọle rẹ fun Idanimọ naa.',
      footerText: 'Yàrá Ìtẹ́ Nduro',
    },
    mandate: {
      label: 'Iṣẹ-ṣiṣe',
      headlinePart1: 'A ko si nibi lati kun awọn selifu.',
      headlinePart2: 'A wa nibi lati kọ awọn pẹpẹ ni irisi awọn ọrọ.',
      description: 'Gbogbo akọle ti a tẹjade gbọdọ sin itẹ, gbe imọlẹ, ati yi awọn oju-aye pada. Ninu agbaye ti ariwo, a tẹ ãrá. A n wa awọn ohun ti o gbe ariwo baba nla ati idakẹjẹ mimọ.',
      sealTitle: 'Ile-iṣẹ Atẹjade Imọlẹ Ìtẹ́',
      sealSubtitle: 'Ọba-ara ni Gbogbo Ọrọ',
      pillars: [
        { title: 'Gbe Ga', description: 'A gbe awọn ohun ti o gbe aṣẹ atọrunwa ga.' },
        { title: 'Tan Imọlẹ', description: 'A tẹjade awọn ọrọ ti o mu ifihan ati mimọ wa.' },
        { title: 'Yipada', description: 'A tu awọn iwe-kika ti o yi oju-aye pada.' },
      ],
    },
    archive: {
      label: 'Awọn idasilẹ lọwọlọwọ',
      headline: 'Ile-ipamọ',
      catalog: [
        { title: 'Ibùsùn Tí Ó Kún & Ìtẹ́ Tí Ó Òfo', author: 'EOLLES', description: 'Iwe-kika asọtẹlẹ fun awọn obinrin ti o ṣetan lati gba ade wọn pada.', status: 'Wa Bayi', viewBook: 'Wo Iwe' },
      ],
      comingSoon: 'Awọn iwe-kika diẹ sii Nbọ Laipẹ',
    },
    gate: {
      label: 'Awọn ifisilẹ',
      headline: 'Ẹnu-bode',
      status: 'Pẹpẹ ti Kun lọwọlọwọ.',
      description: 'A ko gba awọn ifisilẹ iwe afọwọkọ ni akoko yii. A wa ni idojukọ lọwọlọwọ lori ṣiṣakoso awọn ohun ti o wa tẹlẹ ninu ile naa.',
      notice: 'Jọwọ maṣe fi awọn ibeere ranṣẹ.',
    },
    ledger: {
      label: 'Awọn ibeere',
      headline: 'Iwe-akọọlẹ',
      inquiries: 'Fun media, awọn ẹtọ, ati awọn ibeere ajọṣepọ:',
      links: { book: 'Iwe Naa', author: 'Onkọwe Naa', amazon: 'Paṣẹ lori Amazon' },
      copyright: 'Ile-iṣẹ Atẹjade Imọlẹ Ìtẹ́. Gbogbo ẹtọ wa ni ipamọ.',
      slogan: 'Ọba-ara ninu gbogbo ọrọ.',
    },
    footer: {
      taglinePart1: "A kii pin awọn iwe.",
      taglinePart2: "A pin imọlẹ.",
      constellation: "Àwọn Ìràwọ̀",
      connect: "Sopọ",
      rights: "Ile-iṣẹ Atẹjade Imọlẹ Ìtẹ́. Gbogbo ẹtọ wa ni ipamọ.",
      slogan: "Ọba-ara ninu gbogbo ọrọ.",
    },
  },
};

export const getDictionary = (lang: Language) => dictionaries[lang];
