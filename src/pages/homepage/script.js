const favoriteCoinsContainer = document.querySelector(".other-coins")
const mainCoinContainer = document.querySelector(".main-goes-here")

async function getFavoriteCoinsFromStorageAndDisplayThem(){
    try{
        const coinsInStorage = await chrome.storage.local.get(["favoriteCoins"])

        const coinsInStorageArray = coinsInStorage.favoriteCoins || []

        if(coinsInStorageArray.length == 0){
            return isEmptyFavorite()
        }else{
            isLoading()

            const rawFetch = await fetch(`http://localhost:3000/api/displayFavorite?coinNames=${coinsInStorageArray}`)

            const coinsInfo = await rawFetch.json()

        if(!rawFetch.ok){
            throw new Error("searching error", {cause : coinsInfo})
        }

        const [mainCoin] = coinsInfo.splice(0, 1)

        mainCoinContainer.innerHTML = renderMainCoin(mainCoin)

        draw(mainCoin.sparkline_in_7d.price, mainCoin.sparkline_in_7d.price.length, mainCoin.price_change_percentage_24h)

        favoriteCoinsContainer.innerHTML = renderFavoriteCoins(coinsInfo)

        }
        

    }
    catch (err){
        console.log(err)
    }
}

function isLoading(){
    const a = `<div class="big-loader">
        
    </div>
    
    <div class="loader">
        
    </div>

    <div class="loader">
        
    </div>

    <div class="loader">
        
    </div>
    `
        favoriteCoinsContainer.innerHTML = a
}

function isEmptyFavorite(){
    const a = `<p class="empty">
        Oops, seems like you haven't added any coin to your favorite page
    </p>
    `
    favoriteCoinsContainer.innerHTML = a
}

function renderFavoriteCoins(coinsInfo){
    let a = ""

    coinsInfo.forEach((coinInfo)=>{
            const status = coinInfo.price_change_percentage_24h > 0 ? "good" : "bad"

            const statusSymbol = status == "good"? "+" : ""

            const priceChange = coinInfo.price_change_percentage_24h? coinInfo.price_change_percentage_24h.toFixed(2) : false

            let price = Math.round(coinInfo.current_price) >= 1
          ? coinInfo.current_price.toFixed(2)
          : coinInfo.current_price.toFixed(5)

      if(price > 999){
          price = new Intl.NumberFormat().format(price)
      }else if(price == 0){
        price = "<0.000001"
    }

            a += `
        <div class="single-coin-container">
            <div class="logo-and-name">
                <div class="logo-container">
                <img src=${coinInfo.image} alt="${coinInfo.name} logo">
                </div>

                <div class="name">
                    <h1>${coinInfo.name}</h1>
                    <p>${coinInfo.symbol.toUpperCase()}</p>
                </div>
            </div>

            <div class="price-info">
                <h1>$${price}</h1>
                <p class=${status}>${statusSymbol}${priceChange || 0}%</p>
            </div>
        </div>
        `
    })

    return a
}

function renderMainCoin(mainCoinInfo){
    console.log(mainCoinInfo)
            let a = ""

            const status = mainCoinInfo.price_change_percentage_24h > 0 ? "good" : "bad"

            const statusSymbol = status == "good"? "+" : ""

            const priceChange = mainCoinInfo.price_change_percentage_24h? mainCoinInfo.price_change_percentage_24h.toFixed(2) : false

            const price = new Intl.NumberFormat().format(
              Math.round(mainCoinInfo.current_price) >= 1
                ? mainCoinInfo.current_price?.toFixed(3)
                : mainCoinInfo.current_price?.toFixed(5)
            )

            a = `<div class="main-coin-container">
        <div class="top-section">
            <div class="top-logo-and-info">

                <div class="logo-container">
                <img src=${mainCoinInfo.image} alt="${mainCoinInfo.name} logo">
                </div>

                <div class="top-name-and-info">

                     <h1>${mainCoinInfo.name}</h1>
                    <p>${mainCoinInfo.symbol.toUpperCase()}</p>

                </div>
                
            </div>

            <div class="top-price-and-increase">
                <h1>$${price}</h1>
                <p class=${status}>${statusSymbol}${priceChange || 0}%</p>
            </div>
        </div>

        <div class="canvas-container">
        <canvas id="myChart" class="graph"></canvas>
        </div>

    </div>
            `
            return a
}

function getPreviousSevenDays(numPoints) {
  const timestamps = [];
  const now = new Date();

  for (let i = 0; i < numPoints; i++) {
      const pastDate = new Date(now.getTime() - (i * 60 * 60 * 1000));  // Subtract hours for each price point
      timestamps.push(pastDate.toLocaleString());  // Format the timestamp as a readable string
  }

  return timestamps.reverse();
}

function draw(dataArray, numPoints, priceChange){
  const status = priceChange > 0 ? "good" : "bad";

  const ctx = document.getElementById("myChart");

  const cc = ctx.getContext("2d");

  const gradient = cc.createLinearGradient(0, 0, 0, 100);

  status == "good"
    ? gradient.addColorStop(0, "#2B682333")
    : gradient.addColorStop(0, "#68232333");

  gradient.addColorStop(1, "#262626");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: getPreviousSevenDays(numPoints),
      datasets: [
        {
          label: "",
          tension: 0,
          borderWidth: 2,
          data: [...dataArray],
          borderColor: status == "good" ? "#268244" : "#C43D3D", // Line color
          backgroundColor: gradient, // Area under the line
          fill: true,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Completely remove the legend
        },
      },
      scales: {
        y: {
          grid: {
            display: false, // Hide grid lines for x-axis
          },
          beginAtZero: false,
          min: Math.min(...dataArray), // Start value on the Y-axis
          max: Math.max(...dataArray), // End value on the Y-axis
          ticks: {
            display: false,
            stepSize: 20, // Optional: Set the spacing between ticks
          },
        },
        x: {
          grid: {
            display: false, // Hide grid lines for x-axis
          },
          ticks: {
            display: false,
          },
        },
      },
    },
  });
  
}

getFavoriteCoinsFromStorageAndDisplayThem()