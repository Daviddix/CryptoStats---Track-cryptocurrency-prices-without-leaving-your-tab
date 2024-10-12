const allCoinsContainer = document.querySelector(".all-coins")
const searchForm = document.querySelector(".search-all-form")
const searchValueElement = document.querySelector("#search-all") 
const selectedCategory = document.querySelector("#category-selector")


searchForm.addEventListener("submit", (e)=>{
    e.preventDefault()
    searchForACoin(searchValueElement.value, selectedCategory.value)
})
 
searchForm.addEventListener("input", async (e)=>{
    if(e.target.value == ""){
        await getTrendingCoinsFromAllChains()
    }
})

allCoinsContainer.addEventListener("click", (e)=>{
    console.log(e.target.src)
    const activeStar = "chrome-extension://apnalilblhlemleggbcddjpmkciocimc/src/assets/icons/star-active-tab-icon.svg"

    const inactiveStar = "chrome-extension://apnalilblhlemleggbcddjpmkciocimc/src/assets/icons/star-inactive-icon.svg"

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

    const rawFetch = await fetch("http://localhost:3000/api/getTrendingCoins")

    const coins = await rawFetch.json()

    if(!rawFetch.ok){
        throw new Error("error when getting trending coins")
    }
    
    allCoinsContainer.innerHTML = renderTrendingCoins(coins, coinsInStorageArray)

     }
    catch(err){
        isError()
    }
}

async function searchForACoin(searchQuery, categoryQuery){
    try{
        isLoading()

        const rawFetch = await fetch(`http://localhost:3000/api/search?searchQuery=${searchQuery}&categoryQuery=${categoryQuery}`)

        const coinsInfo = await rawFetch.json()

        if(!rawFetch.ok){
            if(rawFetch.status == 404){
                 throw new Error("empty results", {cause : coinsInfo})
            }else{
                throw new Error("Typical Error")
            }
        }


        allCoinsContainer.innerHTML = renderSearchedCoins(coinsInfo)

    }
    catch(err){
        if(err.cause?.reason){
            return isError(err.cause.reason , "light")
        }else{
            return isError()
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

function isError(errorMessage="Seems like an error ocurred, please try reloading the extension", type="strong"){
    const a = `<p class=${type == "strong" ? "error" : "empty"}>${errorMessage}</p>`
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