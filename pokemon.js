var pokemon = [];
let filteredPokemon = [];
let selectedTypes = new Set();

const numPerPage = 10;
var numPages = 0;
const numPageBtn = 5;

const setup = async () => {
  // test out pokeapi using axios here
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset0&limit=1281');
  console.log(response.data.results);
  
  pokemon = response.data.results.map((monster) => {
    return {
      ...monster,
      types: [], // add an empty types array for now
    };
  });

  await Promise.all(
    pokemon.map(async (monster) => {
      const res = await axios.get(monster.url);
      monster.types = res.data.types.map((type) => type.type.name);
    })
  );

  filteredPokemon = pokemon.filter((monster) => {
    if (selectedTypes.size === 0) return true;
    let hasAllSelectedTypes = true;
    for (let type of selectedTypes) {
      if (!monster.types.includes(type)) {
        hasAllSelectedTypes = false;
        break;
      }
    }
    return hasAllSelectedTypes;
  });
  console.log(filteredPokemon);
  numPages = Math.ceil(pokemon.length / numPerPage);
  console.log(numPages);

  showPage(1);

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    console.log(this);
    const pokemonName = $(this).attr('pokeName');
    console.log(pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    console.log(res.data);
    const types = res.data.types.map((type) => type.type.name);
    console.log(types);
    $('.modal-body').html(`
      <div style="width: 200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${pokemonName}">
        <div>
          <h3>Abilities</h3>
          <ul> ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}</ul>
        </div>
        <div>
          <h3>Stats</h3>
          <ul> ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}</ul>
        </div>
      </div>
      <h3>Types</h3>
      <ul> ${types.map((type) => `<li>${type}</li>`).join('')}</ul>
    `);
    $('.modal-title').html(`<h2>${res.data.name}</h2>`);
  });

  $('body').on('click', '.pageBtn', function (e) {
    const pageNum = parseInt($(this).attr('pageNum'));
    console.log(pageNum);
    showPage(pageNum);
  });

  const types = await axios.get('https://pokeapi.co/api/v2/type');

  types.forEach((type) => {
    $("#typeFilters").append(`
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${type}" id="${type}">
        <label class="form-check-label" for="${type}">
          ${type}
        </label>
      </div>
    `);
  });

  $("body").on("change", ".form-check-input", async function (e) {
    const type = e.target.value;
    console.log(type);
    if (e.target.checked) {
      selectedTypes.add(type);
    } else {
      selectedTypes.delete(type);
    }
    console.log(selectedTypes);

    filteredPokemon = pokemon.filter((monster) => {
    if (selectedTypes.size === 0) return true;
    let hasAllSelectedTypes = true;
    for (let type of selectedTypes) {
      if (!monster.types.includes(type)) {
        hasAllSelectedTypes = false;
        break;
      }
    }
    return hasAllSelectedTypes;
  });
  console.log(filteredPokemon);

    showPage(1);
  });

  console.log('setup finished');

  async function showPage(currentPage) {
    if (currentPage < 1) {
      currentPage = 1;
    }
    if (currentPage > numPages) {
      currentPage = numPages;
    }

  console.log(currentPage);
  console.log((currentPage - 1) * numPerPage);
  console.log(((currentPage - 1) * numPerPage) + numPerPage);
  console.log(filteredPokemon.length);

  $("#countText").empty();
  $("#countText").text(`Showing ${(currentPage - 1) * numPerPage + 1} to ${numPerPage * currentPage} of ${filteredPokemon.length} Pokémon`);

  $('#pokemon').empty();
  for (let i = (currentPage - 1) * numPerPage; i < ((currentPage - 1) * numPerPage) + numPerPage && i < filteredPokemon.length; i++) {
    console.log(i);
  // for (let i = 0; i < pokemon.length; i++) {
    let innerResponse = await axios.get(`${filteredPokemon[i].url}`);
    let thisPokemon = innerResponse.data;
    $('#pokemon').append(`
    <div class="pokeCard card" pokeName="${thisPokemon.name}">
      <h3>${thisPokemon.name}</h3>
      <img src="${thisPokemon.sprites.front_default}" alt = "${thisPokemon.name}">
      <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#pokeModal">More</button>
    </div>
    `);
  }

  // add pagination buttons
  $('#pagination').empty();
  var startI = Math.max(1, currentPage - Math.floor(numPageBtn / 2));
  var endI = Math.min(numPages, currentPage + Math.floor(numPageBtn / 2));
  console.log(startI, endI);
  console.log(numPages);
  console.log(currentPage);
  console.log(numPageBtn);

  if (currentPage > 1) {
    $('#pagination').append(`
    <button type="button" class="btn btn-primary pageBtn" id="pageprev" pageNum="${currentPage - 1}">Previous</button>
    `);
    $('#pagination').append(`
    <button type="button" class="btn btn-primary pageBtn" id="pagefirst" pageNum="1">First</button>
    `);
  }

  for (let i = startI; i <= endI; i++) {
    var active = '';
    if (i == currentPage) {
      active = 'active';
    }
    $('#pagination').append(`
    <button type="button" class="btn btn-primary pageBtn ${active}" id="page${i}" pageNum="${i}">${i}</button>
    `);
  }

  if (currentPage < numPages) {
    $('#pagination').append(`
    <button type="button" class="btn btn-primary pageBtn" id="pagelast" pageNum="${numPages}">Last</button>
    `);
    $('#pagination').append(`
    <button type="button" class="btn btn-primary pageBtn" id="pagenext" pageNum="${currentPage + 1}">Next</button>
    `);
  }
}
};



$(document).ready(setup);
