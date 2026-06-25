# PokeBattleHelper

A React SPA designed to help with Pokémon competitive gameplay. Search any Pokémon and instantly get type matchups, weaknesses, resistances, abilities, and evolution chain — all the data you need for battle preparation.

## Features

- 🔍 **Smart search** with autocomplete, Enter key support, and recent searches history
- 🛡️ **Type matchups** — weaknesses (x2, x4), resistances (x0.5, x0.25) and immunities
- ⚡ **Abilities** with descriptions in Spanish/English, including hidden abilities
- 🔄 **Evolution chain** with sprites for each stage
- ✨ **Shiny toggle** to switch between default and shiny artwork
- 💾 **localStorage cache** — searched Pokémon are cached for 7 days to avoid redundant API calls
- 🕐 **Search history** — last 20 searches persist across sessions
- ⚠️ **Loading and error states** with visual feedback

## Tech Stack

- React 19
- Vite
- PokéAPI (REST)
- CSS Modules
- localStorage

## Project Structure

src/

├── components/
│   ├── Navbar/          — search bar with autocomplete and history
│   ├── PokemonCard/     — left panel: sprite, stats, shiny toggle
│   ├── PokemonInfo/     — right panel: types, matchups, abilities, evolutions
│   ├── TypeBadge/       — reusable type pill component
│   └── AbilityModal/    — ability description modal
├── hooks/
│   ├── usePokemonList   — fetches full Pokémon list on mount
│   ├── useEfectividades — calculates type effectiveness
│   ├── useHabilidades   — fetches and manages ability data
│   └── useEvoluciones   — fetches evolution chain
└── constants/
└── tipos.js         — type icon URLs

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Purpose

Built as a frontend practice project to reinforce React concepts including custom hooks, component architecture, state management, and API integration.