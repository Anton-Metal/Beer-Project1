const searchUrl = 'https://api.punkapi.com/v2/beers';
const formElement = document.querySelector('form');
formElement.addEventListener('submit', search);
const forwardButton = document.createElement('button');
const backButton = document.createElement('button');
const pageDisplay = document.createElement('span');
const navElement = document.querySelector('nav');
let pageNumber = 1;
let cachePages = [];

let searchStr = "";
let searchStrHops = "";
let searchStrMalt = "";
let searchStrBrewedBefore = "";
let searchStrBrewedAfter = "";
let searchStrAbvMin = 0;
let searchStrAbvMax = 100;

function render(data) {//spännande upptäckt - behöver ha render här uppe annars måste search köras färdigt innan den kan använda den
    const ulTag = document.querySelector('ul');

    ulTag.innerText = "";
    ulTag.addEventListener('click', openBeerInfo);

    data.forEach((item) => {
        const liTag = document.createElement('li');
        liTag.textContent = item.name;
        liTag.setAttribute('name', item.id);
        ulTag.appendChild(liTag);
    });
    createNavButtons();

    if (pageNumber === 1) 
    {
        backButton.classList.add('inactive');//lagt till för att gömma bakåtknappen på sida 1
    }

    // cachePages.push(data); flyttat till den nya funktionen cacheNextPage
}



function search(evt) {
    pageNumber = 1;

    cachePages = [];

    searchStr = evt.target[0].value;
    searchStrHops = evt.target[1].value;
    searchStrMalt = evt.target[2].value;
    searchStrBrewedAfter = evt.target[3].value;
    searchStrBrewedBefore = evt.target[4].value;

    searchStrAbvMin = evt.target[5].value;
    if (searchStrAbvMin.length !== 0) {
        searchStrAbvMin = parseFloat(searchStrAbvMin);
    }
    searchStrAbvMax = evt.target[6].value;
    if (searchStrAbvMax.length !== 0) {
        searchStrAbvMax = parseFloat(searchStrAbvMax);
    }

    if (validate()) {
        getData(generateUrl(), showFirstPage);
    }
    //ändrat så att getData körs här istället för i generateUrl (före detta changePages)

    pageNumber++; //går fram för att kunna hämta data för nästa sida
    getData(generateUrl(), cacheNextPage); //hämtar nästa sida, cachar den om den finns, gömmer annars framåtknappen
    pageNumber-- //byter tillbaka till rätt sidnummer

    evt.preventDefault();
}

function validate() {
    if (compareDates(searchStrBrewedAfter, searchStrBrewedBefore) &&
        checkIfNumber(searchStrAbvMax) &&
        checkIfNumber(searchStrAbvMin) &&
        compareAbv(searchStrAbvMin, searchStrAbvMax)) {
        return true;
    }
    return false;
}

function checkIfNumber(value) {
    if (value.length === 0) {
        return true;
    } else if (isNaN(value) || value < 0) {
        alert("Skriv in ett positivt tal för alkoholhalterna.");
        return false
    }
    return true;
}

function compareAbv(min, max) {
    if (min > 100 || max > 100) {
        alert("Alkoholprocenten kan inte vara över 100.");
        return false;
    } else if (min.length === 0 || max.length === 0) {
        return true;
    } else if (min <= max) {
        return true;
    }
    alert("Kontrollera ordningen på alkoholhalterna.");
    return false;
}

function compareDates(after, before) {
    if (after.length === 0 || before.length === 0) {
        return true
    } else if (!after.includes("-") || !before.includes("-")) {
        alert("Kontrollera datumformat.");
        return false
    } else {
        let dateArray = (after.split('-'))
        let monthAfter = dateArray[0] - 1;
        let yearAfter = dateArray[1];
        dateArray = (before.split('-'))
        let monthBefore = dateArray[0] - 1;
        let yearBefore = dateArray[1];

        let dateAfter = new Date(yearAfter, monthAfter);
        let dateBefore = new Date(yearBefore, monthBefore);

        if (dateAfter > dateBefore) {
            alert("Kontrollera ordningen på datumen.");
            return false;
        }
    }
    return true;
}

