const getConfig = (data) => {
    return {
        type: "line",
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
                title: {
                    display: true,
                    text: "Chart.js Line Chart",
                },
            },
        },
    };
};

const getData = (values) => {
    if (!values) {
        return console.log("No values available")
    }
    const data = {
        labels: values.map(value => value.date),
        datasets: [
            {
                label: "Rates",
                data: values.map(value => value.course),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
            },
            {
                label: "Moving Average",
                data: values.map(value => value.movingAverageCourse),
                borderColor: 'rgba(0, 200, 132, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
            },
        ],
    };
    return data;
};

const createCanvas = () => {
    const canvas = document.createElement("canvas");
    canvas.height = 400;
    canvas.width = 800;
    canvas.id = "chart";
    return canvas;
}

const createChart = (values) => {
    const canvas = createCanvas();
    const ctx = canvas.getContext("2d");
    const data = getData(values);
    const chart = new Chart(ctx, getConfig(data));
    document.body.appendChild(canvas);
};

const main = async () => {
    const urlParts = window.location.href.split("?");
    if (urlParts.length < 2) {
        console.log("Query param 'currency' is required")
    }
    const params = new URLSearchParams(urlParts[1]);
    const DAYS_IN_MONTH = 30;
    const response = await movingAverage(params.get("currency"), DAYS_IN_MONTH);
    console.log(response);
    createChart(response);
}

main();
