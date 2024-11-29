export default function getCurrencySymbol(shortFormOfCurrency){
    if(shortFormOfCurrency == "usd"){
      return "$"
    }else if(shortFormOfCurrency == "ngn"){
      return "N"
    }else if(shortFormOfCurrency == "ngn"){
      return "N"
    }else if(shortFormOfCurrency == "eur"){
      return "€"
    }else if(shortFormOfCurrency == "aud"){
      return "AU$"
    }else if(shortFormOfCurrency == "php"){
      return "₱"
    }else if(shortFormOfCurrency == "aed"){
      return "د.إ"
    }else if(shortFormOfCurrency == "nzd"){
      return "NZ$"
    }else if(shortFormOfCurrency == "btc"){
      return "₿"
    }
  }