function generateUrl() {
    let beerNameSearch = "";
    if (searchStr !== "") {
        beerNameSearch = `&beer_name=${searchStr}`;
    }
    let hopsSearch = "";
    if (searchStrHops !== "") {
        hopsSearch = `&hops=${searchStrHops}`;
    }
    let maltSearch = "";
    if (searchStrMalt !== "") {
        maltSearch = `&malt=${searchStrMalt}`;
    }
    let brewedBefore = "";
    if (searchStrBrewedBefore !== "") {
        brewedBefore = `&brewed_before=${searchStrBrewedBefore}`;
    }
    let brewedAfter = "";
    if (searchStrBrewedAfter !== "") {
        brewedAfter = `&brewed_after=${searchStrBrewedAfter}`;
    }
    let abvMin = "";
    if (searchStrAbvMin !== "") {
        abvMin = `&abv_gt=${searchStrAbvMin}`;
    }
    let abvMax = "";
    if (searchStrAbvMax !== "") {
        abvMax = `&abv_lt=${searchStrAbvMax}`;
    }

    const url = `${searchUrl}?&page=${pageNumber}&per_page=10${beerNameSearch}${hopsSearch}${maltSearch}${brewedBefore}${brewedAfter}${abvMin}${abvMax}`;
    return url; //lagt till denna rad
    // getData(url, checkData); Den här har jag brutit ut så den körs i search istället
}

// function checkData(data) { //Den här har jag slängt bort för den gick att ersätta med bara en rad
//     if (data.length === 0) {
//         pageExists = false;
//     } else {
//         pageExists = true;
//     }
// }


function getData(url, callback) {
    fetch(url)
        .then(res => res.json())
        .then(data => {
            callback(data);
        })
        .catch(error => {
            console.log(error);
            const ulTag = document.querySelector('ul');
            ulTag.innerText = `Något gick fel:
        ${error}`;
        });
}

//brutit ut denna ur getData funktionen, stoppar in som callback istället
function showFirstPage(data) {
    if (data.length !== 0) {
        render(data);
        cachePages.push(data);
    }
    else
    {backButton.classList.add('inactive');
    pageNumber--;} // To cancel-out counting in goForward();
}

//ny funktion som cachar nästa sida om det finns en, gömmer framåtknappen om den inte finns
function cacheNextPage(data) {
    if (data.length !== 0) {
        cachePages.push(data);
    } else {
        forwardButton.classList.add('inactive');
        pageNumber--;
    }
}

function createNavButtons() {
    forwardButton.textContent = '►';
    forwardButton.addEventListener('click', goForward);
    backButton.textContent = '◄';
    backButton.addEventListener('click', goBack);

    pageDisplay.textContent = pageNumber;

    navElement.appendChild(backButton);
    navElement.appendChild(pageDisplay);
    navElement.appendChild(forwardButton);
}

function goForward() {

    pageNumber++;
    backButton.classList.remove('inactive');
    render(cachePages[pageNumber - 1]) //-1 pga att sida 1 i arrayn har index 0.

    pageNumber++; //bläddra fram för att kunna hämta data för nästa sida
    getData(generateUrl(), cacheNextPage); //hämtar sidan, cachar den om den finns, gömmer annars framåtknappen
    pageNumber-- //byter tillbaka till rätt sidnummer
}

function goBack() {
    forwardButton.classList.remove('inactive');
    if (pageNumber > 1) {
        pageNumber--;
        render(cachePages[pageNumber - 1]);
    }
}

function openBeerInfo(evt) {
    const beerId = evt.target.getAttribute('name');
    const url = `beer-info.html?name=${beerId}`;
    window.open(url);
}