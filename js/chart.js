export function loadChart() {
    const ctx = document.getElementById('mainChart');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['NDA','INDIA'],
            datasets: [{
                data: [293,234]
            }]
        }
    });
}
