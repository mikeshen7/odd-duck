'use strict';

// Global Variables ***********************************************************
// create product list
let productNames = getProductList();
let numProducts = productNames.length;
let productList = [];

for (let i = 0; i < numProducts; i++) {
  if (productNames[i] === 'sweep'){
    productList[i] = new Products(productNames[i], 'png');
  } else {
    productList[i] = new Products(productNames[i]);
  }
}

// user adjustable settings
let numDisplay = 3;
let sessionVotes = 25;

// Initialize variables
let sessionVoteCount = 0;
let totalVotes = 0;
let buttonVisible = false;
let resultType = 'votes';
let productToDisplay = [];

// DOM Windows ****************************************************************
let productImagesDOM = document.getElementById('productImages');
let voteButton = document.getElementById('viewVotes');
let percentageButton = document.getElementById('viewPercentage');
let seenButton = document.getElementById('viewSeen');

// Object Literals ************************************************************



// Functions ******************************************************************
function getProductList() {
  // Create array with image names and file names

  // this is temporary until I figure out how to do it automatically
  let tempArray = ['bag','banana','bathroom','boots','breakfast','bubblegum','chair','cthulhu','dog-duck','dragon','pen','pet-sweep','scissors','shark','sweep','tauntaun','unicorn','water-can','wine-glass'];

  // got from https://www.folkstalk.com/tech/javascript-get-list-of-files-in-directory-with-code-examples/
  // THIS DOESN'T WORK.  CANNOT READ ARRAY INDEX
  // let ifr = document.createElement('iframe');
  // ifr.src = './img/';
  // ifr.style.display = 'none';
  // ifr.onload = () => {
  //   ifr.contentDocument.querySelectorAll('.name').forEach((name) => {
  //     productList.push(name.innerHTML);
  //   });
  // };
  // document.body.appendChild(ifr);

  return tempArray;
}

function Products(name, imgExt = 'jpg') {
  this.name = name;
  this.file = 'img/' + name + '.' + imgExt;
  this.seen = 0;
  this.votes = 0;
  this.onDisplay = false;
  this.percentage = 0;
  this.displayPosition = -1;
}

Products.prototype.display = function (position) {
  // Set onDisplay to true, add one to seen, calc percentage
  this.onDisplay = true;
  this.displayPosition = position;
  this.seen++;
  this.percentage = Math.round((this.votes / this.seen * 1000)) / 10;

  // Delete old <img> element
  document.getElementById(position).remove();

  // Add <img> element based on the position
  let imgElem = document.createElement('img');
  imgElem.src = this.file;
  imgElem.id = position;
  imgElem.alt = 'image of ' + this.name;
  imgElem.title = this.name;
  productImagesDOM.appendChild(imgElem);

  // add event listener
  imgElem.addEventListener('click', handleClick);
};

function handleClick(event) {
  // find product that was just clicked
  let id = productToDisplay[event.target.id];

  // add 1 to vote count, set display to off
  sessionVoteCount++;
  totalVotes++;
  productList[id].votes++; // this works if it's productList[id], but doesn't work if it's 'this'
  productList[id].onDisplay = false;
  productList[id].percentage = Math.round((productList[id].votes / productList[id].seen * 1000)) / 10;

  // remove event listener
  let imgElem = document.getElementById(event.target.id);
  imgElem.removeEventListener('click', handleClick);

  // if > xx votes, end voting session.
  let pElem;
  if (sessionVoteCount >= sessionVotes) {
    // display results
    displayResults();
    sessionVoteCount = 0;

    // remove images
    while (productImagesDOM.firstChild) {
      productImagesDOM.removeChild(productImagesDOM.firstChild);
    }

    // display end of voting message
    pElem = document.createElement('p');
    pElem.textContent = 'Thanks for voting';
    productImagesDOM.appendChild(pElem);

  } else {
    randomProducts();
  }
}

function randomProducts() {
  let imgElem;

  // delete old img elements
  while (productImagesDOM.firstChild) {
    productImagesDOM.removeChild(productImagesDOM.firstChild);
  }

  // create new img elements
  for (let i = 0; i < numDisplay; i++) {
    imgElem = document.createElement('img');
    imgElem.setAttribute('id', i);
    productImagesDOM.appendChild(imgElem);
  }

  // Randomly pick 3 products to display
  let tempProduct = Math.floor(Math.random() * (numProducts));
  let oldProductToDisplay = productToDisplay;
  productToDisplay = [];

  for (let i = 0; i < numDisplay; i++) {
    while (productToDisplay.includes(tempProduct) || oldProductToDisplay.includes(tempProduct)) {
      tempProduct = Math.floor(Math.random() * (numProducts));
    }
    productToDisplay.push(tempProduct);
    productList[tempProduct].display(i);
  }
}

function displayResults() {
  // Show View Results buttons after first session
  if (!buttonVisible) {
    buttonVisible = true;
    voteButton.style.display = 'block';
    percentageButton.style.display = 'block';
    seenButton.style.display = 'block';
  }

  let ulElem = document.getElementById('resultsUL');
  let liElem;
  let tempString;

  // remove previous results
  while (ulElem.firstChild) {
    ulElem.removeChild(ulElem.firstChild);
  }

  // set string output based on result type
  for (let i = 0; i < numProducts; i++) {
    if (resultType === 'percentage') {
      tempString = productList[i].name + ': ' + productList[i].percentage + '%';
    } else if (resultType === 'seen') {
      tempString = productList[i].name + ': ' + productList[i].seen + ' seen';
    } else {
      tempString = productList[i].name + ': ' + productList[i].votes + ' votes';
    }

    liElem = document.createElement('li');
    liElem.textContent = tempString;
    ulElem.appendChild(liElem);
  }

  // Display total votes
  liElem = document.createElement('li');
  liElem.textContent = 'Total Votes: ' + totalVotes;
  ulElem.appendChild(liElem);
}

function handleResultsClick(event) {
  if (event.target.id === 'viewPercentage') {
    resultType = 'percentage';
  } else if (event.target.id === 'viewSeen') {
    resultType = 'seen';
  } else {
    resultType = 'votes';
  }

  displayResults();
}

// Executable Code ************************************************************

// choose initial random products
randomProducts();

// Results buttons
voteButton.addEventListener('click', handleResultsClick);
voteButton.style.display = 'none';

percentageButton.addEventListener('click', handleResultsClick);
percentageButton.style.display = 'none';

seenButton.addEventListener('click', handleResultsClick);
seenButton.style.display = 'none';
