'use strict';

// Global Variables ***********************************************************
// create product list
let productNames = getProductList();
let numProducts = productNames.length;
let productList = [];

for (let i = 0; i < numProducts; i++) {
  if (productNames[i] === 'sweep') {
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
let resultsChartDOM = document.getElementById('chart');
let retryBtnDOM = document.getElementById('retryBtn');
let clearBtnDOM = document.getElementById('clearBtn');

// Object Literals ************************************************************



// Functions ******************************************************************
function getProductList() {
  // Create array with image names and file names

  // this is temporary until I figure out how to do it automatically
  let tempArray = ['bag', 'banana', 'bathroom', 'boots', 'breakfast', 'bubblegum', 'chair', 'cthulhu', 'dog-duck', 'dragon', 'pen', 'pet-sweep', 'scissors', 'shark', 'sweep', 'tauntaun', 'unicorn', 'water-can', 'wine-glass'];

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
  if (Number(this.seen) === 0){
    this.percentage = 0;
  }

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
  // find product that was  clicked
  let id = productToDisplay[event.target.id];

  // add 1 to vote count, set display to off
  sessionVoteCount++;
  totalVotes = totalVotes + 1;
  productList[id].votes++; // this works if it's productList[id], but doesn't work if it's 'this'
  productList[id].onDisplay = false;
  productList[id].percentage = Math.round((productList[id].votes / productList[id].seen * 1000)) / 10;
  if (Number(productList[id].seen) === 0){
    productList[id].percentage = 0;
  }

  // remove event listener
  let imgElem = document.getElementById(event.target.id);
  imgElem.removeEventListener('click', handleClick);

  // if > xx votes, end voting session.
  let pElem;
  if (sessionVoteCount >= sessionVotes) {
    // remove images
    while (productImagesDOM.firstChild) {
      productImagesDOM.removeChild(productImagesDOM.firstChild);
    }

    displayResults();

    // display end of voting message
    pElem = document.createElement('p');
    pElem.textContent = 'Thanks for voting';
    productImagesDOM.appendChild(pElem);

    // display results

    sessionVoteCount = 0;
    displayResults();

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
    retryBtnDOM.style.display = 'block';
    clearBtnDOM.style.display = 'block';
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
    productList[i].percentage = Math.round((productList[i].votes / productList[i].seen * 1000)) / 10;
    if (Number(productList[i].seen) === 0){
      productList[i].percentage = 0;
    }

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

  // Display total votes - not doing this anymore with the local storage
  // liElem = document.createElement('li');
  // liElem.textContent = 'Total Votes: ' + totalVotes;
  // ulElem.appendChild(liElem);

  // Display chart
  displayChart();
  resultsChartDOM.style.display = 'block';

  // Store data to local storage
  storeData();
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

function displayChart() {
  // Remove chart - prevents multiple charts being overlaid on top of each other
  while (resultsChartDOM.firstChild) {
    resultsChartDOM.removeChild(resultsChartDOM.firstChild);
  }

  // create chart element
  let chartElem = document.createElement('canvas');
  chartElem.id = 'resultsChart';
  resultsChartDOM.appendChild(chartElem);

  // Create dataset for chart
  let xValues = []; //array with names for x-axis
  let yValues = []; // array with names for y-axis
  let barColors = []; // array with colors for each bar

  for (let i = 0; i < numProducts; i++) {
    xValues[i] = productList[i].name;

    if (resultType === 'percentage') {
      yValues[i] = productList[i].percentage;
    } else if (resultType === 'seen') {
      yValues[i] = productList[i].seen;
    } else {
      yValues[i] = productList[i].votes;
    }

    // Create random colors for bar chart.  Got this from https://css-tricks.com/snippets/javascript/random-hex-color/
    barColors[i] = '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  // create chart data object
  let chartObj = {
    type: 'bar',

    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: barColors,
        data: yValues,
      }]
    },

    options: {
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Odd Duck Products Voting Results: ' + resultType
        },
        legend: {
          display:false,

        }
      }
    },

  };

  // Create chart
  new Chart('resultsChart', chartObj); // eslint-disable-line
}

function storeData() {
  let temp = JSON.stringify(productList);
  localStorage.setItem('productData', temp);
}

function readData() {
  // On first run of website, if product data doesn't exist, create one
  if (localStorage.getItem('productData') === null){
    storeData();
  }

  let retrievedProductData = localStorage.getItem('productData');

  let parsedProductData = JSON.parse(retrievedProductData);

  for(let i=0; i<numProducts;i++){
    productList[i].votes = Number(parsedProductData[i].votes);
    productList[i].seen = Number(parsedProductData[i].seen);
  }
}

function handleRetryClick(){
  randomProducts();
}

function handleClearClick(){
  for(let i=0; i<numProducts;i++){
    productList[i].votes = 0;
    productList[i].seen = 0;
  }

  storeData();

  displayResults();

}


// Executable Code ************************************************************
// Read data from local storage
readData();

// choose initial random products
randomProducts();

// Hide buttons until ready to display
voteButton.style.display = 'none';
percentageButton.style.display = 'none';
seenButton.style.display = 'none';
retryBtnDOM.style.display = 'none';
clearBtnDOM.style.display = 'none';
resultsChartDOM.style.display = 'none';

// Add event listeners to buttons
voteButton.addEventListener('click', handleResultsClick);
percentageButton.addEventListener('click', handleResultsClick);
seenButton.addEventListener('click', handleResultsClick);
retryBtnDOM.addEventListener('click', handleRetryClick);
clearBtnDOM.addEventListener('click', handleClearClick);
