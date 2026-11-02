/* Cosmos Movie Night · everything you read on movie-night.html lives here, in one place.
   Change the words below, save, commit and push (or hand the change to Claude) and the page follows.

   Two parts:
     copy    the words that stay the same from night to night (the poster lines, the three cards,
             the "coming soon" state, the Past movie nights section)
     nights  one block per night: date, times, the riddle, the pictures, the RSVP link

   House rules: keep the quotes around every piece of text; "\n" inside a text starts a new line
   (a new paragraph in the cards). The film's title stays "" until the morning after: this file is
   public on GitHub and the MPLC license keeps the title out of public view before the screening.
   The page features the next night whose date has not passed and lists every earlier one under
   Past movie nights by itself; when nothing is coming up it shows the "soon" words instead. */
window.MOVIE_NIGHT = {

  copy: {
    presents: "presents",
    title: "Mystery\nMovie Night",            // the big Poiret One title; "\n" = line break
    number: "No. {n}",                         // {n} becomes the night's number
    revealed: "Title revealed at the door",
    terms: "Free · $10 suggested donation",    // shown after the rating on the "revealed" line
    address: "Cosmos Yoga · 1306 S Willow St · Chattanooga",
    seating: "BYO picnic-style seating · blankets, cushions, low chairs · snack bar",
    gameLabel: "This week's movie",            // heads the hints sentence on a night that has hints but no riddle
    gameAsk: "Think you know the mystery movie's title? DM us your guess on IG",
    handle: "@cosmosyogachattanooga",          // the Instagram handle, linked wherever it appears
    prizeLead: "First right answer wins",      // followed by the night's prize
    seat: "Save your seat",                    // the button (opens the night's Mindbody link)
    spots: "Up to 40 spots available",

    // when no night is on the calendar
    soon: {
      line: "the next one is in the works",
      marquee: "NEXT DATE · COMING SOON",
      spots: "free · BYO seating · snack bar",
      seat: "Follow for the date"             // the button then opens Instagram
    },

    // the three cards under the poster. "\n" = new paragraph; {seat} = a "save your seat" link
    // to the night's Mindbody page (seatText is its wording); {ig} = the Instagram handle, linked
    how: [
      { heading: "It's free",
        text: "Movie night is free. If you'd like to chip in, a donation helps make these nights possible. We'll also have popcorn, candy and drinks for sale at the door." },
      { heading: "Picnic-style seating",
        text: "Blankets, cushions, floor chairs, low camp chairs: bring what makes you comfortable.\nSpace is limited to 40, so {seat} and we'll know to expect you.",
        seatText: "save your seat" },
      { heading: "Guess the movie",
        text: "Check out the poster, then DM your guess to {ig}. The first right answer wins a free Cosmos Combo (popcorn/candy/drink).\nWe only confirm guesses in DMs, so no spoilers in the comments, please." }
    ],

    // past nights
    pastEyebrow: "Past movie nights",
    pastHeading: "Previous Movie Night Titles & Posters",
    cardRevealed: "Title revealed at the door.",
    cardFlyer: "See the poster"
  },

  /* One block per night. Fields:
       no       the night's number
       date     YYYY-MM-DD; the night stays featured through that whole day
       doors / film   times as they should print
       rating   MPAA rating, shown as "Title revealed at the door · PG-13 · Free · …"
       riddle   the hint, one line per "\n" (shown in gold italics on the poster and on the past card)
       tag      a few words for the past card's heading (and, with hints, for a night without a riddle)
       hints    three short hints, used only when there is no riddle: "is <tag>, featuring a… b… and c."
       prize    what the first right DM wins
       rsvp     the Mindbody link behind Save your seat
       hero     the picture behind the poster on the page (leave "" for plain dark)
       art      the picture on the past-nights card
       alt      what that picture shows, for screen readers
       flyer    the printable poster, linked from the card
       credit   a line of small print under the poster (picture credits), or ""
       title    the film's name: "" until the morning after, then fill it in and set reveal: true
       recap    a sentence or two after the night (optional) */
  nights: [
    {
      no: 1,
      date: "2026-10-24",
      doors: "7:00",
      film: "7:30",
      rating: "PG-13",
      riddle: "",
      tag: "a Halloween classic",
      hints: ["two sisters", "an old house by the sea", "a family curse"],
      prize: "a free popcorn + candy + drink combo at the door",
      rsvp: "https://clients.mindbodyonline.com/classic/ws?studioid=5755552&stype=41&sTG=35",
      hero: "",
      art: "assets/movie-night/no1-collage.webp",
      alt: "Collage: an old house, two black umbrellas, a moon, rose petals, a broom, a toad and limes",
      flyer: "assets/movie-night/no1-flyer.webp",
      credit: "House photo: Jimmy_Joe, Flickr, CC BY. Other photos public domain and CC0 via Openverse.",
      title: "",
      reveal: false,
      recap: ""
    },
    {
      no: 2,
      date: "2026-11-06",
      doors: "7:00",
      film: "7:30",
      rating: "PG-13",
      riddle: "a week upon land\na day on the sea\nan hour in the air\ntickticktick for all three",
      tag: "a riddle in three parts",
      hints: ["a week upon land", "a day on the sea", "an hour in the air"],
      prize: "a free Cosmos Combo (popcorn, candy and a drink) at the door",
      rsvp: "https://clients.mindbodyonline.com/classic/ws?studioid=5755552&stype=-7&sTG=35&sView=day&sLoc=0&date=2026-11-06",
      hero: "assets/movie-night/no2-art.webp",
      art: "assets/movie-night/no2-scene.webp",
      alt: "Silhouettes at dusk: a long pier running out to sea with a queue of men along it, little ships on the horizon, a fighter plane banking low over the water",
      flyer: "assets/movie-night/no2-flyer.webp",
      credit: "",
      title: "",
      reveal: false,
      recap: ""
    }
  ]
};
