const allCoinsContainer = document.querySelector(".all-coins")
const searchForm = document.querySelector(".search-all-form")
const searchValueElement = document.querySelector("#search-all") 
const selectedCategory = document.querySelector("#category-selector")

const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": "",
    },
}

searchForm.addEventListener("submit", (e)=>{
    e.preventDefault()
    searchForACoin(searchValueElement.value, selectedCategory.value, options)
})
 
searchForm.addEventListener("input", async (e)=>{
    if(e.target.value == ""){
        await getTrendingCoinsFromAllChains()
    }
})

allCoinsContainer.addEventListener("click", (e)=>{
    console.log(e.target)
    const activeStar = "chrome-extension://ppkjmjoglhflmmjgbkepeaakbnphlpgh/src/assets/icons/star-active-tab-icon.svg"

    const inactiveStar = "chrome-extension://ppkjmjoglhflmmjgbkepeaakbnphlpgh/src/assets/icons/star-inactive-icon.svg"

    if (e.target.className == "star-icon"){
        console.log(e.target.src)
        const starIcon = e.target

        if(starIcon.src == activeStar){
            const coinName = starIcon.previousElementSibling.previousElementSibling.parentElement.dataset.id

            removeFromFavorites(coinName)
            
            starIcon.src = inactiveStar
        }else{
            const coinName = starIcon.previousElementSibling.previousElementSibling.parentElement.dataset.id

            addToFavorite(coinName)

             starIcon.src = activeStar
        }
    }
})

async function getTrendingCoinsFromAllChains(){
    isLoading()
    try{
        const coinsInStorage = await chrome.storage.local.get(["favoriteCoins"])

        const coinsInStorageArray = coinsInStorage.favoriteCoins || []

    const rawFetch = await fetch('https://api.coingecko.com/api/v3/search/trending', options)

    const {coins} = await rawFetch.json()

    if(!rawFetch.ok){
        throw new Error("error when getting trending coins")
    }
    
    allCoinsContainer.innerHTML = renderTrendingCoins(coins, coinsInStorageArray)

     }
    catch(err){
        console.log(err)
    }
}

async function searchForACoin(searchQuery, categoryQuery, options){
    try{
        isLoading()

        const rawFetch = await fetch(`https://api.coingecko.com/api/v3/search?query=${searchQuery}`, options)

        const {coins} = await rawFetch.json()

        if(!rawFetch.ok){
            throw new Error("searching error")
        }

        const coinNames = coins.map((coin)=>{
            return coin.id
        })

        const coinNamesFetchUrl = coinNames.join("%2C")


        await getSearchedCoinInfo(coinNamesFetchUrl, categoryQuery, options)

    }
    catch(err){
        console.log(err)
    }
}

async function getSearchedCoinInfo(names, category, options){
      const searchCategory = category == "All" ? "" : `&category=${category}`

    try{
        const rawFetch = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${names}${searchCategory}`, options)

        const coinsInfo = await rawFetch.json()

        if(!rawFetch.ok){
            throw new Error("searching error", {cause : coinsInfo})
        }

        allCoinsContainer.innerHTML = renderSearchedCoins(coinsInfo)
    }
    catch(err){
        const causeOfError = err.cause
        if(causeOfError.error == "Not Found"){
            isEmptySearch()
        } else{
            console.log(err)
            console.log(err.cause)
        }
    }
}

function isLoading(){
    const a = `<div class="loader">
        
    </div>
    
    <div class="loader">
        
    </div>

    <div class="loader">
        
    </div>

    <div class="loader">
        
    </div>

    <div class="loader">
        
    </div>

    <div class="loader">
        
    </div>
    `
        allCoinsContainer.innerHTML = a
}

function isEmptySearch(){
    const a = `<p class="empty">
        Oops, seems like we couldn't find the coin you were looking for
    </p>
    `
        allCoinsContainer.innerHTML = a
}

async function addToFavorite(coinName){
    const previousFavoritesFromStorage = await chrome.storage.local.get(["favoriteCoins"])

    const previousFavoritesArray = previousFavoritesFromStorage.favoriteCoins || []

    const newArray = [...previousFavoritesArray, coinName]

    await chrome.storage.local.set({favoriteCoins : newArray})
}

async function removeFromFavorites(coinName){
    const previousFavoritesFromStorage = await chrome.storage.local.get(["favoriteCoins"])

    const previousFavoritesArray = previousFavoritesFromStorage.favoriteCoins || []

    const newArray = previousFavoritesArray.filter((name)=> name !== coinName)

    await chrome.storage.local.set({favoriteCoins : newArray})
}

function renderSearchedCoins(coinsInfo){
    let a = ""

    coinsInfo.forEach((coinInfo)=>{
            const status = coinInfo.price_change_percentage_24h > 0 ? "good" : "bad"

            const statusSymbol = status == "good"? "+" : ""

            const priceChange = coinInfo.price_change_percentage_24h? coinInfo.price_change_percentage_24h.toFixed(2) : false

            let price = Math.round(coinInfo.current_price) >= 1
                ? coinInfo.current_price?.toFixed(2)
                : coinInfo.current_price?.toFixed(5)

            if(price > 999){
                price = new Intl.NumberFormat().format(price)
            }else if(price == 0){
                price = "<0.000001"
            }
            

            a += `
        <div class="single-coin-container" data-id=${coinInfo.id}>
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

            <img src="../../assets/icons/star-inactive-icon.svg" alt="star icon" class="star-icon">
        </div>
        `
    })

    return a
}

function renderTrendingCoins(coins, favoriteCoinsArray){
    let a = ""

    

    coins.forEach(coinData => {
        let status = coinData.item.data.price_change_percentage_24h.usd > 0 ? "good" : "bad"

        const isFav = favoriteCoinsArray.includes(coinData.item.id)

        let price =  
        Math.round(coinData.item.data.price) >= 1
          ? coinData.item.data.price.toFixed(2)
          : coinData.item.data.price.toFixed(5)

      if(price > 999){
          price = new Intl.NumberFormat().format(price)
      }else if(price == 0){
        price = "<0.000001"
    }

        a += `
        <div class="single-coin-container" data-id=${coinData.item.id}>
            <div class="logo-and-name">
                <div class="logo-container">
                <img src=${coinData.item.large} alt="${coinData.item.name} logo">
                </div>

                <div class="name">
                    <h1>${coinData.item.name}</h1>
                    <p>${coinData.item.symbol}</p>
                </div>
            </div>

            <div class="price-info">
                <h1>$${price}</h1>
                <p class=${status}>${status == "good"? "+" : ""}${coinData.item.data.price_change_percentage_24h.usd.toFixed(2)}%</p>
            </div>

            <img src=${isFav ? "../../assets/icons/star-active-tab-icon.svg" : "../../assets/icons/star-inactive-icon.svg"} alt="star icon" class="star-icon">
        </div>
        `
    })

    return a
}

getTrendingCoinsFromAllChains()