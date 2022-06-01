const searchParams = new URLSearchParams(window.location.search);
const api = 'https://api.punkapi.com/v2/beers';
const id = searchParams.get('name');
const url = `${api}/${id}`;
const mainElement = document.querySelector('main');
const infoList = document.getElementById('info-list');
const infoHeader = document.querySelector('h1');

const image = document.querySelector('img');


getData(url, render);

function getData(url, callback) {

    fetch(url)
        .then(res => res.json())
        .then(data => {

            callback(data);
        })
        .catch(error => console.log(error));
}

function render(data) {

    const beer = data[0];
    const name = beer.name;
    const hopsString = getIngredientsName(beer.ingredients.hops);
    const maltString = getIngredientsName(beer.ingredients.malt);
    const volumeString = printVolume(beer.volume);

    const ingredientsList = [`Yeast: ${beer.ingredients.yeast}`, `Malt: ${maltString}`, `Hops: ${hopsString}`];
    const ulTagIngredients = document.createElement('ul');

    ingredientsList.forEach((item, index) => {
        let newLi = document.createElement('li');
        newLi.textContent = item;
        ulTagIngredients.appendChild(newLi);
        });
        
    let keysArray = ["Beskrivning: ", "Alkoholhalt: ", "Volym: ", "Bryggarens tips: ", "Passar till mat: ", "Första bryggdatum: ", "Ingredienser: "];
    let valuesArray = [beer.description, beer.abv + "%", volumeString, beer.brewers_tips, beer.food_pairing, beer.first_brewed, ""];
    
    infoHeader.textContent = name;

    valuesArray.forEach((item, index) => {
    let newLi = document.createElement('li');
    newLi.textContent = keysArray[index] + item;
    infoList.appendChild(newLi);
    });

    infoList.lastChild.appendChild(ulTagIngredients);

    image.src = beer.image_url;
    image.alt = "Bild på en öl.";
}

function getIngredientsName(ingredients) {

    let stringOfNames = "";

    ingredients.forEach((item) => {
        stringOfNames += item.name + ", ";
    });

    return stringOfNames;
}

function printVolume(volume) {
    let volumeText = `${volume.value} ${volume.unit}`;
    return volumeText;
}
    