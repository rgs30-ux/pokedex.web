const pokemonList = document.getElementById('pokemonList');
const statusText = document.getElementById('status');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('modal');
const details = document.getElementById('pokemonDetails');

let offset = 0;
let showFavoritesOnly = false;

function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function toggleFavorite(name) {
  let favorites = getFavorites();
  if (favorites.includes(name)) {
    favorites = favorites.filter(f => f !== name);
  } else {
    favorites.push(name);
  }
  saveFavorites(favorites);
  loadPokemons();
}

async function loadPokemons() {
  statusText.textContent = 'Carregando...';
  pokemonList.innerHTML = '';

  try {
    if (showFavoritesOnly) {
      const favorites = getFavorites();
      if (!favorites.length) {
        statusText.textContent = 'Nenhum favorito salvo.';
        return;
      }

      for (const name of favorites) {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const data = await res.json();
        renderPokemonCard(data);
      }
    } else {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`);
      const data = await res.json();

      for (const pokemon of data.results) {
        const detailsRes = await fetch(pokemon.url);
        const pokemonData = await detailsRes.json();
        renderPokemonCard(pokemonData);
      }
    }

    statusText.textContent = '';
  } catch (error) {
    statusText.textContent = 'Erro ao carregar Pokémon.';
    console.error(error);
  }
}

function renderPokemonCard(pokemon) {
  const favorites = getFavorites();
  const card = document.createElement('div');
  card.className = 'pokemon-card';

  card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h3>${pokemon.name}</h3>
    <button>${favorites.includes(pokemon.name) ? '★' : '☆'}</button>
  `;

  card.querySelector('button').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(pokemon.name);
  });

  card.addEventListener('click', () => showDetails(pokemon));
  pokemonList.appendChild(card);
}

function showDetails(pokemon) {
  details.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h2>${pokemon.name}</h2>
    <p>ID: ${pokemon.id}</p>
    <p>Tipo: ${pokemon.types.map(t => t.type.name).join(', ')}</p>
    <p>Altura: ${pokemon.height}</p>
    <p>Peso: ${pokemon.weight}</p>
  `;
  modal.classList.remove('hidden');
}

document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');

document.getElementById('nextBtn').onclick = () => {
  offset += 20;
  loadPokemons();
};

document.getElementById('prevBtn').onclick = () => {
  if (offset >= 20) offset -= 20;
  loadPokemons();
};

document.getElementById('searchBtn').onclick = async () => {
  const name = searchInput.value.toLowerCase().trim();
  if (!name) return loadPokemons();

  try {
    statusText.textContent = 'Carregando...';
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) throw new Error();
    const data = await res.json();

    pokemonList.innerHTML = '';
    renderPokemonCard(data);
    statusText.textContent = '';
  } catch {
    pokemonList.innerHTML = '';
    statusText.textContent = 'Nenhum Pokémon encontrado.';
  }
};

document.getElementById('favoritesBtn').onclick = () => {
  showFavoritesOnly = !showFavoritesOnly;
  loadPokemons();
};

loadPokemons();