import { Movie, Actor, Cast, Award } from "../shared/types";

export const movies: Movie[] = [
  {
    movie_id: 1,
    title: "Echoes of Tomorrow",
    release_date: "2024-04-15",
    overview:
      "A scientist discovers how to send messages through time, but each message creates ripples that alter the future in unpredictable ways."
  },
  {
    movie_id: 2,
    title: "The Last Horizon",
    release_date: "2023-10-02",
    overview:
      "An astronaut stranded on a dying space station must team up with a rogue AI to survive and return to Earth."
  },
  {
    movie_id: 3,
    title: "Crimson Divide",
    release_date: "2022-11-20",
    overview:
      "A war journalist uncovers a conspiracy that blurs the line between truth and propaganda in a conflict-torn nation."
  }
];

export const actors: Actor[] = [
  {
    actor_id: 4,
    name: "Liam Cross",
    bio: "Award-winning British actor known for intense and dramatic roles.",
    date_of_birth: "1982-05-09"
  },
  {
    actor_id: 5,
    name: "Sofia Hale",
    bio: "Renowned actress celebrated for her versatility and emotional range.",
    date_of_birth: "1991-08-15"
  },
  {
    actor_id: 6,
    name: "Ethan Park",
    bio: "South Korean actor acclaimed for his performances in action thrillers.",
    date_of_birth: "1987-02-22"
  },
  {
    actor_id: 7,
    name: "Amara Singh",
    bio: "Emerging star known for her powerful portrayals in independent films.",
    date_of_birth: "1996-06-30"
  }
];

export const cast: Cast[] = [
  {
    movie_id: 1,
    actor_id: 4,
    role_name: "Dr. Nathan Cole",
    role_description: "A physicist haunted by his past as he manipulates time itself."
  },
  {
    movie_id: 1,
    actor_id: 5,
    role_name: "Elena Rivers",
    role_description: "A journalist determined to expose the scientist's secret experiments."
  },
  {
    movie_id: 1,
    actor_id: 6,
    role_name: "Agent Silva",
    role_description: "A government agent tracking illegal time technology."
  },

  {
    movie_id: 2,
    actor_id: 4,
    role_name: "Commander Lee Min",
    role_description: "An astronaut trapped aboard a decaying orbital station."
  },
  {
    movie_id: 2,
    actor_id: 6,
    role_name: "Nova",
    role_description: "A sentient AI that questions its own morality."
  },
  {
    movie_id: 2,
    actor_id: 7,
    role_name: "Dr. Marcus Vale",
    role_description: "Mission director torn between rescue and sacrifice."
  },

  {
    movie_id: 3,
    actor_id: 4,
    role_name: "Clara Voss",
    role_description: "A war correspondent uncovering truths hidden in plain sight."
  },
  {
    movie_id: 3,
    actor_id: 7,
    role_name: "Captain Ryker",
    role_description: "A disillusioned soldier caught between loyalty and truth."
  },
  {
    movie_id: 3,
    actor_id: 5,
    role_name: "Lina Ortiz",
    role_description: "A hacker leaking classified information to expose corruption."
  }
];

export const awards: Award[] = [
  {
    award_id: 1,
    body: "Academy Awards",
    category: "Best Picture",
    year: 2024
  },
  {
    award_id: 4,
    body: "BAFTA",
    category: "Best Director",
    year: 2024
  },
  {
    award_id: 5,
    body: "Golden Globes",
    category: "Best Actress",
    year: 2024
  },
  {
    award_id: 2,
    body: "Cannes Film Festival",
    category: "Best Screenplay",
    year: 2023
  },
  {
    award_id: 3,
    body: "Sundance",
    category: "Audience Choice Award",
    year: 2023
  },
  {
    award_id: 1,
    body: "Critics Choice",
    category: "Best Cinematography",
    year: 2024
  },
  {
    award_id: 7,
    body: "Independent Spirit Awards",
    category: "Best Supporting Actor",
    year: 2023
  },
  {
    award_id: 1,
    body: "Saturn Awards",
    category: "Best Sci-Fi Feature",
    year: 2024
  }
];
