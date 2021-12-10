const getActivityPeriods = (currency, allCurrencies, startDate, endDate) => {
    let activityPeriods = allCurrencies
        .filter((item) => {
            return item.parentId === currency.parentId &&
                (item.endDate <= endDate && item.endDate >= startDate || item.startDate <= endDate && item.startDate >= startDate)
        })
        .map((item) => {
            return {
                id: item.id,
                startDate: item.startDate < startDate ? startDate : item.startDate,
                endDate: item.endDate < endDate ? item.endDate : endDate
            };
        })
    activityPeriods.sort((a, b) => a.startDate - b.startDate);
    return activityPeriods;
}

const getRatesForEachPeriod = async (activityPeriods) => {
    const rates = (await Promise.allSettled(
        activityPeriods.map((period) => {
            return getExchangeRates(period.id, period.startDate, period.endDate)
        })
    ))
        .filter((item) => item.status === "fulfilled")
        .map((item) => item.value);
    return rates;
}

const getMovingAverage = (valuesInterval, intervalLength) => {
    if (valuesInterval.length <= 0 || valuesInterval.length !== intervalLength) {
        throw Error("Lack of values");
    }
    return valuesInterval.reduce((acc, value) => acc += value, 0) / valuesInterval.length;
}

class MovingAverageInterval {
    constructor(length) {
        this._interval = [];
        this._intervalLength = length;
    }

    get movingAverage() {
        try {
            return getMovingAverage(this._interval, this._intervalLength);
        } catch (error) {
            return undefined;
        }
    }

    update(value) {
        if (this._interval.length < this._intervalLength) {
            this._add(value);
        } else {
            this._shift(value);
        }
    }

    _add(value) {
        this._interval.push(value);
    }

    _shift(value) {
        this._interval.splice(0, 1);
        this._interval.push(value);
    }
}

const calculateMovingAverage = (rates, intervalLength) => {
    const ratesInterval = new MovingAverageInterval(intervalLength);

    return rates.reduce((movingAverageRates, rate) => {
        const movingAverage = ratesInterval.movingAverage;
        ratesInterval.update(rate.officialRate);
        if (movingAverage) {
            movingAverageRates.push({
                date: convertDate(rate.date),
                course: rate.officialRate,
                movingAverageCourse: movingAverage
            })
        }
        return movingAverageRates;
    }, []);
}

const getPeriodsForCurrency = (currency, allCurrencies, startDate, endDate, intervalLength) => {
    const shiftedDate = new Date();
    shiftedDate.setTime(startDate.getTime());
    shiftedDate.setDate(shiftedDate.getDate() - intervalLength);
    return getActivityPeriods(currency, allCurrencies, shiftedDate, endDate);
}

const getRatesForPeriods = async (activityPeriods) => {
    const ratesForActivityPeriods = await getRatesForEachPeriod(activityPeriods);
    return ratesForActivityPeriods.flat();
}

const getCurrencyRates = async (currency, allCurrencies, startDate, endDate, intervalLength) => {
    const activityPeriods = getPeriodsForCurrency(currency, allCurrencies, startDate, endDate, intervalLength);
    return await getRatesForPeriods(activityPeriods)
}

const getMovingAverageRates = async (currencyAbbreviation, allCurrencies, startDate, endDate, intervalLength) => {
    const currency = allCurrencies.find((elem) => elem.abbreviation == currencyAbbreviation && elem.id === elem.parentId);
    const rates = await getCurrencyRates(currency, allCurrencies, startDate, endDate, intervalLength);
    return calculateMovingAverage(rates, intervalLength);
}

const movingAverage = async (currencyAbbreviation, movingAverageInterval) => {
    try {
        const endDate = new Date();
        const startDate = new Date(endDate.getFullYear(), 0, 1);

        const allCurrencies = await getAllCurrencies();
        return await getMovingAverageRates(currencyAbbreviation, allCurrencies, startDate, endDate, movingAverageInterval);
    } catch (error) {
        console.log(error);
    }
}