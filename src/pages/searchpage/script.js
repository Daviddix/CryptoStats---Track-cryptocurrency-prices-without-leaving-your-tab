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

async function getTrendingCoinsFromAllChains(){
    try{
    const {coins} = JSON.parse(localStorage.getItem("test-all"))
    let a = ""
    coins.forEach(coinData => {
        let status = coinData.item.data.price_change_percentage_24h.usd > 0 ? "good" : "bad"
        a += `
        <div class="single-coin-container">
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
                <h1>$${coinData.item.data.price.toFixed(2)}</h1>
                <p class=${status}>${status == "good"? "+" : ""}${coinData.item.data.price_change_percentage_24h.usd.toFixed(2)}%</p>
            </div>

            <img src="../../assets/icons/star-inactive-icon.svg" alt="star icon">
        </div>
        `
    })
    allCoinsContainer.innerHTML = a

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

        const coinNamesFetchUrl = coinNames.join("%2C%20")


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

        console.log(coinsInfo)

        let a = ""

        coinsInfo.forEach((coinInfo)=>{
            const status = coinInfo.price_change_percentage_24h > 0 ? "good" : "bad"

            const statusSymbol = status == "good"? "+" : ""

            const priceChange = coinInfo.price_change_percentage_24h? coinInfo.price_change_percentage_24h.toFixed(2) : false

            const price = new Intl.NumberFormat().format(
              Math.round(coinInfo.current_price) >= 1
                ? coinInfo.current_price?.toFixed(2)
                : coinInfo.current_price?.toFixed(5)
            )

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

            <img src="../../assets/icons/star-inactive-icon.svg" alt="star icon">
        </div>
        `
        })

        allCoinsContainer.innerHTML = a
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

getTrendingCoinsFromAllChains()