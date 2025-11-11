import {Movie, Actor, Cast, Award} from '../shared/types'

export const movies: Movie[] = [
  {
    movie_id: 1,
    title: "Rebel Moon - Part One: A Child of Fire",
    release_date: "2023-12-15",
    overview: "When a peaceful colony on the edge of the galaxy finds itself threatened by the armies of the tyrannical Regent Balisarius, they dispatch Kora, a young woman with a mysterious past, to seek out warriors from neighboring planets to help them take a stand."
  },
  {
    movie_id: 2,
    title: "Aquaman and the Lost Kingdom",
    release_date: "2023-12-20",
    overview: "Black Manta, still driven by the need to avenge his father's death and wielding the power of the mythic Black Trident, will stop at nothing to take Aquaman down once and for all."
  },
  {
    movie_id: 3,
    title: "The Hunger Games: The Ballad of Songbirds & Snakes",
    release_date: "2023-11-15",
    overview: "64 years before he becomes the tyrannical president of Panem, Coriolanus Snow sees a chance for a change in fortunes when he mentors Lucy Gray Baird, the female tribute from District 12."
  }
];

export const actors: Actor[] = [
  {
    actor_id: 4,
    name: "Joe Bloggs",
    bio: "Award-winning British actor known for action and sci-fi roles.",
    date_of_birth: "1985-03-12"
  },
  {
    actor_id: 5,
    name: "Alice Broggs",
    bio: "Acclaimed actress known for dramatic performances and character depth.",
    date_of_birth: "1990-07-24"
  },
  {
    actor_id: 6,
    name: "Joe Cloggs",
    bio: "Rising star in science fiction and thriller genres.",
    date_of_birth: "1995-01-05"
  }
];

export const cast: Cast[] = [
  {
    movie_id: 1,
    actor_id: 4,
    role_name: "Male Character 1",
    role_description: "description of character 1"
  },
  {
    movie_id: 2,
    actor_id: 5,
    role_name: "Female Character 1",
    role_description: "description of character 2"
  },
  {
    movie_id: 3,
    actor_id: 6,
    role_name: "Male Character 2",
    role_description: "description of character 3"
  },
  {
    movie_id: 1,
    actor_id: 5,
    role_name: "Male Character 2",
    role_description: "description of character 3"
  }
];

export const awards: Award[] = [
  {
    award_id: 1,
    body: "egg",
    category: "Best Picture",
    year: 2025
  },
  {
    award_id: 2,
    body: "bean",
    category: "Best Animated Picture",
    year: 2025
  },
  {
    award_id: 3,
    body: "bacon",
    category: "Best Soundtrack",
    year: 2025
  },
  {
    award_id: 4,
    body: "sausage",
    category: "Best Director",
    year: 2025
  },
  {
    award_id: 5,
    body: "sausage",
    category: "Best Actor",
    year: 2025
  },
  {
    award_id: 5,
    body: "carrot",
    category: "Best Food on Set",
    year: 2025
  }
];
