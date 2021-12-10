const getAllCurrencies = async () => {
    const response = await fetch("https://www.nbrb.by/api/exrates/currencies");
    const data = await response.json();
    return data.map(currencyMapper);
}

const getExchangeRates = async (id, startDate, endDate) => {
    const response = await fetch(`https://www.nbrb.by/api/exrates/rates/dynamics/${id}?startDate=${convertDate(startDate)}&endDate=${convertDate(endDate)}`);
    const data = await response.json();
    return data.map(rateMapper);
}

const rateMapper = (rate) => {
    return {
        id: rate.Cur_ID,
        date: new Date(Date.parse(rate.Date)),
        officialRate: rate.Cur_OfficialRate
    };
}

const currencyMapper = (currency) => {
    const startDate = new Date(Date.parse(currency.Cur_DateStart));
    const endDate = new Date(Date.parse(currency.Cur_DateEnd));

    return {
        id: currency.Cur_ID,
        parentId: currency.Cur_ParentID,
        code: currency.Cur_Code,
        abbreviation: currency.Cur_Abbreviation,
        startDate: startDate,
        endDate: endDate
    };
}