/* Cosmos Movie Night · the list of nights. movie-night.html reads this file.
   The page features the next night whose date has not passed, and lists every earlier one under
   "Past movie nights" automatically. To add a night, copy the block below, bump "no", set the date and
   the hints, drop its art into assets/movie-night/, and that is it. Newest can go anywhere in the list.

   Fields
     no       number of the night (shows as "NO.1" in the title)
     date     YYYY-MM-DD, local. The night stays featured through that whole day.
     doors / film   times as they should print
     rating   MPAA rating, shown as "title revealed at the door · PG-13"
     tag      the genre line, e.g. "a Halloween classic"
     hints    three short hints, shown highlighted in the clue sentence
     prize    what the first right DM wins
     rsvp     the Mindbody link behind Save Your Seat and the flyer's QR code
     art      the collage image (transparent WebP) for the hero and the past-nights card
     flyer    the full flyer image, linked from the card
     title    the film's name. Leave it "" until the night has happened: this file is public on GitHub
              and the MPLC license keeps the title out of public view before the screening. The morning
              after, fill in the title and set reveal:true and the past-night card shows it (Clay's
              call, 2026-10-17). While reveal is false the card says "revealed at the door".
     recap    one or two sentences after the night (optional)
*/
window.MOVIE_NIGHTS = [
  {
    no: 1,
    date: "2026-10-24",
    doors: "7:00",
    film: "7:30",
    rating: "PG-13",
    tag: "a Halloween classic",
    hints: ["two sisters", "an old house by the sea", "a family curse"],
    prize: "a free popcorn + candy + drink combo at the door",
    rsvp: "https://clients.mindbodyonline.com/classic/ws?studioid=5755552&stype=41&sTG=35",
    art: "assets/movie-night/no1-collage.webp",
    flyer: "assets/movie-night/no1-flyer.webp",
    credit: "House photo: Jimmy_Joe, Flickr, CC BY. Other photos public domain and CC0 via Openverse.",
    title: "",
    reveal: false,
    recap: ""
  }
];
